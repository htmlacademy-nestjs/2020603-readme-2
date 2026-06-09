export class User {
  public id!: string;
  public email!: string;
  public name!: string;
  public passwordHash!: string;
  public avatarUrl?: string;
  public createdAt!: Date;
  public postsCount!: number;
  public subscribersCount!: number;
}
