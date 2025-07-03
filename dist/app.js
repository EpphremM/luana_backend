"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("./routes/user.routes");
const body_parser_1 = __importDefault(require("body-parser"));
const admin_routes_1 = require("./routes/admin.routes");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const company_routes_1 = require("./routes/company.routes");
const casher_routes_1 = require("./routes/casher.routes");
const game_routes_1 = require("./routes/game.routes");
const auth_routes_1 = require("./routes/auth.routes");
const cors_1 = __importDefault(require("cors"));
const global_erro_handler_1 = require("./global/global.erro.handler");
const cartela_routes_1 = require("./routes/cartela.routes");
const card_routes_1 = require("./routes/card.routes");
const super_agent_routes_1 = require("./routes/super.agent.routes");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeMiddleware(); // Initialize middleware FIRST
        this.initializeRoutes(); // Then routes
    }
    initializeMiddleware() {
        this.app.use((0, cookie_parser_1.default)());
        // Enhanced CORS configuration
        this.app.use((0, cors_1.default)({
            origin: [
                "https://abyssinia-bingo-hrse.onrender.com",
                "https://abyssinia-bingo-hrse.onrender.com/",
                // "https://goobingo.com",
                // "https://tamagn-bingo.onrender.com",
                // "https://luana-bingo.vercel.app", 
                // "https://fendisha-bingo.onrender.com",
                // "https://abyssinia-bingo.onrender.com",
                "https://tamagnbingo.com",
                "https://abyssiniagames.com",
            ],
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            exposedHeaders: ['Set-Cookie'] // Important for cross-domain cookies
        }));
        // Handle preflight requests
        // this.app.options('/{*any}', cors());
        this.app.options('*', (0, cors_1.default)());
        this.app.use(body_parser_1.default.json());
        this.app.use(express_1.default.json());
    }
    initializeRoutes() {
        const userRoutes = new user_routes_1.UserRoutes();
        const adminRoutes = new admin_routes_1.AdminRoutes();
        const companyRoutes = new company_routes_1.CompanyRoutes();
        const casherRoutes = new casher_routes_1.CasherRoutes();
        const gameRoutes = new game_routes_1.GameRoutes();
        const authRoutes = new auth_routes_1.AuthRoutes();
        const cardRoutes = new card_routes_1.CardRoutes();
        const cartelaRoutes = new cartela_routes_1.CartelaRoutes();
        const superAgentRoutes = new super_agent_routes_1.SuperAgentRoutes();
        this.app.use("/bingo/v1/user", userRoutes.router);
        this.app.use("/bingo/v1/admin", adminRoutes.router);
        this.app.use("/bingo/v1/company", companyRoutes.router);
        this.app.use("/bingo/v1/casher", casherRoutes.router);
        this.app.use("/bingo/v1/game", gameRoutes.router);
        this.app.use("/bingo/v1/card", cardRoutes.router);
        this.app.use("/bingo/v1", authRoutes.router);
        this.app.use("/bingo/v1/cartela", cartelaRoutes.router);
        this.app.use("/bingo/v1/super-agent", superAgentRoutes.router);
        this.app.use(global_erro_handler_1.globalErrorHandler);
    }
}
exports.default = new App().app;
