# ProgressMap

## Yleistä

Ajankäyttö: https://docs.google.com/spreadsheets/d/1uSZrRSVjGdinSfTB5AiUNV2NFqXXDwEZjiPDRvmksyA/edit?usp=sharing

Sprint Burndown kaaviot: https://docs.google.com/spreadsheets/d/1gtdAvn2u4kb_GybwwmAqGRldjNnckgDV1hGt_PwUzjo/edit?usp=sharing

Heroku: http://progressmap.herokuapp.com/

Travis: https://travis-ci.org/PVM-team/ProgressMap

Trello: https://trello.com/pvm5


## Asennusohjeet
#### Tuotantoympäristö
Railsin asennus: https://github.com/mluukkai/WebPalvelinohjelmointi2015/wiki/railsin-asennus

Suorita ohjelman juuressa terminaalikomento "bundle install", joka hakee tarvittat gemit koneellesi.

#### Google API Acceess Token
Tee Googlen sisäänkirjautumista varten oma avain ja syötä se "app/views/layouts/application.html.erb" -tiedostoon rivillä 7 sijaitsevan meta-tagin "content"-kenttään. Ohjeet avaimen luomiseen löydät täältä: https://developers.google.com/identity/protocols/OAuth2

## Käyttöohjeet
####Testit
######Yksikkötestit
Yksikkötestit löytyvät "spec/javascripts" -kansiosta. Ajaaksesi testit suorita ohjelman juuressa komento "rake teaspoon"

######Capybara
Capybara testit löytyvät "spec" kansion alta. Suorita ohjelman juuressa komento "rspec spec/" ajaaksesi kaikki capybaratestit. Suorita "rspec spec/haluamasitiedosto" ajaaksesi yksittäinen testitiedosto. 

HUOM! Jotkut capybara testeistä menevät rikki jos ajat kaikki testitiedostot samaan aikaan. Kannattaa ajaa epäonnistuva testitiedosto yksittäisesti varmistuaksesi virheestä.


####Paikallinen palvelin
Paikallisen palvelimen saat päälle komennolla "rails s"


## API

#### Kurssin luonti

Kurssin luonti onnistuu tekemällä HTTP POST pyynnön osoitteeseen _/courses/create_ antaen parametrina seuraavanlaista dataa JSON muodossa:

  * `course_name: string`
  * `assignments: taulukko tehtävistä, jotka muotoa: {'name': string, 'number': int, 'dependencies': [nr, nr, nr, ...]}`
  * `students: taulukko opiskelijoista, jotka muotoa: {'firstName': string, 'lastName': string}`

**Esimerkki:**

>curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X POST -d '
>{"course_name":"Ohtuprojekti","assignments":[{"name":"Ykköstehtävä","number":1},{"name":"Kakkostehtävä","number":2},{"name":"Kolmostehtävä","number":3,"dependencies":[1]},{"name":"Nelostehtävä","number":4,"dependencies":[1,2,3]},{"name":"Viitostehtävä","number":5,"dependencies":[1,4]}],"students":[{"firstName":"Mauno","lastName":"Erkkilä"},{"firstName":"Jonne","lastName":"Kaukovaara"}]} ' \ progressmap.herokuapp.com/courses/create

Tällä hetkellä kurssi ei rekisteröidy kellekään opettajalle, joten tässä on puute.

#### Opiskelijan lisääminen kurssille

Uuden opiskelijan lisääminen kurssille onnistuu tekemällä HTTP POST pyynnön osoitteeseen _/students/create_ antaen parametrina seuraavanlaista dataa JSON muodossa:

  * `course_token: UUID`
  * `firstName: string`
  * `lastName: string`

**Esimerkki:**

>curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X POST -d '
>{"course_token":"668105d1-8a37-439b-bc54-b74ede95e2c7","firstName":"Erkki","lastName":"Mäkelä"} ' \ progressmap.herokuapp.com/students/create

#### Tehtävän kirjaaminen opiskelijalle yritetyksi/tehdyksi

Tehtävän kirjaaminen opiskelijalle yritetyksi onnistuu tekemällä HTTP POST pyynnön osoitteeseen _/students_tasks_ antaen parametrina seuraavanlaista dataa JSON muodossa:

  * `course_token: UUID`
  * `student_token: UUID`
  * `number: int`
  * `complete: boolean` _(Arvona 'true', jos tehtävä merkataan tehdyksi. Muussa tapauksessa arvoa tai sen olemassaoloa ei huomioda.)_

**Esimerkki:**

>curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X POST -d '
>{"course_token":"2990bbc4-df73-4119-b5b9-e4266a2898ba","number":1,"student_token":"ecf3df35-28b2-4ed0-81cf-b0610a3129da","complete":true} ' \ progressmap.herokuapp.com/students_tasks


## Bugit

Kirjoita tänne jotain jos bugeja on...