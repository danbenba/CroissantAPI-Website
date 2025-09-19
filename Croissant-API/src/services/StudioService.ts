import { inject, injectable } from "inversify";
import { IDatabaseService } from "./DatabaseService";
import { StudioRepository } from "../repositories/StudioRepository";
import { Studio, StudioUser, StudioWithApiKey } from "../interfaces/Studio";
import { User } from "../interfaces/User";
import { IUserService } from "./UserService";
import crypto from "crypto";
import { genKey } from "../utils/GenKey";

export interface IStudioService {
  getStudio(user_id: string): Promise<Studio | null>;
  setStudioProperties(
    user_id: string,
    admin_id: string,
    users: User[]
  ): Promise<void>;
  getUserStudios(user_id: string): Promise<StudioWithApiKey[]>;
  createStudio(studioName: string, admin_id: string): Promise<void>;
  addUserToStudio(studioId: string, user: User): Promise<void>;
  removeUserFromStudio(studioId: string, userId: string): Promise<void>;
  getUser(user_id: string): Promise<User | null>;
}

@injectable()
export class StudioService implements IStudioService {
  private studioRepository: StudioRepository;
  constructor(
    @inject("DatabaseService") private db: IDatabaseService,
    @inject("UserService") private userService: IUserService
  ) {
    this.studioRepository = new StudioRepository(this.db);
  }

  async getStudio(user_id: string) {
    const studio = await this.studioRepository.getStudio(user_id);
    if (!studio) return null;
    const users = await this.getUsersByIds(studio.users);
    const me = (await this.userService.getUserWithPublicProfile(studio.user_id)) as StudioUser;
    return { ...studio, users, me };
  }

  async setStudioProperties(user_id: string, admin_id: string, users: User[]) {
    await this.studioRepository.setStudioProperties(user_id, admin_id, users.map(u => u.user_id));
  }

  async getUserStudios(user_id: string) {
    const studios = await this.studioRepository.getUserStudios(user_id);
    return Promise.all(studios.map(async s => {
      const userIds = [...s.users, s.admin_id];
      const users = await this.getUsersByIds(userIds);
      const me = await this.userService.getUser(s.user_id) as StudioUser;
      return {
        user_id: s.user_id,
        admin_id: s.admin_id,
        users,
        me,
        apiKey: s.admin_id === user_id ? genKey(s.user_id) : undefined,
      };
    }));
  }

  async createStudio(studioName: string, admin_id: string) {
    const user_id = crypto.randomUUID();
    await this.userService.createBrandUser(user_id, studioName);
    await this.studioRepository.createStudio(user_id, admin_id);
  }

  async addUserToStudio(studioId: string, user: User) {
    const studio = await this.getStudio(studioId);
    if (!studio) throw new Error("Studio not found");
    if (!studio.users.some(u => u.user_id === user.user_id)) {
      await this.setStudioProperties(studioId, studio.admin_id, [...studio.users, user]);
    }
  }

  async removeUserFromStudio(studioId: string, userId: string) {
    const studio = await this.getStudio(studioId);
    if (!studio) throw new Error("Studio not found");
    await this.setStudioProperties(
      studioId,
      studio.admin_id,
      studio.users.filter(u => u.user_id !== userId)
    );
  }

  async getUser(user_id: string) {
    return this.userService.getUser(user_id);
  }

  private async getUsersByIds(userIds: string[]) {
    if (!userIds.length) return [];
    return this.db.read<User>(
      `SELECT user_id, username, verified, admin FROM users WHERE user_id IN (${userIds.map(() => "?").join(",")})`,
      userIds
    );
  }
}
