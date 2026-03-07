
const http = require('http');

function postArticle(payload, name) {
    const data = JSON.stringify(payload);
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
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log(`[${name}] Status: ${res.statusCode}`);
            if (res.statusCode !== 201) {
                console.log(`[${name}] Error Body: ${body}`);
            }
        });
    });

    req.on('error', (e) => console.error(`[${name}] Request error: ${e.message}`));
    req.write(data);
    req.end();
}

// Test 1: Empty Category
postArticle({
    title: 'No Category Article',
    slug: 'no-cat-' + Date.now(),
    summary: 'Summary',
    content: 'Content',
    category: '', // Empty string
    image: '/placeholder.jpg',
    author: 'Tester',
    date: '2023-10-26'
}, 'Empty Category');

// Test 2: Empty Image
postArticle({
    title: 'No Image Article',
    slug: 'no-img-' + Date.now(),
    summary: 'Summary',
    content: 'Content',
    category: 'Technology',
    image: '', // Empty string
    author: 'Tester',
    date: '2023-10-26'
}, 'Empty Image');

// Test 3: Duplicate Slug (using one from seed)
postArticle({
    title: 'Duplicate Slug Article',
    slug: 'future-of-writing', // Existing slug
    summary: 'Summary',
    content: 'Content',
    category: 'Technology',
    author: 'Tester',
    date: '2023-10-26'
}, 'Duplicate Slug');
