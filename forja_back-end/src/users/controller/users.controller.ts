import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { PayloadJwt } from "../../shared/types/auth.types.js";
import { AuthGuard } from "../../auth/guard/auth.guard.js";
import { RolesGuard } from "../../auth/guard/roles.guard.js";
import { Roles } from "../../shared/decorator/roles.decorator.js";
import { UserCreateDto, UserDeleteDto, UserUpdateDto, UserProfileUpdateDto } from "../dto/users.dto.js";
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

    @Get(":id")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1)
    getById(@Param("id", ParseIntPipe) id: number) {
        return this.usersService.getById(id);
    }

    @Post("create")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1)
    create(@Body() dto: UserCreateDto) {
        return this.usersService.create(dto);
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
