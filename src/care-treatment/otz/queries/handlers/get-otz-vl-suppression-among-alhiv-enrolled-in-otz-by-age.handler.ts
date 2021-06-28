import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOtzVlSuppressionAmongAlhivEnrolledInOtzByAgeQuery } from '../impl/get-otz-vl-suppression-among-alhiv-enrolled-in-otz-by-age.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransOtzEnrollments } from '../../entities/fact-trans-otz-enrollments.model';
import { Repository } from 'typeorm';

@QueryHandler(GetOtzVlSuppressionAmongAlhivEnrolledInOtzByAgeQuery)
export class GetOtzVlSuppressionAmongAlhivEnrolledInOtzByAgeHandler implements IQueryHandler<GetOtzVlSuppressionAmongAlhivEnrolledInOtzByAgeQuery> {
    constructor(
        @InjectRepository(FactTransOtzEnrollments, 'mssql')
        private readonly repository: Repository<FactTransOtzEnrollments>
    ) {
    }

    async execute(query: GetOtzVlSuppressionAmongAlhivEnrolledInOtzByAgeQuery): Promise<any> {
        const vlSuppressionOtzByAge = this.repository.createQueryBuilder('f')
            .select(['[DATIM_AgeGroup] ageGroup, Last12MVLResult, COUNT(Last12MVLResult) AS vlSuppression'])
            .andWhere('f.MFLCode IS NOT NULL');

        if (query.county) {
            vlSuppressionOtzByAge.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            vlSuppressionOtzByAge.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            vlSuppressionOtzByAge.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            vlSuppressionOtzByAge.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        return await vlSuppressionOtzByAge
            .groupBy('[DATIM_AgeGroup], Last12MVLResult')
            .getRawMany();
    }
}
