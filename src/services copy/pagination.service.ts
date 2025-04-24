import { PaginationDto } from "../dto/pagination.dto";
import { JobRepository } from "../database/repositories/job.repository";

export class JobService {
  constructor(private jobRepository: JobRepository = JobRepository.getRepo()) {}

  async getJobs(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const query = this.jobRepository.jobRpository
      .createQueryBuilder('jobs')
      .leftJoinAndSelect("jobs.tutor", "tutor")
      .leftJoinAndSelect("jobs.family", "family")
      .leftJoinAndSelect("jobs.applications", "application")
      .leftJoinAndSelect("jobs.students", "students")
      .leftJoinAndSelect("students.subjects", "subjects")
      .skip(skip)
      .take(limit);

    const [jobs, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      jobs,
      page,
      limit,
      total,
      totalPages,
    };
  }
}
