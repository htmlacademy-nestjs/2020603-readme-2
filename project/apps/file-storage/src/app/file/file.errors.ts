import {
  BusinessRuleViolationError,
  EntityNotFoundError,
} from '@project/shared-errors';

export class FileNotFoundError extends EntityNotFoundError {
  constructor(id: string) {
    super(`Файл с идентификатором "${id}" не найден`);
  }
}

// Защитный домен: если FileTypePipe пропустил файл, а буфер не похож ни на jpeg,
// ни на png — бросаем бизнес-правило, а не сырую 500.
export class UnsupportedImageTypeError extends BusinessRuleViolationError {
  constructor() {
    super('Поддерживаются только изображения форматов JPEG и PNG');
  }
}
