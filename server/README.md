# Hostinger migracija — dar neįjungta

Viešą svetainę ir redaktorius perjungti tik išsaugojus tikrą naujausią Supabase turinį. Numatyto Vite surinkimo elgesio šie serverio failai nekeičia.

1. Išeksportuoti `{content, revision, editors:[{email,user_id}]}` iš tikros DB, išsaugoti privačią kopiją už Git repozitorijos ribų. Neimportuoti atsarginio seno `src/content.js` kaip naujausios versijos.
2. Hostinger MySQL jau sukurta: `u687412550_mm_cms`, vartotojas `u687412550_mm_editor`. Prisijungimo reikšmės tik serverio aplinkoje. Neįjungti viešos MySQL prieigos.
3. Konfigūruoti SMTP_HOST/PORT/USER/PASSWORD/FROM ir SITE_ORIGIN. SMTP slaptažodį įrašo savininkas tiesiai Hostinger; jo neįtraukti į Git ar klientinį kodą. Aplinkos pakeitimas API pakeičia VISĄ rinkinį — nepamesti jau nustatytų DB reikšmių.
4. Serveryje paleisti `node server/import-content.js /private/path/export.json`. Importas atsisako perrašyti jau esančius duomenis. Saugo originalius redaktorių UUID ir reviziją.
5. Frontend turinys, galerija ir autentikacija jau turi Hostinger adapterį. `VITE_CMS_BACKEND=hostinger` įjungti tik po importo, SMTP ir tikro serverio patikrų. Supabase šaka kol kas palikta grįžimui. Nuolatinės bylos pagal nutylėjimą ~/mm-data; patikrinti prieinamumą serverio naudotojui.
6. Pakeisti Vite statinį paleidimą į Node serverį `server/index.js`, statiniai failai iš dist. Patikrinti produkcinę PORT reikšmę, slapukus, magic-link, redagavimą, konfliktus ir atsargines kopijas.
7. Naujas Instagram serverio atnaujintojas veikia kas 5 min., failai nuolatiniame ~/mm-data/instagram; /instagram/ maršrutas turi Range video siuntimą. Pirmą 5 įrašų galerijos kopiją paruošėme vietoje, tačiau serveryje dar nepatikrinta. Neišjungti seno atnaujintojo iki sėkmingos patikros.
8. Tik po visų patikrų perjungti gyvą svetainę, palikti grįžimo kelią; Supabase neištrinti iki atskiro aiškaus savininko nurodymo.

API apsauga: vienkartinės 256 bitų el. pašto nuorodos (15 min.), tokenai DB tik SHA256, užrakintas vienkartinis sunaudojimas, 12 val. serverio sesija su HttpOnly/Secure/SameSite=Strict, Origin + CSRF tikrinimas, DB užklausos parametrizuotos, tik aktyvūs importuoti redaktoriai, limituotos prisijungimo užklausos, revizijų konfliktų apsauga ir ankstesnių tekstų istorija.

Patikrinta vietoje: 39 testai ir Vite surinkimas abiem režimais. Paruošta tikra 24 revizijos turinio kopija (14 D.U.K.), privatus dviejų redaktorių eksportas ir dabartinės galerijos failai. Serveryje dar neimportuota, SMTP nekonfigūruotas, gyvas Node serveris neperjungtas.
