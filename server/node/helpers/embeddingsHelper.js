import axios from 'axios'
import natural from 'natural'
import { NEWS_CONFIG } from './config.js'
const { TfIdf } = natural
const apiClient = axios.create({
	timeout: 10000,
	headers: { ...NEWS_CONFIG.HEADERS, 'Content-Type': 'application/json' },
})
let globalTfIdf = null
// Косинусное сходство
export function cosineSimilarity(vecA, vecB) {
	if (
		!Array.isArray(vecA) ||
		!Array.isArray(vecB) ||
		vecA.length !== vecB.length ||
		vecA.length === 0
	) {
		return 0
	}
	const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
	const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
	const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
	return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0
}
// Fallback: TF-IDF
export function initTfIdf(allTexts) {
	globalTfIdf = new TfIdf()
	allTexts.forEach(text =>
		globalTfIdf.addDocument(text.toLowerCase().split(/\s+/))
	)
}
export function computeTfIdfEmbedding(index) {
	const vec = []
	if (globalTfIdf) {
		globalTfIdf.tfidfs(index, (i, measure) => vec.push(measure || 0))
	}
	return vec
}

export function computeTfIdfSimilarity(indexA, indexB) {
	const vecA = computeTfIdfEmbedding(indexA)
	const vecB = computeTfIdfEmbedding(indexB)
	const maxLen = Math.max(vecA.length, vecB.length, 384)
	while (vecA.length < maxLen) vecA.push(0)
	while (vecB.length < maxLen) vecB.push(0)
	while (vecA.length > maxLen) vecA.pop()
	while (vecB.length > maxLen) vecB.pop()
	return cosineSimilarity(vecA, vecB)
}
// Ultra-fallback: Jaro-Winkler
export function jaroWinklerSimilarity(textA, textB) {
	return natural.JaroWinklerDistance(textA, textB) || 0
}
// Батч-эмбеддинги
async function getBatchEmbeddings(texts) {
	if (texts.length === 0) return []
	try {
		const response = await apiClient.post(
			`${NEWS_CONFIG.HF_API_URL}/${NEWS_CONFIG.EMBEDDING_MODEL}`,
			{ inputs: texts }
		)
		if (Array.isArray(response.data)) {
			return response.data
		} else if (response.data.error) {
			throw new Error(response.data.error)
		} else {
			return [response.data]
		}
	} catch (error) {
		console.error(`HF Batch Embedding error: ${error.message}`)
		throw error
	}
}

// Эмбеддинги с fallback
export async function getEmbeddingsWithFallback(allTexts, startIndex = 0) {
  let embeddings;
  try {
    embeddings = await getBatchEmbeddings(allTexts);
  } catch (error) {
    console.error('Switching to TF-IDF fallback for embeddings');
    initTfIdf(allTexts);
    return allTexts.map((_, index) => computeTfIdfEmbedding(startIndex + index));
  }
  return embeddings;
}