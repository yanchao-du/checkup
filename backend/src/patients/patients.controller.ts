import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  private readonly logger = new Logger(PatientsController.name);

  constructor(private patientsService: PatientsService) {}

  @Get('lookup')
  async lookupByNric(@Query('nric') nric: string) {
    this.logger.log(`Looking up patient by NRIC: ${nric}`);
    return this.patientsService.lookupByNric(nric);
  }

  @Get('random-test-fin')
  async getRandomTestFin() {
    this.logger.log('Getting random test FIN');
    return this.patientsService.getRandomTestFin();
  }
}
