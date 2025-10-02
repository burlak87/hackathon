const express = require('express')
const { pool, testConnection } = require('./db') // Импорт из db.js
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 3001 // Отдельный порт от Next.js (который на 3000)
app.use(bodyParser.json())
// Тестируем подключение при старте
testConnection().catch(console.error)







// Пример эндпоинта: GET /users (запрос к БД)
app.get('/users', async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM users LIMIT 10') // Пример SQL-запроса
		res.json({ success: true, data: result.rows })
	} catch (err) {
		console.error('Ошибка запроса:', err)
		res.status(500).json({ error: 'Ошибка сервера', details: err.message })
	}
})
// Пример POST /create-user
app.post('/users', async (req, res) => {
	const { name, email } = req.body
	try {
		const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *'
		const result = await pool.query(query, [name, email])
		res.status(201).json({ success: true, data: result.rows[0] })
	} catch (err) {
		console.error('Ошибка вставки:', err)
		res.status(500).json({ error: 'Ошибка создания', details: err.message })
	}
})

// Graceful shutdown (освобождение пула при завершении)
process.on('SIGINT', async () => {
	await pool.end()
	console.log('Пул соединений закрыт')
	process.exit(0)
})

app.listen(PORT, () => {
	console.log(`Backend сервер запущен на http://localhost:${PORT}`)
})
