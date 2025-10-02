import axios from "axios";
import NewsSource from "../interface/NewsSource.js";
import cheerio from "cheerio";
import { getLastNewsDateBySource } from "../helpers/newsHelpers.js"; // Импорт из helpers
// Опционально: import { insertNews } from "../helpers/newsHelpers.js"; // Для сохранения

class WebScrapingParser extends NewsSource {
	constructor(url, selectors) {
		super('Web Scraping')
		this.url = url
		this.selectors = selectors // Ожидаем: { title, link, summary, date } — date обязателен для фильтра
	}

	async fetchNews(options = { limit: 10 }) {
		let lastDate = null
		const source = this.sourceName
		try {
			lastDate = await getLastNewsDateBySource(source)
			if (!lastDate) {
				lastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
				console.log(
					`Нет новостей по источнику "${source}". Парсим за последние 24 часа.`
				)
			} else {
				console.log(
					`Последняя новость по "${source}": ${lastDate.toISOString()}. Парсим после этой даты.`
				)
			}
		} catch (error) {
			console.error('Ошибка при получении даты из БД:', error.message)
			lastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
			console.log('Fallback: парсим за последние 24 часа из-за ошибки.')
		}
		try {
			const response = await axios.get(this.url, { timeout: 10000 })
			const $ = cheerio.load(response.data)
			const news = []
			$(this.selectors.title)
				.slice(0, options.limit)
				.each((i, elem) => {
					const title = $(elem).text().trim()
					if (!title) return
					const link = $(elem).find(this.selectors.link).attr('href') || ''
					const summaryElem = $(this.selectors.summary)
						? $(elem).find(this.selectors.summary)
						: $(elem).next()
					const summary = summaryElem.length ? summaryElem.text().trim() : ''
					let parsedDate = new Date()
					if (this.selectors.date) {
						const dateElem = $(elem).find(this.selectors.date)
						if (dateElem.length) {
							const dateText =
								dateElem.text().trim() ||
								dateElem.attr('datetime') ||
								dateElem.attr('data-date')
							parsedDate = new Date(dateText)
							if (isNaN(parsedDate.getTime())) {
								const match = dateText.match(/(\d{1,2})[.-\/](\d{1,2})[.-\/](\d{4})/)
								if (match) {
									parsedDate = new Date(
										`${match[3]}-${match[2].padStart(
											2,
											'0'
										)}-${match[1].padStart(2, '0')}`
									)
								} else {
									parsedDate = new Date()
								}
							}
						}
					}
					if (parsedDate > lastDate) {
						news.push({
							title,
							summary_text: summary,
							url: link ? new URL(link, this.url).href : this.url,
							date: parsedDate,
							source,
							categories: [],
						})
					}
				})
			console.log(
				`Найдено ${news.length} новых новостей после ${
					lastDate.toISOString().split('T')[0]
				}.`
			)
			// Опционально: Сохранить в БД сразу после парсинга (раскомментируйте, если нужно)
			// try {
			//   const inserted = await insertNews(news);
			//   console.log(`Сохранено ${inserted.length} новостей в БД.`);
			// } catch (saveError) {
			//   console.error('Ошибка сохранения в БД:', saveError.message);
			//   // Не падает fetchNews — возвращаем news для ручного сохранения
			// }
			return news
		} catch (error) {
			console.error('Scraping error: ', error.message)
			return []
		}
	}
}

export default WebScrapingParser;
