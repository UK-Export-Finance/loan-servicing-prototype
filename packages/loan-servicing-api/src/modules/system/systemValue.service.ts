import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import SystemValueEntity from 'models/SystemValueEntity'
import { Repository } from 'typeorm'

const SYSTEM_DATE = 'SYSTEM_DATE'

@Injectable()
// class SystemValueService implements OnModuleInit {
  class SystemValueService {
  constructor(
    @InjectRepository(SystemValueEntity)
    private systemValueRepo: Repository<SystemValueEntity>,
  ) {}

  // async onModuleInit(): Promise<void> {
  //   const systemDate = await this.systemValueRepo.findOneBy({ name: SYSTEM_DATE })
  //   if (!systemDate) {
  //     await this.systemValueRepo.save({
  //       name: SYSTEM_DATE,
  //       value: new Date().toISOString(),
  //     })
  //   }
  // }

  async getSystemDate(): Promise<Date> {
    const dateStr = await this.systemValueRepo.findOneByOrFail({
      name: SYSTEM_DATE,
    })
    return new Date(dateStr.value)
  }

  async setSystemDate(date: Date): Promise<void> {
    await this.systemValueRepo.save({
      name: SYSTEM_DATE,
      value: date.toISOString(),
    })
  }
}

export default SystemValueService