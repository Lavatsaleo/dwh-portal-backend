import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOtzTotalWithVlResultsQuery } from '../impl/get-otz-total-with-vl-results.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransOtzEnrollments } from '../../entities/fact-trans-otz-enrollments.model';
import { Repository } from 'typeorm';

@QueryHandler(GetOtzTotalWithVlResultsQuery)
export class GetOtzTotalWithVlResultsHandler implements IQueryHandler<GetOtzTotalWithVlResultsQuery> {
    constructor(
        @InjectRepository(FactTransOtzEnrollments, 'mssql')
        private readonly repository: Repository<FactTransOtzEnrollments>
    ) {
    }

    async execute(query: GetOtzTotalWithVlResultsQuery): Promise<any> {
        const totalWithVlResults = this.repository.createQueryBuilder('f')
            .select(['count(*) totalWithVlResults'])
            .where('f.lastVL IS NOT NULL')
            .andWhere('f.OTZEnrollmentDate IS NOT NULL');

        if (query.county) {
            totalWithVlResults.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            totalWithVlResults.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            totalWithVlResults.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            totalWithVlResults.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        return await totalWithVlResults.getRawOne();
    }
}