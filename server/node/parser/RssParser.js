import { response } from "express";
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

	async fetchNews(options = { limits: 10 }) {
		fetch('https://your-rss-feed-url.com/feed.xml')
			.then(response => response.text())
			.then(str => new DOMParser().parseFromString(str, "text/xml"))
			.then(data => {
				const items = data.querySelectorAll("item");
				items.forEach(element => {
					console.log(`Заголовок: ${element.querySelector("title").textContent}`)
					console.log(`Ссылка: ${element.querySelector("link").textContent}`)
				});
			})
	}
}

export default new RssParser