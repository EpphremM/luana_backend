"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartelaRepository = void 0;
const data_source_1 = require("../data.source");
const cartela_entity_1 = require("../entities/cartela.entity");
class CartelaRepository {
    constructor() {
        this.cartelaRepository = data_source_1.AppDataSource.getRepository(cartela_entity_1.Cartela);
    }
    async register(cartelaBody) {
        console.log("Hello from registeration of Cartela");
        const cartela = this.cartelaRepository.create(cartelaBody);
        console.log(cartela);
        return await this.cartelaRepository.save(cartela);
    }
    createObject(cartela) {
        return this.cartelaRepository.create(cartela);
    }
    async find() {
        return await this.cartelaRepository.find({ relations: ["cards"] });
    }
    async findById(id) {
        return await this.cartelaRepository.find({ where: { id }, relations: ["cards"] });
    }
    async findByname(name) {
        return await this.cartelaRepository.findOne({ where: { name } });
    }
    async Delete(id) {
        return this.cartelaRepository.delete(id);
    }
    async update(id, newAdmin) {
        await this.cartelaRepository.update(id, newAdmin);
        return await this.cartelaRepository.findOneBy({ id });
    }
    static getRepo() {
        if (!CartelaRepository.cartelaRepo)
            CartelaRepository.cartelaRepo = new CartelaRepository();
        return CartelaRepository.cartelaRepo;
    }
}
exports.CartelaRepository = CartelaRepository;
CartelaRepository.cartelaRepo = null;
