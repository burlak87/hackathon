import Router from 'express'
import NewsController from './controller/NewsController.js'
import NotificationController from './controller/NotificationController.js'

const router = new Router()

router.get('/posts', NewsController.getPosts)

router.post('/notification', NotificationController.sending) // Отправка данных фильтрации тгботу, чтобы он мог присылать инфу в тг
router.post('/notificationByAuthor', NotificationController.sending) // Отправка данных в специализированного бота для авторов сервиса 

export default router
