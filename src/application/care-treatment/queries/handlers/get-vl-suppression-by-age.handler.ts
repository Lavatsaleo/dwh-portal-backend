import { InjectRepository } from '@nestjs/typeorm';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { FactTransVLOutcome } from 'src/entities/care_treatment/fact-trans-vl-outcome.model';
import { GetVlSuppressionByAgeQuery } from '../get-vl-suppression-by-age.query';

@QueryHandler(GetVlSuppressionByAgeQuery)
export class GetVlSuppressionByAgeHandler implements IQueryHandler<GetVlSuppressionByAgeQuery> {
    constructor(
        @InjectRepository(FactTransVLOutcome, 'mssql')
        private readonly repository: Repository<FactTransVLOutcome>
    ) {
    }

    async execute(query: GetVlSuppressionByAgeQuery): Promise<any> {
        const vlSuppressionByAge = this.repository.createQueryBuilder('f')
            .select(['f.AgeGroup ageGroup, f.Last12MVLResult suppression, SUM(f.Total_Last12MVL) vlDone'])
            .where('f.MFLCode > 0')
            .andWhere('f.AgeGroup IS NOT NULL')
            .andWhere('f.Last12MVLResult IS NOT NULL');

        if (query.county) {
            vlSuppressionByAge.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            vlSuppressionByAge.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            vlSuppressionByAge.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            vlSuppressionByAge.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        return await vlSuppressionByAge
            .groupBy('f.AgeGroup, f.Last12MVLResult')
            .orderBy('f.AgeGroup, f.Last12MVLResult')
            .getRawMany();
    }
}
