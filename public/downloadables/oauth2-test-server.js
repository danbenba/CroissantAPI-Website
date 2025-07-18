const http = require('http');
const { URL, URLSearchParams } = require('url');

const hostname = '127.0.0.1';
const port = 3000;

const CLIENT_ID = 'your-uuid-client-id'; // Replace with your actual client ID
const CLIENT_SECRET = 'your-uuid-client-secret'; // Replace with your actual client secret

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/croissant-oauth')) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        const url = new URL(req.url, `http://${req.headers.host}`);
        const code = url.searchParams.get('code');

        const params = new URLSearchParams({
            code: code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        });

        fetch(`https://croissant-api.fr/api/oauth2/user?${params.toString()}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            res.end(`User Info: ${JSON.stringify(data)}\n`);
        })
        .catch(error => {
            console.error('Error:', error);
            res.statusCode = 500;
            res.end('Internal Server Error\n');
        });
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Not found');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});