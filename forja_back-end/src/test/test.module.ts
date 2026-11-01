import { Module } from "@nestjs/common"
import { TestController } from "./controller/test.controller.js";
import { TestService } from "./services/test.service.js";

@Module({

    imports: [],
    controllers: [TestController],
    providers: [TestService],
    exports: [TestService]

})

export class TestModule{}