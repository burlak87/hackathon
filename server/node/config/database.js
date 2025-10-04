// import { Pool } from 'pg' // ESM-импорт для pg
// import 'dotenv/config'

// const pool = new Pool({
// 	host: process.env.DB_HOST || 'localhost',
// 	port: process.env.DB_PORT || 5432,
// 	database: process.env.DB_NAME || 'myapp_db',
// 	user: process.env.DB_USER || 'postgres',
// 	password: process.env.DB_PASSWORD || '',
// 	ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
// 	// Дополнительные опции для производительности
// 	max: 20, // Максимум соединений в пуле (настройте под нагрузку)
// 	idleTimeoutMillis: 30000, // Закрывать idle-соединения через 30s
// 	connectionTimeoutMillis: 2000, // Таймаут подключения 2s
// 	// Если используете DATABASE_URL (production) — раскомментируйте
// 	// connectionString: process.env.DATABASE_URL,
// 	// ssl: { rejectUnauthorized: false },
// 	// ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
// })
// pool.on('error', err => {
// 	console.error('Unexpected error on idle client', err)
// 	process.exit(-1)
// })

// async function testConnection() {
// 	try {
// 		const client = await pool.connect()
// 		console.log('PostgreSQL подключен успешно')
// 		client.release()
// 	} catch (err) {
// 		console.error('Ошибка подключения к PostgreSQL:', err.message)
// 		throw err
// 	}
// }

// export { pool, testConnection }

// Используем require для dotenv — надёжнее в ESM
import dotenv from 'dotenv';
dotenv.config();  // Загружает .env из корня
import { Pool } from 'pg';
let pool;
// Отладка: Логируем все env-переменные БД
console.log('=== ОТЛАДКА ENV ===');
console.log('DB_MOCK value:', process.env.DB_MOCK, '(type:', typeof process.env.DB_MOCK, ')');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PASSWORD exists?', !!process.env.DB_PASSWORD);  // Без показа значения
console.log('====================');
// Проверяем, нужно ли использовать mock (заглушку) — гибкая проверка
const useMock = process.env.DB_MOCK?.toLowerCase() === 'true' || process.env.DB_MOCK === '1';
if (useMock) {
	console.log(
		'🚀 Используется MOCK-подключение к БД (без реального PostgreSQL)'
	)

	// Mock Pool — имитирует поведение реального pool (тот же код, что раньше)
	pool = {
		query: async (queryText, params) => {
			console.log(`[MOCK] Выполнен запрос: ${queryText.substring(0, 100)}...`)

			// Имитируем проверку существования таблицы (для миграции)
			if (
				queryText.includes('information_schema.tables') &&
				queryText.includes('news')
			) {
				return { rows: [{ table_exists: true }] } // "Таблица существует" — миграция пропустится
			}

			// Имитируем COUNT для таблицы news
			if (queryText.includes('SELECT COUNT(*)') && queryText.includes('news')) {
				return { rows: [{ count: 0 }] } // Или >0 для заполненной
			}

			// Имитируем создание таблицы
			if (queryText.includes('CREATE TABLE news')) {
				console.log('[MOCK] Таблица news "создана"')
				return { rows: [] }
			}

			// Имитируем создание индексов
			if (queryText.includes('CREATE INDEX') && queryText.includes('news')) {
				console.log('[MOCK] Индексы для news "созданы"')
				return { rows: [] }
			}

			// Для других запросов к news — фейковые данные
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

			// Fallback
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

// Тестовая функция (работает с mock/реальным)
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
// Опционально: автотест в development (закомментируйте, если мешает)
if (process.env.NODE_ENV === 'development') {
  testConnection().catch(console.error);
}
export { pool, testConnection };