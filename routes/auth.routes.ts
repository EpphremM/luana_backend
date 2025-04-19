import { Router } from 'express';
import { login, logout, refresh } from '../controller/auth.controller';

export class AuthRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/login").post(login);
    this.router.route("/refresh").get(refresh);
    this.router.route("/logout").post(logout)
}
}