import { Body, Controller, ForbiddenException, Post } from "@nestjs/common";
import { AuthService } from "../service/auth.service.js";
import { LoginDto } from "../dto/login.dto.js";
import { RegisterDto } from "../dto/register.dto.js";
import { VerifyEmailDto, VerificationEmailDto } from "../dto/verify-email.dto.js";

@Controller("auth/")
export class AuthController {
    constructor (
        private authService: AuthService
    ) {}

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('register')
    register(@Body() _dto: RegisterDto) {
        throw new ForbiddenException('Las cuentas son creadas únicamente por el administrador FORJA');
    }

    @Post('verify-email')
    verifyEmail(@Body() _dto: VerifyEmailDto) {
        throw new ForbiddenException('El registro público de usuarios está deshabilitado');
    }

    @Post('resend-verification')
    resendVerification(@Body() _dto: VerificationEmailDto) {
        throw new ForbiddenException('El registro público de usuarios está deshabilitado');
    }
}