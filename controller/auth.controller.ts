// controllers/auth.controller.ts
import { Controller, Post, Body, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    private setCookies(res: Response, accessToken: string, refreshToken: string) {
        const isProduction = process.env.NODE_ENV === "production";
        
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }

    @Post("login")
    async login(@Body() body: { username: string; password: string }, @Req() req: Request, @Res() res: Response) {
        try {
            const result = await this.authService.login(body.username, body.password, req);
            this.setCookies(res, result.accessToken, result.refreshToken);
            
            return res.json({
                success: true,
                user: result.user
            });
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    @Post("refresh")
    async refresh(@Req() req: Request, @Res() res: Response) {
        try {
            const refreshToken = req.cookies["refresh_token"];
            if (!refreshToken) {
                throw new Error("No refresh token provided");
            }

            const fingerprint = this.authService.generateDeviceFingerprint(req);
            const result = await this.authService.refreshToken(refreshToken, fingerprint);
            
            this.setCookies(res, result.accessToken, result.refreshToken);
            
            return res.json({ success: true });
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    @Post("logout")
    async logout(@Req() req: Request, @Res() res: Response) {
        try {
            const refreshToken = req.cookies["refresh_token"];
            if (refreshToken) {
                await this.authService.logout(refreshToken);
            }

            res.clearCookie("access_token");
            res.clearCookie("refresh_token");
            
            return res.json({ success: true });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}