import NewsSource from '../interface/NewsSource.js';
import axios from 'axios';
import { load } from 'cheerio';
import { getLastNewsDateBySource } from '../helpers/newsHelpers.js';

class TelegramParser extends NewsSource {
	constructor(botToken, channelId, source) {
		super('Telegram')
		this.botToken = botToken
		this.channelId = channelId.startsWith('@') ? channelId.slice(1) : channelId
		this.source = source
	}
	async fetchNews(options = { limit: 10 }) {
		console.log(
			`[DEBUG] TelegramParser fetchNews called for ${this.source} with new code`
		)
		let lastDate = null
		try {
			lastDate = await getLastNewsDateBySource(this.source)
			if (!lastDate) {
				lastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
			}
		} catch (error) {
			lastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
		}
		let news = await this.scrapePublicWidget(lastDate, options)
		if (news.length < options.limit / 2 && this.botToken) {
			console.log('Fallback to Telegram Bot API')
			news = news.concat(
				await this.fetchViaBotAPI(lastDate, options.limit - news.length)
			)
		}
		console.log(
			`Найдено ${news.length} новых сообщений из Telegram после ${
				lastDate.toISOString().split('T')[0]
			}.`
		)
		news.reverse()
		return news
	}
	async scrapePublicWidget(lastDate, options) {
		try {
			const url = `https://t.me/s/${this.channelId}`
			const response = await axios.get(url, {
				timeout: 15000,
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				},
			})
			const $ = load(response.data)
			const news = []
			$('.tgme_widget_message')
				.slice(0, options.limit)
				.each((i, elem) => {
					const textElem = $(elem).find('.tgme_widget_message_text')
					const title = textElem.text().trim()
					if (!title) return
					const text = title
					const link = `https://t.me/${this.channelId}/${
						$(elem)
							.find('.tgme_widget_message_date a')
							.attr('href')
							?.split('/')
							?.pop() || i + 1
					}`
					const dateStr = $(elem).find('time').attr('datetime')
					const parsedDate = dateStr ? new Date(dateStr) : new Date()
					if (parsedDate > lastDate) {
						news.push({
							title: 'Telegram Update',
							summary_text: text,
							url: link,
							date: parsedDate,
							source: this.source,
							categories: [],
						})
					}
				})
			return news
		} catch (error) {
			console.error('Telegram scraping error: ', error.message)
			return []
		}
	}
	async fetchViaBotAPI(lastDate, limit) {
		if (!this.botToken) return []
		try {
			const response = await axios.get(
				`https://api.telegram.org/bot${this.botToken}/getUpdates`,
				{
					params: {
						offset: -1,
						limit,
						timeout: 10,
						allowed_updates: ['channel_post'],
					},
					headers: {
						'User -Agent':
							'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
					},
				}
			)
			const updates = response.data.result || []
			const news = []
			updates.forEach(update => {
				if (
					update.channel_post &&
					update.channel_post.chat.username === this.channelId
				) {
					const post = update.channel_post
					const parsedDate = new Date(post.date * 1000)
					if (parsedDate > lastDate) {
						news.push({
							title: (post.text || '').split('\n')[0] || 'Telegram Update',
							summary_text: post.text || '',
							url: `https://t.me/${this.channelId}/${post.message_id}`,
							date: parsedDate,
							source: this.source,
							categories: [],
						})
					}
				}
			})
			return news.slice(0, limit)
		} catch (error) {
			console.error('Telegram Bot API error: ', error.message)
			return []
		}
	}
}
export default TelegramParser