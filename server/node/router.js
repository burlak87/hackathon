import Router from 'express'
import NewsController from './controller/NewsController.js'

const router = new Router()

router.get('/news', NewsController.getNews)

export default router