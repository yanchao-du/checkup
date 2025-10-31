import { Controller, Get, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LookupPatientDto } from './dto/lookup-patient.dto';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  private readonly logger = new Logger(PatientsController.name);

  constructor(private patientsService: PatientsService) {}

  @Post('lookup')
  async lookupByNric(@Body() lookupPatientDto: LookupPatientDto) {
    this.logger.log(`Looking up patient by NRIC: ${lookupPatientDto.nric}`);
    return this.patientsService.lookupByNric(lookupPatientDto.nric);
  }

  @Get('random-test-fin')
  async getRandomTestFin() {
    this.logger.log('Getting random test FIN');
    return this.patientsService.getRandomTestFin();
  }
}
