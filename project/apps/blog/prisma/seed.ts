import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  PostType,
  PostStatus,
} from '../src/generated/prisma/client.js';

// Prisma 7 НЕ читает .env сам — грузим .env сервиса Blog явно.
loadEnv({ path: path.join(import.meta.dirname, '..', '.env') });

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB } =
  process.env;

const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;

// Prisma 7: рантайм-клиент обязательно через driver adapter (@prisma/adapter-pg)
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

// Идентификаторы авторов имитируют opaque-id из сервиса Users (без FK — правило проекта).
const AUTHOR_1 = '6571e8c9b4a1f2d3e4a5b6c7';
const AUTHOR_2 = '6571e8c9b4a1f2d3e4a5b6c8';
const AUTHOR_3 = '6571e8c9b4a1f2d3e4a5b6c9';

async function clean(): Promise<void> {
  // Идемпотентность: чистим перед заполнением. Порядок учитывает связи,
  // хотя каскады удалили бы comments/likes при удалении posts.
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
}

async function main(): Promise<void> {
  await clean();

  // --- Теги (3) ---
  const [tsTag, nestTag, prismaTag] = await Promise.all([
    prisma.tag.create({ data: { title: 'typescript' } }),
    prisma.tag.create({ data: { title: 'nestjs' } }),
    prisma.tag.create({ data: { title: 'prisma' } }),
  ]);

  // --- Посты: все 5 видов ---
  const textPost = await prisma.post.create({
    data: {
      type: PostType.text,
      status: PostStatus.published,
      authorId: AUTHOR_1,
      title: 'Мой первый пост о TypeScript разработке',
      announce:
        'Краткий анонс публикации, который заинтересует читателя и расскажет о сути материала.',
      text: 'Полный текст публикации о том, как мы подключили PostgreSQL и Prisma ORM к сервису Blog. '.padEnd(
        120,
        '.',
      ),
      tags: { connect: [{ id: tsTag.id }, { id: nestTag.id }] },
    },
  });

  const videoPost = await prisma.post.create({
    data: {
      type: PostType.video,
      status: PostStatus.published,
      authorId: AUTHOR_2,
      title: 'Видеоурок по NestJS для начинающих',
      videoUrl: 'https://www.youtube.com/watch?v=abcdefghijk',
      tags: { connect: [{ id: nestTag.id }] },
    },
  });

  const quotePost = await prisma.post.create({
    data: {
      type: PostType.quote,
      status: PostStatus.published,
      authorId: AUTHOR_3,
      quoteText:
        'Любая достаточно продвинутая технология неотличима от магии.',
      quoteAuthor: 'Артур Кларк',
      tags: { connect: [{ id: prismaTag.id }] },
    },
  });

  const photoPost = await prisma.post.create({
    data: {
      type: PostType.photo,
      status: PostStatus.published,
      authorId: AUTHOR_1,
      photoUrl: '/uploads/photos/demo-photo.jpg',
    },
  });

  const linkPost = await prisma.post.create({
    data: {
      type: PostType.link,
      status: PostStatus.draft, // демонстрация черновика
      authorId: AUTHOR_2,
      link: 'https://www.prisma.io',
      linkDescription: 'Официальный сайт Prisma ORM',
      tags: { connect: [{ id: prismaTag.id }, { id: tsTag.id }] },
    },
  });

  // --- Комментарии (3) ---
  await prisma.comment.createMany({
    data: [
      { postId: textPost.id, authorId: AUTHOR_2, text: 'Отличная статья, спасибо!' },
      { postId: textPost.id, authorId: AUTHOR_3, text: 'Очень полезно, ждём продолжения.' },
      { postId: videoPost.id, authorId: AUTHOR_1, text: 'Хороший разбор, всё по делу.' },
    ],
  });

  // --- Лайки (3) ---
  await prisma.like.createMany({
    data: [
      { postId: textPost.id, userId: AUTHOR_2 },
      { postId: textPost.id, userId: AUTHOR_3 },
      { postId: videoPost.id, userId: AUTHOR_1 },
    ],
  });

  // --- Подписки (2) — опциональная модель «Моя лента» ---
  await prisma.subscription.createMany({
    data: [
      { followerId: AUTHOR_1, followingId: AUTHOR_2 },
      { followerId: AUTHOR_3, followingId: AUTHOR_1 },
    ],
  });

  console.log('Seed complete:', {
    tags: 3,
    posts: [textPost.id, videoPost.id, quotePost.id, photoPost.id, linkPost.id]
      .length,
    comments: 3,
    likes: 3,
    subscriptions: 2,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
