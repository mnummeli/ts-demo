#!/usr/bin/env node

'use strict';

const os = require('node:os');
import express, { Express, Request, Response } from 'express';
const app: Express = express();
const PORT= process.env.port || 3000;

app.set('view engine', 'pug');

app.get('/', (req: Request, res: Response) => {
    const model = {
        "title": "Tietoa",
        "visitCount": 0,
        "hostname": os.hostname()
    };
    res.render('index', model);
});

app.listen(PORT, () => {
    console.log(`Sovellus vastaa portissa: ${PORT}.`);
});
