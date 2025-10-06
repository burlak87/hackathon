import express from 'express'
import router from './router.js'
import cors from 'cors'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import { pool, testConnection } from './config/database.js'
import runMigrations from './models/News.js'
import dotenv from 'dotenv'
import TimeService from './service/TimeService.js'

dotenv.config()

const PORT = process.env.PORT || 3001
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('../../public/downloads'))
app.use(fileUpload({}))
app.use('/api-v1', router)

async function startApp() {
	try {
		await testConnection()
		await runMigrations()
		console.log('База данных инициализирована')
		app.listen(PORT, async () => {
			console.log('SERVER STARTED ON PORT ' + PORT)
			try {
				console.log('Initializing: Starting first news fetch and processing...')
				await TimeService.factoryNews()
				console.log('Initialization: First news processing completed.')
			} catch (initError) {
				console.error('Initialization error:', initError.message)
			}
			import('./schedule.js').then(() => {console.log('Cron scheduler started (every 30 minutes)')}).catch(cronError => {console.error('Cron import error:', cronError.message)
      })
		})
		import('./schedule.js').then(() => console.log('Cron scheduler started'))
	} catch (error) {
		console.error('Failed to start app:', error.message)
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