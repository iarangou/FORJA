import { Body, Controller, Post } from "@nestjs/common";
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
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('verify-email')
    verifyEmail(@Body() dto: VerifyEmailDto) {
        return this.authService.verifyEmail(dto);
    }

    @Post('resend-verification')
    resendVerification(@Body() dto: VerificationEmailDto) {
        return this.authService.resendVerification(dto.email);
    }
}