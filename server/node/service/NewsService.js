import News from '../models/News.js'

const { Pool } = require('pg')
const pool = new Pool({
	
})

class NewsService {
  async getPosts(filters) {
    const { category, source } = filters;
    let query = 'SELECT * FROM posts';
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
