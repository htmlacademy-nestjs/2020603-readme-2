/** Ограничения данных пользователя (§1.2, §1.9). */
export const UserValidation = {
  Name: { MinLength: 3, MaxLength: 50 },
  Password: { MinLength: 6, MaxLength: 12 },
} as const;
