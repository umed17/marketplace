# API Documentation — Усто Marketplace

Base URL: `/api`  
Auth: JWT cookie `usto_token` (httpOnly). Login/register cookie-ро мегузоранд.

Ҳама ҷавобҳои хато:

```json
{ "error": "матни хато" }
```

## Auth

### POST `/api/auth/register`

```json
{
  "firstName": "Умед",
  "lastName": "Каримов",
  "email": "umed@test.tj",
  "phone": "+992900000001",
  "password": "Test1234!",
  "confirmPassword": "Test1234!",
  "role": "customer"
}
```

`role`: `customer` | `master`

Хатоҳо:

- `409` — `Ин email аллакай истифода шудааст.`
- `409` — `Ин рақами телефон аллакай истифода шудааст.`

### POST `/api/auth/login`

```json
{ "email": "umed@test.tj", "password": "Test1234!" }
```

### POST `/api/auth/logout`

### GET `/api/auth/me`

User-и ҷорӣ + profile.

## Masters

### GET `/api/masters`

Query: `q`, `categoryId`, `city`, `district`, `verified=1`, `online=1`, `minRating`, `minExperience`, `maxPrice`, `sort=rating|newest|experience|price`

### GET `/api/masters/:id`

### PUT `/api/masters/:id`

Профили усто (худ ё admin).

## Orders

### GET `/api/orders`

Query: `scope=public|mine|master|assigned`, `q`, `categoryId`, `city`, `status`

### POST `/api/orders`

```json
{
  "title": "Таъмири кран",
  "categoryId": "...",
  "description": "...",
  "city": "Душанбе",
  "district": "Сино",
  "address": "...",
  "budgetFrom": 200,
  "budgetTo": 300,
  "preferredTime": "Имрӯз",
  "priority": "normal",
  "masterId": "optional-direct-hire"
}
```

Агар `masterId` бошад: status = `master_selected`, chat фавран кушода мешавад.

### GET `/api/orders/:id`

### PUT `/api/orders/:id`

### POST `/api/orders/:id/offers`

```json
{ "price": 250, "message": "...", "arrivalTime": "18:00", "finishTime": "1 соат" }
```

### GET `/api/orders/:id/offers`

### POST `/api/orders/:id/select`

```json
{ "offerId": "..." }
```

Offer-и интихобшуда `accepted`, дигарҳо `rejected`, chat кушода мешавад.

### POST `/api/orders/:id/start` → `in_progress`

### POST `/api/orders/:id/complete` → `completed`

### POST `/api/orders/:id/media`

```json
{ "url": "/api/uploads/orders/....jpg", "type": "image" }
```

## Chat

### GET `/api/conversations`

### GET `/api/conversations/:id`

### GET `/api/conversations/:id/messages`

### POST `/api/conversations/:id/messages`

```json
{ "body": "Салом", "attachmentUrl": "optional" }
```

Агар телефон/email/Telegram/WhatsApp дар матн бошад:

```json
{ "warning": "Барои бехатарии корбарон ...", "hits": [] }
```

Паём **блок намешавад** (MVP). Flag: `contact_block_enabled`.

## Reviews / Favorites / Notifications

### POST `/api/reviews` — як completed order → як review

### GET `/api/reviews?masterId=`

### GET/POST/DELETE `/api/favorites`

### GET/POST `/api/notifications`

### POST `/api/reports`

```json
{ "targetType": "user", "targetUserId": "...", "reason": "..." }
```

## Search / Categories / Upload

### GET `/api/search?q=`

Master, service, order.

### GET `/api/categories`

### POST `/api/upload` — `multipart/form-data`: `file`, `folder=avatars|portfolio|orders|chat`

### GET `/api/uploads/:folder/:filename`

## Admin (role=admin)

- GET `/api/admin/stats`
- GET `/api/admin/users?q=&role=`
- PUT/DELETE `/api/admin/users/:id`
- GET/PUT `/api/admin/masters`
- GET `/api/admin/orders?status=`
- GET/POST/PUT/DELETE `/api/admin/categories`
- GET/PUT/DELETE `/api/admin/reviews`
- GET/PUT `/api/admin/reports`

## Order statuses

`draft` → `published` → `receiving_offers` → `master_selected` → `in_progress` → `completed`  
ё `cancelled`
