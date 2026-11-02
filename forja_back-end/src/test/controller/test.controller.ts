import { Controller, Get } from "@nestjs/common";
import { TestService } from "../services/test.service.js";

@Controller("test/")
export class TestController {
    constructor (private testService: TestService) {}

    @Get()
    test() {
        return this.testService.test();
    }
}