import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCalhivVirallySuppressedQuery } from '../impl/get-calhiv-virally-suppressed.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransOvcEnrollments } from '../../entities/fact-trans-ovc-enrollments.model';
import { Repository } from 'typeorm';
import { FactTransOtzOutcome } from '../../../otz/entities/fact-trans-otz-outcome.model';

@QueryHandler(GetCalhivVirallySuppressedQuery)
export class GetCalhivVirallySuppressedHandler implements IQueryHandler<GetCalhivVirallySuppressedQuery> {
    constructor(
        @InjectRepository(FactTransOvcEnrollments, 'mssql')
        private readonly repository: Repository<FactTransOtzOutcome>
    ) {
    }

    async execute(query: GetCalhivVirallySuppressedQuery): Promise<any> {
        const CALHIVVLDone = this.repository.createQueryBuilder('f')
            .select(['Count (*)CALHIVVLDone'])
            .andWhere('f.TXCurr=1 and VLDone=1');

        if (query.county) {
            CALHIVVLDone.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            CALHIVVLDone.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            CALHIVVLDone.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            CALHIVVLDone.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        if (query.agency) {
            CALHIVVLDone.andWhere('f.CTAgency IN (:...agencies)', { agencies: query.agency });
        }

        if (query.gender) {
            CALHIVVLDone.andWhere('f.Gender IN (:...genders)', { genders: query.gender });
        }

        if (query.datimAgeGroup) {
            CALHIVVLDone.andWhere('f.DATIM_AgeGroup IN (:...ageGroups)', { ageGroups: query.datimAgeGroup });
        }

        return await CALHIVVLDone.getRawOne();
    }
}
