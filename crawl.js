/**
 * Author : Adil Hussain
 * email: adil.cs.work@gmail.com
 */
const puppeteer = require('puppeteer');
const http = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const download = require('download');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'noruto_shippuden.csv',
    header: [
        {id: 'name', title: 'NAME'},
        {id: 'player', title: 'PLAYER URL'},
        {id:'download',title:'DOWNLOAD URL'}
    ]
});
const BASE_URL = "https://ww.kissanimes.tv";
const INITIAL_URL = BASE_URL +"/watch/naruto-shippuuden-dub-episode-1";
const DIR = '';
(async () => {
 const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let nextUrl = INITIAL_URL;
  for (i=0;i<500;i++) {
  await page.goto(nextUrl);
  let fileName = nextUrl.split('/').pop()+".mp4";
  let videoUrl='',downloadUrl='';
  // Get the "viewport" of the page, as reported by the page.
  try {
    videoUrl = await page.evaluate(() => {
      try {
        const next =  "https://ww.kissanimes.tv"+$('.btn_next_and_prev').children().last('a')[0].getAttribute('href')
    return [document.getElementById("player_container").childNodes[0].getAttribute("src"),next] 
      } catch (error) {
        return null;
      }
  });
  if(!Array.isArray(videoUrl)) {
    console.log("Error : "+fileName);
    arr = nextUrl.split('-');
    nextEpisode = 1+parseInt(arr.pop());
    nextUrl = arr.join('-')+"-"+nextEpisode;
    continue;
  }
  nextUrl = videoUrl[1];
  await page.goto(videoUrl[0]);
  downloadUrl=await page.evaluate(()=>{
    const delay = ms => new Promise(res => setTimeout(res, ms));
    return delay(5).then(()=>{
        return jwplayer("myVideo").getConfig().sources[0].file
    }).catch((err)=>err);
  });
} catch(err){
  console.log(err);
  continue;
}
  try {
    const records = [
      {name: fileName,  player: videoUrl[0],download:downloadUrl}
  ];
    const data = await download(downloadUrl);
    fs.writeFileSync(DIR+fileName,data);
    await csvWriter.writeRecords(records) 
    console.log('added '+fileName);
  } catch(err){
      console.log(err);
  }
  }
  await page.close();
  await browser.close();
})();