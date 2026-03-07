
const http = require('http');

const data = JSON.stringify({
  title: 'Debug Article',
  slug: 'debug-article-' + Date.now(),
  summary: 'This is a debug article to test creation.',
  content: '<p>Debug content</p>',
  category: 'Technology', // Assuming this category exists from seed
  image: '/placeholder.jpg',
  isFeatured: false,
  author: 'Sourav Halder',
  date: new Date().toISOString().split('T')[0]
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/articles',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
