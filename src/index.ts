#!/usr/bin/env node

'use strict';

const os = require('node:os');
const path = require('node:path');
import express, { Express, Request, Response } from 'express';
const app: Express = express();
const PORT= process.env.PORT || 3000;
const { createClient } = require('redis');
const redisClient = createClient({
    url: resolveRedisUrl()
});
redisClient.on('error',
          (er: Error) => {
              console.error(`Rediksen alustaminen epäonnistui: ${er.message}`);
              redisClient.quit();
          });

process.on('SIGINT', () => {
    redisClient.quit();
    console.log(`Hei hei!\n`);
    process.exit(0);
});

interface Model {
    "title": string,
    "visitCount": string | number,
    "hostname": string,
    "timeString": string
}

app.set('view engine', 'pug');

const model: Model = {
    "title": "Tietoa",
    "visitCount": "Ei yhteyttä Redis-palvelimeen.",
    "hostname": os.hostname(),
    "timeString": "Kellonaika ei tiedossa."
};

function resolveRedisUrl(): string {
    return process.env.REDIS_URL || 'redis://localhost:6379';
}

function handleRedisResponse(resultPromise: Promise<any>, req: Request, res: Response, errorMessage: string) {
    resultPromise.then((value: string | number) => {
        model.visitCount = value;
    }).then(() => {
        redisClient.disconnect();
    }).then(() => {
        if(req.method === 'POST') {
            res.redirect('/');
        } else {
            res.render('index', model);
        }
    }).catch((er: Error) => {
        console.error(`${errorMessage}: ${er.message}`);
    });
}

app.get('/', (req: Request, res: Response) => {
    // Kellonaika
    const currentTime: Date = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    model.timeString = `${hours}:${minutes}:${seconds}`;

    let redisUrl: string = resolveRedisUrl();
    redisClient.connect().then(() => {
        let redisResultPromise : Promise<any> = redisClient.incr('visits');
        handleRedisResponse(redisResultPromise, req, res, `Arvon päivittäminen Redikseen epäonnistui`);
    });
});

app.post('/', (req: Request, res: Response) => {
    let redisUrl: string = resolveRedisUrl();
    redisClient.connect().then(() => {
        let redisResultPromise : Promise<any> = redisClient.set('visits', 0);
        handleRedisResponse(redisResultPromise, req, res, `Arvon nollaaminen Rediksessä epäonnistui`);
    });
});

app.use(express.static(path.join(__dirname, 'static')));

app.listen(PORT, () => {
    console.log(`Sovellus vastaa osoitteessa: http://${os.hostname()}:${PORT}`);
});
