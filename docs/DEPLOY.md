# Насби production — Vercel + Railway + Neon

Архитектура:

| Қисм | Platform | Вазифа |
|------|----------|--------|
| **Frontend** | Vercel | UI, middleware, proxy `/api/*` → Railway |
| **Backend (API)** | Railway | Next.js API routes, uploads, Prisma |
| **Database** | Neon | PostgreSQL |

---

## 1. Neon — базаи додаҳо

1. Дар [neon.tech](https://neon.tech) проект созед
2. **Connection string**-ро гиред:
   - **Pooled** (бо `-pooler`) → `DATABASE_URL`
   - **Direct** (бе pooler) → `DIRECT_DATABASE_URL`
3. Ҳар ду URL-ро бо `?sslmode=require` илова кунед

```
DATABASE_URL=postgresql://...@ep-xxx-pooler....neon.tech/neondb?sslmode=require
DIRECT_DATABASE_URL=postgresql://...@ep-xxx....neon.tech/neondb?sslmode=require
```

---

## 2. Railway — Backend (API)

1. Дар [railway.app](https://railway.app) repo-ро connect кунед
2. **Variables** илова кунед:

| Variable | Қимат |
|----------|-------|
| `DATABASE_URL` | Neon pooled URL |
| `DIRECT_DATABASE_URL` | Neon direct URL |
| `JWT_SECRET` | сирри тасодуфӣ (≥32 аломат) |
| `NODE_ENV` | `production` |
| `UPLOAD_DIR` | `/data/uploads` |
| `MAX_UPLOAD_MB` | `8` |

3. **Volume** (барои файлҳо):
   - Add Volume → mount path: `/data/uploads`

4. Deploy автоматӣ аз `railway.toml`:
   - Build: `npm run build:backend` (migrate + build)
   - Start: `npm run start:backend`

5. Пас аз deploy, URL-ро гиред (масalan `https://usto-api.up.railway.app`)

6. Seed (як бор):

```bash
# Local, бо Neon URL дар .env
npm run db:deploy
npm run db:seed
```

---

## 3. Vercel — Frontend

1. Дар [vercel.com](https://vercel.com) repo-ро import кунед
2. **Environment Variables**:

| Variable | Қимат |
|----------|-------|
| `BACKEND_URL` | URL-и Railway (бидуни `/` дар охир) |
| `JWT_SECRET` | **ҳамон** сирр, ки дар Railway |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

3. Build: `npm run build:frontend` (аз `vercel.json`)
4. Deploy

**Чӣ тавр кор мекунад:** Vercel `/api/*`-ро ба Railway proxy мекунад. Cookie-ҳои auth дар домени Vercel кор мекунанд.

---

## 4. Санҷиш

1. Railway: `https://YOUR-RAILWAY-URL/api/categories` → JSON
2. Vercel: саҳифаи асосӣ → 200
3. Login/register → cookie → dashboard

---

## 5. Local development

```bash
docker compose up -d
cp .env.example .env
npm install
npm run db:deploy
npm run db:seed
npm run dev
```

`BACKEND_URL`-ро **холӣ** гузоред — ҳама чиз дар як сервер (`localhost:3000`) кор мекунад.

---

## 6. Диqqат

- `JWT_SECRET` дар Vercel ва Railway **якхела** бошад
- `npm run build` ҳангоми `dev` иҷро **накунед** (cache `.next` хароб мешавад)
- Пароли admin-и seed-ро пеш аз launch иваз кунед
- Барои domain-и шахсӣ: `NEXT_PUBLIC_APP_URL` ва `BACKEND_URL`-ро навсозӣ кунед

---

## Scripts

| Script | Истифода |
|--------|----------|
| `npm run build:backend` | Railway build |
| `npm run build:frontend` | Vercel build |
| `npm run db:deploy` | `prisma migrate deploy` |
| `npm run db:seed` | маълумоти тестӣ |
| `npm run dev:clean` | тоза кардани `.next` + dev |
