import TimeService from './service/TimeService.js'
import cron from 'node-cron'

cron.schedule('0 * * * *', () =>{ 
  TimeService.factoryNews()
}, {
  scheduled: true,
  timezone: "Europe/Moscow"
})