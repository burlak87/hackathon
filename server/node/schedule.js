import TimeService from './service/TimeService'
import cron from 'node-cron'

cron.schedule('0 * * * *', () =>{ 
  TimeService.factory()
}, {
  scheduled: true,
  timezone: "Europe/Moscow"
})