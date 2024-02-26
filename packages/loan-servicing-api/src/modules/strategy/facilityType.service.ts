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
    facilityTypeName: string,
  ): Promise<FacilityType> {
    const result = await this.facilityTypeRepo.findOne({
      where: { name: facilityTypeName },
    })
    if (!result) {
      throw new NotFoundException(
        `No definition found for facility type "${facilityTypeName}"`,
      )
    }
    return result
  }

  async getAllFacilityTypes(): Promise<FacilityType[]> {
    return this.facilityTypeRepo.find()
  }

  createFacilityType(facilityTypeDefintion: FacilityType): Promise<FacilityType> {
    return this.facilityTypeRepo.save(facilityTypeDefintion)
  }
}

export default FacilityTypeService
