import { Injectable } from '@nestjs/common';
import { AdoptionRepository } from './adoption.repository';
import { CreateAdoptionDto } from './dto/create-adoption.dto';
import { UpdateAdoptionDto } from './dto/update-adoption.dto';

@Injectable()
export class AdoptionService {
  constructor(private readonly adoptionRepository: AdoptionRepository) {}
  create(createAdoptionDto: CreateAdoptionDto) {
    return this.adoptionRepository.create(createAdoptionDto);
  }

  findAll() {
    return this.adoptionRepository.findAll();
  }

  findOne(id: string) {
    return this.adoptionRepository.findById(id);
  }

  update(id: string, updateAdoptionDto: UpdateAdoptionDto) {
    return this.adoptionRepository.updateById(id, updateAdoptionDto);
  }

  remove(id: string) {
    return this.adoptionRepository.deleteById(id);
  }
}
