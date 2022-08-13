const dotEnv = require("dotenv");
dotEnv.config({path: "./config.env"});

const express = require('express')
const app = express();
const {SitemapStream, streamToPromise} = require("sitemap");
const cheerio = require('cheerio');
const fs = require("fs");

const got = (...args) => import('got').then(({default: got}) => got(...args));


const extractLinks = async (url) => {
  try {
    const response = await got(url);
    const html = response.body;


    const $ = cheerio.load(html);

    const linkObjects = $('a');

    const links = [];
    linkObjects.each((index, element) => {
      links.push({
        href: $(element).attr('href')
      });
    });

    //here we go

    const siteMapStream = new SitemapStream({hostname: 'https://github.com/'});
    links.forEach(item=>{
        siteMapStream.write({
            url: item.href,
            changefred: "daily",
            priority: 1
        })
    });
    siteMapStream.end();
    const siteMapData = await streamToPromise(siteMapStream);
    fs.writeFileSync("./sitemap.xml", siteMapData, "utf-8");
  } catch (error) {
    console.log(error.response.body);
  }
};

// Try it
const URL = 'https://github.com/';
extractLinks(URL);

const port = process.env.PORT||3000;
app.listen(port, ()=>{
    console.log(`this app is started at port ${port}`);
});