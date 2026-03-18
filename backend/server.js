/**
 * server.js — Entry point (COMPLETE)
 */
require('dotenv').config()

const app                = require('./app')
const { testConnection } = require('./src/config/db')
const { initCronJobs }   = require('./src/services/cron.service')
const { initBot }        = require('./src/config/telegram')
const logger             = require('./src/utils/logger')

const PORT = process.env.PORT || 5000

const start = async () => {
  await testConnection()

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`)
    logger.info(`📌 Environment: ${process.env.NODE_ENV || 'development'}`)
  })

  initCronJobs()
  initBot()
}

start()
