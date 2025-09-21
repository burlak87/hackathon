import router from './router.js'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import fileUpload from 'express-fileupload'

const PORT = 5000
const DB_URL =
	'mongodb+srv://noobikcfb:7ejX8bQK303aA9Ul@cluster0.aynxjpc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('../../public/downloads'))
app.use(fileUpload({}))
app.use('/api-v1', router)

async function startApp() {
	try {
		await mongoose.connect(DB_URL)
		app.listen(PORT, () => console.log('SERVER STARTED ON PORT ' + PORT))
	} catch (e) {
		console.log(e)
	}
}

startApp()
