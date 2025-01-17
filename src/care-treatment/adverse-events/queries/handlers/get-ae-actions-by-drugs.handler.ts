import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAeActionsByDrugsQuery } from '../impl/get-ae-actions-by-drugs.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransAeCauses } from '../../entities/fact-trans-ae-causes.model';
import { Repository } from 'typeorm';

@QueryHandler(GetAeActionsByDrugsQuery)
export class GetAeActionsByDrugsHandler implements IQueryHandler<GetAeActionsByDrugsQuery> {
    constructor(
        @InjectRepository(FactTransAeCauses, 'mssql')
        private readonly repository: Repository<FactTransAeCauses>
    ) {
    }

    async execute(query: GetAeActionsByDrugsQuery): Promise<any> {
        const aeActionsByDrugs = this.repository.createQueryBuilder('f')
            .select('[Severity], [AdverseEventCause], SUM([Total_AdverseEventCause]) total, DATIM_AgeGroup ageGroup')
            .where('[AdverseEventCause] IS NOT NULL');

        if (query.county) {
            aeActionsByDrugs
                .andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            aeActionsByDrugs
                .andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            aeActionsByDrugs
                .andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            aeActionsByDrugs
                .andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        if (query.agency) {
            aeActionsByDrugs.andWhere('f.CTAgency IN (:...agencies)', { agencies: query.agency });
        }

        if (query.datimAgeGroup) {
            aeActionsByDrugs.andWhere('f.DATIM_AgeGroup IN (:...ageGroups)', { ageGroups: query.datimAgeGroup });
        }

        if (query.gender) {
            // lacking gender
            // aeActionsByDrugs.andWhere('f.CTAgency IN (:...agencies)', { agencies: query.agency });
        }

        return await aeActionsByDrugs
            .groupBy('[Severity], [AdverseEventCause], DATIM_AgeGroup')
            .getRawMany();
    }
}
