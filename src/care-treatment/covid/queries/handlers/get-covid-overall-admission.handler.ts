import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCovidOverallAdmissionQuery } from '../impl/get-covid-overall-admission.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransCovidVaccines } from '../../entities/fact-trans-covid-vaccines.model';
import { Repository } from 'typeorm';
import { FactTransNewCohort } from '../../../new-on-art/entities/fact-trans-new-cohort.model';
import { DimAgeGroups } from '../../../common/entities/dim-age-groups.model';

@QueryHandler(GetCovidOverallAdmissionQuery)
export class GetCovidOverallAdmissionHandler implements IQueryHandler<GetCovidOverallAdmissionQuery> {
    constructor(
        @InjectRepository(FactTransCovidVaccines, 'mssql')
        private readonly repository: Repository<FactTransCovidVaccines>
    ) {
    }

    async execute(query: GetCovidOverallAdmissionQuery): Promise<any> {
        const covidOverallAdmission = this.repository.createQueryBuilder('f')
            .select(['AdmissionStatus, CASE WHEN AdmissionStatus=\'Yes\' THEN \'Admitted\' WHEN AdmissionStatus=\'No\'  THEN \'Not Admitted\' ELSE \'Unclassified\' END as Admission, count (*) Num'])
            .leftJoin(FactTransNewCohort, 'g', 'f.PatientID = g.PatientID and f.SiteCode=g.MFLCode and f.PatientPK=g.PatientPK')
            .innerJoin(DimAgeGroups, 'v', 'g.ageLV = v.Age')
            .where('PatientStatus=\'Symptomatic\'');

        if (query.county) {
            covidOverallAdmission.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            covidOverallAdmission.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            covidOverallAdmission.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            covidOverallAdmission.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        return await covidOverallAdmission
            .groupBy('AdmissionStatus')
            .getRawMany();
    }
}
