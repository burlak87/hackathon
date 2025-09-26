import NewsSource from "../interface/NewsSource";
import TelegramBot from "node-telegram-bot-api";

class TelegramParser extends NewsSource {
	constructor(botToken, channelId) {
		super('Telegram')
		this.bor = new TelegramBot(botToken, { polling: true })
		this.url = channelId
		this.recentMessages = new Set()
	}

	async fetchNews() {}
}

export default new TelegramParser