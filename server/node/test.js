import FactoryService from './FactoryService.js'

const axios = require('axios')
const natural = require('natural')
const { TfIdf } = require('natural')
const pLimit = require('p-limit')

const DUPLICATE_THRESHOLD = 0.8
const MAX_SUMMARY_LENGTH = 256
const MAX_SUMMARY_SENTENCES = 3
const HF_API_URL = 'https://api-inference.huggingface.co/models'
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'
const SUMMARIZATION_MODEL = 'facebook/bart-large-cnn'
const HF_TOKEN = process.env.HF_TOKEN || null
const HEADERS = HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {}

const apiClient = axios.create({
	timeout: 10000, // 10s
	headers: { ...HEADERS, 'Content-Type': 'application/json' },
})

const limit = pLimit(10)

class TimeService {
	async factoryNews() {
		const config = {
			newsapi: { apiKey: 'your-news-key' },
			telegram: { botToken: 'your-bot-token', channelId: '@prime1' },
			scraping: {
				url: 'https://www.bcs-express.ru/news',
				selectors: {
					title: 'h3.news-title',
					summary: '.news-summary',
					link: 'a',
				},
			},
		}

		const newsList = []
		for (const key in config) {
			if (key.startsWith('newsapi')) {
				const parser = FactoryService.create('newsapi', config.newsapi)
				const news = await parser.fetchNews({ q: 'technology', pageSize: 5 })
				console.log('Fetched news: ', news)
				newsList.push(news)
			} else if (key.startsWith('telegram')) {
				const parser = FactoryService.create(
					'newsapi',
					config.telegram.botToken,
					config.telegram.channelId
				)
				const news = await parser.fetchNews({ limit: 5 })
				console.log('Fetched news: ', news)
				newsList.push(news)
			} else if (key.startsWith('scraping')) {
				const parser = FactoryService.create(
					'newsapi',
					config.scraping.url,
					config.scraping.selectors
				)
				const news = await parser.fetchNews({ limit: 5 })
				console.log('Fetched news: ', news)
				newsList.push(news)
			}
		}

		function getNewsText(newsItem) {
			if (typeof newsItem === 'string') return newsItem
			return (newsItem.title || '') + ' ' + (newsItem.content || '')
		}

		function cosineSimilarity(vecA, vecB) {
			if (
				!Array.isArray(vecA) ||
				!Array.isArray(vecB) ||
				vecA.length !== vecB.length ||
				vecA.length === 0
			) {
				return 0 // Несовместимые dims или пустые — 0
			}
			const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
			const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
			const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
			return magnitudeA && magnitudeB
				? dotProduct / (magnitudeA * magnitudeB)
				: 0
		}

		let globalTfIdf = null // Глобальный для батчинга

		function initTfIdf(allTexts) {
			globalTfIdf = new TfIdf()
			allTexts.forEach(text =>
				globalTfIdf.addDocument(text.toLowerCase().split(/\s+/))
			) // Простая токенизация
		}

		function computeTfIdfEmbedding(index) {
			const vec = []
			globalTfIdf.tfidfs(index, (i, measure) => vec.push(measure || 0))
			return vec
		}

		function computeTfIdfSimilarity(indexA, indexB) {
			const vecA = computeTfIdfEmbedding(indexA)
			const vecB = computeTfIdfEmbedding(indexB)
			// Паддим/обрезаем до max len для совместимости
			const maxLen = Math.max(vecA.length, vecB.length, 384) // MiniLM dims
			while (vecA.length < maxLen) vecA.push(0)
			while (vecB.length < maxLen) vecB.push(0)
			while (vecA.length > maxLen) vecA.pop()
			while (vecB.length > maxLen) vecB.pop()
			return cosineSimilarity(vecA, vecB)
		}

		// Ultra-fallback: Jaro-Winkler (0-1 similarity, строковое)
		function jaroWinklerSimilarity(textA, textB) {
			return natural.JaroWinklerDistance(textA, textB) || 0
		}

		// Keyword fallback для классификации (если embeddings fail)
		function keywordTopCategories(newsText, categories) {
			const newsWords = newsText.toLowerCase().split(/\s+/)
			const scores = categories.map(cat => {
				const catWords = cat.toLowerCase().split(/\s+/)
				let score = 0
				catWords.forEach(
					word =>
						(score +=
							newsWords.filter(nw => nw.includes(word)).length > 0 ? 1 : 0)
				)
				return { category: cat, score }
			})
			return scores
				.sort((a, b) => b.score - a.score)
				.slice(0, 3)
				.map(s => s.category)
		}

		// Батч-эмбеддинги через HF API (массив текстов -> массив эмбеддингов)
		async function getBatchEmbeddings(texts) {
			if (texts.length === 0) return []
			try {
				const response = await apiClient.post(
					`${HF_API_URL}/${EMBEDDING_MODEL}`,
					{ inputs: texts }
				)
				if (Array.isArray(response.data)) {
					return response.data
				} else if (response.data.error) {
					throw new Error(response.data.error)
				} else {
					return [response.data] // Если одиночный
				}
			} catch (error) {
				console.error(`HF Batch Embedding error: ${error.message}`)
				throw error
			}
		}
		// Эмбеддинги с fallback (батч)
		async function getEmbeddingsWithFallback(allTexts, startIndex = 0) {
			let embeddings
			try {
				embeddings = await getBatchEmbeddings(allTexts)
			} catch (error) {
				console.error('Switching to TF-IDF fallback for embeddings')
				initTfIdf(allTexts) // Батч все тексты
				return allTexts.map((_, index) =>
					computeTfIdfEmbedding(startIndex + index)
				)
			}
			return embeddings
		}
		// Суммаризация (с limit и fallback)
		async function summarizeText(text) {
			return limit(async () => {
				try {
					const response = await apiClient.post(
						`${HF_API_URL}/${SUMMARIZATION_MODEL}`,
						{
							inputs: text,
							parameters: {
								max_length: 100,
								min_length: 30,
								do_sample: false,
								num_beams: 4,
							},
						}
					)
					let summary = response.data?.[0]?.summary_text || text
					// Regex для предложений (улучшенный)
					const sentences = summary.match(/[^\.!\?]+[\.!\?]+/g) || [summary]
					summary = sentences.slice(0, MAX_SUMMARY_SENTENCES).join(' ').trim()
					if (summary.length > MAX_SUMMARY_LENGTH) {
						summary = summary.slice(0, MAX_SUMMARY_LENGTH - 3).trim() + '...'
					}
					return summary
				} catch (error) {
					console.error(`Summarization error: ${error.message}`)
					// Fallback: усечение
					const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text]
					let fallback = sentences
						.slice(0, MAX_SUMMARY_SENTENCES)
						.join(' ')
						.trim()
					if (fallback.length > MAX_SUMMARY_LENGTH) {
						fallback = fallback.slice(0, MAX_SUMMARY_LENGTH - 3).trim() + '...'
					}
					return fallback
				}
			})()
		}

		// const uniqueNewsList = newsList.filter((news, index, self) =>
		// 	index === self.findIndex((n) => n.url === news.url || n.title === news.title || n.summary === news.summary)
		// );

		// должна быть проверка новостей после окончания обновления списка можно сортировать через ИИ API.

		const summaryNewsList = []
		for (let i = 0; i < uniqueNewsList.length; i++) {
			console.log(uniqueNewsList[i])
		}

		// Сжатие новостей происходит через текстовую модель сразу после отработки проверки.

		// Лишь после сжатия запись в бд.
		// Основная функция обработки
		async function processNews(req, res) {
			const { news, categories = [], previousEmbeddings = [] } = req.body
			if (!news || !Array.isArray(news)) {
				return res
					.status(400)
					.json({ error: 'Invalid input: news must be an array' })
			}
			const newsTexts = news.map(getNewsText)
			const allTextsForTfIdf = [...newsTexts, ...categories] // Для батчинга в fallback
			let useFallback = false
			let newsEmbeddings = []
			let categoryEmbeddings = []
			try {
				// Батч эмбеддингов категорий (один вызов)
				if (categories.length > 0) {
					categoryEmbeddings = await getEmbeddingsWithFallback(
						categories,
						newsTexts.length
					) // startIndex для tfidf
				}
				// Батч эмбеддингов новостей (один вызов)
				newsEmbeddings = await getEmbeddingsWithFallback(newsTexts, 0)
				// Проверка на fallback (dims != 384)
				if (newsEmbeddings.length > 0 && newsEmbeddings[0].length !== 384) {
					useFallback = true
					initTfIdf(allTextsForTfIdf)
					console.log('Using TF-IDF fallback for embeddings')
				}
			} catch (error) {
				console.error(
					'Global embedding error, using full fallback:',
					error.message
				)
				useFallback = true
				initTfIdf(allTextsForTfIdf)
				// Перегенерируем embeddings как TF-IDF
				newsEmbeddings = newsTexts.map((_, i) => computeTfIdfEmbedding(i))
				categoryEmbeddings = categories.map((_, i) =>
					computeTfIdfEmbedding(newsTexts.length + i)
				)
			}
			// Дедупликация: Сравнение с previous + между новыми (O(n²))
			const uniqueNews = []
			const uniqueIndices = new Set()
			const allPreviousEmbeddings = [...previousEmbeddings] // Копируем (предполагаем HF dims)
			const uniqueEmbeddings = [] // Для новых уникальных
			for (let i = 0; i < news.length; i++) {
				if (uniqueIndices.has(i)) continue
				const currentNews = news[i]
				const currentText = newsTexts[i]
				let currentEmbedding = newsEmbeddings[i]
				let isDuplicate = false
				// Сравнение с previous
				for (let prevEmb of allPreviousEmbeddings) {
					let sim
					if (useFallback) {
						// Ultra-fallback: JaroWinkler (строковое, независимо от dims)
						sim = jaroWinklerSimilarity(currentText, '') // Проблема: previous — векторы, не текст. Для простоты: пропускаем deep previous в fallback или используем только cosine если dims match
						// Лучше: Если previous dims == current, cosine; else Jaro (но previous текст не известен — approx 0.5 или skip)
						if (
							currentEmbedding.length === prevEmb.length &&
							prevEmb.length > 0
						) {
							sim = cosineSimilarity(currentEmbedding, prevEmb)
						} else {
							sim = jaroWinklerSimilarity(currentText, currentText) // Self=1, но для previous approx low; на практике: используем 0.5 threshold adjust или log warn
							console.warn(
								`Dims mismatch for previous embedding ${i}, using Jaro approx: ${sim}`
							)
							sim = 0.5 // Conservative: не считать дубликатом если mismatch
						}
					} else {
						sim = cosineSimilarity(currentEmbedding, prevEmb)
					}
					if (sim > DUPLICATE_THRESHOLD) {
						isDuplicate = true
						break
					}
				}
				// Если не дубликат previous, сравнить с предыдущими уникальными новыми
				if (!isDuplicate) {
					for (let j of uniqueIndices) {
						let prevNewEmb = newsEmbeddings[j]
						let sim
						if (useFallback) {
							sim = computeTfIdfSimilarity(i, j)
						} else {
							sim = cosineSimilarity(currentEmbedding, prevNewEmb)
						}
						if (sim > DUPLICATE_THRESHOLD) {
							isDuplicate = true
							break
						}
					}
				}
				if (!isDuplicate) {
					uniqueIndices.add(i)
					uniqueNews.push({ ...currentNews, tempIndex: i }) // Сохраняем оригинал + index для tfidf
					uniqueEmbeddings.push(currentEmbedding)
					allPreviousEmbeddings.push(currentEmbedding) // Для следующих
				}
			}
			if (uniqueNews.length === 0) {
				return res.json({
					uniqueNews: [],
					totalProcessed: news.length,
					uniqueCount: 0,
					fallbackUsed: useFallback,
				})
			}
			// Классификация для уникальных (параллельно, но embeddings готовы — просто sort)
			const classifiedNews = uniqueNews.map(newsItem => {
				try {
					const embIndex = newsItem.tempIndex
					const emb = newsEmbeddings[embIndex]
					let similarities
					if (useFallback || categoryEmbeddings.length === 0) {
						// Keyword fallback
						similarities = keywordTopCategories(newsTexts[embIndex], categories)
					} else {
						const sims = categoryEmbeddings.map((catEmb, idx) =>
							cosineSimilarity(emb, catEmb)
						)
						similarities = categories
							.map((cat, idx) => ({ category: cat, similarity: sims[idx] }))
							.sort((a, b) => b.similarity - a.similarity)
							.slice(0, 3)
							.map(s => s.category)
					}
					return { ...newsItem, topCategories: similarities }
				} catch (error) {
					console.error(
						`Classification error for news ${newsItem.tempIndex}: ${error.message}`
					)
					return { ...newsItem, topCategories: [] }
				}
			})
			// Суммаризация уникальных (параллельно с limit)
			const summarizedPromises = classifiedNews.map(async newsItem => {
				try {
					const text = getNewsText(newsItem)
					const summary = await summarizeText(text)
					delete newsItem.tempIndex // Cleanup
					return { ...newsItem, summary }
				} catch (error) {
					console.error(`Summary error for news: ${error.message}`)
					delete newsItem.tempIndex
					const text = getNewsText(newsItem)
					const fallbackSentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text]
					const fallback = fallbackSentences
						.slice(0, MAX_SUMMARY_SENTENCES)
						.join(' ')
						.trim()
					const truncated =
						fallback.length > MAX_SUMMARY_LENGTH
							? fallback.slice(0, MAX_SUMMARY_LENGTH - 3).trim() + '...'
							: fallback
					return { ...newsItem, summary: truncated }
				}
			})
			const summarizedNews = await Promise.all(summarizedPromises)
			// Формируем embeddingsForDB (только уникальные)
			const embeddingsForDB = uniqueEmbeddings
			// Возврат: без embeddings в основном (для БД optional)
			const responseData = summarizedNews.map(({ tempIndex, ...rest }) => rest) // Cleanup если остался
			res.json({
				uniqueNews: responseData,
				totalProcessed: news.length,
				uniqueCount: summarizedNews.length,
				fallbackUsed: useFallback,
				embeddingsForDB, // Для сохранения в БД как previous
			})
		}
		// Эндпоинт
		app.post('/process-news', async (req, res) => {
			try {
				await processNews(req, res)
			} catch (error) {
				console.error('Processing error:', error)
				res
					.status(500)
					.json({ error: 'Internal server error', details: error.message })
			}
		})
		app.listen(port, () => {
			console.log(`Server running on http://localhost:${port}`)
			console.log(
				'Use POST /process-news with {news: [...], categories: [...], previousEmbeddings: [[...]]}'
			)
		})
	}
}

export default TimeService()
