import express from 'express';
import RateLimiter from './rate-limiter.js'
import 'dotenv/config';



const app = new express();
const rateLimiter = new RateLimiter({window: 3000, maxHits: 3, storage: 'redis', redisConfig: {
    host: '127.0.0.1',
    port: 6379,
}});
app.use(rateLimiter.guard());

app.get('/test', (req, res) => {
    console.log('request received')
    res.json({ message: 'Hello!' });
});

app.listen(process.env.PORT, ()=>{
    console.log(`App running on ${process.env.PORT}`)
});