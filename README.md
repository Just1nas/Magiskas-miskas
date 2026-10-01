# Magiškas Miškas

Vite + React svetainė lietuvių kalba, paruošta GitHub ir Hostinger. Naudojami pateikti logotipai, Magical ir Manrope šriftai bei tikra vartotojo miško nuotrauka. Naujo fono paletė — naktinė mėlyna, turkis ir violetinė pagal šią nuotrauką. Generuotų iliustracijų ar netikrų socialinių įrašų nėra.

## Būsena ir failai

Aplikacija veikia ir surenkama. Bilietai.lt renginio nuoroda ir vartotojo pateiktas PLG valdiklis integruoti. Instagram galerija rodo tikrus @magiskas.miskas įrašų viršelius; bilietai pasirenkami oficialiame valdiklyje.

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
5. Patikrinkite domeną. Šiai vieno puslapio svetainei naudojamos `#` nuorodos, todėl SPA perrašymo taisyklių nereikia. `base: '/'` skirtas domeno šakniai; administravimui reikia išlaikyti `gabija/index.html`.

Jei gavote `magiskas-miskas-dist.zip`, jame jau yra surinkta versija. Kiekvieną kartą pakeitus šaltinį jį reikia surinkti iš naujo. `build.yml` tikrina aplikaciją; `instagram.yml` atnaujina galerijos duomenis. Svetainę publikuoja Hostinger GitHub jungtis.

## Bilietai.lt

`src/content.js` laukas `tickets.widgetId` yra vartotojo pateiktas viešas valdiklio ID. `TicketWidget.jsx` po komponento įkėlimo vieną kartą įkelia oficialų `https://www.bilietai.lt/_widgets/widget.iife.js` skriptą su `plg-embed`. Valdiklio elementas turi `plg-widget`, `data-widget-id` ir `data-language="lt"`. Kalendorių, kainas, laisvas vietas, mokėjimą ir iframe aukštį valdo Bilietai.lt. Valdiklio spalvos, kraštinės ir šriftai perduodami tiekėjo palaikomais `data-theme`, `data-base`, `data-font` ir `data-custom-styles` parametrais iš `src/ticketTheme.js`. Naudojama dabartinė naktinė svetainės paletė, Manrope tekstams ir Magical H1–H3.

Svarbu: 2026-09-30 tiekėjo temos parametrų režimas neskaito išsaugotos valdiklio konfigūracijos. Todėl kartu perduodami viešo `/api/widget/<ID>` patikrinti `eventId: 7VTPCXHIHO` ir `sp: magiskas`. Pakeitus renginį reikia atnaujinti ir `ticketWidgetRouting`. Mokėjimo funkcijos nekeičiamos. Šriftai tie patys vartotojo pateikti WOFF2, įkeliami iš fiksuotos jo GitHub repo versijos; Hostinger šriftų atsakymai šiuo metu neturi iframe reikalingos CORS antraštės. Tiekėjui pakeitus parametrų palaikymą reikia pakartotinai patikrinti temą ir pirkimo pasirinkimą.

Visi „Pirkti bilietą“ mygtukai veda į `#bilietai`. `tickets.url` yra patikrinta tiesioginė šio renginio nuoroda; ji visada rodoma po valdikliu, taip pat jei skriptas užblokuotas arba kraunasi ilgai. Slapukų pasirinkimus valdo tiekėjas. Svetainėje neapdorojami mokėjimo ar asmens duomenys; pirkimas vyksta Bilietai.lt. Integracijos patikra neapima tikro užsakymo ar apmokėjimo.

`season.mode: 'closed'` paslepia valdiklį. Pašalinus `widgetId` grįžtama į ankstesnį nuorodos / pasirenkamo `tickets.iframeUrl` režimą. Nebūtina ir negalima kviesti `PLGWidget.init()` pakartotinai: tiekėjo skriptas pats inicializuoja elementą ir savo pranešimų bei URL pasikeitimo klausytojus.

## Instagram — nuotraukų galerija

Trečioje svetainės skiltyje rodoma iki 5 naujausių @magiskas.miskas įrašų viršelių be balto rėmo. Srautas: Supabase `instagram_cache`. Kompiuteryje telpa keturios nuotraukos, telefone galima braukti. Paspaudus atidaroma didesnė peržiūra; Reel vaizdo įrašas atidaromas pačiame Instagram. Vienas įrašas nedubliuojamas: automatinis slinkimas įsijungia turint bent du įrašus.

Karuselė perslenka kas 6,5 sekundės, pristabdo užvedus pelę, sustoja po lietimo ar klaviatūros fokuso. Yra rodyklės ir pauzės mygtukas. Už ekrano, neaktyviame lange, atidarius didesnę peržiūrą arba įjungus `prefers-reduced-motion`, automatinis slinkimas nevyksta. Peržiūra uždaroma mygtuku, Escape arba paspaudus už jos ribų.

Automatiką vykdo Supabase Cron kas 5 minutes, nepriklausomai nuo GitHub ir Hostinger diegimų. `supabase/functions/instagram-refresh/index.ts` pakeičia visą viešos `instagram_cache` lentelės įrašų sąrašą, todėl dingę įrašai pašalinami. Nauji failai saugomi `instagram-media` saugykloje; jau turimi failai pakartotinai nesiunčiami. Svetainė numatytajam `instagram.endpoint` skaito šią lentelę kas minutę. Tuščias sėkmingas srautas yra galiojantis; statinis JSON negrąžinamas kaip atsarginis sąrašas, kad neatsirastų ištrinti įrašai. Senesnė nei 15 min. galerija paslepiama iki sėkmingo atnaujinimo.

Įdiegimas kitame projekte: vieną kartą paleisti `supabase/instagram-cache.sql`, įdiegti funkciją `instagram-refresh` su JWT patikra, tada `supabase/instagram-schedule.sql` pritaikyti projekto URL ir viešą publishable raktą. Funkcija naudoja tik įprastus serverio `SUPABASE_URL` ir `SUPABASE_SERVICE_ROLE_KEY`; pastarojo niekada nedėkite į repo ar naršyklę. Viešas raktas neturi teisės rašyti į lentelę. `cron.schedule` tuo pačiu vardu atnaujina esamą grafiką. Išjungti: `select cron.unschedule('instagram-refresh-every-5-min');`.

Patikra: `/gabija/` Instagram skiltyje matomas paskutinio sėkmingo tikrinimo laikas ir įrašų kiekis. Supabase SQL: `select checked_at,last_attempt,last_error from public.instagram_cache;` ir `select * from cron.job_run_details order by start_time desc limit 5;`. Cron „succeeded“ reiškia HTTP užklausos išsiuntimą; tikras rezultatas yra naujas `checked_at` ir `net._http_response` HTTP 200 su `status: updated`. 4 min. užraktas neleidžia dubliuoti atsisiuntimų.

Šaltinis tebėra viešo Instagram profilio įterpimo puslapio metaduomenys, ne autentifikuota Meta Graph API. Naršyklės prisijungimo slapukai nenaudojami. Instagram gali pakeisti struktūrą arba riboti užklausas; tokiu atveju įrašomas `last_error`, o `checked_at` neatnaujinamas. 5 min. grafikas nėra Instagram duomenų pasiekiamumo garantija. Oficialiai Meta API ateityje reikėtų atskiro paskyros autorizavimo.

GitHub `Refresh Instagram gallery` liko tik rankiniam statinio `public/instagram/feed.json` atnaujinimui (Actions → Run workflow); jis nėra gyvos galerijos šaltinis. `instagram.endpoint` pakeitus kitu JSON URL, naudojamas tas adresas ir redaguojamas tikrinimo intervalas. Formatui reikia `posts` masyvo su `id`, `permalink`, `timestamp`, `caption`, `media_type`, `media_url`; VIDEO turi `thumbnail_url` ir pasirenkamą `video_url`. Srautų slaptų raktų nelaikykite frontend ar viešame JSON.

## Du fono variantai

- `/?perziura=1&fonas=spalvos` — mėlynos, turkio ir violetinės šviesos fonas su logotipu.
- `/?perziura=1&fonas=nuotrauka` — vartotojo miško nuotrauka hero dalyje su patamsinimu.

Peržiūros nuorodos rodo fono perjungiklį. Įprastame puslapyje jis nerodomas. Numatytoji `appearance.background` reikšmė yra `colors`; galutinai pasirinkus nuotrauką pakeiskite į `photo` ir surinkite projektą. Nuotrauka konvertuota iš vartotojo BMP į 276 KB WebP; originalas nepakeistas. Animacijos išjungtos su `prefers-reduced-motion`.

## Žemėlapis, kontaktai ir sezonas

`map.directionsUrl` jau atidaro adresą Google Maps. `map.embedUrl` įrašytas vartotojo pateiktas Google My Maps žemėlapis (`mid=1FTCxCjWWOorMnTW6itQX26UgJRLCrVc`). Jis rodomas „Kaip atvykti“ skiltyje ir kraunamas tingiai (`loading="lazy"`), kai lankytojas priartėja prie skilties. Plotis prisitaiko prie ekrano; yra ir atskira nuoroda atidaryti žemėlapį. Žemėlapio viešą prieinamumą, žymeklius ir sluoksnius valdo jo savininkas Google My Maps. Žemėlapis nėra papildomas dekoratyvinis vaizdas.

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

## Turinio panelė `/gabija/` — prijungimas

Supabase projektas `bksezjoyymvhrlideciq` sukurtas, lentelės ir RLS įdiegtos. Vieša registracija išjungta; grįžimo adresas `https://www.magiskasmiskas.lt/gabija/`. Viešas publishable raktas įrašytas `src/cms-config.js`. SMTP kvietimas sėkmingai išsiųstas, pirmam vartotojui suteikta `site_editors` narystė. Tikro prisijungimo ir išsaugojimo patikrai dar reikia, kad vartotojas atidarytų el. paštu gautą nuorodą. Viešoje navigacijoje nėra nuorodos į panelę. Adreso slaptumas nėra apsauga: serverio RLS leidžia rašyti tik `site_editors` įrašytiems vartotojams. Panelė turi `noindex,nofollow`.

1. Sukurkite savininkui priklausantį Supabase projektą. SQL Editor vieną kartą paleiskite `supabase/setup.sql`.
2. Authentication nustatymuose išjunkite viešą naujų vartotojų registraciją. Site URL: `https://www.magiskasmiskas.lt`. Redirect URLs pridėkite tik `https://www.magiskasmiskas.lt/gabija/` (ir vietinio testavimo adresą, jei reikia). Prisijungimui naudojama vienkartinė el. pašto nuoroda su PKCE, atidaroma toje pačioje naršyklėje.
3. Sukonfigūruokite Supabase Auth SMTP su savininko el. pašto siuntimo paslauga. Numatytasis testinis siuntimas nėra tinkamas savavališkiems komandos adresams. Patikrinkite pristatymą, apribojimus ir kvietimo bei Magic Link šablonus; naudokite tiekėjo `ConfirmationURL`.
4. Authentication → Users pakvieskite tik patvirtintus el. pašto adresus. Kiekvieno vartotojo UUID įrašykite į `site_editors` per SQL Editor (pavyzdys SQL failo gale). Kliento kodas negali kurti redaktorių. Pašalinus narį iš šios lentelės jo esama sesija nebeturės rašymo teisės.
5. Šiam projektui papildomų Hostinger kintamųjų nereikia: `src/cms-config.js` turi viešą URL ir publishable raktą. Kitam projektui galima perrašyti `VITE_SUPABASE_URL` ir `VITE_SUPABASE_PUBLISHABLE_KEY` pagal `.env.example` ir surinkti iš naujo. Tai viešos reikšmės, saugumas priklauso nuo RLS. **Jokių secret / service_role raktų į frontend, GitHub ar VITE kintamuosius.**
6. Patikrinkite `/gabija` ir `/gabija/` tiesiogiai bei po perkrovimo. Vite surenka atskirą `dist/gabija/index.html`, todėl Hostinger turi patiekti katalogo index, o ne pagrindinės svetainės index. Svetainė skirta domeno šakniai (`base: '/'`). Įsitikinkite, kad neprisijungus ir prisijungus nekviesta paskyra UPDATE, INSERT, DELETE užklausos atmetamos. Kviestas redaktorius gali UPDATE vienintelį `main` dokumentą; negali keisti redaktorių sąrašo.
7. Su pakviesta paskyra pakeiskite testinį tekstą, išsaugokite, patikrinkite atskirame viešame lange ir grąžinkite tekstą. Atidarykite du panelės langus: išsaugojus pirmame, antro senos versijos išsaugojimas turi rodyti konfliktą. Patikrinkite atsijungimą, nuorodos galiojimą ir teisės atšaukimą. Šiems bandymams reikia vartotojo prisijungimo per jam išsiųstą nuorodą.

Panelėje redaguojami visi `src/content.js` duomenys: pagrindiniai tekstai, navigacijos ir sekcijų antraštės, mygtukų tekstai, miško erdvės, praktinė informacija, atvykimas, bilietų URL / valdiklio ID / renginio ID / parduotuvės kodas, bilietų tipai, Instagram profilio ir JSON šaltinio adresai, galerijos intervalas ir automatinis judėjimas, socialinės nuorodos, kontaktai, žemėlapis, D.U.K., sezono būsena, esamo fono pasirinkimas ir animacijų jungiklis. Sąrašų įrašus galima pridėti, šalinti ir perrikiuoti; miško erdvių 1–20, kitų sąrašų 1–50, Instagram rodo 3–5 įrašus, jei šaltinyje jų pakanka. Antraštėse nauja eilutė išlaikoma.

Instagram profilio nuorodos pakeitimas savaime nekeičia GitHub automatinio rinktuvo paskyros. Kitai paskyrai prižiūrėtojas turi atnaujinti rinktuvą arba administratorius pateikti suderinamą JSON šaltinį. Duomenų šaltinyje negalima laikyti slaptažodžių ar prieigos raktų. Bilietai.lt įterpinys priima tik to tiekėjo adresus, žemėlapio įterpinys – Google. Visos nuorodos tikrinamos, HTML nevykdomas.

Visas turinys eksportuojamas JSON kopija; importas užpildo laukelius, paskelbiamas tik paspaudus „Išsaugoti“. Prieš importą rekomenduojama atsisiųsti esamo turinio kopiją. Bendras dokumento dydis iki 128 KB. Senos dalinės turinio versijos suderinamos; nauji laukai paveldi numatytąsias reikšmes. Vienu išsaugojimu publikuojami visų skilčių pakeitimai.

Tai visos šios svetainės turinio administravimo teisės. Panelė nesuteikia Supabase organizacijos, vartotojų teisių, duomenų bazės schemos, mokėjimų, Hostinger ar GitHub valdymo. Šriftų / logotipų failai, CSS išdėstymas ir sistemos pranešimai prižiūrimi kode. Tokios infrastruktūros teisės nėra suteikiamos per viešą turinio dokumentą.

Išsaugojimas vyksta į Supabase, ne GitHub. Naujas lankytojo puslapio įkėlimas skaito naujausią turinį; jau atidarytą puslapį reikia atnaujinti. Nepavykus pasiekti paslaugos per 2,5 s naudojamas pilnas `src/content.js` atsarginis tekstas (gali būti senesnis už panelės pakeitimus). Planui atitinkančias DB atsargines kopijas ir eksportus tvarko projekto savininkas. Supabase išsaugojimas nesukelia Hostinger diegimo.

Vietinė UI peržiūra: `http://127.0.0.1:4173/gabija/?perziura=1`. Ji leidžiama tik localhost / 127.0.0.1, nerodo tikro prisijungimo ir nieko neišsaugo. Viešame domene šis parametras nesuteikia prieigos. Kol aplinka neprijungta, paprastas `/gabija/` rodo aiškų neaktyvios panelės pranešimą.

Šaltiniai: [Supabase el. pašto prisijungimas](https://supabase.com/docs/guides/auth/auth-email-passwordless), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [API raktai](https://supabase.com/docs/guides/api/api-keys).


## Lietuvių ir anglų kalbos

- `/` — lietuviška versija (numatytoji); `/en/` — angliška. Naršyklės kalba automatiškai nekeičia pasirinkimo. Kalbą apibrėžia adresas, todėl nuorodą galima išsaugoti ir persiųsti.
- Meniu LT / EN išlaiko atidarytą skiltį ir nekartoja įžangos. Prekės ženklas ir Instagram įrašų tekstai lieka originalūs.
- `/gabija/` pasirink **LT · Lietuvių** arba **EN · English**. Vienas išsaugojimas apima abiejų kalbų tekstus. Lietuviškų pakeitimų sistema automatiškai neverčia — atnaujink ir EN tekstą.
- English copy is bundled in `src/english.js`, editable under `translations.en` in the same Supabase `main` document. Old documents automatically receive these defaults. No database migration or extra permissions are required. Existing revision checks and the 128 KB limit apply to both languages together.
- Maps, URLs, social links, visual settings, season mode and ticket integration remain shared. English transport rows inherit Lithuanian row URLs by position; change their structure in LT and keep translations aligned.
- Bilietai.lt receives `data-language="en"` in English mode. Event descriptions and third-party content remain controlled by their providers.
- Vite builds `dist/en/index.html` alongside the Lithuanian and admin entries. Hostinger settings stay unchanged: `npm run build`, output `dist`. Upload/deploy the **whole** dist directory, including `en/`.
- English factual text was translated from the public CMS content on 2026-10-01. Review both versions whenever dates, prices or visitor rules change.

Production release: the six-second introduction and ambient logo are enabled by default. The introduction plays once per browser tab session, can be skipped, and is bypassed for reduced motion and section links. Replay and background/video experiment controls are available only on localhost.


## Editing with drafts and live preview

At `/gabija/`, authorized editors can edit LT/EN text with a live unpublished preview and desktop/phone views. Save draft stores a validated copy only in the current browser, keyed to the signed-in editor; it is not shared across devices. Restore draft reloads it into the fields and warns if its base revision is older. Publish remains the only server write, using the existing editor RLS and revision conflict check. Cancel changes restores the version loaded at sign-in; it does not roll back other editors. JSON backup tools are under Additional settings. Preview messages are accepted only in an embedded preview from the same-origin parent and validated before rendering; they never write to Supabase.
