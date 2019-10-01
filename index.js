const request = require("request");
const axios = require("axios");
const {parse} = require("node-html-parser");
const cheerio = require('cheerio');
const fs = require('fs');
const lineReader = require('line-reader');


//
// let $ = cheerio.load('<dl><dt><a href="/app/brand/goods_list/herno">HERNO</a><span class="ti_sale"> SALE</span></dt> <dd><a href="/app/brand/goods_list/herno">에르노</a></dd> </dl>');
// console.log($('a').text());
const option = {
    method: "GET",
    uri: "https://store.musinsa.com/app/contents/brandshop",
    headers: {"User-Agent": "Mozilla/5.0"}
};
const tempFile = './test.txt';

request(option, (req, res, body) => {
    // console.log(body);
    const $ = cheerio.load(body);
    $('.brand_li').find('a').each((index, elem) => {
        const test = {
            path: elem.attribs.href,
            name: elem.children[0].data
        };

        let text = "";
        if (fs.existsSync(tempFile)) {
            text = fs.readFileSync(tempFile, 'utf8');
        }
        makeFile(text + "\n" + JSON.stringify(test));
    })
});

function makeFile(str) {
    fs.writeFileSync("./test.txt", str, "utf8");
}
