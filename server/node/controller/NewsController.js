import NewsService from '../service/NewsService.js'

class NewsController {
  async getAll(req, res) {
    try {
      const posts = await NewsService.getAll()
      return res.json(posts)
    } catch (e) {
      res.status(500).json(e.message)
    }
  }
  
  // async sending(req, res) {
  //   try {
  //     const { recipientId, message } = req.body
  //     // recipientId = 806974705
  //     const token = '7059882388:AAEQkQ0XGAeSwCrT20WEx_ayeDro621x5yI'
  //     const notification = await BotNewsService.sending(
  //       recipientId,
  //       message,
  //       token
  //     )
  //     res.json(notification)
  //   } catch (e) {
  //     res.status(500).json(e.message)
  //   }
  // }
}

export default new NewsController()