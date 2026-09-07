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
   Регистрация Service Worker (для офлайн-работы PWA)
   ------------------------------------------------------------------------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {
      // Тихо игнорируем — приложение и без SW продолжит работать.
    });
  });
}
