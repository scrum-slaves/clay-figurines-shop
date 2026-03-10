FROM python:3.12-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Копируем requirements.txt и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь backend код
COPY . .

# Копируем и даём права на entrypoint скрипт

# Создаём директорию для статических файлов
RUN mkdir -p /app/staticfiles

# (entrypoint.sh removed) Dockerfile больше не использует entrypoint скрипт

# Команда по умолчанию
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
