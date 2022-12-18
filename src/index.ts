#!/usr/bin/env node

'use strict';

const os = require('node:os');
const path = require('node:path');
import express, { Express, Request, Response } from 'express';
const app: Express = express();
const PORT= process.env.port || 3000;
const { createClient } = require('redis');
const redisClient = createClient();
redisClient.on('error',
          (er: Error) => {
              console.error(`Rediksen alustaminen epäonnistui: ${er.message}`);
              process.exit(1);
          });

process.on('exit', code => {
    redisClient.quit();
    console.log(`Hei hei, prosessi päättyi koodilla: ${code}`);
});

interface Model {
    "title": string,
    "visitCount": string | number,
    "hostname": string,
    "timeString": string
}

app.set('view engine', 'pug');

app.get('/', (req: Request, res: Response) => {
    const model: Model = {
        "title": "Tietoa",
        "visitCount": "Ei yhteyttä Redis-palvelimeen.",
        "hostname": os.hostname(),
        "timeString": "Kellonaika ei tiedossa."
    };
    const currentTime: Date = new Date();

    // Kellonaika
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
        redisClient.incr('visits').then((value: string | number) => {
            model.visitCount = value;
        }).then(() => {
            redisClient.disconnect();
        }).then(() => {
            res.render('index', model);
        }).catch((er: Error) => {
            console.error(`Arvon päivittäminen Redikseen epäonnistui: ${er.message}`);
        });
    });
});

app.use(express.static(path.join(__dirname, 'static')));

app.listen(PORT, () => {
    console.log(`Sovellus vastaa portissa: ${PORT}.`);
});
