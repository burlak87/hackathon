import FactoryService from './FactoryService.js'
import { cosineSimilarity, initTfIdf, computeTfIdfSimilarity, jaroWinklerSimilarity, getEmbeddingsWithFallback } from '../helpers/embeddingsHelper.js'
import { getNewsText, keywordTopCategories, summarizeText } from '../helpers/summarizationHelper.js'
import { NEWS_CONFIG } from './helpers/config.js'
import pLimit from 'p-limit'
import { insertNews } from '../helpers/newsHelpers.js'

const categories = ['Политика', 'Экономика', 'Спорт', 'Технологии', 'Культура'];

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
				newsList.push(...news)
			} else if (key.startsWith('telegram')) {
				const parser = FactoryService.create(
					'telegram',
					config.telegram.botToken,
					config.telegram.channelId
				)
				const news = await parser.fetchNews({ limit: 5 })
				console.log('Fetched news: ', news)
				newsList.push(...news)
			} else if (key.startsWith('scraping')) {
				const parser = FactoryService.create(
					'scraping',
					config.scraping.url,
					config.scraping.selectors
				)
				const news = await parser.fetchNews({ limit: 5 })
				console.log('Fetched news: ', news)
				newsList.push(...news)
			}
		}

		const news = newsList.flat().map(item => {
			if (typeof item === 'string') {
				return { title: item, content: '', url: '' }
			}
			return item
		})

		let previousEmbeddings = []

		const processNewsLocal = async (
			inputNews,
			inputCategories,
			inputPreviousEmbeddings
		) => {
			let localUseFallback = false
			const {
				news: inputNewsLocal,
				categories: inputCategoriesLocal,
				previousEmbeddings: inputPreviousEmbeddingsLocal,
			} = {
				news: inputNews,
				categories: inputCategories,
				previousEmbeddings: inputPreviousEmbeddings,
			}
			if (!inputNewsLocal || !Array.isArray(inputNewsLocal)) {
				throw new Error('Invalid input: news must be an array')
			}
			const newsTexts = inputNewsLocal.map(getNewsText)
			const allTextsForTfIdf = [...newsTexts, ...inputCategoriesLocal]
			let newsEmbeddings = []
			let categoryEmbeddings = []
			try {
				if (inputCategoriesLocal.length > 0) {
					categoryEmbeddings = await getEmbeddingsWithFallback(
						inputCategoriesLocal,
						newsTexts.length
					)
				}
				newsEmbeddings = await getEmbeddingsWithFallback(newsTexts, 0)
				if (newsEmbeddings.length > 0 && newsEmbeddings[0].length !== 384) {
					localUseFallback = true
					initTfIdf(allTextsForTfIdf)
					console.log('Using TF-IDF fallback for embeddings')
				}
			} catch (error) {
				console.error(
					'Global embedding error, using full fallback:',
					error.message
				)
				localUseFallback = true
				initTfIdf(allTextsForTfIdf)
				newsEmbeddings = newsTexts.map((_, i) => {
					const vec = []
					globalTfIdf.tfidfs(i, (idx, measure) => vec.push(measure || 0))
					return vec
				})
				categoryEmbeddings = inputCategoriesLocal.map((_, i) => {
					const vec = []
					globalTfIdf.tfidfs(newsTexts.length + i, (idx, measure) =>
						vec.push(measure || 0)
					)
					return vec
				})
			}

			const uniqueNews = []
			const uniqueIndices = new Set()
			const allPreviousEmbeddings = [...inputPreviousEmbeddingsLocal]
			const uniqueEmbeddings = []
			for (let i = 0; i < inputNewsLocal.length; i++) {
				if (uniqueIndices.has(i)) continue
				const currentNews = inputNewsLocal[i]
				const currentText = newsTexts[i]
				let currentEmbedding = newsEmbeddings[i]
				let isDuplicate = false

				for (let prevEmb of allPreviousEmbeddings) {
					let sim
					if (localUseFallback) {
						if (
							currentEmbedding.length === prevEmb.length &&
							prevEmb.length > 0
						) {
							sim = cosineSimilarity(currentEmbedding, prevEmb)
						} else {
							console.warn(
								`Dims mismatch for previous embedding ${i}, using conservative sim`
							)
							sim = 0.5
						}
					} else {
						sim = cosineSimilarity(currentEmbedding, prevEmb)
					}
					if (sim > NEWS_CONFIG.DUPLICATE_THRESHOLD) {
						isDuplicate = true
						break
					}
				}
				if (!isDuplicate) {
					for (let j of uniqueIndices) {
						let sim
						if (localUseFallback) {
							sim = computeTfIdfSimilarity(i, j)
						} else {
							sim = cosineSimilarity(currentEmbedding, newsEmbeddings[j])
						}
						if (sim > NEWS_CONFIG.DUPLICATE_THRESHOLD) {
							isDuplicate = true
							break
						}
					}
				}
				if (!isDuplicate) {
					uniqueIndices.add(i)
					uniqueNews.push({ ...currentNews, tempIndex: i })
					uniqueEmbeddings.push(currentEmbedding)
					allPreviousEmbeddings.push(currentEmbedding)
				}
			}
			if (uniqueNews.length === 0) {
				return {
					uniqueNews: [],
					totalProcessed: inputNewsLocal.length,
					uniqueCount: 0,
					fallbackUsed: localUseFallback,
					embeddingsForDB: [],
				}
			}

			const classifiedNews = uniqueNews.map(newsItem => {
				try {
					const embIndex = newsItem.tempIndex
					const emb = newsEmbeddings[embIndex]
					let topCategories
					if (localUseFallback || categoryEmbeddings.length === 0) {
						topCategories = keywordTopCategories(
							newsTexts[embIndex],
							inputCategoriesLocal
						)
					} else {
						const sims = categoryEmbeddings.map((catEmb, idx) =>
							cosineSimilarity(emb, catEmb)
						)
						topCategories = inputCategoriesLocal
							.map((cat, idx) => ({ category: cat, similarity: sims[idx] }))
							.sort((a, b) => b.similarity - a.similarity)
							.slice(0, 3)
							.map(s => s.category)
					}
					return { ...newsItem, topCategories }
				} catch (error) {
					console.error(
						`Classification error for news ${newsItem.tempIndex}: ${error.message}`
					)
					return { ...newsItem, topCategories: [] }
				}
			})

			const summarizeLimit = pLimit(NEWS_CONFIG.LIMIT_CONCURRENCY)
			const summarizedPromises = classifiedNews.map(newsItem =>
				summarizeLimit(async () => {
					try {
						const text = getNewsText(newsItem)
						const summary = await summarizeText(text)
						delete newsItem.tempIndex
						return { ...newsItem, summary }
					} catch (error) {
						console.error(`Summary error for news: ${error.message}`)
						delete newsItem.tempIndex
						const text = getNewsText(newsItem)
						const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text]
						const fallback = sentences
							.slice(0, NEWS_CONFIG.MAX_SUMMARY_SENTENCES)
							.join(' ')
							.trim()
						const truncated =
							fallback.length > NEWS_CONFIG.MAX_SUMMARY_LENGTH
								? fallback.slice(0, NEWS_CONFIG.MAX_SUMMARY_LENGTH - 3).trim() +
								  '...'
								: fallback
						return { ...newsItem, summary: truncated }
					}
				})
			)
			const summarizedNews = await Promise.all(summarizedPromises)
			const embeddingsForDB = uniqueEmbeddings
			const responseData = summarizedNews.map(({ tempIndex, ...rest }) => rest)
			return {
				uniqueNews: responseData,
				totalProcessed: inputNewsLocal.length,
				uniqueCount: summarizedNews.length,
				fallbackUsed: localUseFallback,
				embeddingsForDB,
			}
		}
		const processed = await processNewsLocal(
			news,
			categories,
			previousEmbeddings
		)
		const uniqueNewsList = processed.uniqueNews
		const summaryNewsList = []
		for (let i = 0; i < uniqueNewsList.length; i++) {
			console.log(uniqueNewsList[i])
			summaryNewsList.push(uniqueNewsList[i])
		}

		const uniqueNewsListForDB = uniqueNewsList.map(item => ({
			...item,
			summary_text: item.summary || '',
			categories: item.topCategories || [],
		}))
		try {
			const inserted = await insertNews(uniqueNewsListForDB)
			console.log(`Сохранено ${inserted.length} уникальных новостей в БД`)
		} catch (saveError) {
			console.error('Ошибка сохранения в БД:', saveError.message)
		}

		console.log(
			`Processed: ${processed.totalProcessed} total, ${processed.uniqueCount} unique, fallback: ${processed.fallbackUsed}`
		)
		return { uniqueNewsList, summaryNewsList, processed }
	}
}

export default TimeService()