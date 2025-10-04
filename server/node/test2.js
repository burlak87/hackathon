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