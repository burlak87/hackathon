// const tress = require('tress');
// const needle = require('needle');
// const cheerio = require('cheerio');
// const resolve = require('url').resolve;
// const fs = require('fs');

// let url = 'http://www.ferra.ru/ru/techlife/news/';
// let results = []

// let q = tress(function(url, callback) {
//   needle.get(url, function(err, res) {
//     if (err) throw err;
    
//     var $ = cheerio.load(res.body);
//     if($('.b_infopost').contents().eq(2).text().trim().slice(0, -1) === "Алексей Козлов") {
//       results.push({
// 				title: $('h1').text(),
// 				date: $('.b_infopost>.date').text(),
//         hred: url,
//         size: $('.newsbody').text().length(),
// 			});
//     };

//     $('b_review p>a').each(function() {
//       q.push($(this).attr('href'));
//     });

//     $('bpr_next>a').each(function() {
//       q.push(resolve(url, $(this).attr('href')));
//     });

//     callback();
//   });
// }, 10);

// q.drain = function() {
//   fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));
// }

// q.push(url);

import NewsSource from "../interface/NewsSource";

class WebScrapingParser extends NewsSource {
  constructor(url, selectors) {
    super('Web Scraping');
    this.url = url;
    this.selectors = selectors;
  }

  async fetchNews() {}
}

export default new WebScrapingParser