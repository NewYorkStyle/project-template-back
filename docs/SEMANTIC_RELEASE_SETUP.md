# Настройка Semantic Release

## Что было настроено

1. **Установлены пакеты:**

   - `semantic-release` - основной пакет для автоматического релиза
   - `@semantic-release/changelog` - генерация CHANGELOG.md
   - `@semantic-release/git` - коммит изменений в package.json и CHANGELOG.md
   - `@semantic-release/github` - создание релизов на GitHub
   - `@semantic-release/npm` - публикация в npm (отключена для приватного репозитория)
   - `commitizen` и `cz-conventional-changelog` - для удобного создания conventional commits

2. **Создана конфигурация:**

   - `.releaserc.json` - настройки semantic-release
   - `.github/workflows/release.yml` - GitHub Actions workflow для автоматического релиза
   - `docs/CHANGELOG.md` - файл для отслеживания изменений

3. **Обновлены настройки:**
   - `package.json` - добавлены скрипты для semantic-release и commitizen
   - `.husky/commit-msg` - обновлен для поддержки conventional commits

## Как использовать

### 1. Создание коммитов

Требуемый формат коммитов:

```bash
feat: PROJECTTEMPLATE-123 добавить новую функцию
fix: PROJECTTEMPLATE-456 исправить баг
feat!: PROJECTTEMPLATE-789 breaking change
feat(scope): PROJECTTEMPLATE-101 добавить функцию в область
docs: PROJECTTEMPLATE-202 обновить документацию
style: PROJECTTEMPLATE-303 исправить форматирование
refactor: PROJECTTEMPLATE-404 рефакторинг кода
perf: PROJECTTEMPLATE-505 улучшить производительность
test: PROJECTTEMPLATE-606 добавить тесты
build: PROJECTTEMPLATE-707 обновить build систему
ci: PROJECTTEMPLATE-808 обновить CI/CD
chore: PROJECTTEMPLATE-909 обновить зависимости
```

### 2. Использование commitizen (опционально)

Для удобного создания conventional commits:

```bash
npm run commit
```

### 3. Автоматический релиз

После влития PR в ветку `master`:

1. GitHub Actions автоматически запустит semantic-release
2. Проанализирует коммиты с conventional commits
3. Определит тип релиза (major/minor/patch)
4. Обновит версию в `package.json`
5. Создаст запись в `CHANGELOG.md`
6. Создаст GitHub Release
7. Зафиксирует изменения в git

### 4. Правила версионирования

- `feat:` → minor version (1.0.0 → 1.1.0)
- `fix:` → patch version (1.0.0 → 1.0.1)
- `feat!:` или `BREAKING CHANGE:` → major version (1.0.0 → 2.0.0)
- `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:` → patch version

## Настройка GitHub

### 1. GitHub Token

Убедитесь, что в настройках репозитория есть переменная окружения `GITHUB_TOKEN` (она создается автоматически GitHub Actions).

### 2. Права доступа

Workflow требует следующие права:

- `contents: write` - для создания коммитов
- `issues: write` - для комментирования в issues
- `pull-requests: write` - для комментирования в PR

## Тестирование

Для тестирования локально (требует GitHub token):

```bash
npm run semantic-release:dry-run
```

## Файлы, которые будут автоматически обновляться

- `package.json` - версия
- `docs/CHANGELOG.md` - история изменений
- GitHub Releases - автоматически создаваемые релизы

## Примеры коммитов

```bash
# Новая функция
git commit -m "feat: PROJECTTEMPLATE-123 добавить авторизацию пользователей"

# Исправление бага
git commit -m "fix: PROJECTTEMPLATE-456 исправить ошибку валидации email"

# Breaking change
git commit -m "feat!: PROJECTTEMPLATE-789 изменить API авторизации"

# С областью
git commit -m "feat(auth): PROJECTTEMPLATE-101 добавить двухфакторную аутентификацию"

# Документация
git commit -m "docs: PROJECTTEMPLATE-202 обновить README с инструкциями по установке"

# Рефакторинг
git commit -m "refactor: PROJECTTEMPLATE-303 оптимизировать структуру компонентов"

# Тесты
git commit -m "test: PROJECTTEMPLATE-404 добавить unit тесты для авторизации"
```
