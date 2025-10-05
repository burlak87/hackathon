import NewsService from '../service/NewsService.js'

class NewsController {
  async getNews(req, res) {
    try {
      const { category, source } = req.query
      const posts = await NewsService.getNews({ category, source })
      res.json(posts)
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: "Internal Server Error", message: e.message })
    }
  }
}

export default new NewsController()