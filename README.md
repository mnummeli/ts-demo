# Typescript-demo

## Yleistä

Tämä on alkeellinen Express.js-palvelimeen ja Redis-tietokantaan perustuva prototyyppi, jossa Redistä käytetään sivulla käyntikertojen laskemiseen. Sovellusta on mahdollista ajaa lokaalisti, kunhan tarvittavat ohjelmistot on ladattu tai paketoida Docker-levykuvaksi.

## Tarvittavat ohjelmistot

Jos sovellusta ajaa lokaalisti, käytössä tulee olla UNIX-käyttöjärjestelmä, esimerkiksi joku GNU/Linux-distribuutio. Lisäksi tarvitaan
* Node.js
* Gulp
* Redis

### `Node.js`

https://nodejs.org/en/download/

### Gulp

```bash
npm install -g gulp-cli typescript
```

### Redis

Debian-pohjaisissa järjestelmissä
```bash
sudo apt-get install redis
```

RedHat-pohjaisissa järjestelmissä

```bash
sudo yum install redis
```

## Ajaminen paikallisesti

### Node.js-riippuvuuksien asennus

```bash
npm install
```

### Ajaminen

```bash
gulp
```

Tämän jälkeen avaa toinen välilehti ja kirjoita siellä

```bash
cd dist
node ./index.js
```

Jos ohjelma käynnistyi oikein, se kertoo, missä osoitteessa ohjelma vastaa. Mikäli haluat, että sivu päivittyy automaattisesti kun `index.pug` tai `app.css`-tiedostoja päivitetään, tulee eri välilehdessä ajaa päähakemistossa käsky:

```bash
gulp dev
```

## Ajaminen Docker-konteissa

Tätä varten tulee `docker` olla asennettuna. Se onnistuu Ubuntu Linuxissa käskyllä

```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
```

### Levykuvan kääntäminen

```bash
npm run build-docker-image
```

### Ajaminen `docker-compose`:lla

```bash
docker-compose up -d
```

Porttien eteenpäin välittämisen vuoksi selaimen voi nyt osoittaa osoitteeseen:

http://localhost:3000

Palvelu voidaan sammuttaa käskyllä:

```bash
docker-compose down
```
