import NewsSource from "../interface/NewsSource.js"
import axios from 'axios'
import cheerio from 'cheerio'
import { searchLast } from "../helpers/searchLast.js"
class TelegramParser extends NewsSource {
	constructor(botToken, channelId) {
		super('Telegram')
		this.botToken = botToken
		this.channelId = channelId.startsWith('@') ? channelId : `@${channelId}`
		this.source = this.channelId
	}
	async fetchNews(options = { limit: 10 }) {
		let lastDate = null
		lastDate = await searchLast(lastDate, this.source)
		try {
			const url = `https://t.me/s/${this.channelId.replace('@', '')}`
			const response = await axios.get(url, { timeout: 10000 })
			const $ = cheerio.load(response.data)
			const news = []
			$('article').slice(0, options.limit).each((i, elem) => {
				const title = $(elem).find('div.tgme_widget_message_text').text().trim()
				if (!title) return
				const text = $(elem).find('div.tgme_widget_message_text').text().trim()
				const link = `https://t.me/${this.channelId.replace('@', '')}/${i + 1}`
				const parsedDate = new Date()
				if (parsedDate > lastDate) {
					news.push({
						title: title.split('\n')[0] || 'Telegram Update',
						summary_text: text,
						url: link,
						date: parsedDate,
						source: this.sourceName,
						categories: [],
					})
				}
			})
			console.log(
				`Найдено ${news.length} новых сообщений из Telegram после ${
					lastDate.toISOString().split('T')[0]
				}.`
			)
			news.reverse()
			return news
		} catch (error) {
			console.error('Telegram scraping error: ', error.message)
			return []
		}
	}
}

export default TelegramParser