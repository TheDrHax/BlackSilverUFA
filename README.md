# Архив стримов BlackUFA [![Build Status](https://jenkins.thedrhax.pw/job/BlackSilverUfa-Beta/badge/icon)](https://jenkins.thedrhax.pw/job/BlackSilverUfa-Beta/)

Перейдите на [GitHub Pages](https://blackufa-beta.thedrhax.pw) для доступа ко всем функциям ![](https://static-cdn.jtvnw.net/emoticons/v1/81274/1.0)

### Зависимости

* `python3-venv` (Ubuntu) или `python3` (Alpine)
* `git` (для работы с gh-pages и получения даты добавления стрима)
* `jq` — для парсинга `config.json` в скрипте `bsu`
* `gettext` — для парсинга `config.json` в скрипте `bsu`
* `tzdata` — для установки правильного часового пояса
* `libc6` (Ubuntu) или `libstdc++` (Alpine) — для Node.js

### Сборка и тестирование

Основную часть работы выполняет shell-скрипт [bsu](./bsu) в корне репозитория. К сожалению, автоматическая сборка на Windows в данный момент не поддерживается, но проект можно собрать вручную при наличии Python.

При первом запуске скрипт создаст виртуальное окружение Python в директории `./_python` и установит туда все пакеты, неоходимые для сборки и запуска проекта (они перечислены в файле [requirements.txt](./requirements.txt)).

Ниже приведены примеры использования скрипта `./bsu`.

```bash
# Обновить виртуальное окружение Python
./bsu venv update

# Загрузить текущую версию ветки gh-pages в директорию ./_site
# (обязательно для сборки проекта, т.к. в ветке gh-pages хранятся важные данные)
./bsu pages pull

# Загрузить текущую версию базы данных со стримами в ./data (обязательно)
./bsu data pull

# Загрузить недостающие субтитры (если они ещё доступны)
./bsu download-chats

# Собрать сайт из исходного кода
./bsu build
# или поднять веб-сервер на порту 8000
# (будет пересобирать сайт автоматически при изменении кода)
./bsu serve
# или поднять сервер и собрать сайт в режиме отладки
# (заменяет абсолютные ссылки на относительные, меняет режим webpack)
./bsu debug
# или поднять сервер и быстро показывать изменения компонентов React
./bsu react

# Закоммитить новую версию статики в локальную ветку gh-pages
./bsu pages commit

# Отправить изменения на GitHub
./bsu pages push
```

## Связанные проекты

* [Twitch-Chat-Downloader](https://github.com/TheDrHax/Twitch-Chat-Downloader) (форк) — для сохранения чата в виде субтитров;
* [streamlink](https://github.com/TheDrHax/streamlink) (форк) — для записи стримов без рекламы (требуется аккаунт подписчика);
* [Twitch-Utils](https://github.com/TheDrHax/Twitch-Utils) — для автоматического склеивания записей стримов и сопоставления им записей с YouTube;
