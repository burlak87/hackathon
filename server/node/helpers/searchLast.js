import { getLastNewsDateBySource } from "./newsHelpers.js"

async function searchLast(lastDate, source) {
	try {
		lastDate = await getLastNewsDateBySource(source)
		if (!lastDate) {
			lastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
			console.log(
				`Нет новостей по источнику "${source}". Парсим за последние 24 часа.`
			)
		} else {
			console.log(
				`Последняя новость по "${source}": ${lastDate.toISOString()}. Парсим после этой даты.`
			)
		}
	} catch (error) {
		console.error('Ошибка при получении даты из БД:', error.message)
		lastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
		console.log('Fallback: парсим за последние 24 часа из-за ошибки.')
	}
}

export default searchLast
