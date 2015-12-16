# ProgressMap

## Yleistä

Ajankäyttö: https://docs.google.com/spreadsheets/d/1uSZrRSVjGdinSfTB5AiUNV2NFqXXDwEZjiPDRvmksyA/edit?usp=sharing

Sprint Burndown kaaviot: https://docs.google.com/spreadsheets/d/1gtdAvn2u4kb_GybwwmAqGRldjNnckgDV1hGt_PwUzjo/edit?usp=sharing

Heroku: http://progressmap.herokuapp.com/

Travis: https://travis-ci.org/PVM-team/ProgressMap

Trello: https://trello.com/pvm5

## Käyttöohjeet
####Testit
######Yksikkötestit
Yksikkötestit löytyvät "spec/javascripts" -kansiosta. Ajaaksesi testit suorita ohjelman juuressa komento "rake teaspoon"


######Capybara
Capybara testit löytyvät "spec" kansion alta. Suorita ohjelman juuressa komento "rspec spec/" ajaaksesi kaikki capybaratestit. Suorita "rspec spec/haluamasitiedosto" ajaaksesi yksittäinen testitiedosto. 

HUOM! Jotkut capybara testeistä menevät rikki jos ajat kaikki testitiedostot samaan aikaan. Kannattaa ajaa epäonnistuva testitiedosto yksittäisesti varmistuaksesi virheestä.


####Paikallinen palvelin
Paikallisen palvelimen saat päälle komennolla "rails s"

## Asennusohjeet
#### Tuotantoympäristö
Railsin asennus: https://github.com/mluukkai/WebPalvelinohjelmointi2015/wiki/railsin-asennus

Suorita ohjelman juuressa terminaalikomento "bundle install", joka hakee tarvittat gemit koneellesi.

#### Google API Acceess Token
Tee Googlen sisäänkirjautumista varten oma avain ja syötä se "app/views/layouts/application.html.erb" -tiedostoon rivillä 7 sijaitsevan meta-tagin "content"-kenttään. Ohjeet avaimen luomiseen löydät täältä: https://developers.google.com/identity/protocols/OAuth2


## Bugit


