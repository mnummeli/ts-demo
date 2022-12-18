#!/usr/bin/env node

'use strict';

const os = require('node:os');
const path = require('node:path');
import express, { Express, Request, Response } from 'express';
const app: Express = express();
const PORT= process.env.PORT || 3000;
const { createClient } = require('redis');
const redisClient = createClient();
redisClient.on('error',
          (er: Error) => {
              console.error(`Rediksen alustaminen epäonnistui: ${er.message}`);
              process.exit(1);
          });

process.on('SIGINT', () => {
    redisClient.quit();
    console.log(`Hei hei!`);
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

app.get('/', (req: Request, res: Response) => {
    // Kellonaika
    const currentTime: Date = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    model.timeString = `${hours}:${minutes}:${seconds}`;

    // Vierailujen lukumäärä (Redis)
    let redisUrl: string;
    if(process.env.REDIS_URL) {
        redisUrl = process.env.REDIS_URL;
    } else {
        redisUrl = 'redis://localhost:6379';
    }
    redisClient.connect(redisUrl).then(() => {
        let redisResultPromise : Promise<any> = redisClient.incr('visits').then((value: string | number) => {
            model.visitCount = value;
        });
        redisResultPromise.then(() => {
            redisClient.disconnect();
        }).then(() => {
            res.render('index', model);
        }).catch((er: Error) => {
            console.error(`Arvon päivittäminen Redikseen epäonnistui: ${er.message}`);
        });
    });
});

app.post('/', (req: Request, res: Response) => {
    // Kellonaika
    const currentTime: Date = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    model.timeString = `${hours}:${minutes}:${seconds}`;

    // Vierailujen lukumäärä (Redis)
    let redisUrl: string;
    if(process.env.REDIS_URL) {
        redisUrl = process.env.REDIS_URL;
    } else {
        redisUrl = 'redis://localhost:6379';
    }
    redisClient.connect(redisUrl).then(() => {
        let redisResultPromise : Promise<any> = redisClient.set('visits', 0).then((value: string | number) => {
            model.visitCount = value;
        });
        redisResultPromise.then(() => {
            redisClient.disconnect();
        }).then(() => {
            res.redirect('/');
        }).catch((er: Error) => {
            console.error(`Arvon nollaaminen Rediksessä epäonnistui: ${er.message}`);
        });
    });
});

app.use(express.static(path.join(__dirname, 'static')));

app.listen(PORT, () => {
    console.log(`Sovellus vastaa osoitteessa: http://${os.hostname()}:${PORT}`);
});
