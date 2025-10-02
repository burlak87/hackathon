const { pool } = require('../config/database.js');
/**
 * Запуск миграций для таблицы news
 * - Проверяет существование таблицы.
 * - Если существует и заполнена (COUNT > 0) — пропускает.
 * - Если не существует или пуста — создаёт таблицу + индексы.
 * @returns {Promise<void>}
 */
async function runMigrations() {
	try {
		const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'news'
      ) as table_exists
    `
		const tableResult = await pool.query(tableCheckQuery)
		const tableExists = tableResult.rows[0].table_exists
		if (!tableExists) {
			console.log('Таблица news не существует. Выполняем миграцию...')
			await createTable()
			console.log('Таблица news создана.')
			return
		}

		const countQuery = `SELECT COUNT(*) as count FROM news`
		const countResult = await pool.query(countQuery)
		const rowCount = parseInt(countResult.rows[0].count)
		if (rowCount > 0) {
			console.log(
				`Таблица news существует и заполнена (${rowCount} записей). Миграция пропущена.`
			)
			return
		}

		console.log('Таблица news пуста. Выполняем миграцию...')
		await createTable()
		console.log('Таблица news создана и готова к заполнению.')
	} catch (error) {
		console.error('Ошибка миграции:', error.message)
		throw new Error(`Миграция не удалась: ${error.message}`)
	}
}

async function createTable() {
  const createTableQuery = `
    CREATE TABLE news (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      summary_text TEXT NOT NULL,
      url TEXT,
      date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      source TEXT NOT NULL,
      categories JSONB DEFAULT '[]'::JSONB
    )
  `;
  await pool.query(createTableQuery);

  const index1 = `CREATE INDEX IF NOT EXISTS idx_news_source_date ON news (source, date DESC)`;
  const index2 = `CREATE INDEX IF NOT EXISTS idx_news_source ON news (source)`;
  const uniqueIndex = `CREATE UNIQUE INDEX IF NOT EXISTS idx_news_url ON news (url)`;
  await Promise.all([
    pool.query(index1),
    pool.query(index2),
    pool.query(uniqueIndex)
  ]);
}

export default runMigrations()

// const { pool } = require('../config/database.js')
// /**
//  * Получить последнюю дату новости по источнику (source)
//  * @param {string} source - Название источника
//  * @returns {Promise<Date|null>} - Последняя дата или null, если нет новостей
//  */
// async function getLastNewsDateBySource(source) {
// 	try {
// 		const query = `
//       SELECT MAX(date) as last_date 
//       FROM news 
//       WHERE source = $1
//     `
// 		const result = await pool.query(query, [source])
// 		return result.rows[0]?.last_date || null
// 	} catch (error) {
// 		console.error(
// 			'Ошибка получения последней даты по источнику:',
// 			error.message
// 		)
// 		throw error // Или return null для fallback
// 	}
// }
// /**
//  * Вставить массив новостей в БД (batch insert для производительности)
//  * @param {Array} newsArray - Массив объектов {title, summary_text, url, date, source, categories}
//  * @returns {Promise<Array>} - Вставленные записи (с id)
//  */
// async function insertNews(newsArray) {
//   if (!Array.isArray(newsArray) || newsArray.length === 0) {
//     return [];
//   }
//   try {
//     const query = `
//       INSERT INTO news (title, summary_text, url, date, source, categories)
//       VALUES ${newsArray.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`).join(', ')}
//       ON CONFLICT (url) DO NOTHING  -- Избегать дубликатов по URL
//       RETURNING *
//     `;
    
//     // Подготавливаем параметры (flatten array)
//     const values = newsArray.flatMap(item => [
//       item.title,
//       item.summary_text || item.summary, // Адаптация под парсер
//       item.url,
//       item.date,
//       item.source,
//       JSON.stringify(item.categories || []) // JSONB
//     ]);
//     const result = await pool.query(query, values);
//     console.log(`Вставлено ${result.rowCount} новостей`);
//     return result.rows;
//   } catch (error) {
//     console.error('Ошибка вставки новостей:', error.message);
//     throw error;
//   }
// }
// /**
//  * Получить все новости (опционально, для отладки)
//  * @param {Object} options - { limit: 10 }
//  * @returns {Promise<Array>}
//  */
// async function getAllNews(options = { limit: 10 }) {
//   try {
//     const query = `SELECT * FROM news ORDER BY date DESC LIMIT $1`;
//     const result = await pool.query(query, [options.limit]);
//     return result.rows;
//   } catch (error) {
//     console.error('Ошибка получения новостей:', error.message);
//     throw error;
//   }
// }
// module.exports = {
//   getLastNewsDateBySource,
//   insertNews,
//   getAllNews
// };