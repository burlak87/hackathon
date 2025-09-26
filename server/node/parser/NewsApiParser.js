const NewsSource = require('../interface/NewsSource');
const axios = require('axios')

class NewsApiParser extends NewsSource {
  constructor(apiKey) {
    super('NewsAPI');
    this.apiKey = apiKey;
    this.baseUrl = 'https://newsapi.org/v2/everything';
  }

  async fetchNews(options = { q: 'technology', pageSize: 10 }) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: options.q || 'news',
          apiKey: this.apiKey,
          pageSize: options.pageSize || 10,
          sortBy: 'publishedAt'
        }
      });

      return response.data.articles.map(article => ({
        title: article.title,
        summary: article.description,
        url: article.url,
        date: new Date(article.publishedAt),
        source: article.source.name
      }));
    } catch (error) {
      console.error('NewsAPI error: ', error.message);
      return [];
    }
  }
}

export default new NewsApiParser()