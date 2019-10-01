const request = require("request");
const axios = require("axios");
const {parse} = require("node-html-parser");
const cheerio = require('cheerio');
const fs = require('fs');
const lineReader = require('line-reader');


const option = {
    method: "GET",
    uri: "https://store.musinsa.com/app/contents/brandshop",
    headers: {"User-Agent": "Mozilla/5.0"}
};
const tempFile = './test.txt';

const host = "https://wusinsa.musinsa.com";


function getBrandList() {
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
}

function makeFile(str) {
    fs.writeFileSync(tempFile, str, "utf8");
}

function readBrandList() {
    lineReader.eachLine(tempFile, async (line, last) => {
        const path = JSON.parse(line).path;
        const body = await axios.get(host + path);
        const $ = cheerio.load(body);
        const test = $('div .list_img').find('a');
        console.log(test);
    });
}

function start() {
    /*file이 존재 하면 */
    if (fs.existsSync(tempFile)) {
        readBrandList()
    } else {
        getBrandList();
    }
}

start();
