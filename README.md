# ProgressMap

## Yleistä

Ajankäyttö: https://docs.google.com/spreadsheets/d/1uSZrRSVjGdinSfTB5AiUNV2NFqXXDwEZjiPDRvmksyA/edit?usp=sharing

Sprint Burndown kaaviot: https://docs.google.com/spreadsheets/d/1gtdAvn2u4kb_GybwwmAqGRldjNnckgDV1hGt_PwUzjo/edit?usp=sharing

Heroku: http://progressmap.herokuapp.com/

Travis: https://travis-ci.org/PVM-team/ProgressMap

Trello: https://trello.com/pvm5

## Käyttöohjeet

Ohjelma toimii osoitteessa http://progressmap.herokuapp.com/

## API

#### Kurssin luonti

Kurssin luonti onnistuu tekemällä HTTP POST pyynnön osoitteeseen 'progressmap.herokuapp.com/courses/create' antaen seuraavanlaista dataa JSON muodossa:

  * course_name: string
  * assignments: taulukko tehtävistä, jotka muotoa {'name': string, 'number': int, 'dependencies': [nr, nr, nr, ...]}
  * students: taulukko opiskelijoista, jotka muotoa {'firstName': string, 'lastName': string}`

**Esimerkki:**

>curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X POST -d '
>{"course_name":"Ohtuprojekti","assignments":[{"name":"Ykköstehtävä","number":1},{"name":"Kakkostehtävä","number":2},{"name":"Kolmostehtävä","number":3,"dependencies":[1]},{"name":"Nelostehtävä","number":4,"dependencies":[1,2,3]},{"name":"Viitostehtävä","number":5,"dependencies":[1,4]}],"students":[{"firstName":"Mauno","lastName":"Erkkilä"},{"firstName":"Jonne","lastName":"Kaukovaara"}]} ' \ progressmap.herokuapp.com/courses/create

Tällä hetkellä kurssi ei rekisteröidy kellekään opettajalle, joten tässä on puute.


## Asennusohjeet
#### Tuotantoympäristö
Railsin asennus: https://github.com/mluukkai/WebPalvelinohjelmointi2015/wiki/railsin-asennus
Ohjelman juuressa suorita konsolissa "bundle install", joka hakee tarvittat gemit koneellesi

#### Google API Acceess Token
Tee Googlen sisäänkirjautumista varten oma avain ja syötä se "app/views/layouts/application.html.erb" -tiedostoon rivillä 7 sijaitsevan meta-tagin "content"-kenttään. Ohjeet avaimen luomiseen löydät täältä https://developers.google.com/identity/protocols/OAuth2
