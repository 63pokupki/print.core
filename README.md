# PRINT.CORE

## Установка на Windows

### Установка

- Скачать и установить NodeJS LTS с официального сайта
- Скачать и установить Git <https://git-scm.com/download/win>
- Скачать [Downloader](https://63pokupkifiles.fra1.digitaloceanspaces.com/print.core/Downloader.cmd) и запустить
- Создать ярлык на рабочем столе файла PrintServer.cmd из открывшейся папки (%appdata%\print.core)
- Опционально (если нужно установить драйвер принтера): скачать [драйвер](https://63pokupkifiles.fra1.digitaloceanspaces.com/print.core/MPRINT%2064bit%20Label%20LP-Driver%20v1.1.0.2.exe) и запустить (см. Установка драйвера)

### Запуск

Запустить ярлык PrintServer на рабочем столе

### Установка Node JS

- Прощелкать везде "Next"
- Дождаться установки и завершить её

Если основное приложение установили или собираетесь устанавливать в Program Files, то выполнить следующие действия:

- Зайти в C:\Program Files\nodejs
- Зайти в свойства nodejs.exe (ПКМ -> Свойства)
- Поставить галочку "Запускать эту программу от имени администратора" (вкладка "Совместимость")

### Установка драйвера

!!! Принтер должен быть включен !!!

- Нажать "Install"
- При появлении окошка выбрать порт "USB001"
- Нажать "Next"
- Нажать "Finish"

### Выбор бумаги

- Зайти в Панель управления (Win + R -> control) -> Устройства и принтеры
- Настройка печати (ПКМ по нашему принтеру (по-умолчанию MPRINT LP58 LABEL EVA))
- Вкладка "Параметры страницы" -> Группа "Материал для печати"
- Выбрать нужный размер странички