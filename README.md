# GymFlow
Gym PWA (trening, ishrana, recepti, program za visceralnu mast, raspored, napredak) + mali backend za naloge i sinhronizaciju.

## Pokretanje (sve u jednom)
`node server/server.js` (Node >= 22.13) → http://localhost:8080 (server servira i `gym/`).
Env: `PORT`, `DATA_DIR`, `SECRET`, `ALLOWED_ORIGIN` (npr. adresa GitHub Pages sajta).

## Deploy
- Docker: `docker build -t gymflow . && docker run -p 8080:8080 -v gymdata:/data gymflow`
- Hosting (Render/Railway/Fly): Dockerfile u korenu; montiraj trajni disk na `/data`, postavi `SECRET`.
- Samo frontend: GitHub Pages (workflow objavljuje `gym/`), pa u aplikaciji (Plan → Nalog) unesi adresu servera.

## Welmi (`welmi/`) – brojač kalorija sa AI skeniranjem
`ANTHROPIC_API_KEY=... node welmi/server.js` → http://localhost:8081
Onboarding (pol, godine, visina, težina, cilj) → dnevni plan kalorija/makroa (Mifflin-St Jeor), Today ekran (prsten, makroi, 4 obroka, voda, streak), dodavanje: slika obroka (AI), barkod (Open Food Facts), opis (AI), pretraga/ručni unos, napredak (težina, 7 dana). Bez API ključa rade sve opcije osim AI skeniranja/opisa.
