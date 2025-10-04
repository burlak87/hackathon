export const NEWS_CONFIG = {
	DUPLICATE_THRESHOLD: 0.8,
	MAX_SUMMARY_LENGTH: 256,
	MAX_SUMMARY_SENTENCES: 3,
	HF_API_URL: 'https://api-inference.huggingface.co/models',
	EMBEDDING_MODEL: 'sentence-transformers/all-MiniLM-L6-v2',
	SUMMARIZATION_MODEL: 'facebook/bart-large-cnn',
	HF_TOKEN: process.env.HF_TOKEN || null,
	HEADERS: process.env.HF_TOKEN
		? { Authorization: `Bearer ${process.env.HF_TOKEN}` }
		: {},
	LIMIT_CONCURRENCY: 10,
}
