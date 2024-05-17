import { Provider } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type'
import { Repository } from 'typeorm'

export const provideBlankMockRepositoryFor = (
  entity: EntityClassOrSchema,
): Provider => ({
  provide: getRepositoryToken(entity),
  useClass: Repository,
})

export const provideManyBlankMockRepositorysFor = (
  entities: EntityClassOrSchema[],
): Provider[] => entities.map((e) => provideBlankMockRepositoryFor(e))
