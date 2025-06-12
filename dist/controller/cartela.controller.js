"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyCartela = exports.update = exports.getAllCartela = exports.getOne = exports.deleteCartela = exports.register = void 0;
const app_error_1 = require("../express/error/app.error");
const cartela_repository_1 = require("../database/repositories/cartela.repository");
const response_body_1 = require("../express/types/response.body");
const zod_validation_1 = require("../zod/middleware/zod.validation");
const cartela_schema_1 = require("../zod/schemas/cartela.schema");
const admin_repository_1 = require("../database/repositories/admin.repository");
const register = async (req, res, next) => {
    try {
        const body = req.body;
        const validationStatus = await (0, zod_validation_1.validateInput)(cartela_schema_1.CartelaSchema, body);
        if (validationStatus.status !== "success") {
            next(new app_error_1.AppError("Invalid request", 400, "Operational"));
            return;
        }
        const existingCartela = await cartela_repository_1.CartelaRepository.getRepo().findByname(body.name);
        console.log("Existing cartela is", existingCartela);
        if (existingCartela) {
            next(new app_error_1.AppError("Cartela already registered", 400, "Operational"));
            return;
        }
        const cartelas = await cartela_repository_1.CartelaRepository.getRepo().register(body);
        console.log("Cartela created successfully", cartelas);
        res.status(200).json((0, response_body_1.createResponse)("success", "cartela created successfully", cartelas));
        return;
    }
    catch (error) {
        console.log(error);
        next(new app_error_1.AppError("Cartela registration error", 400, "Operational", error));
    }
};
exports.register = register;
const deleteCartela = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await cartela_repository_1.CartelaRepository.getRepo().Delete(id);
        if (result) {
            res.status(200).json((0, response_body_1.createResponse)("success", "Cartela deleted successfully", []));
        }
    }
    catch (error) {
        console.log(error);
        next(new app_error_1.AppError("Error occured during deleting cartela", 400, error));
    }
};
exports.deleteCartela = deleteCartela;
const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const exisitngCartela = await cartela_repository_1.CartelaRepository.getRepo().findById(id);
        if (!exisitngCartela) {
            return next(new app_error_1.AppError("There is no cartela with this id", 404, "Operational"));
        }
        res.status(200).json((0, response_body_1.createResponse)("success", "Cartela fetched successfully", exisitngCartela));
    }
    catch (error) {
        console.log(error);
        return next(new app_error_1.AppError("Couldn't find this cartela", 404, "Operational", error));
    }
};
exports.getOne = getOne;
const getAllCartela = async (req, res, next) => {
    try {
        const cartelas = await cartela_repository_1.CartelaRepository.getRepo().find();
        res.status(200).json((0, response_body_1.createResponse)("success", "Cartela fetched successfully", cartelas));
    }
    catch (error) {
        console.log(error);
        return next(new app_error_1.AppError("Fetch error", 404, "Operational"));
    }
};
exports.getAllCartela = getAllCartela;
const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const validationStatus = await (0, zod_validation_1.validateInput)(cartela_schema_1.UpdateCartelaSchema, body);
        if (validationStatus.status !== "success") {
            return next(new app_error_1.AppError("Invalid Request", 400, "Operational"));
        }
        const exisingCartela = await cartela_repository_1.CartelaRepository.getRepo().findById(id);
        if (!exisingCartela) {
            return next(new app_error_1.AppError("User not found", 404, "Operational"));
        }
        const updatedCartela = await cartela_repository_1.CartelaRepository.getRepo().update(id, body);
        res.status(200).json((0, response_body_1.createResponse)("success", "Cartela updated successfully", updatedCartela));
    }
    catch (error) {
        next(new app_error_1.AppError("Error occured duting editing cartela", 400, error));
    }
};
exports.update = update;
const copyCartela = async (req, res, next) => {
    try {
        const { from_admin_id, to_admin_id } = req.body;
        const fromAdmin = await admin_repository_1.AdminRepository.getRepo().findById(from_admin_id);
        if (!fromAdmin || !fromAdmin.cartela_id) {
            res.status(200).json((0, response_body_1.createResponse)("fail", "Invalid User id or cartela not found", []));
            return;
        }
        console.log("TO ADMIN ID IS", to_admin_id);
        const toAdmin = await admin_repository_1.AdminRepository.getRepo().findById(to_admin_id);
        console.log("fetched admin is", toAdmin);
        if (!toAdmin) {
            res.status(200).json((0, response_body_1.createResponse)("fail", "Admin not found", []));
            return;
        }
        toAdmin.cartela_id = fromAdmin.cartela_id;
        const updateToUpdmin = await admin_repository_1.AdminRepository.getRepo().smallUpdate(toAdmin.id, { cartela_id: fromAdmin.cartela_id });
        console.log(updateToUpdmin);
        console.log(toAdmin.cartela_id);
        console.log("Updated admin", updateToUpdmin);
        res.status(200).json((0, response_body_1.createResponse)("success", "Cartela copied successfully", toAdmin));
    }
    catch (error) {
        console.log(error);
    }
};
exports.copyCartela = copyCartela;
