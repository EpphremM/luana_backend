"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const data_source_1 = require("../data.source");
const user_entity_1 = require("../entities/user.entity");
class UserRepository {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    }
    async register(userBody) {
        console.log("Hello from registeration of user");
        const user = this.userRepository.create(userBody);
        console.log(user);
        // console.log(user)
        return await this.userRepository.save(user);
    }
    createObject(user) {
        return this.userRepository.create(user);
    }
    async find() {
        return await this.userRepository.find({ relations: ["admin"] });
    }
    async findById(id) {
        return await this.userRepository.find({ where: { id }, relations: ["super_admin", "casher", "admin", "super_agent"] });
    }
    async findByUsername(username) {
        return await this.userRepository.findOne({ where: { username } });
    }
    async Delete(id) {
        return this.userRepository.delete(id);
    }
    async update(id, newAdmin) {
        await this.userRepository.update(id, newAdmin);
        return await this.userRepository.findOneBy({ id });
    }
    static getRepo() {
        if (!UserRepository.userRepo)
            UserRepository.userRepo = new UserRepository();
        return UserRepository.userRepo;
    }
}
exports.UserRepository = UserRepository;
UserRepository.userRepo = null;
