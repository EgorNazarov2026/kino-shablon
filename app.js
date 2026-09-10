/* =========================================================================
   КИНО ШАБЛОН — вся логика приложения.

   Чтобы поменять исходный шаблон в будущем — редактируйте только
   константу TEMPLATE ниже. Остальной код трогать не нужно.
   ========================================================================= */

const TEMPLATE = `ФИЛЬМ Ⓜ️😎🅾️

ЧЕРНОВИК ХРОНО 00:00

Премьера ✅

Публиковать

Продвижение

Кубик готовность

Текст для кубика

Кубик размещен

Обложка

Сценарий

Описание для обзора

Ролик размещен

КУБИК

ОПИСАНИЕ

❤️ ПЛЮСЫ

💔 МИНУСЫ

⸻

#ОбзорФильма #Фильм #ОскарОбзор

⸻

Ну так вот

⸻

НАЗВАНИЕ

ОПИСАНИЕ

В частности:

00:00 -

00:00 -

00:00 -

00:00 -

00:00 -

00:00 -

00:00 -

00:00 -

00:00 -

00:00 -

00:00 -

00:00 -

00:00 -

00:00 -

А так же зацени обзоры на эти фильмы:

ФИЛЬМ - ССЫЛКА

ФИЛЬМ - ССЫЛКА

ФИЛЬМ - ССЫЛКА

ФИЛЬМ - ССЫЛКА

⸻

#ОбзорФильма #Фильм #ОскарОбзор

⸻

ТЭГИ:

КОНКРЕТНЫЕ,

Конкретные

Оскар обзор, ОскарОбзор, фильм на Оскар, Оскар 2026, лучший фильм года, Oscar obzor, OscarObzor, быстро и просто,

Обзор фильма, краткий пересказ, сюжет фильма, о чем, Cut the crap, КиноОбзор, киноогонь, скрытый смысл, о чем на самом деле, трэш обзор, неСпойлер, кинокритика, краткий пересказ,

⸻

ПЛАН СТРУКТУРА МЫСЛИ ОТССЫЛКИ СЦЕНАРИЙ

ШАНСЫ НА ОСКАР

И ЕЩЁ…

⸻

ПРОДВИЖЕНИЕ

ФИЛЬМ - ссылка

⸻

#ОскарОбзор #Фильм #ОбзорФильма`;

/* -------------------------------------------------------------------------
   Замена слова «ФИЛЬМ» (в любом регистре: ФИЛЬМ / Фильм / фильм) только
   тогда, когда оно встречается как САМОСТОЯТЕЛЬНОЕ слово — то есть не
   является частью другого слова (например «ОбзорФильма», «фильмы»,
   «фильма» не затрагиваются).

   Стандартный \b в JS не понимает кириллицу, поэтому границы слова
   проверяются вручную через lookahead/lookbehind по списку "буквенных"
   символов.
   ------------------------------------------------------------------------- */
const WORD_CHARS = 'A-Za-zА-Яа-яЁё0-9_';
const FILM_WORD_REGEX = new RegExp(
  `(?<![${WORD_CHARS}])фильм(?![${WORD_CHARS}])`,
  'gi'
);

function buildResult(rawTitle) {
  const title = rawTitle.trim();
  if (!title) return '';
  return TEMPLATE.replace(FILM_WORD_REGEX, title);
}

/* -------------------------------------------------------------------------
   UI
   ------------------------------------------------------------------------- */
const titleInput = document.getElementById('title-input');
const generateBtn = document.getElementById('generate-btn');
const errorMsg = document.getElementById('error-msg');
const resultSection = document.getElementById('result-section');
const resultArea = document.getElementById('result-area');
const copyBtn = document.getElementById('copy-btn');
const shareBtn = document.getElementById('share-btn');

function updateGenerateAvailability() {
  const hasValue = titleInput.value.trim().length > 0;
  if (hasValue) errorMsg.hidden = true;
}

titleInput.addEventListener('input', updateGenerateAvailability);

generateBtn.addEventListener('click', () => {
  const title = titleInput.value.trim();

  if (!title) {
    errorMsg.hidden = false;
    resultSection.hidden = true;
    return;
  }

  errorMsg.hidden = true;
  titleInput.value = title; // убираем случайные пробелы по краям

  const result = buildResult(title);
  resultArea.value = result;
  resultSection.hidden = false;

  // Даём Safari отрисовать textarea перед прокруткой к нему.
  requestAnimationFrame(() => {
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // падаем в fallback ниже
    }
  }

  // Fallback для случаев, когда Clipboard API недоступен.
  const tempTextArea = document.createElement('textarea');
  tempTextArea.value = text;
  tempTextArea.style.position = 'fixed';
  tempTextArea.style.top = '-9999px';
  tempTextArea.style.left = '-9999px';
  document.body.appendChild(tempTextArea);
  tempTextArea.focus();
  tempTextArea.select();

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    success = false;
  }
  document.body.removeChild(tempTextArea);
  return success;
}

copyBtn.addEventListener('click', async () => {
  const text = resultArea.value;
  if (!text) return;

  const success = await copyToClipboard(text);

  if (success) {
    const original = copyBtn.textContent;
    copyBtn.textContent = 'СКОПИРОВАНО ✓';
    copyBtn.classList.add('copied');
    copyBtn.disabled = true;
    setTimeout(() => {
      copyBtn.textContent = original;
      copyBtn.classList.remove('copied');
      copyBtn.disabled = false;
    }, 1500);
  }
});

/* -------------------------------------------------------------------------
   Поделиться через системный iOS Share Sheet (Web Share API).

   Если navigator.share недоступен в текущем окружении, кнопка «Поделиться»
   остаётся скрытой — пользователь всё равно может скопировать текст через
   уже существующую кнопку «КОПИРОВАТЬ» (это и есть fallback).
   ------------------------------------------------------------------------- */
if (navigator.share) {
  shareBtn.hidden = false;
}

async function shareGeneratedText() {
  const text = resultArea.value;
  if (!text) return;

  const title = titleInput.value.trim();

  try {
    await navigator.share(title ? { title, text } : { text });
  } catch (err) {
    // Пользователь нажал Cancel в Share Sheet — это не ошибка, ничего не делаем.
    if (err && err.name === 'AbortError') return;
    // Любая другая ошибка Web Share API — тихо игнорируем, приложение не должно падать.
  }
}

shareBtn.addEventListener('click', shareGeneratedText);

/* -------------------------------------------------------------------------
   Страница «Фильмы»: хранение, сортировка и цветовой индикатор даты
   ------------------------------------------------------------------------- */
const FILMS_STORAGE_KEY = 'kino-shablon:films';

const addFilmBtn = document.getElementById('add-film-btn');
const filmForm = document.getElementById('film-form');
const filmTitleInput = document.getElementById('film-title-input');
const filmDateInput = document.getElementById('film-date-input');
const filmSaveBtn = document.getElementById('film-save-btn');
const filmCancelBtn = document.getElementById('film-cancel-btn');
const filmsList = document.getElementById('films-list');
const filmsEmpty = document.getElementById('films-empty');

function loadFilms() {
  try {
    const raw = localStorage.getItem(FILMS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveFilms() {
  try {
    localStorage.setItem(FILMS_STORAGE_KEY, JSON.stringify(films));
  } catch (err) {
    // localStorage недоступен (например, приватный режим) — список останется
    // рабочим в течение сессии, просто не сохранится между запусками.
  }
}

let films = loadFilms();

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Цвет индикатора всегда пересчитывается от текущей даты в момент отрисовки.
function getFilmStatus(film) {
  if (!film.dateProvided) return 'yellow';
  return film.sortDate < todayISO() ? 'red' : 'green';
}

function renderFilms() {
  const sorted = [...films].sort((a, b) => {
    if (a.sortDate < b.sortDate) return -1;
    if (a.sortDate > b.sortDate) return 1;
    return 0;
  });

  filmsList.innerHTML = '';

  sorted.forEach((film) => {
    const li = document.createElement('li');
    li.className = 'film-item';

    const indicator = document.createElement('span');
    indicator.className = `film-indicator film-indicator--${getFilmStatus(film)}`;

    const info = document.createElement('div');
    info.className = 'film-info';

    const titleEl = document.createElement('span');
    titleEl.className = 'film-title';
    titleEl.textContent = film.title;

    const dateEl = document.createElement('span');
    dateEl.className = 'film-date';
    dateEl.textContent = formatDateDisplay(film.sortDate);

    info.appendChild(titleEl);
    info.appendChild(dateEl);
    li.appendChild(indicator);
    li.appendChild(info);
    filmsList.appendChild(li);
  });

  filmsEmpty.hidden = sorted.length > 0;
  filmsList.hidden = sorted.length === 0;
}

function openFilmForm() {
  filmTitleInput.value = '';
  filmDateInput.value = '';
  filmForm.hidden = false;
  filmTitleInput.focus();
}

function closeFilmForm() {
  filmForm.hidden = true;
}

addFilmBtn.addEventListener('click', () => {
  if (filmForm.hidden) {
    openFilmForm();
  } else {
    closeFilmForm();
  }
});

filmCancelBtn.addEventListener('click', closeFilmForm);

filmSaveBtn.addEventListener('click', () => {
  const title = filmTitleInput.value.trim();
  if (!title) {
    filmTitleInput.focus();
    return;
  }

  const explicitDate = filmDateInput.value; // '' если пользователь не выбрал дату
  const dateProvided = Boolean(explicitDate);

  films.push({
    id: `film-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    dateProvided,
    sortDate: dateProvided ? explicitDate : todayISO(),
  });

  saveFilms();
  renderFilms();
  closeFilmForm();
});

renderFilms();

/* -------------------------------------------------------------------------
   Боковое меню: открытие/закрытие + свайп слева
   ------------------------------------------------------------------------- */
const menuBtn = document.getElementById('menu-btn');
const sideMenu = document.getElementById('side-menu');
const overlay = document.getElementById('overlay');
const menuItems = document.querySelectorAll('.side-menu-item');
const pages = document.querySelectorAll('.page');

function openMenu() {
  sideMenu.classList.add('open');
  overlay.classList.add('open');
  sideMenu.setAttribute('aria-hidden', 'false');
}

function closeMenu() {
  sideMenu.classList.remove('open');
  overlay.classList.remove('open');
  sideMenu.setAttribute('aria-hidden', 'true');
}

function toggleMenu() {
  if (sideMenu.classList.contains('open')) {
    closeMenu();
  } else {
    openMenu();
  }
}

menuBtn.addEventListener('click', toggleMenu);
overlay.addEventListener('click', closeMenu);

function showPage(pageId) {
  pages.forEach((page) => {
    page.hidden = page.id !== `page-${pageId}`;
  });
  menuItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });
  if (pageId === 'films') {
    renderFilms();
  }
}

menuItems.forEach((item) => {
  item.addEventListener('click', () => {
    showPage(item.dataset.page);
    closeMenu();
  });
});

showPage('home');

// Свайп от левого края экрана открывает меню, свайп влево — закрывает.
const EDGE_ZONE_PX = 24;
const SWIPE_THRESHOLD_PX = 50;
let touchStartX = null;
let touchStartY = null;

document.addEventListener(
  'touchstart',
  (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  },
  { passive: true }
);

document.addEventListener(
  'touchend',
  (event) => {
    if (touchStartX === null) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // Игнорируем преимущественно вертикальные жесты (обычный скролл).
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStartX = null;
      touchStartY = null;
      return;
    }

    const menuIsOpen = sideMenu.classList.contains('open');

    if (!menuIsOpen && touchStartX <= EDGE_ZONE_PX && deltaX > SWIPE_THRESHOLD_PX) {
      openMenu();
    } else if (menuIsOpen && deltaX < -SWIPE_THRESHOLD_PX) {
      closeMenu();
    }

    touchStartX = null;
    touchStartY = null;
  },
  { passive: true }
);

/* -------------------------------------------------------------------------
   Регистрация Service Worker (для офлайн-работы PWA)
   ------------------------------------------------------------------------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {
      // Тихо игнорируем — приложение и без SW продолжит работать.
    });
  });
}
