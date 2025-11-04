import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    
    return this.usersService.findAll(user.clinicId, pageNum, limitNum);
  }

  @Get('doctors/list')
  async getDoctors(@CurrentUser() user: any) {
    return this.usersService.findDoctors(user.clinicId);
  }

  @Get('nurses/list')
  async getNurses(@CurrentUser() user: any) {
    return this.usersService.findNurses(user.clinicId);
  }

  @Get('me/clinics')
  @Roles('doctor', 'nurse')
  async getMyClinics(@CurrentUser() user: any) {
    return this.usersService.getUserClinics(user.id, user.role);
  }

  @Get('me/default-doctor')
  @Roles('nurse')
  async getDefaultDoctor(@CurrentUser() user: any) {
    return this.usersService.getDefaultDoctor(user.id);
  }

  @Put('me/default-doctor')
  @Roles('nurse')
  async setDefaultDoctor(
    @CurrentUser() user: any,
    @Body() body: { defaultDoctorId: string },
  ) {
    return this.usersService.setDefaultDoctor(user.id, body.defaultDoctorId);
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(id, user.clinicId);
  }

  @Post()
  @Roles('admin')
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.create(user.clinicId, createUserDto);
  }

  @Put(':id')
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.update(id, user.clinicId, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user.clinicId);
  }

  // Doctor-Clinic relationship endpoints
  @Get(':id/clinics')
  @Roles('admin', 'doctor')
  getDoctorClinics(@Param('id') id: string) {
    return this.usersService.getDoctorClinics(id);
  }

  @Post(':id/clinics')
  @Roles('admin')
  assignDoctorToClinic(
    @Param('id') doctorId: string,
    @Body() body: { clinicId: string; isPrimary?: boolean },
  ) {
    return this.usersService.assignDoctorToClinic(
      doctorId,
      body.clinicId,
      body.isPrimary,
    );
  }

  @Delete(':id/clinics/:clinicId')
  @Roles('admin')
  removeDoctorFromClinic(
    @Param('id') doctorId: string,
    @Param('clinicId') clinicId: string,
  ) {
    return this.usersService.removeDoctorFromClinic(doctorId, clinicId);
  }

  @Put(':id/clinics/:clinicId/primary')
  @Roles('admin')
  setPrimaryClinic(
    @Param('id') doctorId: string,
    @Param('clinicId') clinicId: string,
  ) {
    return this.usersService.setPrimaryClinic(doctorId, clinicId);
  }

  // Nurse-Clinic relationship endpoints
  @Post(':id/nurse-clinics')
  @Roles('admin')
  assignNurseToClinic(
    @Param('id') nurseId: string,
    @Body() body: { clinicId: string; isPrimary?: boolean },
  ) {
    return this.usersService.assignNurseToClinic(
      nurseId,
      body.clinicId,
      body.isPrimary,
    );
  }

  @Delete(':id/nurse-clinics/:clinicId')
  @Roles('admin')
  removeNurseFromClinic(
    @Param('id') nurseId: string,
    @Param('clinicId') clinicId: string,
  ) {
    return this.usersService.removeNurseFromClinic(nurseId, clinicId);
  }

  @Put(':id/nurse-clinics/:clinicId/primary')
  @Roles('admin')
  setNursePrimaryClinic(
    @Param('id') nurseId: string,
    @Param('clinicId') clinicId: string,
  ) {
    return this.usersService.setNursePrimaryClinic(nurseId, clinicId);
  }

  @Get(':id/nurse-clinics')
  @Roles('admin', 'nurse')
  getNurseClinics(@Param('id') id: string) {
    return this.usersService.getNurseClinics(id);
  }
}
