import express from 'express';
const app = express();
app.get('/status', (req, res) => res.json({ status: 'OK' }));
app.listen(3002, () => console.log('Listening on 3002'));
