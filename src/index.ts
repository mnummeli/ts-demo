#!/usr/bin/env node

'use strict';

const os = require('node:os');
const path = require('node:path');
import express, { Express, Request, Response } from 'express';
const app: Express = express();
const PORT= process.env.port || 3000;

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
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    model.timeString = `${hours}:${minutes}:${seconds}`;
    res.render('index', model);
});

app.use(express.static(path.join(__dirname, 'static')))

app.listen(PORT, () => {
    console.log(`Sovellus vastaa portissa: ${PORT}.`);
});
