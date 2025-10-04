// import Notification from '../models/Notification.js'
// import TelegramBot from 'node-telegram-bot-api'

// class NotificationService {
// 	async sending(id, txt, token) {
// 		if (!id || !txt || !token) throw new Error('Не все данные указанны')

// 		if (isNaN(id)) throw new Error('ID чата должен быть числом')

// 		const bot = new TelegramBot(token, { polling: true })

// 		try {
// 			const createdNotification = await Notification.create({
// 				chatId: id,
// 				text: txt,
// 			})
// 			await bot.sendMessage(id, `Заявка: ${txt}`)
// 			return createdNotification
// 		} catch (e) {
// 			if (e.code === 'ETELEGRAM') {
// 				throw new Error('Ошибка Telegram API: ' + e.message)
// 			} else if (e.name === 'ValidationError') {
// 				throw new Error('Ошибка валидации данных: ' + e.message)
// 			} else {
// 				throw new Error('Внутренняя ошибка сервера')
// 			}
// 		} finally {
// 			bot.close()
// 		}
// 	}
// }

// export default new NotificationService()
