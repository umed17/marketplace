# Усто — Биржаи хизматрасонӣ

Marketplace барои муштариён ва устоҳо. Дар MVP ҳама функсияҳо **ройгон**анд: комиссия, VIP, TOP ва пардохт хомӯшанд.

## Стек

- Frontend / Backend: Next.js 15 (App Router)
- Database: PostgreSQL (Neon) + Prisma
- Auth: JWT дар httpOnly cookie, bcrypt
- UI: Tailwind CSS 4, mobile-first

## Оғоз

```bash
npm install
docker compose up -d
cp .env.example .env
npm run db:deploy
npm run db:seed
npm run dev
```

Браузер: [http://localhost:3000](http://localhost:3000)

## Ҳисобҳои тестӣ

| Role     | Email              | Password    |
|----------|--------------------|-------------|
| Admin    | admin@usto.tj      | Admin123!   |
| Customer | umed@test.tj       | Test1234!   |
| Master   | alisher@test.tj    | Test1234!   |
| Master   | rustam@test.tj     | Test1234!   |

## Workflow-ҳои асосӣ

### Муштарӣ

1. Регистрация ҳамчун муштарӣ
2. Усто ҷустуҷӯ / заказ гузоштан
3. Пешниҳодҳоро дидан ва усто интихоб кардан
4. Chat
5. «Кор анҷом шуд» + рейтинг

### Усто

1. Регистрация ҳамчун усто → setup профил
2. Заказҳои нав
3. Пешниҳод фиристодан
4. Пас аз интихоб — chat ва иҷрои кор

## Production (Vercel + Railway + Neon)

Дастури пурра: **[docs/DEPLOY.md](docs/DEPLOY.md)**

- **Frontend:** Vercel (`BACKEND_URL` → Railway)
- **Backend API:** Railway (`DATABASE_URL` → Neon)
- **Database:** Neon PostgreSQL

## PostgreSQL (local)

1. `docker compose up -d`
2. `.env`-ро аз `.env.example` нусха баред
3. `npm run db:deploy && npm run db:seed`

## Амният

- Парол hash мешавад (bcrypt, 12 rounds)
- JWT 7 рӯз, httpOnly + SameSite=Lax
- Unique email ва unique phone
- Rate limit дар login/register
- Upload: type/size validation, номи бехатар
- Contact detection дар chat (warning, block не)

## Monetization flags

Дар ҷадвали `PlatformSetting` (ҳоло ҳама `false`):

- `commission_enabled`
- `lead_fee_enabled`
- `vip_enabled`
- `top_enabled`
- `subscription_enabled`
- `online_payment_enabled`
- `contact_block_enabled`

## Ҳуҷҷатҳо

- [docs/API.md](docs/API.md)
