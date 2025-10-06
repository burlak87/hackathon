import TimeService from './service/TimeService.js'
import cron from 'node-cron'

cron.schedule('0 * * * *', async () => {
		try {
      console.log('Cron: Starting news fetch and processing...')
			await TimeService.factoryNews()
      console.log('Cron: News processing completed.')
		} catch (error) {
			console.error('Cron error: ', error.message)
		}
	},
	{
		scheduled: true,
		timezone: 'Europe/Moscow',
	}
)

console.log('Cron scheduler initialized');