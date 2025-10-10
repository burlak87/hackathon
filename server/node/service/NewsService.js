import { pool } from '../config/database.js'

class NewsService {
	async getNews(filters) {
		const { category, source, time, limit = 10 } = filters;
		let query = 'SELECT * FROM news';
		const conditions = [];
		const values = [];
		let paramIndex = 1;
		if (category) {
			if (category.includes(',')) {
				const catArray = category.split(',').map(c => c.trim());
				const placeholders = catArray.map(() => `$${paramIndex++}`).join(', ');
				conditions.push(`categories ?| array[${placeholders}]`);
				values.push(...catArray);
			} else {
				conditions.push(`categories ? '${category}'`);
				values.push(category);
			}
		}
		if (source) {
			if (source.includes(',')) {
				const srcArray = source.split(',').map(s => s.trim());
				const placeholders = srcArray.map(() => `$${paramIndex++}`).join(', ');
				conditions.push(`source IN (${placeholders})`);
				values.push(...srcArray);
			} else {
				conditions.push(`source = $${paramIndex++}`);
				values.push(source);
			}
		}
		if (time) {
			conditions.push(`date >= NOW() - INTERVAL '${time} hours'`);
		}
		if (conditions.length > 0) {
			query += ' WHERE ' + conditions.join(' AND ');
		}
		query += ' ORDER BY date DESC LIMIT $' + paramIndex;
		values.push(limit);
		const { rows } = await pool.query(query, values);
		console.log(rows)
		return rows;
	}
}

export default new NewsService()
