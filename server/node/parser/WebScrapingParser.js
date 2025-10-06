import axios from "axios";
import NewsSource from "../interface/NewsSource.js";
import { load } from "cheerio";
import { getLastNewsDateBySource } from '../helpers/newsHelpers.js'

class WebScrapingParser extends NewsSource {
	constructor(url, selectors) {
		super('WebScraping')
		this.url = url
		this.selectors = selectors
	}

	async fetchNews(options = { limit: 10 }) {
		let lastDate = null
		try {
			lastDate = await getLastNewsDateBySource(this.source)
			if (!lastDate) {
				lastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
			}
		} catch (error) {
			lastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
		}
		try {
			console.log(
				`[DEBUG] Scraping ${this.url} with selectors:`,
				this.selectors
			)
      const response = await axios.get(this.url, {
				timeout: 15000,
				headers: {
					'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				},
			})
			const $ = load(response.data)
			
			const titleElements = $(this.selectors.title)
			console.log(
					`[DEBUG] Found ${titleElements.length} title elements with selector "${this.selectors.title}"`
				)
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
							source: this.source,
							categories: [],
						})
					}
				})
			console.log(
				`[DEBUG] Total parsed items: ${titleElements.length}, new after ${
				lastDate.toISOString().split('T')[0]
				}: ${news.length}`
			)
			console.log(
				`Найдено ${news.length} новых новостей после ${
					lastDate.toISOString().split('T')[0]
				}.`
			)
			return news
		} catch (error) {
			console.error('Scraping error: ', error.message)
			return []
		}
	}
}

export default WebScrapingParser;
