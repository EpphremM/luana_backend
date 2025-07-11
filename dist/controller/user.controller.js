"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registraton = void 0;
const user_repository_1 = require("../database/repositories/user.repository");
const registraton = async (req, res, next) => {
    console.log("From the above one");
    const body = req.body;
    // console.log(req.body ); 
    const result = await user_repository_1.UserRepository.getRepo().register(body);
    res.status(201).json({ status: "success", data: result });
};
exports.registraton = registraton;
