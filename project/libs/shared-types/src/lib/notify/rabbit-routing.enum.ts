/**
 * Маршруты (паттерны событий) брокера сообщений notify.
 *
 * Общий контракт для продюсеров (`blog`, в перспективе `users`) и консьюмера
 * (`notify`): обе стороны ссылаются на один и тот же паттерн события.
 */
export enum RabbitRouting {
  AddSubscriber = 'add.subscriber',
  AddPost = 'add.post',
}
