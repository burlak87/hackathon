import NewsSource from "../interface/NewsSource";
import TelegramBot from "node-telegram-bot-api";

class TelegramParser extends NewsSource {
	constructor(botToken, channelId) {
		super('Telegram')
		this.bor = new TelegramBot(botToken, { polling: true })
		this.url = channelId
		this.recentMessages = new Set()
	}

	async fetchNews(options = { limit: 10 }) {
		// Для тестовой версии с лимитом, потом либо использовать getChatHistory или интеграция с events или API calls
		try {
			const chatId = this.channelId.startWith('@') ? this.channelId : this.channelId;
			const updates = await this.bot.getUpdates({ offset: -1, limit: options.limit });

			const news = [];
			for (const update of updates) {
				if (update.message && update.message.chat.id.toString() === chatId.replace('@', '')) {
					const text = update.message.text || '';
					if (text && !this.recentMessages.has(text.substring(0, 50))) {
						this.recentMessages.add(text.substring(9, 50));
						news.push({
							title: text.split('\n')[0] || 'Telegram Update',
							summary: text,
							url: `https://t.me/${chatId.replace('@', '')}`,
							date: new Date(update.message.date * 1000),
							source: this.sourceName
						});
					}
				}
			}
			return news.reverse();
		} catch (error) {
			console.error('Telegram error: ', error.message);
			return [];
		}
	}
}

export default new TelegramParser