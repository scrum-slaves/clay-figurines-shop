# Clay Shop (Monorepo)

Каркас интернет-магазина глиняных фигурок.

- Backend: Django + Django REST Framework
- Frontend: React + Vite + React Router + TailwindCSS
- DB: PostgreSQL
- Покупатели без регистрации, корзина в `localStorage`
- Оформление заказа через Telegram deep link

## Структура

```text
clay-shop/
  backend/
  frontend/
  compose.yml
  .env.example
```

## Быстрый старт (локально, без Docker)

### 1) Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1   ## для Мариного компа cmd:    d:\Git\clay-figurines-shop\backend\.venv\Scripts\activate
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
- `POST /api/v1/checkout/validate-cart/`

### Контракт `validate-cart`

Request:

```json
{
  "items": [
    {"product_id": 10, "qty": 2}
  ]
}
```

Response (ошибки):

```json
{
  "ok": false,
  "problems": [
    {"product_id": 10, "reason": "deleted_or_inactive"},
    {"product_id": 11, "reason": "not_enough_stock", "available": 1}
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

## Где добавить модели и миграции (TODO)

- `backend/apps/catalog/models.py` — ProductType, Product, ProductImage
- `backend/apps/checkout/` — при необходимости сервисные модели/снапшоты
- После добавления моделей:
  1. Подключить ORM в `apps/catalog/services.py`
  2. Привязать `django-filter` к модели в `apps/catalog/filters.py`
  3. Перейти на `ModelSerializer` в `apps/catalog/serializers.py`
  4. Зарегистрировать модели в `apps/catalog/admin.py`
  5. Выполнить `python manage.py makemigrations && python manage.py migrate`

## Telegram настройка

Frontend использует:

- `VITE_MASTER_USERNAME` — username мастера без `@`

На странице `/checkout` алгоритм:

1. Читает корзину из `localStorage`
2. Вызывает `POST /api/v1/checkout/validate-cart/`
3. Если есть проблемы, показывает список и не уходит в Telegram
4. Если `ok=true`, формирует текст заказа
5. Открывает deep link:
   `https://t.me/<MASTER_USERNAME>?text=<urlencoded_message>`

## Примечания по текущему каркасу

- Модели и миграции специально не реализованы.
- `catalog` API пока возвращает `501 TODO: подключить модели`.
- `checkout/validate-cart` работает через заглушку репозитория `get_products_by_ids`.
- Django Admin включен (`/admin/`), регистрацию моделей добавьте после создания `models.py`.

# Тестирование и схема работы checkout

Endpoint для проверки корзины работает при выполнении условий: 
нужно POST на /api/v1/products/checkout/ с телом JSON:
{
"items":[{"product_id": 1, "qty": 2}, {"product_id":5,"qty":10}]
}
---
Ответ форматируется так:
- если всё ок: {"ok": true, "problems": []}
если товар отсутствует: {"ok": false, "problems":[{"product_id":999,"reason":"deleted_or_inactive"}]}
- если не хватает: {"ok": false, "problems":[{"product_id":5,"reason":"not_enough_stock","missing":7}]}