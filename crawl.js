const puppeteer = require('puppeteer');
const http = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const download = require('download');

const BASE_URL = "https://ww.kissanimes.tv";
const INITIAL_URL = BASE_URL +"/watch/naruto-shippuuden-dub-episode-162";
const DIR = '/home/adilh/Downloads/Video/NarutoShippuden/';
(async () => {
 const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let nextUrl = INITIAL_URL;
  for (i=0;i<317;i++) {
  await page.goto(nextUrl);
  let fileName = nextUrl.split('/').pop()+".mp4"
  // Get the "viewport" of the page, as reported by the page.
  const videoUrl = await page.evaluate(() => {
      const next =  "https://ww.kissanimes.tv"+$('.btn_next_and_prev')[0].childNodes[3].getAttribute('href')
    return [document.getElementById("player_container").childNodes[0].getAttribute("src"),next]
  });
  nextUrl = videoUrl[1];
  await page.goto(videoUrl[0]);
  const downloadUrl=await page.evaluate(()=>{
    const delay = ms => new Promise(res => setTimeout(res, ms));
    return delay(1000).then(()=>{
        return jwplayer("myVideo").getConfig().sources[0].file
    }).catch((err)=>err);
  });
  try {
    const data = await download(downloadUrl);
    fs.writeFileSync(DIR+fileName,data);
    console.log('downloaded '+fileName);
  } catch(err){
      console.log(err);
  }
  }
  await page.close();
  await browser.close();
})();