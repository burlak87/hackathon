class NewsSource {
  constructor(config) {
    this.config = config;
    if (this.constructor === NewsSource) {
      throw new Error('NewsSource is abstract and cannot be instantiated directly')
    }
  }

  async fetchNews(options = {}) {
    throw new Error('fetchNews() must be implemented by subclass')
  }
}

export default NewsSource