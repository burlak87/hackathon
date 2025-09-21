import mongoose from 'mongoose'

const Notification = new mongoose.Schema({
  chatId: { type: String, required: true },
  text: { type: String, required: true },
})

export default mongoose.model('Notification', Notification)
