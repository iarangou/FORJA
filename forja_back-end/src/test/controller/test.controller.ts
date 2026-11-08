import { Controller, Get, UseGuards } from "@nestjs/common";
import { TestService } from "../services/test.service.js";
import { AuthGuard } from '../../auth/guard/auth.guard.js';
import { RolesGuard } from '../../auth/guard/roles.guard.js';
import { Roles } from '../../shared/decorator/roles.decorator.js';

@Controller("test/")
export class TestController {
    constructor (private testService: TestService) {}

    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1)
    test() {
        return this.testService.test();
    }
}
