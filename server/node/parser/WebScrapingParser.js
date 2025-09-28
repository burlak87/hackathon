import axios from "axios";
import NewsSource from "../interface/NewsSource";
import cheerio from "cherio"

class WebScrapingParser extends NewsSource {
  constructor(url, selectors) {
    super('Web Scraping');
    this.url = url;
    this.selectors = selectors;
  }

  async fetchNews(options = { limit:10 } ) {
    try {
			const response = await axios.get(this.url)
			const $ = cheerio.load(response.data)

			const news = []
			$(this.selectors.title)
				.slice(0, options.limit)
				.each((i, elem) => {
					const title = $(elem).text().trim()
					const link = $(elem).find(this.selectors.link).attr('href')
					const summaryElem = $(elem).next(this.selectors.summary)
					const summary = summaryElem.length ? summaryElem.text().trim() : ''

					if (title) {
						news.push({
							title,
							summary,
							url: link ? new URL(link, this.url).href : this.url,
							date: new Date(),
							source: this.sourceName,
						})
					}
				})
			return news
		} catch (error) {
      console.error('Scraping error: ', error.message)
      return []
    }

		

		

		
  }
}

export default new WebScrapingParser