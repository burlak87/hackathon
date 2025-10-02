const { pool } = require('../config/database.js')
/**
 * Получить последнюю дату новости по источнику (source)
 * @param {string} source - Название источника
 * @returns {Promise<Date|null>} - Последняя дата или null, если нет новостей
 */
async function getLastNewsDateBySource(source) {
	try {
		const query = `
      SELECT MAX(date) as last_date 
      FROM news 
      WHERE source = $1
    `
		const result = await pool.query(query, [source])
		return result.rows[0]?.last_date || null
	} catch (error) {
		console.error(
			'Ошибка получения последней даты по источнику:',
			error.message
		)
		return null // Fallback: null, чтобы парсер использовал 24ч
	}
}
/**
 * Вставить массив новостей в БД (batch insert для производительности)
 * @param {Array} newsArray - Массив объектов {title, summary_text, url, date, source, categories}
 * @returns {Promise<Array>} - Вставленные записи (с id)
 */
async function insertNews(newsArray) {
	if (!Array.isArray(newsArray) || newsArray.length === 0) {
		console.log('Нет новостей для вставки')
		return []
	}
	try {
		const query = `
      INSERT INTO news (title, summary_text, url, date, source, categories)
      VALUES ${newsArray
				.map(
					(_, i) =>
						`($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${
							i * 6 + 5
						}, $${i * 6 + 6})`
				)
				.join(', ')}
      ON CONFLICT (url) DO NOTHING  -- Избегать дубликатов по URL
      RETURNING *
    `

		// Подготавливаем параметры (flatten array)
		const values = newsArray.flatMap(item => [
			item.title,
			item.summary_text,
			item.url,
			item.date,
			item.source,
			JSON.stringify(item.categories || []), // JSONB
		])
		const result = await pool.query(query, values)
		console.log(`Вставлено ${result.rowCount} новых новостей`)
		return result.rows
	} catch (error) {
		console.error('Ошибка вставки новостей:', error.message)
		throw error // Пропагандируем ошибку, если критично
	}
}
/**
 * Получить все новости (опционально, для отладки или API)
 * @param {Object} options - { limit: 10 }
 * @returns {Promise<Array>}
 */
async function getAllNews(options = { limit: 10 }) {
  try {
    const query = `SELECT * FROM news ORDER BY date DESC LIMIT $1`;
    const result = await pool.query(query, [options.limit]);
    return result.rows;
  } catch (error) {
    console.error('Ошибка получения новостей:', error.message);
    throw error;
  }
}

export default { getLastNewsDateBySource, insertNews, getAllNews }