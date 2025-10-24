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
  @Roles('doctor', 'admin')
  findPendingApprovals(
    @CurrentUser() user: any,
    @Query() query: ApprovalQueryDto,
  ) {
    // Allow doctors and admins to view pending approvals (admins are read-only)
    if (user.role !== 'doctor' && user.role !== 'admin') {
      throw new ForbiddenException('Only doctors or admins can view approvals');
    }
    // Coerce query params to numbers (ValidationPipe in tests may not enable transform)
    const page = query.page ? Number(query.page) : undefined;
    const limit = query.limit ? Number(query.limit) : undefined;

    return this.approvalsService.findPendingApprovals(
      user.clinicId,
      user.id, // Pass doctor's ID for filtering
      query.examType,
      page,
      limit,
    );
  }

  @Get('rejected')
  @Roles('doctor', 'admin')
  findRejectedSubmissions(
    @CurrentUser() user: any,
    @Query() query: ApprovalQueryDto,
  ) {
    // Allow doctors and admins to view rejected submissions
    if (user.role !== 'doctor' && user.role !== 'admin') {
      throw new ForbiddenException('Only doctors or admins can view rejections');
    }
    const page = query.page ? Number(query.page) : undefined;
    const limit = query.limit ? Number(query.limit) : undefined;

    return this.approvalsService.findRejectedSubmissions(
      user.clinicId,
      user.id,
      query.examType,
      page,
      limit,
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
