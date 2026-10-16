# Hostinger serveris

2026-10-16 į Hostinger MySQL perkelta patikrinta Supabase turinio revizija 24 (14 D.U.K.) ir tie patys du redaktoriai su originaliais UUID. Privatus eksportas saugomas už repozitorijos ribų. Supabase projekto neištrinti be atskiro savininko nurodymo.

## Paleidimas

Node.js 24, framework Other, root ./, build script build, output ./, entry server/index.js, npm. HTTP serveris turi pradėti klausyti sinchroniškai: LiteSpeed įkelia entry per require(). Statiniai puslapiai siunčiami tik iš dist, nepriklausomai nuo darbo katalogo. Aplinkos VITE_CMS_BACKEND=hostinger reikia surinkimo metu.

DB_HOST=127.0.0.1, DB_PORT=3306, DB_NAME/DB_USER/DB_PASSWORD nustatomi tik Hostinger aplinkoje. SITE_ORIGIN=https://www.magiskasmiskas.lt. Neįjungti nuotolinio MySQL. Aplinkos API pakeičia VISĄ rinkinį — niekada neperkelti užmaskuotų reikšmių kaip tikrų slaptažodžių.

## Prisijungimas be laiškų

Savininko pasirinkimu SMTP nenaudojamas. Redaktoriai jungiasi el. paštu ir slaptažodžiu. Slaptažodžiai saugomi scrypt su atskira atsitiktine druska; slaptažodžio ilgis 12–128 simbolių. Nėra viešo registravimosi.

Pirmą slaptažodį redaktorius susikuria per privačią /gabija/#setup= nuorodą. MM_SETUP_TOKENS aplinkos JSON apima tik {email,hash}; hash yra atsitiktinio 256 bitų tokeno SHA256. Nuoroda 24 val. ir vienkartinė; mm_setup_provisioned neleidžia serverio perkrovimui jos atgaivinti. Žalias tokenas saugomas tik privačioje savininko kopijoje, niekada Git. Po importo MM_IMPORT_EDITORS ir MM_SETUP_TOKENS pašalinami iš aplinkos; įrašai lieka DB. Prieigą suteikiame tik jau patvirtintiems redaktoriams.

Sesijos 12 val., HttpOnly/Secure/SameSite=Strict slapukas. Origin ir CSRF tikrinami, prisijungimo bandymai ribojami. Keisti slaptažodį galima per autentifikuotą /api/auth/password su dabartiniu slaptažodžiu; tai panaikina kitas sesijas.

## Turinys ir galerija

/api/content grąžina publikuotą turinį. Publikavimas tik su aktyvia redaktoriaus sesija, revizijų konflikto apsauga ir ankstesnio turinio istorija. Disko kopija ~/mm-data/published-content.json; Instagram ~/mm-data/instagram. Šios vietos turi išlikti per diegimus.

Instagram profilis tikrinamas kas 5 min.; nauja narystė autoritetinga, įskaitant tuščią galeriją, pasikartojimai pašalinami. Medija laikoma Hostinger, video siunčiamas su Range. Nepavykus atnaujinti lieka paskutinė patikrinta kopija, klientas pasenusius duomenis slepia.

Patikrinti: /api/content revizija ir atsakymai, /api/instagram įrašai, vietinės medijos ir video 206, anoniminis publikavimas 401, neleistinas Origin 403, privatūs failai neprieinami. Tikras slaptažodžio sukūrimas ir publikavimas tikrinamas savininkui prisijungus. Vietoje 42 testai ir Vite build.
