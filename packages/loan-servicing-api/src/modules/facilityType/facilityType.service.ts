import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FacilityType, FacilityTypeSettings } from 'loan-servicing-common'
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

  async verifyConfigMatchesType(
    config: Partial<FacilityTypeSettings>,
    facilityTypeName: string,
  ): Promise<boolean> {
    const facilityType =
      await this.getPropertiesOfFacilityType(facilityTypeName)
    return Object.entries(config).reduce(
      (allValid: boolean, [propName, propValue]) => {
        const test = facilityType[
          propName as keyof FacilityTypeSettings
        ] as string[]
        return allValid && test.includes(propValue)
      },
      true,
    )
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
