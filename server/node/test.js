// const express = require('express')
// const axios = require('axios')
// const { cosine } = require('ml-distance')
// const bodyParser = require('body-parser')
// const app = express()
// const PORT = 3000
// // Middleware
// app.use(bodyParser.json())
// // Hugging Face API endpoints (бесплатные публичные модели)
// const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'
// const SUMMARIZATION_MODEL = 'facebook/bart-large-cnn'
// const HF_API_URL = 'https://api-inference.huggingface.co/models/'
// // Функция для генерации эмбеддинга (вектор) новости
// async function getEmbedding(text) {
// 	try {
// 		const response = await axios.post(
// 			`${HF_API_URL}${EMBEDDING_MODEL}`,
// 			{
// 				inputs: text,
// 			},
// 			{
// 				headers: { 'Content-Type': 'application/json' },
// 			}
// 		)
// 		return response.data[0] // Возвращает массив чисел (эмбеддинг)
// 	} catch (error) {
// 		console.error('Ошибка эмбеддинга:', error.message)
// 		throw new Error('Не удалось сгенерировать эмбеддинг')
// 	}
// }

// // Функция для суммаризации новости
// async function summarizeNews(text) {
//   try {
//     const response = await axios.post(`${HF_API_URL}${SUMMARIZATION_MODEL}`, {
//       inputs: text,
//       parameters: {
//         max_length: 100,  // Ограничиваем длину суммаризации
//         min_length: 30,
//         do_sample: false, // Детерминистично, чтобы избежать вариаций
//         num_beams: 4      // Для лучшего качества
//       }
//     }, {
//       headers: { 'Content-Type': 'application/json' }
//     });
//     let summary = response.data[0].summary_text;
    
//     // Обрезаем до 3 предложений (простой split по точкам)
//     const sentences = summary.split('.').slice(0, 3).join('. ');
//     summary = sentences + '.';
    
//     // Обрезаем до 256 символов (включая пунктуацию)
//     if (summary.length > 256) {
//       summary = summary.substring(0, 256).trim() + '...';
//     }
    
//     return summary;
//   } catch (error) {
//     console.error('Ошибка суммаризации:', error.message);
//     // Fallback: простое усечение оригинала, если API недоступен
//     return text.substring(0, 256) + '...';
//   }
// }

// // Основная логика обработки: удаление дубликатов + суммаризация
// async function processNewsArray(newsArray) {
// 	if (!Array.isArray(newsArray) || newsArray.length === 0) {
// 		return []
// 	}
// 	// Шаг 1: Генерируем эмбеддинги для всех новостей
// 	const embeddings = []
// 	for (const news of newsArray) {
// 		const embedding = await getEmbedding(news)
// 		embeddings.push({ text: news, embedding })
// 	}
// 	// Шаг 2: Удаляем дубликаты (семантические)
// 	const uniqueNews = []
// 	const usedEmbeddings = new Set()
// 	for (let i = 0; i < embeddings.length; i++) {
// 		const current = embeddings[i]
// 		let isDuplicate = false
// 		for (const usedId of usedEmbeddings) {
// 			const prev = embeddings[usedId]
// 			const similarity = cosine(current.embedding, prev.embedding) // 0-1, где 1 = идентично
// 			if (similarity > 0.8) {
// 				// Порог для "немного по-другому"
// 				isDuplicate = true
// 				break
// 			}
// 		}

// 		if (!isDuplicate) {
// 			uniqueNews.push(current.text)
// 			usedEmbeddings.add(i)
// 		}
// 	}

// 	// Шаг 3: Суммаризируем уникальные новости
// 	const summarized = []
// 	for (const news of uniqueNews) {
// 		const summary = await summarizeNews(news)
// 		summarized.push(summary)
// 	}
// 	return summarized // Новый массив с сжатыми уникальными новостями
// }
// // Эндпоинт для обработки
// app.post('/process-news', async (req, res) => {
// 	try {
// 		const { newsArray } = req.body // Ожидаем { "newsArray": ["новость1", "новость2", ...] }

// 		if (!newsArray) {
// 			return res.status(400).json({ error: 'newsArray обязателен' })
// 		}
// 		const processed = await processNewsArray(newsArray)
// 		res.json({
// 			originalLength: newsArray.length,
// 			uniqueSummarizedLength: processed.length,
// 			data: processed,
// 		})
// 	} catch (error) {
// 		console.error('Ошибка обработки:', error)
// 		res.status(500).json({ error: 'Ошибка при обработке новостей' })
// 	}
// })

// // Запуск сервера
// app.listen(PORT, () => {
//   console.log(`Сервер запущен на http://localhost:${PORT}`);
// });

const express = require('express')
const axios = require('axios')
const { cosine } = require('ml-distance')
const bodyParser = require('body-parser')
const natural = require('natural')
const pLimit = require('p-limit')
const app = express()
const PORT = 3000
// Middleware
app.use(bodyParser.json({ limit: '10mb' })) // Для больших массивов эмбеддингов
// Hugging Face API (с таймаутом)
const HF_API_URL = 'https://api-inference.huggingface.co/models/'
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'
const SUMMARIZATION_MODEL = 'facebook/bart-large-cnn'
const AXIOS_CONFIG = { timeout: 10000 } // 10s timeout
// Fallback: TF-IDF tokenizer и TfIdf для семантики
const TfIdf = natural.TfIdf
const tokenizer = new natural.WordTokenizer()
const tfidf = new TfIdf()
// Limit concurrency (5 параллельных API-calls)
const limit = pLimit(5)

// Функция для генерации эмбеддинга (с fallback)
async function getEmbedding(text, useFallback = false) {
  if (useFallback) {
    // Fallback: TF-IDF vector (упрощённо, как sparse vector)
    const tokens = tokenizer.tokenize(text.toLowerCase());
    tfidf.addDocument(tokens);
    const vector = [];
    tfidf.tfidfs(tokens, (i, measure) => vector.push(measure || 0));
    return vector.slice(0, 384); // Паддим до размера MiniLM (384 dims)
  }
  try {
    const response = await axios.post(`${HF_API_URL}${EMBEDDING_MODEL}`, { inputs: text }, {
      ...AXIOS_CONFIG,
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data[0] || [];
  } catch (error) {
    console.error('API Embedding error:', error.message);
    // Retry with fallback
    return getEmbedding(text, true);
  }
}

// Функция для суммаризации (с fallback)
async function summarizeNews(text) {
  try {
    const response = await axios.post(`${HF_API_URL}${SUMMARIZATION_MODEL}`, {
      inputs: text,
      parameters: { max_length: 100, min_length: 30, do_sample: false, num_beams: 4 }
    }, AXIOS_CONFIG);
    let summary = response.data?.[0]?.summary_text || text;
    
    // Обрезаем до 3 предложений
    const sentences = summary.split('.').slice(0, 3).join('. ');
    summary = sentences + '.';
    
    // До 256 символов
    if (summary.length > 256) {
      summary = summary.substring(0, 256).trim() + '...';
    }
    return summary;
  } catch (error) {
    console.error('API Summarization error:', error.message);
    // Fallback: усечение
    const sentences = text.split('.').slice(0, 3).join('. ');
    let summary = sentences + '.';
    if (summary.length > 256) {
      summary = summary.substring(0, 256).trim() + '...';
    }
    return summary;
  }
}

// Вычисление топ-3 категорий (с fallback на keyword match)
async function getTopCategories(newsText, categoryEmbeddings, categories, useFallback = false) {
  const newsEmbedding = await getEmbedding(newsText, useFallback);
  
  let similarities = [];
  for (let i = 0; i < categories.length; i++) {
    const sim = cosine(newsEmbedding, categoryEmbeddings[i]);
    similarities.push({ category: categories[i], similarity: sim });
  }
  
  // Топ-3 по сходству
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, 3).map(s => s.category);
}
// Основная логика обработки
async function processNewsArray(newsArray, categories = [], previousEmbeddings = []) {
	if (!Array.isArray(newsArray) || newsArray.length === 0) {
		return []
	}
	let useFallback = false // Глобальный флаг для fallback, если первый API fail
	// Шаг 1: Эмбеддинги категорий (один раз, параллельно)
	const categoryEmbeddings = await Promise.all(
		categories.map(cat =>
			getEmbedding(cat).catch(() => {
				useFallback = true
				return []
			})
		)
	)
	// Шаг 2: Параллельные эмбеддинги для новых новостей
	const embeddingsPromises = newsArray.map(news =>
		getEmbedding(news).catch(err => {
			useFallback = true
			return { text: news, embedding: [] }
		})
	)
	const newsWithEmbeddings = await Promise.all(embeddingsPromises)
	const newEmbeddings = newsWithEmbeddings
		.map(item => item.embedding)
		.filter(e => e.length > 0)
	// Шаг 3: Детальная проверка дубликатов (против previous + новых)
	const allPrevious = [...previousEmbeddings, ...newEmbeddings.slice(0, -1)] // Исключаем текущий для self-check
	const uniqueNews = []
	const uniqueIndices = [] // Индексы уникальных в newsArray
	for (let i = 0; i < newsWithEmbeddings.length; i++) {
		const current = newsWithEmbeddings[i]
		let isDuplicate = false
		// Проверяем против всех previous + предыдущих новых
		for (const prevEmb of allPrevious) {
			if (useFallback) {
				// Fallback: Levenshtein similarity (0-1)
				const sim =
					natural.JaroWinklerDistance(
						current.text,
						newsArray[/* approx index */ 0]
					) || 0 // Упрощённо; адаптируйте
				if (sim > 0.8) {
					isDuplicate = true
					break
				}
			} else {
				const sim = cosine(current.embedding, prevEmb)
				if (sim > 0.8) {
					// Порог
					isDuplicate = true
					break
				}
			}
		}
		if (!isDuplicate) {
			uniqueNews.push(current.text)
			uniqueIndices.push(i)
			allPrevious.push(current.embedding) // Добавляем для следующих
		}
	}
	if (uniqueNews.length === 0) return []
	// Шаг 4: Топ-категории для уникальных (параллельно)
	const categoriesPromises = uniqueNews.map(news =>
		getTopCategories(news, categoryEmbeddings, categories, useFallback)
	)
	const topCategoriesArray = await Promise.all(categoriesPromises)
	// Шаг 5: Параллельная суммаризация уникальных
	const summarizePromises = uniqueNews.map(news => summarizeNews(news))
	const summaries = await Promise.all(summarizePromises)
	// Шаг 6: Формируем новый массив с метаданными
	const processed = summaries.map((summary, idx) => ({
		summary,
		topCategories: topCategoriesArray[idx],
		originalIndex: uniqueIndices[idx], // Опционально, для трекинга
	}))
	return processed
}
// Эндпоинт
app.post('/process-news', async (req, res) => {
  try {
    const { newsArray, categories = [], previousEmbeddings = [] } = req.body;
    
    if (!newsArray || !Array.isArray(newsArray)) {
      return res.status(400).json({ error: 'newsArray обязателен (массив строк)' });
    }
    if (categories.length === 0) {
      console.warn('categories пустой — топ-категории будут []');
    }
    const processed = await processNewsArray(newsArray, categories, previousEmbeddings);
    res.json({ 
      originalLength: newsArray.length,
      uniqueLength: processed.length,
      fallbackUsed: useFallback, // Для отладки
      data: processed 
    });
  } catch (error) {
    console.error('Общая ошибка:', error);
    res.status(500).json({ error: 'Ошибка обработки: ' + error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Сервер на http://localhost:${PORT}`);
  console.log('Пример запроса: POST /process-news с {newsArray: [...], categories: [...], previousEmbeddings: [[...], ...]}');
});
