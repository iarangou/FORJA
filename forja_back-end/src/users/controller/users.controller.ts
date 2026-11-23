import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { PayloadJwt } from "../../shared/types/auth.types.js";
import { AuthGuard } from "../../auth/guard/auth.guard.js";
import { RolesGuard } from "../../auth/guard/roles.guard.js";
import { Roles } from "../../shared/decorator/roles.decorator.js";
import { UserCreateDto, UserDeleteDto, UserUpdateDto, UserProfileUpdateDto, ReviewRegistrationDto } from "../dto/users.dto.js";
import { UsersService } from "../service/users.service.js";

@Controller("users/")
export class UsersController {
    constructor(
        private usersService: UsersService
    ) {}

    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1)
    getAll() {
        return this.usersService.getAll();
    }

    @Get("me")
    @UseGuards(AuthGuard)
    getProfile(@Req() request: { user: PayloadJwt }) {
        return this.usersService.getProfile(request.user.sub);
    }

    @Patch("me")
    @UseGuards(AuthGuard)
    updateProfile(@Req() request: { user: PayloadJwt }, @Body() dto: UserProfileUpdateDto) {
        return this.usersService.updateProfile(request.user.sub, dto);
    }

    @Post(":id/registration-review")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1)
    reviewRegistration(
        @Param("id",ParseIntPipe) id:number,
        @Body() dto:ReviewRegistrationDto,
    ){
        return this.usersService.reviewRegistration(id,dto.decision,dto.rol_id,dto.faculty_id);
    }

    @Get(":id")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1)
    getById(@Param("id", ParseIntPipe) id: number) {
        return this.usersService.getById(id);
    }

    @Post("update")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1)
    update(@Body() dto: UserUpdateDto) {
        return this.usersService.update(dto);
    }

    @Post("delete")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1)
    delete(@Body() dto: UserDeleteDto) {
        return this.usersService.delete(dto);
    }
}
