# Поддержка Одноклассников — 1 октября 2026

Адаптация выполнена локально в общей React/VKUI-сборке приложения «Любовь в деталях».

- VK: <https://vk.com/app54445864>.
- OK: <https://ok.ru/app/512004459603>, ID предоставлен владельцем приложения.
- Идентификаторы и синхронная политика интерфейса: `src/utils/platformPolicy.ts`.
- `vk_client=ok` имеет приоритет над обычными VK-маркерами. `vk_platform`
  сохраняется для выбора политики клиента; эти параметры не подтверждают личность.
- В OK с первого рендера скрыты фото-промпты с переходом в другое VK-приложение
  и карточка избранного VK. В проекте нет ссылки на VK-сообщество; контакт
  поддержки OK не предоставлен.
- Native Bridge требует WebView SDK либо iframe с родителем на VK/OK.
  Обычный браузер, в том числе `?vk_client=ok`, работает без нативных вызовов.
- Init выполняется один раз (3 секунды), проверки методов кешируются и ограничены
  2 секундами, обычные запросы — 5 секундами, интерактивные — 120 секундами.
  Core-квиз не ждёт профиль, конфигурацию или рекламу. Запросов профиля и частного
  backend в этом проекте нет.
- Истории скрыты в OK `desktop_web`, `desktop_web_ok`, `mobile_web`,
  `mobile_web_ok` и неизвестных вариантах. Android/iPhone/iPad/iOS, включая
  `mobile_*` и суффиксы, остаются кандидатами, но требуют реального host и
  успешной проверки метода. VK сохраняет исходный payload истории.
- OK story payload сохраняет изображение, удаляет `attachment` и
  `clickable_zones` у renderable-стикеров; исходный объект не изменяется.
- Отправляется чистая ссылка соответствующей платформы. Ответы Bridge 3 и
  совместимые legacy-ответы классифицируются явно. Отмена не вызывает ошибку
  или второй диалог. Сбой оставляет приглашение для копирования/выделения;
  timeout сохраняет блокировку нативного диалога до реального ответа host.
  Успешный ответ редактора не считается доказательством публикации.
- Баннер показывается после проверки `ShowBannerAd`, без `CheckBannerAd`.
  No-fill не резервирует место. Проверка межстраничной рекламы также ограничена
  по времени; результат остаётся доступен при сбое.
- Umami auto-track отключён. Pageview и каждое событие получают явный payload
  с pathname и referrer без credentials/query/hash. Ранние события дожидаются
  загрузки скрипта. Логи не содержат сырых ошибок Bridge/параметров запуска.
- На мобильных экранах до 420 px блок отправки занимает всю ширину, чтобы
  подписи кнопок не обрезались.

## Источники и пределы доказательств

[Совместимость VK Mini Apps в OK](https://apiok.ru/apps/vk) прочитана 01.10.2026:
маркер `vk_client=ok`, отдельный app ID, sharing, native stories и ограничения
story payload. Раздел публикации там явно помечен устаревшим; он не используется
как актуальный релизный checklist.

Страницы [историй](https://dev.vk.com/ru/bridge/VKWebAppShowStoryBox),
[sharing](https://dev.vk.com/ru/bridge/VKWebAppShare) и
[баннера](https://dev.vk.com/ru/bridge/VKWebAppShowBannerAd) через веб-инструмент
не открылись. Payload и response проверены по установленным официальным типам
`@vkontakte/vk-bridge` 3.0.2. Примеры вариантов `mobile_android`, `mobile_iphone`,
`mobile_ipad` есть в [официальном репозитории VKCOM](https://github.com/VKCOM/vk-mini-apps-router/blob/master/typings/vk-bridge/index.d.ts).

Исключение историй OK web учитывает наблюдение из применённого навыка:
другой OK desktop-клиент объявлял поддержку и отклонял редактор. Это не
наблюдение в «Любви в деталях». Консервативная политика неизвестных вариантов
и скрытие VK-промо — продуктовые решения этой адаптации.

Аналитика проверена по [Umami tracker functions](https://docs.umami.is/docs/tracker-functions)
и [tracker configuration](https://docs.umami.is/docs/tracker-configuration),
а затем с реальным публичным скриптом `umami.pixel-and-byte.ru/script.js`.
В браузерном тесте фактические POST payload перехватывались локально;
аналитика тестов не отправлялась на сервер.

## Локальные проверки

- `npm test`: 95 тестов, 17 файлов, успешно.
- `npm run build`: TypeScript и Vite production build, успешно.
- `npx -y react-doctor@latest . --verbose --scope changed`: 100/100, замечаний нет.
- `scripts/verify-ok-support.mjs`: 18 сценариев (9 контекстов × ширины 390/1280),
  успешно. Проверены standalone, OK preview, mock desktop/mobile web,
  mock Android/iOS, mock VK, отсутствие stories/no-fill, зависший Init.
  Истории в web скрыты даже при fake-positive support. Проверены чистые app
  links, cancel/failure/manual fallback, отсутствие VK-промо на welcome/results,
  отсутствие горизонтального overflow и uncaught JS errors. Native mocks
  работают через SDK-транспорт AndroidBridge или iOS messageHandlers, а не
  через переключатель в production-коде.
- Unit fixtures дополнительно проверяют stuck/rejected support, legacy/array
  share responses, неизменность VK payload, удаление OK sticker zones,
  и сохранение блокировки после timeout до реального завершения host-запроса.
- Реальный публичный Umami скрипт прошёл перехват запросов с вымышленными
  sentinel-секретами в launch query/hash и referrer. Ни один проверенный
  pageview/custom event не содержал этих значений.
- `scripts/smoke-ok-production.mjs`: обычная production-сборка, без Bridge mocks
  и debug-панелей. Standalone и OK preview: полный квиз A (12) → передача
  телефона → B (12) → результаты → все ответы → перезапуск, успешно.
- Мобильный screenshot блока отправки дополнительно проверен визуально.

Повторение браузерных проверок (нужен установленный Chrome):

```sh
npm run dev
curl --fail --silent --show-error https://umami.pixel-and-byte.ru/script.js -o /tmp/love-details-umami.js
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node scripts/verify-ok-support.mjs
```

`APP_BASE_URL`, `CHROME_PATH`, `UMAMI_SCRIPT_PATH` переопределяются окружением.
Production smoke запускается после `npm run build` и
`npm run preview -- --host 127.0.0.1 --port 10889`:

```sh
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node scripts/smoke-ok-production.mjs
```

## Реальные клиенты и выпуск

| Клиент | Локальное доказательство | Реальный клиент / build |
|---|---|---|
| OK desktop web | Политика + browser native-response mock, 390/1280 | Не проверен |
| OK mobile web | Политика + browser native-response mock, 390/1280 | Не проверен |
| OK Android | SDK AndroidBridge mock: история без attachment, cancel/failure | Не проверен |
| OK iOS | SDK iOS messageHandlers mock: история без attachment, cancel/failure | Не проверен |
| VK | Существующие тесты + SDK mock: прежний app link/story attachment | Не проверен |

Владелец разрешил коммит и push 01.10.2026. Изменения выпускаются через
Coolify Auto Deploy при push в `main` согласно `docs/deployment.md`. Результат
выпуска проверяется отдельно по SHA, статусу ресурса и публичным bundle.
Настройки платформы, модерация и публикации в ленте/историях не выполнялись.
Публичную карточку OK через веб-инструмент прочитать не удалось; её текущий
embedded build и доступность для пользователей не подтверждены.

После выпуска нужно проверить фактически загруженный bundle в
реальном iframe, share composer/cancel на desktop и mobile web, story
editor/cancel отдельно на Android и iOS, theme/insets и рекламную геометрию,
регрессию VK. Также требуется подтвердить контакт поддержки и текущие
требования формы OK. Локальные mocks/preview не доказывают реальную нативную
работу, публикацию или готовность к модерации.
