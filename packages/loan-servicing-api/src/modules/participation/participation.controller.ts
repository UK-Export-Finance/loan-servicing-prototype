import { Controller } from "@nestjs/common";
import { ApiTags, ApiParam } from "@nestjs/swagger";


@ApiTags('Participation')
@Controller('/facility/:facilityId/participation')
@ApiParam({ name: 'facilityId', required: true, type: 'string' })
class ParticipationController {}

export default ParticipationController