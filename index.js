import express from 'express';
import RateLimiter from './rate-limiter.js'

const app = new express();
const rateLimiter = new RateLimiter({window: 3000, maxHits: 3});
app.use(rateLimiter.guard());

app.get('/test', (req, res) => {
    console.log('request received')
    res.json({ message: 'Hello!' });
});

app.listen(65535, ()=>{
    console.log("app running on 65535")
});