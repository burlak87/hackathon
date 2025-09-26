import Router from 'express'
import NewsController from './controller/NewsController.js'
import NotificationController from './controller/NotificationController.js'

const router = new Router()

router.get('/posts', NewsController.getAll) // Получение всех статей, по идеи должно учитывать фильтрацию
// router.get('/posts/:id', PostController.getOne)
// router.post('/posts', PostController.create)
// router.put('/posts', PostController.update)
// router.delete('/posts/:id', PostController.delete)

router.post('/notification', NotificationController.sending) // Отправка данных фильтрации тгботу, чтобы он мог присылать инфу в тг
router.post('/notificationByAuthor', NotificationController.sending) // Отправка данных в специализированного бота для авторов сервиса 

export default router
