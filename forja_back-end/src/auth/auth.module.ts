import { Module } from "@nestjs/common"
import { AuthController } from "./controller/auth.controller.js";
import { AuthService } from "./service/auth.service.js";
import { AuthGuard } from "./guard/auth.guard.js";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";


@Module({
    imports: [
        JwtModule.registerAsync({
            global: true,

            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: Number(config.get<string>('JWT_EXPIRES_IN_SECONDS')),
                }
            })
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard],
    exports: [AuthService]

})

export class AuthModule{}