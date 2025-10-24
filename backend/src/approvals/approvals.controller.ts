import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApprovalQueryDto, ApproveDto, RejectDto } from './dto/approval.dto';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Get()
  @Roles('doctor')
  findPendingApprovals(
    @CurrentUser() user: any,
    @Query() query: ApprovalQueryDto,
  ) {
    if (user.role !== 'doctor') {
      throw new ForbiddenException('Only doctors can view approvals');
    }
    return this.approvalsService.findPendingApprovals(
      user.clinicId, 
      user.id, // Pass doctor's ID for filtering
      query.examType, 
      query.page, 
      query.limit
    );
  }

  @Get('rejected')
  @Roles('doctor')
  findRejectedSubmissions(
    @CurrentUser() user: any,
    @Query() query: ApprovalQueryDto,
  ) {
    if (user.role !== 'doctor') {
      throw new ForbiddenException('Only doctors can view rejections');
    }
    return this.approvalsService.findRejectedSubmissions(
      user.clinicId,
      user.id,
      query.examType,
      query.page,
      query.limit
    );
  }

  @Post(':id/approve')
  @Roles('doctor')
  approve(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ApproveDto,
  ) {
    if (user.role !== 'doctor') {
      throw new ForbiddenException('Only doctors can approve submissions');
    }
    return this.approvalsService.approve(id, user.id, user.clinicId, dto.notes);
  }

  @Post(':id/reject')
  @Roles('doctor')
  reject(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: RejectDto,
  ) {
    if (user.role !== 'doctor') {
      throw new ForbiddenException('Only doctors can reject submissions');
    }
    
    return this.approvalsService.reject(id, user.id, user.clinicId, dto.reason);
  }
}
