import http from 'http';

const ports = [5173, 5174, 3000, 3001];

for (const port of ports) {
    const req = http.get(`http://localhost:${port}/`, (res) => {
        console.log(`Port ${port} is active! Status: ${res.statusCode}`);
    });
    req.on('error', (e) => {
        // console.log(`Port ${port} is not active: ${e.message}`);
    });
}
