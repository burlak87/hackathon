const express = require('express')
const { Pool } = require('pg')
const axios = require('axios')
const {
	Worker,
	isMainThread,
	parentPort,
	workerData,
} = require('worker_threads')
const app = express()
app.use(express.json())
const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'newsdb',
	password: 'password',
	port: 5432,
})
// Конфигурация
const DUPLICATE_THRESHOLD = 0.85
const MAX_SUMMARY_LENGTH = 256
const MAX_SUMMARY_SENTENCES = 3
// Категории для классификации
const categories = ['Политика', 'Экономика', 'Спорт', 'Технологии', 'Культура']

// Функция для вызова HuggingFace API для эмбеддингов
async function getEmbeddings(texts) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
      { inputs: texts },
      { headers: { Authorization: `Bearer YOUR_HUGGINGFACE_API_TOKEN` } }
    );
    return response.data;
  } catch (error) {
    throw new Error('Ошибка получения эмбеддингов: ' + error.message);
  }
}
// Косинусное сходство
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}
// Функция сжатия новости через HuggingFace summarization API
async function summarize(text) {
	try {
		const response = await axios.post(
			'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
			{ inputs: text },
			{ headers: { Authorization: `Bearer YOUR_HUGGINGFACE_API_TOKEN` } }
		)
		let summary = response.data[0]?.summary_text || text
		// Ограничение по предложениям
		const sentences = summary.match(/[^\.!\?]+[\.!\?]+/g) || [summary]
		summary = sentences.slice(0, MAX_SUMMARY_SENTENCES).join(' ').trim()
		// Ограничение по длине
		if (summary.length > MAX_SUMMARY_LENGTH) {
			summary = summary.slice(0, MAX_SUMMARY_LENGTH - 3).trim() + '...'
		}
		return summary
	} catch (error) {
		// В случае ошибки возвращаем исходный текст обрезанный по лимитам
		const fallback = text
			.split('.')
			.slice(0, MAX_SUMMARY_SENTENCES)
			.join('.')
			.slice(0, MAX_SUMMARY_LENGTH)
		return fallback.length < text.length ? fallback + '...' : fallback
	}
}
// Параллельная обработка с worker_threads
function runWorker(data) {
	return new Promise((resolve, reject) => {
		const worker = new Worker(__filename, { workerData: data })
		worker.on('message', resolve)
		worker.on('error', reject)
		worker.on('exit', code => {
			if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
		})
	})
}
if (!isMainThread) {
  // Рабочий поток: классификация и сжатие одной новости
  (async () => {
    const { news, newsEmbedding, categoryEmbeddings, categories } = workerData;
    // Топ-3 категории по косинусному сходству
    const sims = categoryEmbeddings.map(catEmb => cosineSimilarity(newsEmbedding, catEmb));
    const top3Indexes = sims
      .map((sim, i) => ({ sim, i }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3)
      .map(x => categories[x.i]);
    const summary = await summarize(news);
    parentPort.postMessage({
      original: news,
      categories: top3Indexes,
      summary,
    });
  })();
  return;
}
app.post('/process-news', async (req, res) => {
	try {
		const newsArray = req.body.news
		if (!Array.isArray(newsArray) || newsArray.length === 0) {
			return res
				.status(400)
				.json({ error: 'news должен быть непустым массивом' })
		}
		// Получаем эмбеддинги новостей и категорий
		const newsEmbeddings = await getEmbeddings(newsArray)
		const categoryEmbeddings = await getEmbeddings(categories)
		// Дедупликация
		const uniqueNews = []
		const uniqueEmbeddings = []
		for (let i = 0; i < newsArray.length; i++) {
			const emb = newsEmbeddings[i]
			let isDuplicate = false
			for (const uEmb of uniqueEmbeddings) {
				if (cosineSimilarity(emb, uEmb) > DUPLICATE_THRESHOLD) {
					isDuplicate = true
					break
				}
			}
			if (!isDuplicate) {
				uniqueNews.push(newsArray[i])
				uniqueEmbeddings.push(emb)
			}
		}
		// Параллельная обработка: классификация и сжатие
		const processed = await Promise.all(
			uniqueNews.map((news, idx) =>
				runWorker({
					news,
					newsEmbedding: uniqueEmbeddings[idx],
					categoryEmbeddings,
					categories,
				})
			)
		)
		// Запись в PostgreSQL
		const client = await pool.connect()
		try {
			await client.query('BEGIN')
			for (const item of processed) {
				await client.query(
					'INSERT INTO news (text, categories, summary) VALUES ($1, $2, $3)',
					[item.original, item.categories, item.summary]
				)
			}
			await client.query('COMMIT')
		} catch (e) {
			await client.query('ROLLBACK')
			throw e
		} finally {
			client.release()
		}
		res.json({
			success: true,
			processedCount: processed.length,
			data: processed,
		})
	} catch (error) {
		console.error('Ошибка обработки:', error)
		res.status(500).json({ error: 'Внутренняя ошибка сервера' })
	}
})
app.listen(3000, () => {
	console.log('Сервер запущен на http://localhost:3000')
})

CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  categories TEXT[] NOT NULL,
  summary TEXT NOT NULL
);

const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const app = express();
app.use(express.json());
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'newsdb',
  password: 'password',
  port: 5432,
});
// Конфигурация
const DUPLICATE_THRESHOLD = 0.85;
const MAX_SUMMARY_LENGTH = 256;
const MAX_SUMMARY_SENTENCES = 3;
// Категории для классификации
const categories = [
  "Политика",
  "Экономика",
  "Спорт",
  "Технологии",
  "Культура",
];

// Функция для вызова HuggingFace API для эмбеддингов
async function getEmbeddings(texts) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
      { inputs: texts },
      { headers: { Authorization: `Bearer YOUR_HUGGINGFACE_API_TOKEN` } }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.error) {
      throw new Error(response.data.error);
    } else {
      throw new Error('Unexpected response from embeddings API');
    }
  } catch (error) {
    throw new Error('Ошибка получения эмбеддингов: ' + error.message);
  }
}
// Косинусное сходство
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}
// Функция сжатия новости через HuggingFace summarization API
async function summarize(text) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: text },
      { headers: { Authorization: `Bearer YOUR_HUGGINGFACE_API_TOKEN` } }
    );
    if (Array.isArray(response.data) && response.data[0]?.summary_text) {
      let summary = response.data[0].summary_text;
      // Ограничение по предложениям
      const sentences = summary.match(/[^\.!\?]+[\.!\?]+/g) || [summary];
      summary = sentences.slice(0, MAX_SUMMARY_SENTENCES).join(' ').trim();
      // Ограничение по длине
      if (summary.length > MAX_SUMMARY_LENGTH) {
        summary = summary.slice(0, MAX_SUMMARY_LENGTH - 3).trim() + '...';
      }
      return summary;
    } else if (response.data.error) {
      throw new Error(response.data.error);
    } else {
      throw new Error('Unexpected response from summarization API');
    }
  } catch (error) {
    // В случае ошибки возвращаем исходный текст обрезанный по лимитам
    const fallbackSentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    let fallback = fallbackSentences.slice(0, MAX_SUMMARY_SENTENCES).join(' ').trim();
    if (fallback.length > MAX_SUMMARY_LENGTH) {
      fallback = fallback.slice(0, MAX_SUMMARY_LENGTH - 3).trim() + '...';
    }
    return fallback;
  }
}
// Параллельная обработка с worker_threads
function runWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: data });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}
if (!isMainThread) {
  // Рабочий поток: классификация и сжатие одной новости
  (async () => {
    try {
      const { news, newsEmbedding, categoryEmbeddings, categories } = workerData;
      // Топ-3 категории по косинусному сходству
      const sims = categoryEmbeddings.map(catEmb => cosineSimilarity(newsEmbedding, catEmb));
      const top3Indexes = sims
        .map((sim, i) => ({ sim, i }))
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 3)
        .map(x => categories[x.i]);
      const summary = await summarize(news);
      parentPort.postMessage({
        original: news,
        categories: top3Indexes,
        summary,
      });
          } catch (err) {
      parentPort.postMessage({
        original: workerData.news,
        categories: [],
        summary: workerData.news.slice(0, MAX_SUMMARY_LENGTH) + (workerData.news.length > MAX_SUMMARY_LENGTH ? '...' : ''),
        error: err.message,
      });
    }
  })();
  return;
}
app.post('/process-news', async (req, res) => {
  try {
    const newsArray = req.body.news;
    if (!Array.isArray(newsArray) || newsArray.length === 0) {
      return res.status(400).json({ error: 'news должен быть непустым массивом' });
    }
    // Получаем эмбеддинги новостей и категорий
    const newsEmbeddings = await getEmbeddings(newsArray);
    const categoryEmbeddings = await getEmbeddings(categories);
    // Дедупликация
    const uniqueNews = [];
    const uniqueEmbeddings = [];
    for (let i = 0; i < newsArray.length; i++) {
      const emb = newsEmbeddings[i];
      let isDuplicate = false;
      for (const uEmb of uniqueEmbeddings) {
        if (cosineSimilarity(emb, uEmb) > DUPLICATE_THRESHOLD) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        uniqueNews.push(newsArray[i]);
        uniqueEmbeddings.push(emb);
      }
    }
    // Параллельная обработка: классификация и сжатие
    const processed = await Promise.all(
      uniqueNews.map((news, idx) =>
        runWorker({
          news,
          newsEmbedding: uniqueEmbeddings[idx],
          categoryEmbeddings,
          categories,
        })
      )
    );
    // Запись в PostgreSQL
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of processed) {
        await client.query(
          'INSERT INTO news (text, categories, summary) VALUES ($1, $2, $3)',
          [item.original, item.categories, item.summary]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
      } finally {
      client.release();
    }
    res.json({ success: true, processedCount: processed.length, data: processed });
  } catch (error) {
    console.error('Ошибка обработки:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});
app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});
