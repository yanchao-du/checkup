import { Controller, Get, Param, Res, UseGuards, Request } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PdfService } from './pdf.service';
import { SubmissionsService } from '../submissions/submissions.service';

@Controller('submissions')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly submissionsService: SubmissionsService,
  ) {}

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    console.log('📄 PDF Controller: Request received for submission', id);
    console.log('👤 User:', req.user);
    
    // Use the existing authorization logic from SubmissionsService
    const submission = await this.submissionsService.findOne(
      id,
      req.user.userId,
      req.user.role,
      req.user.clinicId,
    );

    console.log('✅ PDF Controller: Authorization passed, generating PDF');

    // Generate PDF
    const pdfBuffer = await this.pdfService.generateSubmissionPdf(submission as any);

    console.log(`✅ PDF Controller: PDF generated, size: ${pdfBuffer.length} bytes`);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="submission-${id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);
  }
}
