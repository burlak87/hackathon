import FactoryService from './FactoryService.js'

class TimeService {
	async factory() {
		const config = {
			newsapi: { apiKey: 'your-news-key' },
			telegram: { botToken: 'your-bot-token', channelId: '@prime1' },
			scraping: {
				url: 'https://www.bcs-express.ru/news',
				selectors: {
					title: 'h3.news-title',
					summary: '.news-summary',
					link: 'a',
				},
			},
		}

		for (const key in config) {
			if (key.startsWith('newsapi')) {
				const parser = FactoryService.create('newsapi', config.newsapi)
				const news = await parser.fetchNews({ q: 'technology', pageSize: 5 })
				console.log('Fetched news: ', news)
			} else if (key.startsWith('telegram')) {
				const parser = FactoryService.create('newsapi', config.telegram.botToken, config.telegram.channelId)
				const news = await parser.fetchNews({ limit: 5 })
				console.log('Fetched news: ', news)
			} else if (key.startsWith('scraping')) {
				const parser = FactoryService.create('newsapi', config.scraping.url, config.scraping.selectors)
				const news = await parser.fetchNews({ limit: 5 })
				console.log('Fetched news: ', news)
			}
		}
	}
}

export default TimeService()
