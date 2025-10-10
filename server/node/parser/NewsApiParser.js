import NewsSource from "../interface/NewsSource.js"
import Parser from 'rss-parser';

const parser = new Parser();

class NewsApiParser extends NewsSource {
  constructor(apiKey, source) {
    super('NewsAPI');
    this.apiKey = apiKey;
    this.source = source;
  }
  async fetchNews(options = { pageSize: 15 }) {
    try {
      const feed = await parser.parseURL(this.apiKey);
      const news = feed.items.slice(0, options.pageSize).map(item => ({
        title: item.title,
        summary_text: item.contentSnippet || item.description || '',
        url: item.link,
        date: new Date(item.pubDate || item.isoDate),
        source: this.source,
        categories: [],
	    }));
      console.log(`Parsed ${news.length} items from RSS`);
      return news;
    } catch (error) {
      console.error('RSS parse error:', error.message);
      return [];
    }
  }
}

export default NewsApiParser