const axios = require('axios');
const art = require('art-template');
const path = require('path');
const cheerio = require('cheerio');
const config = require('../../config');

function replaceEmpty(str) {
    return str.replace(' ','');
}

const baseUrl='http://weekly.dockone.io'

module.exports = async (ctx) => {
    const url = `${baseUrl}/issues`;

    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
            Referer: url
        }
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('ul.i.issues>li');
    

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: $('title').text(),
        link: url,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        lastBuildDate: new Date().toUTCString(),
        item: list && list.map((item,index) => {
            item=$(index);
            return {
                title:`${replaceEmpty(item.find('a>h3>time').text())}[${replaceEmpty(item.find('a>h3>strong').text())}]`,
                description:item.find('a>ul>li').text(),
                link:`${baseUrl}${item.find('a').attr('href')}`
            };
        }).get(),
    });
};
