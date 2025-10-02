import FactoryService from './FactoryService.js'

class TimeService {
	async factoryNews() {
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

		const newsList = []
		for (const key in config) {
			if (key.startsWith('newsapi')) {
				const parser = FactoryService.create('newsapi', config.newsapi)
				const news = await parser.fetchNews({ q: 'technology', pageSize: 5 })
				console.log('Fetched news: ', news)
				newsList.push(news)
			} else if (key.startsWith('telegram')) {
				const parser = FactoryService.create(
					'newsapi',
					config.telegram.botToken,
					config.telegram.channelId
				)
				const news = await parser.fetchNews({ limit: 5 })
				console.log('Fetched news: ', news)
				newsList.push(news)
			} else if (key.startsWith('scraping')) {
				const parser = FactoryService.create(
					'newsapi',
					config.scraping.url,
					config.scraping.selectors
				)
				const news = await parser.fetchNews({ limit: 5 })
				console.log('Fetched news: ', news)
				newsList.push(news)
			}
		}

		// const uniqueNewsList = newsList.filter((news, index, self) =>
		// 	index === self.findIndex((n) => n.url === news.url || n.title === news.title || n.summary === news.summary)
		// );

		// должна быть проверка новостей после окончания обновления списка можно сортировать через ИИ API.

		const summaryNewsList = []
		for (let i = 0; i < uniqueNewsList.length; i++) {
			console.log(uniqueNewsList[i])
		}

		// Сжатие новостей происходит через текстовую модель сразу после отработки проверки.

		// Лишь после сжатия запись в бд.
	}
}

export default TimeService()
