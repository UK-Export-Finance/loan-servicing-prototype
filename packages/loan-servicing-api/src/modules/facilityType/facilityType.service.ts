import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
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
    if (exisiting) {
      throw new BadRequestException(
        `Existing facility type with name "${facilityTypeDefintion.name}"`,
      )
    }
    return this.facilityTypeRepo.save(facilityTypeDefintion)
  }
}

export default FacilityTypeService
