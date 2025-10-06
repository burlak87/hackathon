import FactoryService from './FactoryService.js'
import { cosineSimilarity, initTfIdf, computeTfIdfSimilarity, jaroWinklerSimilarity, getEmbeddingsWithFallback } from '../helpers/embeddingsHelper.js'
import { getNewsText, keywordTopCategories, summarizeText } from '../helpers/summarizationHelper.js'
import { NEWS_CONFIG } from '../helpers/config.js'
import pLimit from 'p-limit'
import { insertNews } from '../helpers/newsHelpers.js'

import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.allowRemoteModels = true;

const categories = [
	'Политика',
	'Экономика',
	'Спорт',
	'Технологии',
	'Культура',
	'Общество',
	'Бизнес',
	'Наука',
	'Здоровье',
	'Развлечения',
	'игры',
]

class TimeService {
	async factoryNews() {
		const config = {
			'newsapi-cnn': { apiKey: 'http://rss.cnn.com/rss/edition.rss' },
			'newsapi-the-guardian': { apiKey: 'https://www.theguardian.com/uk/rss' },
			'newsapi-npr': { apiKey: 'https://www.npr.org/rss/rss.php?id=1001' },
			'newsapi-skynews': {
				apiKey: 'https://feeds.skynews.com/feeds/rss/world.xml',
			},
			'newsapi-cbsnews': {
				apiKey: 'https://www.cbsnews.com/latest/rss/main',
			},
			'telegram-halyvaigr_tg': {
				botToken: process.env.TELEGRAM_BOT_TOKEN,
				channelId: 'halyvaigr_tg',
			},
			'telegram-strudio': {
				botToken: process.env.TELEGRAM_BOT_TOKEN,
				channelId: 'strudio',
			},
			'telegram-sql-ready': {
				botToken: process.env.TELEGRAM_BOT_TOKEN,
				channelId: 'sql_ready',
			},
			'telegram-golang-interview': {
				botToken: process.env.TELEGRAM_BOT_TOKEN,
				channelId: 'golang_interview',
			},
			'telegram-durov': {
				botToken: process.env.TELEGRAM_BOT_TOKEN,
				channelId: 'durov',
			},
			'scraping-rbc': {
				url: 'https://www.rbc.ru/',
				selectors: {
					title: 'h2[data-test="news-item-title"]',
					summary: '.news-item__text',
					link: 'a',
				},
			},
			'scraping-lenta': {
				url: 'https://lenta.ru/',
				selectors: {
					title: '.card-full-news__title',
					summary: '.card-full-news__text',
					link: 'a[href]',
				},
			},
			'scraping-kommersant': {
				url: 'https://www.kommersant.ru/',
				selectors: {
					title: '.news__title',
					summary: '.news__lead',
					link: '.news__link',
				},
			},
			'scraping-vedomosti': {
				url: 'https://www.vedomosti.ru/',
				selectors: {
					title: 'h3.u-h3',
					summary: '.lenta-item__text',
					link: 'a',
				},
			},
			'scraping-izvestia': {
				url: 'https://iz.ru/',
				selectors: {
					title: '.block-news__title',
					summary: '.block-news__lead',
					link: '.block-news__link',
				},
			},
		}

		const newsList = []
		for (const key in config) {
			const sourceConfig = config[key]
			try {
				let parser
				let fetchParams
				if (key.startsWith('newsapi')) {
					parser = FactoryService.create('newsapi', sourceConfig)
					fetchParams = { q: 'technology', pageSize: 5 }
				} else if (key.startsWith('telegram')) {
					parser = FactoryService.create('telegram', sourceConfig)
					fetchParams = { limit: 5 }
				} else if (key.startsWith('scraping')) {
					parser = FactoryService.create('scraping', sourceConfig)
					fetchParams = { limit: 5 }
				} else {
					console.warn(`Unknown source type for key: ${key}`)
					continue
				}
				const news = await parser.fetchNews(fetchParams)
				console.log(`Fetched news from ${key}: `, news)
				newsList.push(...news)
			} catch (error) {
				console.error(`Error fetching from ${key}:`, error.message)
			}
		}

		const news = newsList.flat().map(item => {
			if (typeof item === 'string') {
				return { title: item, content: '', url: '' }
			}
			return item
		})

		let previousEmbeddings = []

		let summarizer = null
		const USE_SUMMARY_MODEL = process.env.USE_SUMMARY_MODEL !== 'false' 
		if (USE_SUMMARY_MODEL) {
			try {
				console.log(
					'Attempting to initialize local summarizer (Xenova/distilbart-cnn-12-6)...'
				) 
				summarizer = await pipeline(
					'summarization',
					'Xenova/distilbart-cnn-12-6',
					{
						revision: 'main',
						quantized: true,
					}
				)
				console.log(
					'Local summarizer initialized successfully. Model ready for compression.'
				)
			} catch (initError) {
				console.error(
					'Failed to init local summarizer (first attempt):',
					initError.message
				)
				try {
					console.log('Retrying summarizer init...')
					summarizer = await pipeline(
						'summarization',
						'Xenova/distilbart-cnn-12-6',
						{
							revision: 'main',
							quantized: true,
						}
					)
					console.log('Local summarizer initialized on retry.')
				} catch (retryError) {
					console.error(
						'Retry failed. Disabling model, using extractive fallback:',
						retryError.message
					)
					summarizer = null
				}
			}
		} else {
			console.log('Summary model disabled. Using extractive fallback only.')
			summarizer = null
		}
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
						).slice(0, 3)
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

			const summarizeLimit = pLimit(NEWS_CONFIG.LIMIT_CONCURRENCY || 3);
const summarizedPromises = classifiedNews.map((newsItem, index) =>
	summarizeLimit(async () => {
		try {
			const text = getNewsText(newsItem) 
			console.log(
				`[DEBUG] Processing news ${index}: Original text length = ${text.length} chars`
			)
			const cyrillicCount = (text.match(/[\u0400-\u04FF]/g) || []).length
			const isRussian = cyrillicCount / text.length > 0.1 
			console.log(
				`[DEBUG] Language detect: RU=${isRussian} (cyrillic=${cyrillicCount}/${text.length})`
			)
			let summary = ''
			const sentences = text
				.split(/([.!?]+(?:\s|$))/)
				.filter(s => s.trim().length > 10)
				.slice(0, 10) 
			const extractiveSentences = sentences.slice(0, 3)
			let extractiveSummary = extractiveSentences.join(' ').trim() + '.'
			console.log(
				`[DEBUG] Extractive: ${sentences.length} sentences → ${
					extractiveSummary.length
				} chars | Preview: "${extractiveSummary.slice(0, 100)}..."`
			)
			if (summarizer && text.length > 200 && !isRussian) {
				console.log(`[DEBUG] Using model for English text...`)
				const output = await summarizer(text, {
					max_length: 150,
					min_length: 30,
					max_new_tokens: 80,
					do_sample: false,
					truncation: true,
				})
				summary = output[0]?.summary_text?.trim() || ''
				console.log(
					`[DEBUG] Model summary length: ${
						summary.length
					} chars | Preview: "${summary.slice(0, 100)}..."`
				)
				if (
					summary.length < 50 ||
					(isRussian &&
						/[A-Z]/.test(summary) &&
						!/[\u0400-\u04FF]/.test(summary))
				) {
					console.log(
						`[DEBUG] Model output poor (short/garbled), fallback to extractive`
					)
					summary = ''
				}
			}
			summary = summary || extractiveSummary
			const finalSentences = summary
				.split(/([.!?]+(?:\s|$))/)
				.filter(s => s.trim().length > 10)
				.slice(0, 3)
			let finalSummary = finalSentences.join(' ').trim() + '.'
			if (finalSummary.length > 256) {
				finalSummary = truncateTo256(finalSummary)
				console.log(`[DEBUG] Truncated to 256 chars`)
			}
			console.log(
				`[DEBUG] Final summary length: ${
					finalSummary.length
				} chars | Preview: "${finalSummary.slice(0, 100)}..."`
			)
			delete newsItem.tempIndex
			return { ...newsItem, summary: finalSummary }
		} catch (error) {
			console.error(`[ERROR] Summary error for news ${index}: ${error.message}`)
			delete newsItem.tempIndex
			const text = getNewsText(newsItem)
			const sentences = text
				.split(/([.!?]+(?:\s|$))/)
				.filter(s => s.trim().length > 10)
			const fallbackSummary = truncateTo256(
				sentences.slice(0, 3).join(' ').trim() + '.'
			)
			console.log(
				`[DEBUG] Catch fallback: ${
					fallbackSummary.length
				} chars | Preview: "${fallbackSummary.slice(0, 100)}..."`
			)
			return { ...newsItem, summary: fallbackSummary }
		}
	})
)
						
			const summarizedNews = await Promise.all(summarizedPromises)
			console.log(
				`[DEBUG] All summaries generated: ${summarizedNews.length} items`
			)

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

		function truncateTo256(text) {
			if (text.length <= 256) return text
			let truncated = text.slice(0, 256)
			const lastSpace = truncated.lastIndexOf(' ', 253)
			if (lastSpace > 0) {
				truncated = truncated.slice(0, lastSpace)
			}
			const result = truncated.trim() + '...'
			console.log(`[DEBUG] Truncate: ${text.length} → ${result.length} chars`)
			return result
		}

		const processed = await processNewsLocal(
			news,
			categories,
			previousEmbeddings
		)
		const uniqueNewsList = processed.uniqueNews

		const summaryNewsList = []
		console.log('[DEBUG] Unique news with summaries:')
		for (let i = 0; i < uniqueNewsList.length; i++) {
			const item = uniqueNewsList[i]
			console.log(
				`News ${i}: Title="${item.title?.slice(
					0,
					50
				)}...", Summary="${item.summary?.slice(0, 100)}..." (len=${
					item.summary?.length || 0
				})`
			)
			console.log(`Full summary: ${item.summary}`) 
			console.log(`Categories: ${JSON.stringify(item.topCategories || [])}`)
			summaryNewsList.push(item)
		}

		const uniqueNewsListForDB = uniqueNewsList.map(item => ({
			...item,
			summary_text:
				item.summary || truncateTo256(item.summary_text || item.title || ''),
			categories: item.topCategories || [],
			date:
				item.date instanceof Date && !isNaN(item.date) ? item.date : new Date(),
		}))
		try {
			const inserted = await insertNews(uniqueNewsListForDB)
			console.log(
				`Сохранено ${inserted.length} уникальных новостей в БД (с summaries ≤256 chars)`
			)
		} catch (saveError) {
			console.error('Ошибка сохранения в БД:', saveError.message)
		}

		console.log(
			`Processed: ${processed.totalProcessed} total, ${processed.uniqueCount} unique, fallback: ${processed.fallbackUsed}`
		)
		return { uniqueNewsList, summaryNewsList, processed }
	}
}

export default new TimeService