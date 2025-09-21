import Router from 'express'
import PostController from './controller/PostController.js'
import NotificationController from './controller/NotificationController.js'

const router = new Router()

router.get('/posts', PostController.getAll)
router.get('/posts/:id', PostController.getOne)
router.post('/posts', PostController.create)
router.put('/posts', PostController.update)
router.delete('/posts/:id', PostController.delete)

router.post('/notification', NotificationController.sending)

export default router
