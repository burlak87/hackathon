class NewsSource {
  constructor(sourceName) {
    this.sourceName = sourceName;
    if (this.constructor === NewsSource) {
      throw new Error('NewsSource is abstract and cannot be instantiated directly')
    }
  }

  async fetchNews(options = {}) {
    throw new Error('fetchNews() must be implemented by subclass')
  }
}

export default NewsSource