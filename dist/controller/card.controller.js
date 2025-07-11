"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.getALlCards = exports.getOne = exports.deleteCard = exports.register = void 0;
const app_error_1 = require("../express/error/app.error");
const response_body_1 = require("../express/types/response.body");
const card_repositor_1 = require("../database/repositories/card.repositor");
const zod_validation_1 = require("../zod/middleware/zod.validation");
const card_schema_1 = require("../zod/schemas/card.schema");
const register = async (req, res, next) => {
    try {
        const body = req.body;
        const validationStatus = await (0, zod_validation_1.validateInput)(card_schema_1.CardSchema, req.body);
        if (validationStatus.status !== "success") {
            console.log(validationStatus);
            return next(new app_error_1.AppError("Invalid Request", 400, "Operational"));
        }
        // const existingCard = await CardRepository.getRepo().findBynumber(body.number);
        // if (existingCard.length!==0) {
        //     return next(new AppError("Card already registered", 400, "OperationalError"));
        // }
        const card = await card_repositor_1.CardRepository.getRepo().register(body);
        res.status(200).json((0, response_body_1.createResponse)("success", "cartela created successfully", card));
        return;
    }
    catch (error) {
        console.log(error);
        next(new app_error_1.AppError("Cartela registration error", 400, "Operational", error));
    }
};
exports.register = register;
const deleteCard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await card_repositor_1.CardRepository.getRepo().Delete(id);
        if (result) {
            res.status(200).json((0, response_body_1.createResponse)("success", "Cartela deleted successfully", []));
        }
    }
    catch (error) {
        console.log(error);
        next(new app_error_1.AppError("Error occured during deleting cartela", 400, error));
    }
};
exports.deleteCard = deleteCard;
const getOne = async (req, res, next) => {
    try {
        const { id } = req.body;
        const card = await card_repositor_1.CardRepository.getRepo().findById(id);
        if (!card) {
            next(new app_error_1.AppError("card not found", 404, "Operational"));
        }
        res.status(200).json((0, response_body_1.createResponse)("success", "Card fetched successfully", card));
    }
    catch (error) {
        console.log(error);
        next(new app_error_1.AppError("Error occured during fetching cards", 404, "Operational"));
    }
};
exports.getOne = getOne;
const getALlCards = async (req, res, next) => {
    try {
        const card = await card_repositor_1.CardRepository.getRepo().find();
        res.status(200).json((0, response_body_1.createResponse)("success", "Card fetched successfully", card));
    }
    catch (error) {
        console.log(error);
        next(new app_error_1.AppError("Error occured during fetching cards", 404, "Operational"));
    }
};
exports.getALlCards = getALlCards;
const update = async (req, res, next) => {
    try {
        const body = req.body;
        const validationStatus = await (0, zod_validation_1.validateInput)(card_schema_1.UpdateCardSchema, req.body);
        const { id } = req.params;
        if (validationStatus.status !== "success") {
            console.log(validationStatus);
            return next(new app_error_1.AppError("Invalid Request", 400, "Operational"));
        }
        const card = await card_repositor_1.CardRepository.getRepo().findById(id);
        if (!card) {
            return next(new app_error_1.AppError("Card not found", 404, "Operational"));
        }
        // const existingCard = await CardRepository.getRepo().findBynumber(body.number);
        // if (existingCard) {
        //     return next(new AppError("User already registered", 400, "OperationalError"));
        // }
        const updatedCard = await card_repositor_1.CardRepository.getRepo().update(id, body);
        res.status(200).json((0, response_body_1.createResponse)("success", "cartela updated successfully", updatedCard));
        return;
    }
    catch (error) {
        console.log(error);
        next(new app_error_1.AppError("Cartela updation error", 400, "Operational", error));
    }
};
exports.update = update;
