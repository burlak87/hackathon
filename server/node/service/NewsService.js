import { pool } from '../config/database.js'

class NewsService {
	async getNews(filters) {
		const { category, source } = filters
		let query = 'SELECT * FROM news'
		const conditions = []
		const values = []
		if (category) {
			values.push(category)
			conditions.push(`category = $${values.length}`)
		}
		if (source) {
			values.push(source)
			conditions.push(`source = $${values.length}`)
		}
		if (conditions.length > 0) {
			query += ' WHERE ' + conditions.join(' AND ')
		}
		const { rows } = await pool.query(query, values)
		return rows
	}
}

export default new NewsService()
