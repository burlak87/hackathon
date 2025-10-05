import TimeService from './service/TimeService.js'
import cron from 'node-cron'

cron.schedule('0 * * * *', async () => {
  try {
    await TimeService.factoryNews()
  } catch (error) {
    console.error('Cron error: ', error.message)
  }
}, {
  scheduled: true,
  timezone: "Europe/Moscow"
})

console.log('Cron scheduler initialized');