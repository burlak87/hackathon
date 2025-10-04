import NewsSource from '../interface/NewsSource.js'
import axios from 'axios'
import { searchLast } from '../helpers/searchLast.js'

class NewsApiParser extends NewsSource {
	constructor(apiKey) {
		super('NewsAPI')
		this.apiKey = apiKey
		this.baseUrl = 'https://newsapi.org/v2/everything'
	}

  async fetchNews(options = { q: 'technology', pageSize: 10, source: null }) {
		let lastDate = null
		const querySource = options.source
		if (querySource) {
			lastDate = await searchLast(lastDate, querySource)
		} else {
			lastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
			console.log(
				'Нет указанного source. Парсим за последние 24 часа (общий запрос).'
			)
		}
    try {
			const params = {
				q: options.q || 'news',
				apiKey: this.apiKey,
				pageSize: options.pageSize || 10,
				sortBy: 'publishedAt',
				from: lastDate.toISOString().split('T')[0],
				...(options.language && { language: options.language }),
				...(querySource && { sources: querySource }),
			}
			const response = await axios.get(this.baseUrl, { params, timeout: 10000 })
			if (response.data.status !== 'ok') {
				throw new Error(`NewsAPI status: ${response.data.message}`)
			}
			const news = response.data.articles
				.filter(article => article.publishedAt)
				.map(article => {
					const parsedDate = new Date(article.publishedAt)
					if (isNaN(parsedDate.getTime())) {
						parsedDate = new Date()
					}
					if (parsedDate <= lastDate) return null
					return {
						title: article.title || 'No Title',
						summary_text: article.description || '',
						url: article.url,
						date: parsedDate,
						source: article.source.name,
						categories: [],
					}
				})
				.filter(Boolean)
			console.log(
				`Найдено ${news.length} новых статей после ${
					lastDate.toISOString().split('T')[0]
				}.`
			)
			// try {
			//   const inserted = await insertNews(news);
			//   console.log(`Сохранено ${inserted.length} новостей в БД.`);
			// } catch (saveError) {
			//   console.error('Ошибка сохранения в БД:', saveError.message);
			// }
			return news
		} catch (error) {
			console.error('NewsAPI error: ', error.message)
			return []
		}
  }
}

export default NewsApiParser