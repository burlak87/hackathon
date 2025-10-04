import express from 'express'
import router from './router.js'
import cors from 'cors'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import { pool, testConnection } from './config/database.js'
import runMigrations from './models/News.js'

const PORT = 5000 // process.env.PORT || 5000
const app = express()

app.use(bodyParser.json())
app.use(cors())
app.use(express.json())
app.use(express.static('../../public/downloads'))
app.use(fileUpload({}))
app.use('/api-v1', router)

async function startApp() {
	try {
		await testConnection()
		await runMigrations()
		console.log('База данных инициализирована')
		app.listen(PORT, () => console.log('SERVER STARTED ON PORT ' + PORT))
	} catch (error) {
		console.error('Инициализация БД провалилась', error.message)
		process.exit(1)
	}
}

startApp()

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('Пул соединений закрыт');
  process.exit(0);
});