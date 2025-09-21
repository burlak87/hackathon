import mongoose from 'mongoose'

const BotNews = new mongoose.Schema({
  chatId: { type: String, required: true },
  text: { type: String, required: true },
})

export default mongoose.model('BotNews', BotNews)