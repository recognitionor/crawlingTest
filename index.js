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
const brandListPath = "/app/contents/brandshop";


function getUrl(url) {
    console.log(host + url);
    return {
        method: "GET",
        uri: host + url,
        headers: {"User-Agent": "Mozilla/5.0"}
    }
}

function getBrandList() {
    request(getUrl(brandListPath), (req, res, body) => {
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
    console.log("readBrandList");
    lineReader.eachLine(tempFile, async (line, last) => {
        const path = JSON.parse(line).path;
        await request(getUrl(path), (req, res, body) => {
            const $ = cheerio.load(body);
            const path = $('.list_img').find('a')[0].attribs.href
            console.log(path);
            getBrandInfo(path);

        });
    });
}

function getBrandInfo(path) {
    request(getUrl(path), (req, res, body) => {
        const $ = cheerio.load(body);
        const path = $('.sallerinfo_detail_section').find('div').each((index, elem) => {
            const temp = cheerio.load(elem);
            temp('div').find('dd').each((i, e) => {
                console.log(e.children[0].data);

            });
        });
    })
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
