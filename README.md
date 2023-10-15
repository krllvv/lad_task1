# lad_task1
[REST-сервис на Node.js](https://lad-academy.ru/zadanie-dlya-backend-stazhirovki)

# Описание функционала:

Создается сервер, который принимает массив URLов, на каждой странице анализирует текст и возвращает файл PDF с тремя наиболее встречающимися словами длиннее 4 символов для каждого URLа.
# Запуск приложения:

Для проекта необходимо установить зависимости:

```bash
  npm ci
```
Запустить:

```bash
  npm run start
```

## Пример

Для проверки можно использовать:

```bash
  curl -L 'http://localhost:3000/' ^
-H 'Content-Type: application/json' ^
-H 'Cookie: undefined=' ^
-d '{
    "urls": [
    "https://ya.ru",
    "http://habrahabr.ru/"
    ]   
}'
```
Результат работы сохраняется в файле `words.pdf`
