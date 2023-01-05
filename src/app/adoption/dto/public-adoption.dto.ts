import { OmitType } from '@nestjs/swagger';
import { AdoptionEntity } from '../entities/adoption.entity';

export class PublicAdoptionDto extends OmitType(AdoptionEntity, ['donorId']) {}
