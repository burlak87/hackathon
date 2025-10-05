import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
let pool;
console.log('=== ОТЛАДКА ENV ===');
console.log('DB_MOCK value:', process.env.DB_MOCK, '(type:', typeof process.env.DB_MOCK, ')');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PASSWORD exists?', !!process.env.DB_PASSWORD);  // Без показа значения
console.log('====================');
const useMock = process.env.DB_MOCK?.toLowerCase() === 'true' || process.env.DB_MOCK === '1';
if (useMock) {
	console.log(
		'🚀 Используется MOCK-подключение к БД (без реального PostgreSQL)'
	)

	pool = {
		query: async (queryText, params) => {
			console.log(`[MOCK] Выполнен запрос: ${queryText.substring(0, 100)}...`)

			if (
				queryText.includes('information_schema.tables') &&
				queryText.includes('news')
			) {
				return { rows: [{ table_exists: true }] } // "Таблица существует" — миграция пропустится
			}

			if (queryText.includes('SELECT COUNT(*)') && queryText.includes('news')) {
				return { rows: [{ count: 0 }] } // Или >0 для заполненной
			}

			if (queryText.includes('CREATE TABLE news')) {
				console.log('[MOCK] Таблица news "создана"')
				return { rows: [] }
			}

			if (queryText.includes('CREATE INDEX') && queryText.includes('news')) {
				console.log('[MOCK] Индексы для news "созданы"')
				return { rows: [] }
			}

			if (queryText.includes('news')) {
				return {
					rows: [
						{
							id: 1,
							title: 'Mock News Title',
							summary_text: 'Mock summary',
							url: 'https://mock.com',
							date: new Date(),
							source: 'Mock Source',
							categories: [],
						},
					],
				}
			}

			return { rows: [] }
		},

		connect: async () => {
			console.log('[MOCK] Клиент "подключен"')
			return {
				query: pool.query.bind(pool),
				release: () => console.log('[MOCK] Клиент "отпущен"'),
			}
		},

		on: (event, handler) => {
			if (event === 'error') {
				console.log('[MOCK] Обработчик ошибки зарегистрирован')
			}
		},

		end: async () => {
			console.log('[MOCK] Pool "закрыт"')
		},
	}
} else {
	console.log('🔌 Используется реальное подключение к PostgreSQL')

	pool = new Pool({
		host: process.env.DB_HOST || 'localhost',
		port: process.env.DB_PORT || 5432,
		database: process.env.DB_NAME || 'myapp_db',
		user: process.env.DB_USER || 'postgres',
		password: process.env.DB_PASSWORD || '', // Строка!
		ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
	})

	pool.on('error', err => {
		console.error('Unexpected error on idle client', err)
		process.exit(-1)
	})
}

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL подключен успешно (или mock активен)');
    client.release();
  } catch (err) {
    console.error('Ошибка подключения к PostgreSQL:', err.message);
    throw err;
  }
}

if (process.env.NODE_ENV === 'development') {
  testConnection().catch(console.error);
}

export { pool, testConnection };