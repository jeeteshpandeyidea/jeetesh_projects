import { BadRequestException, Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const body =
      req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0
        ? req.body
        : (dto as unknown as Record<string, unknown>);
    const email = body?.email != null ? String(body.email).trim() : '';
    const password = body?.password != null ? String(body.password) : '';
    if (!email || !password) {
      throw new BadRequestException('Email and password are required. Send the request body as application/json with { "email": "...", "password": "..." }.');
    }
    const ipAddress = req.ip || req.socket?.remoteAddress || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.login({ email, password }, ipAddress, userAgent);
  }
}


