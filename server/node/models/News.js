import { pool } from '../config/database.js'

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
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      summary_text TEXT NOT NULL,
      url TEXT,
      date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      source TEXT NOT NULL,
      category TEXT,
      categories JSONB DEFAULT '[]'::JSONB
      embeddings JSONB DEFAULT '[]'::JSONB
    )
  `
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

export default runMigrations