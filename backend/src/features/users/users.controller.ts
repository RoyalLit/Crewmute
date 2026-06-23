import type { Request, Response, NextFunction } from 'express';

import { successResponse } from '../../shared/response';

import { usersService } from './users.service';

export class UsersController {
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.getUserById(req.user!.userId);
      res.status(200).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await usersService.getStats(req.user!.userId);
      res.status(200).json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }

  async getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const profile = await usersService.getPublicProfile(id);
      res.status(200).json(successResponse(profile));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.updateProfile(req.user!.userId, req.body);
      res.status(200).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async uploadPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Multer processes the file and attaches the Cloudinary URL to req.file.path
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: { message: 'No image file provided' } });
        return;
      }

      const photoUrl = file.path;
      const user = await usersService.updateProfilePhoto(req.user!.userId, photoUrl);
      res.status(200).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async updatePushToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pushToken } = req.body;
      const user = await usersService.updatePushToken(req.user!.userId, pushToken);
      res.status(200).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: revieweeId } = req.params;
      const review = await usersService.createReview(req.user!.userId, revieweeId, req.body);
      res.status(201).json(successResponse(review));
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: userId } = req.params;
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
      const reviews = await usersService.getReviews(userId, page, pageSize);
      res.status(200).json(successResponse(reviews));
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
