"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardRepository = void 0;
const data_source_1 = require("../data.source");
const card_entity_1 = require("../entities/card.entity");
class CardRepository {
    constructor() {
        this.cardRepository = data_source_1.AppDataSource.getRepository(card_entity_1.Card);
    }
    async register(cardBody) {
        console.log("Hello from registeration of card");
        const card = this.cardRepository.create(cardBody);
        console.log(card);
        return await this.cardRepository.save(card);
    }
    createObject(card) {
        return this.cardRepository.create(card);
    }
    async find() {
        return await this.cardRepository.find({ relations: [] });
    }
    async findById(id) {
        return await this.cardRepository.find({ where: { id }, relations: [] });
    }
    async findBynumber(num) {
        return await this.cardRepository.find({ where: { number: num }, relations: [] });
    }
    async Delete(id) {
        return this.cardRepository.delete(id);
    }
    async update(id, newAdmin) {
        await this.cardRepository.update(id, newAdmin);
        return await this.cardRepository.findOneBy({ id });
    }
    static getRepo() {
        if (!CardRepository.cardRepo)
            CardRepository.cardRepo = new CardRepository();
        return CardRepository.cardRepo;
    }
}
exports.CardRepository = CardRepository;
CardRepository.cardRepo = null;
