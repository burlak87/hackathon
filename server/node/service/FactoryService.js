import NewsApiParser from "../parser/NewsApiParser.js";
import TelegramParser from "../parser/TelegramParser.js";
import WebScrapingParser from "../parser/WebScrapingParser.js";

class FactoryService {
  static create(type, config) {
    switch (type.toLowerCase()) {
      case 'newsapi':
        if (!config.apiKey) throw new Error('API key required for NewsAPI')
        return new NewsApiParser(config.apiKey)
      
      case 'telegram':
        if (!config.botToken || !config.channelId) throw new Error('Bot token and channel ID required for Telegram Channel')
        return new TelegramParser(config.botToken, config.channelId)

      // case 'scraping':
      //   if (!config.url || !config.selectors) throw new Error('URL and selectors required for scraping')
      //   return new WebScrapingParser(config.url, config.selectors)

      default:
        throw new Error(`Unknown parser type: ${type}`)
    }
  }
}

export default FactoryService