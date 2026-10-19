/**
 * Ограничения публикаций из ТЗ (§2.5–2.9, §8). Общие для blog и api-gateway:
 * оба сервиса валидируют одни и те же поля.
 */
export const PostValidation = {
  Title: { MinLength: 20, MaxLength: 50 },
  Announce: { MinLength: 50, MaxLength: 255 },
  Text: { MinLength: 100, MaxLength: 1024 },
  QuoteText: { MinLength: 20, MaxLength: 300 },
  QuoteAuthor: { MinLength: 3, MaxLength: 50 },
  LinkDescription: { MaxLength: 300 },
  SearchQuery: { MinLength: 1, MaxLength: 50 },
} as const;

/**
 * Ссылка на видео — страница ролика на YouTube (§2.5). Принимаются адреса,
 * которые YouTube выдаёт для одного ролика: youtube.com/watch?v=ID (также
 * m.youtube.com и с параметрами вроде &t=30s), youtu.be/ID и youtube.com с
 * путями /shorts/ID, /embed/ID, /live/ID. ID ролика — ровно 11 символов
 * из латинских букв, цифр, «-» и «_».
 */
export const YoutubeUrl = {
  Pattern:
    /^https?:\/\/(?:(?:(?:www|m)\.)?youtube\.com\/(?:watch\?(?:[^\s#]*&)?v=|(?:shorts|embed|live)\/)|youtu\.be\/)[\w-]{11}(?:[?&#]\S*)?$/,
  ValidationMessage: 'videoUrl must be a valid YouTube URL',
} as const;

/**
 * Требования к тегам (раздел «Теги к публикациям»): одно слово без пробелов,
 * начинается с буквы, длина 3–10 символов, не больше восьми на публикацию.
 */
export const PostTag = {
  MaxCount: 8,
  Pattern: /^\p{L}[^\s]{2,9}$/u,
  ValidationMessage:
    'each tag must be a single word of 3-10 characters starting with a letter',
} as const;

/** Размеры страниц списка публикаций (§3.1) и выдачи поиска (§8.3). */
export const PostListLimit = {
  Default: 25,
  Max: 25,
  Search: 20,
} as const;
