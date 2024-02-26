import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FacilityType } from 'loan-servicing-common'
import FacilityTypeEntity from 'models/entities/FacilityTypeEntity'
import FacilityService from 'modules/facility/facility.service'
import { Repository } from 'typeorm'

@Injectable()
class FacilityTypeService {
  constructor(
    @InjectRepository(FacilityTypeEntity)
    private facilityTypeRepo: Repository<FacilityTypeEntity>,
    @Inject(FacilityService) private facilityService: FacilityService,
  ) {}

  async tryGetPropertiesOfFacilityType(
    facilityTypeName: string,
  ): Promise<FacilityType | null> {
    return this.facilityTypeRepo.findOne({
      where: { name: facilityTypeName },
    })
  }

  async getPropertiesOfFacilityType(
    facilityTypeName: string,
  ): Promise<FacilityType> {
    const result = await this.tryGetPropertiesOfFacilityType(facilityTypeName)
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

  async saveFacilityType(
    facilityTypeDefintion: FacilityType,
  ): Promise<FacilityType> {
    const exisiting = await this.tryGetPropertiesOfFacilityType(
      facilityTypeDefintion.name,
    )
    if (!exisiting) {
      return this.facilityTypeRepo.save(facilityTypeDefintion)
    }
    Object.assign(exisiting, facilityTypeDefintion)
    const savedType = await this.facilityTypeRepo.save(exisiting)

    await this.facilityService.recalculateFacilitiesOfType(savedType.name)
    return savedType
  }
}

export default FacilityTypeService
