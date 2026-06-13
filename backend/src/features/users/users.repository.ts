import { UserModel, IUser } from '../../db/models/User';

export class UsersRepository {
  async findById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id).lean();
    return user ? (user as unknown as IUser) : null;
  }

  async updateProfile(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return user ? (user as unknown as IUser) : null;
  }
}

export const usersRepository = new UsersRepository();
