import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import ActivityModel from '../database/models/activity-log.model';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;
    const url = req.originalUrl;
    const body = req.body;
    const headers = req.headers;

    next();
    let user;
    const bearerToken = req.headers.authorization;
    if (bearerToken) {
      const jwtToken = bearerToken.split(' ')[1] ?? '';
      user = await this.jwtAuth(jwtToken);
    } else {
      user = null;
    }

    const apiCall = {
      method,
      url,
      timestamp: new Date(),
      body,
      headers,
      user: user ? user?.id : null,
    };

    if (url == '/auth/login') {
      apiCall.body = { ...body, password: null };
    }

    ActivityModel.create(apiCall).catch((err: any) => {
      console.error('Error recording API call:>>> ', err.message);
    });
  }

  private async jwtAuth(token: string) {
    const decodedToken = await this.jwtService.verify(token, {
      secret: process.env.JWTKEY,
    });
    const user = decodedToken;
    return user;
  }
}
