import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FacilityType } from 'loan-servicing-common'
import FacilityTypeEntity from 'models/entities/FacilityTypeEntity'
import { Repository } from 'typeorm'

@Injectable()
class FacilityTypeService {
  constructor(
    @InjectRepository(FacilityTypeEntity)
    private facilityTypeRepo: Repository<FacilityTypeEntity>,
  ) {}

  async getPropertiesOfFacilityType(
    facilityType: string,
  ): Promise<FacilityType> {
    const result = await this.facilityTypeRepo.findOne({
      where: { name: facilityType },
    })
    if (!result) {
      throw new NotFoundException(
        `No definition found for facility type "${facilityType}"`,
      )
    }
    return result
  }
}

export default FacilityTypeService
