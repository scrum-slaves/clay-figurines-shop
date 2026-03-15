# Clay Shop (Monorepo)

Интернет-магазин глиняных фигурок.

- Backend: Django + Django REST Framework
- Frontend: React + Vite + React Router + TailwindCSS
- DB: PostgreSQL
- Покупатели без регистрации, корзина в `localStorage`
- Оформление заказа через Telegram deep link


## Текущий статус проекта

Бекенд проекта уже работает: 
- API отвечает
- админка доступна
- БД заполнена частью данных для тестирования
- корзину можно проверить через `POST /api/v1/products/checkout/`, остальные эндпоинты ниже
- для фотографий товаров использованы `ImageField` (с `MEDIA_ROOT`/`MEDIA_URL`)

## Структура

```text
clay-shop/
  backend/
  frontend/
  compose.yml
  .env
```

## Быстрый старт (локально, без Docker)

### 1) Backend (мы не используем, запускали через Docker)

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1   ##cmd:    d:\Git\clay-figurines-shop\backend\.venv\Scripts\activate
## в (.venv)
pip install -r requirements.txt
```

Создайте файл `../.env` на основе `../.env.example`.

Запуск:

```bash
python manage.py migrate
python manage.py runserver
```

Backend будет доступен на `http://localhost:8000`.

### 2) Frontend

```bash
cd frontend
npm install
# скопируйте frontend/.env.example в frontend/.env и задайте VITE_MASTER_USERNAME
npm run dev
```

Frontend будет доступен на `http://localhost:5173`.

## Запуск сервисов через Docker Compose

Из корня проекта:

```bash
docker-compose up --build
# Импорт заполненной БД на новое устройство, dump.sql в корневой директории 
docker cp dump.sql clay-shop-db:/dump.sql
docker exec clay-shop-db psql -U clay_shop -d clay_shop -f /dump.sql
```

Первый запуск может занять время, так как:
- Будут установлены все зависимости Python и Node.js в контейнерах
- БД будет инициализирована (миграции, суперпользователь admin:admin123)

После полного запуска все компоненты будут доступны на:

- **PostgreSQL**: `localhost:5432`
  - Credentials из `.env`: `clay_shop / clay_shop_password`
- **Django Backend API**: `http://localhost:8000`
  - Admin панель: `http://localhost:8000/admin` (admin / admin123)
  - API Base: `http://localhost:8000/api/v1`
- **Vite Frontend**: `http://localhost:5173`

### Остановка и очистка

```bash
# Остановить контейнеры
docker-compose down

# Остановить и удалить всё (включая volume с БД)
docker-compose down -v

# Пересборка контейнеров с нуля
docker-compose down -v && docker-compose up --build
```

## API эндпоинты

- `GET /api/v1/types/`
- `GET /api/v1/products/?type=1&type=2`
- `GET /api/v1/products/<id>/`
- `POST /api/v1/products/checkout/`

### Контракт для `/api/v1/products/checkout/`

Request:

```json
{
  "items": [
    {
        "product_id": 1,
        "qty": 1
    },
    {
        "product_id": 5,
        "qty": 2
    }
  ]
}
```

Response (ошибки):

```json
{
  "ok": false,
  "problems": [
    {"product_id": 1, "reason": "deleted_or_inactive"},
    {"product_id": 5, "reason": "not_enough_stock", "available": 1}
  ]
}
```

Response (успех):

```json
{
  "ok": true,
  "problems": []
}
```

## Telegram настройка

Frontend использует:

- `VITE_MASTER_USERNAME` — username мастера без `@`

На странице `/checkout` алгоритм:

1. Читает корзину из `localStorage`
2. Вызывает `POST /api/v1/products/checkout/`
3. Если есть проблемы, показывает список и не уходит в Telegram
4. Если `ok=true`, формирует текст заказа
5. Открывает deep link:
   `https://t.me/<MASTER_USERNAME>?text=<urlencoded_message>`