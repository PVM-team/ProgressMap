# ProgressMap

## Asennusohjeet
Kopioi tämä repo koneellesi haluamallasi tavalla.

#### Tuotantoympäristö
Railsin asennus: https://github.com/mluukkai/WebPalvelinohjelmointi2015/wiki/railsin-asennus

Suorita ohjelman juuressa terminaalikomento _bundle install_, joka hakee tarvittat gemit koneellesi.

#### Google API Acceess Token
Tee Googlen sisäänkirjautumista varten oma avain ja syötä se _app/views/layouts/application.html.erb_ -tiedostoon rivillä 7 sijaitsevan meta-tagin _content_-kenttään. Ohjeet avaimen luomiseen löydät täältä: https://developers.google.com/identity/protocols/OAuth2

## Käyttöohjeet
#### Palvelin paikallisesti
Paikallisen palvelimen saat päälle komennolla _rails s_.

#### Palvelin Herokussa
Ohjelma löytyy osoitteesta http://progressmap.herokuapp.com

HUOM! Kirjautuessa Google-tunnuksilla sisälle, ohjelma luo tietokantaan uuden käyttäjän.

Käytössämme on Herokun hobby tier -suunnitelma, joka rajoittaa palvelimen käyttöä huomattavasti. ks. https://devcenter.heroku.com/articles/heroku-postgres-plans#hobby-tier

#### Testit
##### Yksikkötestit (front)
Front -puolen yksikkötestit löytyvät _spec/javascripts_ -kansiosta. Ajaaksesi testit suorita ohjelman juuressa komento _rake teaspoon_.

##### Yksikkötestit (backend)
Backend -puolen yksikkötestit löytyvät _spec/models_ -kansiosta. Ajaaksesi testit suorita ohjelman juuressa komento _rspec spec/models_.

#### API testit (backend)
API testit löytyvät _spec/apis_ kansiosta. Ajaaksesi testit suorita ohjelman juuressa komento _rspec spec/apis_.

#### Integraatio -ja käytettävyystestit
Testaus on kirjoitettu Capybaralla. Testit voi suorittaa ajamalla _rspec/spec/features_. Yksittäisen testin voi suorittaa antamalla _rspec_:ille parametrina testin polun.

HUOM! Osa testeistä ei mene läpi, sillä ne eivät toimi enää kirjautumistoiminnallisuuden käyttöönoton takia. Lisäksi capybara -testejä suorittaessa kannattaa testitiedostot ajaa yksi kerrallaan - niiden suoritus ei toimi täysin samalla lailla, jos suorittaa kaikki capybara -testit kerralla.


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

## Puutteita

  * Opettajan käyttöliittymästä ei voi tällä hetkellä merkata opiskelijoille tehtäviä tehdyksi.

  * Kurssin luonti API-kutsulla ei lisää kurssia kellekkään opettajalle, eli luotuun kurssiin ei kukaan pääse käyttöliittymästä käsiksi.

  * Testaus ei ole ollut kattavaa kirjautumistoiminnallisuuden käyttöönoton jälkeen.


## Bugit

  * Studentmap avautuu välillä normaalisti, toisinaan jää "jumiin".

  * OSX:llä studentmap avautuu "littanana".

  * OSX:llä studentmapin riippuvuusnuolet eivät toimi ikkunan koon muuttamisen jälkeen.

  * Googlen kirjautuminen häviää hetkellisesti sivun manuaalisen päivittämisen yhteydessä. Tämä johtaa siihen, että sovellus ohjaa käyttäjän takaisin pääsivulle.
