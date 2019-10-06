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


const resultFile = './result.csv';
const brandListFile = './brand_list.txt';

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
            if (fs.existsSync(brandListFile)) {
                text = fs.readFileSync(brandListFile, 'utf8');
            }
            makeBrandList(text + "\n" + JSON.stringify(test));
        })
    });
}

function makeBrandList(str) {
    fs.writeFileSync(brandListFile, str, "utf8");
}

function makeBrandInfo(str) {
    let text = "";
    if (fs.existsSync(resultFile)) {
        text = fs.readFileSync(resultFile, 'utf8');
    }
    fs.writeFileSync(resultFile, text + "\n" + JSON.stringify(str), "utf8");
}

function readBrandList() {
    lineReader.eachLine(brandListFile, async (line, last) => {
        const path = JSON.parse(line).path;
        await request(getUrl(path), (req, res, body) => {
            if (body) {
                const $ = cheerio.load(body);
                const target = $('.list_img').find('a')[0];
                if (target) {
                    const path = target.attribs.href;
                    getBrandInfo(path);
                }
            }
        });
    });
}

function getBrandInfo(path) {
    request(getUrl(path), (req, res, body) => {
        const $ = cheerio.load(body);
        let tempStr = "";
        const path = $('.sallerinfo_detail_section').find('div').each((index, elem) => {
            const temp = cheerio.load(elem);
            temp('div').find('dd').each((i, e) => {
                tempStr += e.children[0].data + ", ";
            });
        });
        makeBrandInfo(tempStr)
    })
}

function start() {
    /*file이 존재 하면 */
    if (fs.existsSync(brandListFile)) {
        readBrandList()
    } else {
        getBrandList();
    }
}

start();
