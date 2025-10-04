const { Pool } = require('pg')
require('dotenv').config()
const pool = new Pool({
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 5432,
	database: process.env.DB_NAME || 'myapp_db',
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || '',
	ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, 
	// Дополнительные опции для производительности
	max: 20, // Максимум соединений в пуле (настройте под нагрузку)
	idleTimeoutMillis: 30000, // Закрывать idle-соединения через 30s
	connectionTimeoutMillis: 2000, // Таймаут подключения 2s
	// Если используете DATABASE_URL (production) — раскомментируйте
  // connectionString: process.env.DATABASE_URL,
	// ssl: { rejectUnauthorized: false },
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})
pool.on('error', err => {
	console.error('Unexpected error on idle client', err)
	process.exit(-1)
})

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL подключен успешно');
    client.release();
  } catch (err) {
    console.error('Ошибка подключения к PostgreSQL:', err.message);
    throw err;
  }
}

export default { pool, testConnection }