# OGC API kennissessie
Repository ten behoeve van kennisdeling voor het bouwen van een OGC API Features & Processes node app.

Dit is geen operationele service.

## Start de server lokaal

1. Installeer de dependencies van de server met Node en `node install`.
2. Start de server op één van de volgende manieren:

   1. Vanaf de commandline: `node --env-file=.env src/index.js`
   2. In Visual Studio Code: er is een [.vscode/launch.json](.vscode/launch.json) bestand meegeleverd, waarmee met een **druk op F5** de server start.
     
3. De server start, maar mogelijk is poort 80 niet beschikbaar.
   1. Wijzig dan in het bestand [`.env`](.env) de regel `PORT=80` naar een niet-gepriviligeerd, hoger poortnummer, bijv. `PORT=8085`.

4. Open in een webbrower de service op `http://localhost/{ID}/v{APIVERSION}`.
   1. Bijv. als het poortnummer is verhoogd: http://localhost:8085/demoservice/v1/
