import axios from 'axios'
import { NEWS_CONFIG } from './config.js'
const apiClient = axios.create({
	timeout: 30000,
	headers: { ...NEWS_CONFIG.HEADERS, 'Content-Type': 'application/json' },
})
export function getNewsText(item) {
	let text =
		(item.summary_text || '') +
		'. ' +
		(item.content || '')
	text = text.trim()
	if (text.length === 0) {
		text = item.title || 'No content available'
		console.warn('[WARN] Empty text for news, using title only')
	}
	console.log(
		`[DEBUG] getNewsText assembled: ${text.length} chars (title=${
			item.title?.length || 0
		}, summary_text=${item.summary_text?.length || 0})`
	)
	return text
}
export function keywordTopCategories(newsText, categories) {
	const newsWords = newsText.toLowerCase().split(/\s+/)
	const scores = categories.map(cat => {
		const catWords = cat.toLowerCase().split(/\s+/)
		let score = 0
		catWords.forEach(
			word =>
				(score += newsWords.filter(nw => nw.includes(word)).length > 0 ? 1 : 0)
		)
		return { category: cat, score }
	})
	return scores
		.sort((a, b) => b.score - a.score)
		.slice(0, 3)
		.map(s => s.category)
}

export async function summarizeText(text) {
  try {
    const response = await apiClient.post(`${NEWS_CONFIG.HF_API_URL}/${NEWS_CONFIG.SUMMARIZATION_MODEL}`, {
      inputs: text,
      parameters: { max_length: 100, min_length: 30, do_sample: false, num_beams: 4 }
    });
    let summary = response.data?.[0]?.summary_text || text;
    const sentences = summary.match(/[^\.!\?]+[\.!\?]+/g) || [summary];
    summary = sentences.slice(0, NEWS_CONFIG.MAX_SUMMARY_SENTENCES).join(' ').trim();
    if (summary.length > NEWS_CONFIG.MAX_SUMMARY_LENGTH) {
      summary = summary.slice(0, NEWS_CONFIG.MAX_SUMMARY_LENGTH - 3).trim() + '...';
    }
    return summary;
  } catch (error) {
    console.error(`Summarization error: ${error.message}`);
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    let fallback = sentences.slice(0, NEWS_CONFIG.MAX_SUMMARY_SENTENCES).join(' ').trim();
    if (fallback.length > NEWS_CONFIG.MAX_SUMMARY_LENGTH) {
      fallback = fallback.slice(0, NEWS_CONFIG.MAX_SUMMARY_LENGTH - 3).trim() + '...';
    }
    return fallback;
  }
}
