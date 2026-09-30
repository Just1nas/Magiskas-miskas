# Magiškas Miškas

Vite + React svetainė lietuvių kalba, paruošta GitHub ir Hostinger. Naudojami pateikti logotipai, Magical ir Manrope šriftai bei tikra vartotojo miško nuotrauka. Naujo fono paletė — naktinė mėlyna, turkis ir violetinė pagal šią nuotrauką. Generuotų iliustracijų ar netikrų socialinių įrašų nėra.

## Būsena ir failai

Aplikacija veikia ir surenkama. Tikras Bilietai.lt renginio URL ir widgetas dar nepateikti. Instagram galerija rodo tikrus @magiskas.miskas įrašų viršelius; bilietams rodoma laukimo būsena. Bendras Bilietai.lt mygtukas atidaro platintojo svetainę ir neapsimeta renginio pirkimo nuoroda.

`src/content.js` — tekstai, datos, vieta, zonos, D.U.K., kainos, nuorodos, sezono režimas ir integracijos. `src/styles.css` — visas dizainas, @font-face, mobile ir reduced-motion. `src/main.jsx` — sekcijos ir komponentai. `src/integrations.js` — tikrų Instagram įrašų validavimas. `public/brand/` ir `public/fonts/` — pateikti logotipai bei konvertuoti šriftai. `tests/` — integracijų patikros.

Turinys paremtas vartotojo „Magiško Miško WEB’o gairėmis“: pradžia nuo spalio 10 d., penkių erdvių aprašymai ir Vingio skyriaus adresas. Dokumento pavyzdinės spalio 11 ir 15 dienų eilutės nebuvo laikomos patvirtintu visu kalendoriumi. Nepateiktos kainos, valandos, nuolaidų, grąžinimo ir prieinamumo taisyklės nebuvo išgalvotos. Prieš viešinimą peržiūrėkite visus laukiančius patikslinimo tekstus.

## Paleisti kompiuteryje

Reikia Node.js 24 LTS. Projektas reikalauja bent 22.12.0.

```sh
npm ci
npm run dev
```

Atidarykite terminale parodytą vietinį adresą. Gamybinės versijos patikra:

```sh
npm test
npm run build
npm run preview
```

`dist/` yra paruošta statinė svetainė. `npm run check:release` išvardija trūkstamus paleidimo duomenis ir grąžina nesėkmės kodą, kol jie neužpildyti. Tai sąmoningai atskiras žingsnis: peržiūrą galima surinkti ir prieš bilietų prekybos pradžią.

## Saugus perkėlimas į GitHub

Projektas įkeltas į `Just1nas/Magiskas-miskas`, šaka `main`, ir prijungtas prie Hostinger. Prieš atnaujinimą patikrinkite naujausią main būseną ir išsaugokite kitų pakeitimus. Į repo keliami šaltiniai, `public`, testai, konfigūracija ir `.github`; `node_modules` ir `dist` nekelkite.

## Hostinger — GitHub build ir deploy

Instrukcija patikrinta 2026-09-30 pagal [oficialų Hostinger diegimo vadovą](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/). Šis būdas skirtas Hostinger **Deploy Web App / Node.js Web App** funkcijai (Business arba Cloud planas), ne Website Builder/Horizons tekstinio prompto laukui.

1. Hostinger hPanel: **Websites → Add Website → Deploy Web App** (kai kuriose sąsajos versijose **Node.js Web App**).
2. Rinkitės **Import Git Repository**. Prijunkite GitHub ir pasirinkite `Just1nas/Magiskas-miskas` bei šaką su šiuo projektu. Viešą repozitoriją taip pat galima nurodyti jos URL, jei tokį lauką siūlo hPanel.
3. Patvirtinkite šiuos nustatymus:

| Laukas | Reikšmė |
| --- | --- |
| Framework / preset | Vite (React frontend) |
| Root directory | `.` — jei `package.json` yra šaknyje; `website` tik jei projektą įdėjote ten |
| Node.js | `24.x` |
| Package manager | npm |
| Install command, jei rodomas | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variables | Nereikia |
| Start command / entry file | Nereikia statiniam Vite frontend |

4. Spauskite **Deploy**. Build žurnale turi būti sėkmingas Vite surinkimas. Patikrinkite laikiną svetainės adresą, šriftus, mobilų meniu, D.U.K., bilietų ir maršruto nuorodas.
5. Prijunkite domeną per šios svetainės Hostinger domeno nustatymus; DNS reikšmes naudokite tik tas, kurias rodo jūsų hPanel. Patikrinkite HTTPS.
6. Jei prijungėte GitHub automatinį diegimą, nauji pasirinktos šakos pakeitimai inicijuoja naują build. Prieš juos integruojant GitHub patikra turi sėkmingai baigti `npm test` ir `npm run build`.

Neįrašykite `npm run dev` ar `vite preview` kaip produkcinio serverio. Tai statinė aplikacija be nuolatinio Node proceso.

### Alternatyva be GitHub jungties

**Deploy Web App → Upload your website files** priima projekto šaltinio ZIP. Įkelkite projekto šaltinio ZIP, kuriame `package.json` yra tiesiai ZIP šaknyje, ir naudokite tuos pačius build nustatymus. Tai nėra automatinis GitHub diegimas.

### Alternatyva įprastam statiniam hostingui

Jei planas neturi Deploy Web App, bet turi failų talpinimą:

1. Savo kompiuteryje vykdykite `npm ci` ir `npm run build`.
2. Padarykite esamo domeno failų atsarginę kopiją.
3. hPanel File Manager atidarykite konkretaus domeno `public_html`.
4. Įkelkite **`dist` aplanko turinį**, ne patį aplanką ir ne React šaltinį. `index.html` turi būti tiesiai `public_html`.
5. Patikrinkite domeną. Šiai vieno puslapio svetainei naudojamos `#` nuorodos, todėl SPA perrašymo taisyklių nereikia. `base: './'` leidžia talpinti ir poaplankyje.

Jei gavote `magiskas-miskas-dist.zip`, jame jau yra surinkta versija. Kiekvieną kartą pakeitus šaltinį jį reikia surinkti iš naujo. `build.yml` tikrina aplikaciją; `instagram.yml` atnaujina galerijos duomenis. Svetainę publikuoja Hostinger GitHub jungtis.

## Bilietai.lt

`src/content.js`:

- `tickets.url`: oficiali TIK šio renginio HTTPS nuoroda į Bilietai.lt. Ją užpildžius visi „Pirkti bilietą“ mygtukai (header, hero, praktinė informacija, D.U.K., final ir mobile) nukreips į tą pačią vietą.
- `tickets.iframeUrl`: tik tiekėjo duotas įterpimo URL. Jis nėra tas pats, kas įprastas renginio puslapis. Widgetas įkeliamas tik lankytojui paspaudus „Rodyti bilietų pasirinkimą“. Tiesioginė nuoroda lieka visada pasiekiama, net jeigu iframe užblokuotas.
- `tickets.price` ir `ticketTypes`: kainos ir kategorijos. Kategorijos dabar yra iš gairių, be išgalvotų sumų.

Komponentas `Tickets` izoliuoja widgeto vietą. Jei Bilietai.lt pateiks tik script integraciją, pritaikykite ją ten pagal oficialią tiekėjo instrukciją su `useEffect` ir cleanup; nedėkite nepatikrinto script ar HTML į `content.js`. Numatytoji leistinų hostų taisyklė yra `bilietai.lt`; kitą widgeto domeną pridėkite tik gavę oficialų tiekėjo patvirtinimą.

## Instagram — nuotraukų galerija

Trečioje svetainės skiltyje rodoma iki 5 naujausių @magiskas.miskas įrašų viršelių be balto rėmo. Srautas: `public/instagram/feed.json`. Kompiuteryje telpa keturios nuotraukos, telefone galima braukti. Paspaudus atidaroma didesnė peržiūra; Reel vaizdo įrašas atidaromas pačiame Instagram. Vienas įrašas nedubliuojamas: automatinis slinkimas įsijungia turint bent du įrašus.

Karuselė perslenka kas 6,5 sekundės, pristabdo užvedus pelę, sustoja po lietimo ar klaviatūros fokuso. Yra rodyklės ir pauzės mygtukas. Už ekrano, neaktyviame lange, atidarius didesnę peržiūrą arba įjungus `prefers-reduced-motion`, automatinis slinkimas nevyksta. Peržiūra uždaroma mygtuku, Escape arba paspaudus už jos ribų.

`.github/workflows/instagram.yml` tikrina paskyrą kas valandą, 17 minutę (GitHub vykdymas gali vėluoti). Rankinis paleidimas: GitHub → Actions → Refresh Instagram gallery → Run workflow. Darbas paleidžiamas ir pakeitus atnaujinimo skriptą. Pasikeitus srautui įrašo tik `public/instagram/` pakeitimus į main; Hostinger automatinis diegimas surenka naują versiją. GitHub Actions reikia `contents: write` teisės; main taisyklės turi leisti darbo įrašus.

Šaltinis yra viešo Instagram profilio įterpimo puslapio metaduomenys. Tai nėra autentifikuota Meta Graph API integracija: prisijungimo naršyklėje slapukai nenaudojami, prieigos raktų nėra. Instagram gali pakeisti struktūrą arba riboti užklausas. Tokiu atveju darbas praneša apie nesėkmę, o svetainėje lieka paskutinė sėkminga galerija. Stebėkite GitHub Actions nesėkmių pranešimus. Jei viešas šaltinis taps neprieinamas, reikės oficialios Meta API arba pasirinkto feed tiekėjo integracijos.

`node scripts/refresh-instagram.js` atnaujina srautą vietoje. Skriptas nevykdo gauto JavaScript: tik perskaito JSON, patikrina paskyros savininką, nuorodas ir vaizdo formatą. Viršeliai saugomi lokaliai, todėl lankytojo naršyklė nesikreipia į Instagram, kol nepaspaudžia išorinės nuorodos. Visi failai paimami prieš pakeičiant srautą; nesėkmingas atsakymas neištrina veikiančios galerijos.

`instagram.endpoint` galima pakeisti patikimo serverio JSON adresu. Formatui reikia `posts` masyvo su `id`, `permalink`, `timestamp`, `caption`, `media_type`, `media_url`; VIDEO viršeliui — `thumbnail_url`. Frontend tikrina srautą kas 5 minutes. Niekada nedėkite prieigos rakto į frontend, `VITE_*`, repo ar viešą JSON.

## Du fono variantai

- `/?perziura=1&fonas=spalvos` — mėlynos, turkio ir violetinės šviesos fonas su logotipu.
- `/?perziura=1&fonas=nuotrauka` — vartotojo miško nuotrauka hero dalyje su patamsinimu.

Peržiūros nuorodos rodo fono perjungiklį. Įprastame puslapyje jis nerodomas. Numatytoji `appearance.background` reikšmė yra `colors`; galutinai pasirinkus nuotrauką pakeiskite į `photo` ir surinkite projektą. Nuotrauka konvertuota iš vartotojo BMP į 276 KB WebP; originalas nepakeistas. Animacijos išjungtos su `prefers-reduced-motion`.

## Žemėlapis, kontaktai ir sezonas

`map.directionsUrl` jau atidaro adresą Google Maps. `map.embedUrl` paliktas tuščias: įrašykite Google Maps „Share → Embed a map“ iframe HTTPS `src`, jei norite žemėlapio vietoje. Jis įkeliamas tik po paspaudimo. Žemėlapis nėra papildomas dekoratyvinis vaizdas.

`socials.facebook`, `socials.tiktok`, `contactEmail`, `reviewUrl` valdo papildomas nuorodas; tušti laukai nerodomi. Adresų nespėliokite.

Pasibaigus sezonui nustatykite `season.mode: 'closed'` ir atnaujinkite `season.closedMessage`. Tada bilietų widgetas neberodomas, visi pirkimo CTA tampa „Iki susitikimo“, o hero datos ir final sekcija skelbia uždarymo žinutę. Naujam sezonui grąžinkite `upcoming` arba `live`, atnaujinkite datą, kainas ir bilietų URL, tada surinkite iš naujo. Visas esamas istorinis turinys lieka redaguojamas.

## Dizainas ir patikra

- Penkios miško erdvės pateikiamos vienoje perjungiamoje scenoje: pasirinkimas pavadinimais, ankstesnės / kitos erdvės mygtukai ir klaviatūros rodyklės. D.U.K. pradžioje rodo šešis klausimus, likę pasiekiami per „Daugiau klausimų“.
- Magical naudojamas H1/H2/H3, didelėms emocinėms frazėms ir erdvių pavadinimams; Manrope — navigacijai, tekstui, mygtukams ir FAQ.
- Šriftai konvertuoti iš pateiktų TTF į WOFF2 be simbolių iškirpimo, išsaugotos lietuviškos raidės ir Manrope variable ašis.
- Logotipo PNG failai išlaikyti originalūs. Balta išvaizda ant tamsaus fono gaunama CSS filtru. Watermark naudoja pateiktą to paties pagrindinio logotipo simbolį.
- Pirmojo ekrano antraštė pasirodo dviem etapais; kitos antraštės ir pasakojimo tekstai vieną kartą atsiskleidžia patekę į matomą sritį (28 px, 1,1–1,4 s); tekstas visada išlieka įskaitomas. Mygtukai reaguoja į pelę, klaviatūros fokusą ir paspaudimą. Logotipo fone judesys lėtas.
- `prefers-reduced-motion` išjungia animaciją ir tolygų slinkimą, taip pat sustabdo jau vykstančius efektus pakeitus sistemos nuostatą. Yra klaviatūros fokusas, skip link, semantinės antraštės, native FAQ accordion, mobile meniu ir nuolatinis bilietų CTA.
- SEO meta tekstai yra `index.html`; pakeitus renginio esmę juos atnaujinkite kartu su turiniu. Canonical ir renginio struktūriniai duomenys nepridėti be patvirtinto domeno / pilnų datų.
- Reali bilietų operacija, oficialus widgetas ir tikros paskyros feed turi būti patikrinti prijungus tiekėjo duomenis.
