import  express,{ Application } from "express";
import { UserRoutes } from "./routes/user.routes";
import bodyParser from "body-parser";
import { AdminRoutes } from "./routes/admin.routes";
import cookieParser from "cookie-parser"
import { CompanyRoutes } from "./routes/company.routes";
import { CasherRoutes } from "./routes/casher.routes";
import { GameRoutes } from "./routes/game.routes";
import { AuthRoutes } from "./routes/auth.routes";
import cors from "cors";
import { globalErrorHandler } from "./global/global.erro.handler";
import { CartelaRoutes } from "./routes/cartela.routes";
import { CardRoutes } from "./routes/card.routes";

class App {
    public app: Application;

    constructor() {
  
        this.app = express();
        this.initializeMiddleware(); // Initialize middleware FIRST
        this.initializeRoutes();     // Then routes
    }

    private initializeMiddleware() {
        this.app.use(cookieParser());
        
        // Enhanced CORS configuration
        this.app.use(cors({
            origin: [
                "http://localhost:3001",
                // "https://goobingo.com",
                // "https://tamagn-bingo.onrender.com",
                // "https://luana-bingo.vercel.app", 
                // "https://fendisha-bingo.onrender.com",
                // "https://abyssinia-bingo.onrender.com",
                "https://abyssiniagames.com",
            ],
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            exposedHeaders: ['Set-Cookie'] // Important for cross-domain cookies
        }));
    
        // Handle preflight requests
        // this.app.options('/{*any}', cors());
        this.app.options('*', cors());
        
        
        this.app.use(bodyParser.json());
        this.app.use(express.json());
    }

    private initializeRoutes() {
        
        const userRoutes = new UserRoutes();
        const adminRoutes = new AdminRoutes();
        const companyRoutes = new CompanyRoutes();
        const casherRoutes = new CasherRoutes();
        const gameRoutes = new GameRoutes();
        const authRoutes = new AuthRoutes();
        const cardRoutes=new CardRoutes();
        const cartelaRoutes=new CartelaRoutes();
        
        this.app.use("/bingo/v1/user", userRoutes.router);
        this.app.use("/bingo/v1/admin", adminRoutes.router);
        this.app.use("/bingo/v1/company", companyRoutes.router);
        this.app.use("/bingo/v1/casher", casherRoutes.router);
        this.app.use("/bingo/v1/game", gameRoutes.router);
        this.app.use("/bingo/v1/card", cardRoutes.router);
        this.app.use("/bingo/v1", authRoutes.router);
        this.app.use("/bingo/v1/cartela", cartelaRoutes.router);
        
        this.app.use(globalErrorHandler);
    }
}

export default new App().app;