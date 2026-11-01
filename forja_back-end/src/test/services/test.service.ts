import { HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class TestService {
    constructor () {}
    async test() {
        return "todo bien :)";
    }

    getCurrentTime() {
        const now = new Date();

        return {
            iso: now.toISOString(),
            time: now.toLocaleTimeString("es-CO"),
            date: now.toLocaleDateString("es-CO"),
        };
    }
}