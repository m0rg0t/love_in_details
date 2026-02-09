# Любовь в деталях

Парный квиз для двоих в формате VK Mini App. Два участника по очереди отвечают на 12 вопросов на одном устройстве, затем видят, где совпадают, а где различаются.

Это не тест на совместимость — это спокойный инструмент для разговора о важном.

## Описание для каталога VK

**Короткое (~100 символов):**
> Парный квиз для двоих. Узнайте, где вы совпадаете, а где различаетесь 💕

**Полное (~500 символов):**
> «Любовь в деталях» — парный квиз для двоих на одном устройстве. Ответьте на 12 вопросов о поддержке, общении, времени вместе и направлении отношений. Передайте телефон партнёру — и узнайте, где вы совпадаете, а где смотрите на вещи по-разному. Никаких оценок и красных флагов — только бережные наблюдения и темы для спокойного разговора. Пройдите вместе за 5 минут — и откройте что-то новое друг о друге.

## AI-промпты для Nana Pabana Pro

**Иконка (512x512):**
> Minimalistic app icon, two intertwined hearts formed from geometric lines, pink-to-purple gradient (#e8739e to #7c5cbf), dark background, clean modern aesthetic, no text, centered composition, flat design with subtle depth

**Горизонтальный splash screen (1920x1080):**
> Horizontal splash screen, app name "Любовь в деталях" in elegant white typography, soft heart patterns in background, pink-to-purple gradient (#e8739e to #7c5cbf), clean minimalist aesthetic, subtle geometric heart decorations, modern and warm feel

## Быстрый старт

```bash
npm install
npm run dev      # https://localhost:10888
npm run build    # Сборка для продакшена
npm run deploy   # Деплой в VK Hosting
```

## Технологии

- **React 18** + **TypeScript** (strict mode)
- **Vite 5** — сборка и dev-сервер
- **VKUI 6.5** — UI-компоненты VK
- **VK Bridge** — интеграция с VK платформой
- **Vitest** + **React Testing Library** — тесты
- **Puppeteer** — E2E тестирование

## Структура проекта

```
src/
├── components/     # React-компоненты (Welcome, Quiz, Results, ...)
├── hooks/          # Хуки (useQuizState, useVKAds, useBackButton, ...)
├── styles/         # CSS (variables, animations, компонентные стили)
├── data/           # Вопросы (12 штук, 4 блока по 3)
├── types/          # TypeScript-типы
└── utils/          # Утилиты (platform, comparison, analytics, ...)
```

## Ссылки

- [VK Mini Apps документация](https://dev.vk.com/mini-apps)
- [VKUI компоненты](https://vkcom.github.io/VKUI/)
- [VK Bridge API](https://dev.vk.com/bridge/overview)
