import tgBotNewsService from '../service/TgBotNewsService.js'

class NotificationController {
  async sending(req, res) {
    try {
      const { recipientId, message } = req.body
      // recipientId = 806974705
      const token = '7059882388:AAEQkQ0XGAeSwCrT20WEx_ayeDro621x5yI'
      const notification = await tgBotNewsService.sending(
        recipientId,
        message,
        token
      )
      res.json(notification)
    } catch (e) {
      res.status(500).json(e.message)
    }
  }
}

export default new NotificationController()
