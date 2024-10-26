import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { LocalAuthGuard } from '../../../common/guards/local-auth.guard';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { UserInfoInputModel } from './models/input/user-info.input.model';
import { LoginSuccessViewModel } from './models/output/login-success.view.model';
import { CurrentUserId } from '../../../common/decorators/identification/current-user-id.param.decorator';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    const result = await this.authService.login(req.user as UserInfoInputModel);
    const { accessToken, refreshToken } = result as LoginSuccessViewModel;
    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken });
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @HttpCode(HttpStatus.OK)
  async get(@CurrentUserId() currentUserId: string) {
    return this.usersQueryRepository.getAuthUserById(currentUserId);
  }

  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() userCreateModel: UserCreateModel) {
    await this.authService.registerUser(userCreateModel);
  }
}
