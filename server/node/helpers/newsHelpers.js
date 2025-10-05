import { pool } from '../config/database.js'

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
    return null
  }
}

async function insertNews(newsArray) {
	if (!Array.isArray(newsArray) || newsArray.length === 0) {
		console.log('Нет новостей для вставки')
		return []
	}
	try {
		const hasCategory = newsArray.some(item => item.category !== undefined)
		const fieldCount = hasCategory ? 7 : 6 
		const query = `
      INSERT INTO news (title, summary_text, url, date, source, categories ${
				hasCategory ? ', category' : ''
			})
      VALUES ${newsArray
				.map((_, i) => {
					const base = `($${i * fieldCount + 1}, $${i * fieldCount + 2}, $${
						i * fieldCount + 3
					}, $${i * fieldCount + 4}, $${i * fieldCount + 5}, $${
						i * fieldCount + 6
					})`
					return hasCategory
						? `${base.slice(0, -1)}, $${i * fieldCount + 7})`
						: base
				})
				.join(', ')}
      ON CONFLICT (url) DO NOTHING  -- Избегать дубликатов по URL
      RETURNING *
    `
		const values = newsArray.flatMap(item => [
			item.title,
			item.summary_text || item.summary || '',
			item.url,
			item.date,
			item.source,
			JSON.stringify(item.categories || item.topCategories || []),
			...(hasCategory ? [item.category || null] : []),
		])
		const result = await pool.query(query, values)
		console.log(`Вставлено ${result.rowCount} новых новостей`)
		return result.rows
	} catch (error) {
		console.error('Ошибка вставки новостей:', error.message)
		throw error
	}
}

async function getAllNews(options = { limit: 10 }) {
	try {
		const query = `SELECT * FROM news ORDER BY date DESC LIMIT $1`
		const result = await pool.query(query, [options.limit])
		return result.rows
	} catch (error) {
		console.error('Ошибка получения новостей:', error.message)
		throw error
	}
}

export { getLastNewsDateBySource, insertNews, getAllNews }