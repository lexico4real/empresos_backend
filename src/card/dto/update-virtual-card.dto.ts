import { PartialType } from '@nestjs/swagger';
import { CreateVirtualCardDto } from './create-virtual-card.dto';

export class UpdateCardDto extends PartialType(CreateVirtualCardDto) {}
