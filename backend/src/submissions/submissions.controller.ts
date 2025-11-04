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
  Logger,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateSubmissionDto, UpdateSubmissionDto, SubmissionQueryDto, AssignSubmissionDto } from './dto/submission.dto';

@Controller('submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  private readonly logger = new Logger(SubmissionsController.name);

  constructor(private submissionsService: SubmissionsService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: SubmissionQueryDto) {
    return this.submissionsService.findAll(user.id, user.role, user.clinicId, query);
  }

  @Get('rejected')
  findRejectedSubmissions(@CurrentUser() user: any, @Query() query: SubmissionQueryDto) {
    return this.submissionsService.findRejectedSubmissions(user.id, user.clinicId, query);
  }

  @Get('assigned-to-me')
  getAssignedSubmissions(@CurrentUser() user: any) {
    this.logger.log(`GET assigned submissions for user ${user.id} (${user.role})`);
    return this.submissionsService.getAssignedSubmissions(user.id, user.role, user.clinicId);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateSubmissionDto) {
    return this.submissionsService.create(user.id, user.role, user.clinicId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.submissionsService.findOne(id, user.id, user.role, user.clinicId);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateSubmissionDto) {
    this.logger.log(`UPDATE request for submission ${id} by user ${user.id} (${user.role})`);
    this.logger.debug(`Update DTO: ${JSON.stringify(dto)}`);
    return this.submissionsService.update(id, user.id, user.role, dto);
  }

  @Post(':id/submit')
  submitForApproval(@Param('id') id: string, @CurrentUser() user: any) {
    return this.submissionsService.submitForApproval(id, user.id, user.role);
  }

  @Post(':id/assign')
  assignSubmission(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: AssignSubmissionDto,
  ) {
    this.logger.log(`ASSIGN submission ${id} to ${dto.assignToId} by user ${user.id} (${user.role})`);
    return this.submissionsService.assignSubmission(id, user.id, user.role, dto);
  }

  @Post(':id/claim')
  claimSubmission(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`CLAIM submission ${id} by user ${user.id} (${user.role})`);
    return this.submissionsService.claimSubmission(id, user.id, user.role);
  }

  @Post(':id/submit-collaborative')
  submitCollaborativeDraft(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`SUBMIT COLLABORATIVE draft ${id} by user ${user.id} (${user.role})`);
    return this.submissionsService.submitCollaborativeDraft(id, user.id, user.role);
  }

  @Post(':id/reopen')
  reopenSubmission(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`REOPEN request for submission ${id} by user ${user.id} (${user.role})`);
    return this.submissionsService.reopenSubmission(id, user.id, user.role);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`DELETE request for submission ${id} by user ${user.id} (${user.role})`);
    return this.submissionsService.delete(id, user.id, user.role);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.submissionsService.getAuditTrail(id);
  }
}
