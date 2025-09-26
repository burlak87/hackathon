import NewsSource from "../interface/NewsSource";
import Parser from "rss-parser"
// import axios from "axios"

class RssParser extends NewsSource {
	constructor(rssUrl) {
		super('RSS')
		this.parser = new Parser()
		this.rssUrl = rssUrl
		this.postedHeads = new Set()
	}

	async fetchNews() {}
}

export default new RssParser