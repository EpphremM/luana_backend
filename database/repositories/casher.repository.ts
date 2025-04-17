import { AppDataSource } from "../data.source";
import { Casher } from "../entities/casher.entity";
import { CasherInterface } from "../type/casher/casher.interface";

export class CasherRepository {
    casherRepository = AppDataSource.getRepository<CasherInterface>(Casher);
    static casherRepo: CasherRepository | null = null;
    private constructor() { }

    async register(casher: CasherInterface) {
        return await this.casherRepository.save(casher);
    }
    async find() {
        return await this.casherRepository.createQueryBuilder('casher').leftJoinAndSelect('casher.user', 'user').leftJoinAndSelect('casher.admin', 'user').getMany();

    }
    static getRepo() {
        if (!CasherRepository.casherRepo) {
            CasherRepository.casherRepo = new CasherRepository();
        }
        return CasherRepository.casherRepo;
    }
}