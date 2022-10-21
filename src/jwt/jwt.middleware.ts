import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { TOKEN_KEY } from 'src/common/common.constants';
import { JwtService } from 'src/jwt/jwt.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (TOKEN_KEY in req.headers) {
      const token = req.headers[TOKEN_KEY];
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        try {
          const { user } = await this.userService.findUserById(decoded['id']);
          req['user'] = user;
        } catch (e) {}
      }
    }
    next();
  }
}
