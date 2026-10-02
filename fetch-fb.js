const https = require('https');
const urls = [
  "https://www.facebook.com/profile.php?id=61551047840314",
  "https://www.facebook.com/ofm.org/",
  "https://www.facebook.com/franciscanmissions/",
  "https://www.facebook.com/PEACOfficial/",
  "https://www.facebook.com/ofmsouthphil/",
  "https://www.facebook.com/CEAPChannel/"
];

async function fetchImage(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchImage(res.headers.location).then(resolve);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (match) {
          resolve(match[1].replace(/&amp;/g, '&'));
        } else {
          resolve('Not found');
        }
      });
    }).on('error', () => resolve('Error'));
  });
}

async function main() {
  for (const url of urls) {
    const img = await fetchImage(url);
    console.log(url, '=>', img);
  }
}
main();
