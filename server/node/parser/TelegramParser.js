import NewsSource from "../interface/NewsSource.js"
import TelegramBot from "node-telegram-bot-api"
import { searchLast } from "../helpers/searchLast.js"

class TelegramParser extends NewsSource {
  constructor(botToken, channelId) {
    super('Telegram');
    this.bot = new TelegramBot(botToken, { polling: true });
    this.url = channelId;
    this.recentMessages = new Set();
    this.source = channelId.startsWith('@') ? channelId : `@${channelId}`;
  }

	async fetchNews(options = { limit: 10 }) {
		let lastDate = null
		lastDate = await searchLast(lastDate, this.source)
		// Для тестовой версии с лимитом; в production — используйте getChatHistory или интеграция с events или API calls
		try {
			const chatId = this.source
			const updates = await this.bot.getUpdates({
				offset: -1,
				limit: options.limit,
			})
			const news = []
			for (const update of updates) {
				if (
					update.message &&
					update.message.chat.id.toString() === chatId.replace('@', '')
				) {
					const text = update.message.text || ''
					if (!text) continue
					const textHash = text.substring(0, 50)
					if (this.recentMessages.has(textHash)) continue
					this.recentMessages.add(textHash)
					const parsedDate = new Date(update.message.date * 1000)
					if (isNaN(parsedDate.getTime())) {
						parsedDate = new Date()
					}
					if (parsedDate > lastDate) {
						news.push({
							title: text.split('\n')[0] || 'Telegram Update',
							summary_text: text,
							url: `https://t.me/${chatId.replace('@', '')}`,
							date: parsedDate,
							source: this.sourceName,
							categories: [],
						})
					}
				}
			}
			console.log(
				`Найдено ${news.length} новых сообщений после ${
					lastDate.toISOString().split('T')[0]
				}.`
			)
			news.reverse()
			// Опционально: Сохранить в БД сразу (раскомментируйте)
			// try {
			//   const inserted = await insertNews(news);
			//   console.log(`Сохранено ${inserted.length} новостей в БД.`);
			// } catch (saveError) {
			//   console.error('Ошибка сохранения в БД:', saveError.message);
			// }
			return news
		} catch (error) {
			console.error('Telegram error: ', error.message)
			return []
		}
	}
}

export default TelegramParser