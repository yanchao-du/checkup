import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { SubmissionData } from './utils/types';
import { pdfStyles } from './utils/styles';
import { buildHeader } from './builders/header.builder';
import { buildPatientInfo } from './builders/patient-info.builder';
import { buildBodyMeasurements } from './builders/body-measurements.builder';
import { buildRemarks } from './builders/remarks.builder';
import { buildDeclaration } from './builders/declaration.builder';
import { generateMdwContent } from './generators/mdw.generator';
import { generateFmwContent } from './generators/fmw.generator';
import { generateFullMedicalContent } from './generators/full-medical.generator';
import { generateIcaContent } from './generators/ica.generator';
import { generateDriverTpContent } from './generators/driver-tp.generator';
import { generateDriverTpLtaContent } from './generators/driver-tp-lta.generator';
import { generateDriverLtaContent } from './generators/driver-lta.generator';
import { generateShortDriverExamContent } from './generators/short-driver-exam.generator';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly printer: PdfPrinter;

  constructor() {
    // Initialize pdfmake with fonts
    const fs = require('fs');
    const path = require('path');
    
    // Read Material Icons font file
    const materialIconsPath = path.join(__dirname, 'fonts', 'MaterialIcons-Regular.ttf');
    const materialIconsBuffer = fs.readFileSync(materialIconsPath);
    
    // Load default Roboto fonts from vfs_fonts
    const vfsFonts = require('pdfmake/build/vfs_fonts.js');
    const vfs = vfsFonts.pdfMake ? vfsFonts.pdfMake.vfs : vfsFonts;
    
    const fonts = {
      Roboto: {
        normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
        bold: Buffer.from(vfs['Roboto-Medium.ttf'], 'base64'),
        italics: Buffer.from(vfs['Roboto-Italic.ttf'], 'base64'),
        bolditalics: Buffer.from(vfs['Roboto-MediumItalic.ttf'], 'base64'),
      },
      MaterialIcons: {
        normal: materialIconsBuffer,
        bold: materialIconsBuffer,
        italics: materialIconsBuffer,
        bolditalics: materialIconsBuffer,
      },
    };
    
    this.printer = new PdfPrinter(fonts);
  }

  async generateSubmissionPdf(submission: SubmissionData): Promise<Buffer> {
    try {
      this.logger.log(`Generating PDF for submission ${submission.id}, exam type: ${submission.examType}`);
      
      const docDefinition = this.buildDocumentDefinition(submission);
      this.logger.debug(`Document definition created successfully`);
      
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        
        // Set timeout for PDF generation
        const timeout = setTimeout(() => {
          pdfDoc.end();
          reject(new Error('PDF generation timeout'));
        }, 30000); // 30 seconds

        pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
        
        pdfDoc.on('end', () => {
          clearTimeout(timeout);
          const result = Buffer.concat(chunks);
          this.logger.log(`PDF generated successfully for submission ${submission.id}, size: ${result.length} bytes`);
          resolve(result);
        });
        
        pdfDoc.on('error', (err: Error) => {
          clearTimeout(timeout);
          this.logger.error(`PDF generation error for submission ${submission.id}:`, err);
          reject(err);
        });
        
        pdfDoc.end();
      });
    } catch (error) {
      this.logger.error(`Failed to generate PDF for submission ${submission.id}:`, error);
      this.logger.error(`Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
      throw new InternalServerErrorException(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildDocumentDefinition(submission: SubmissionData): TDocumentDefinitions {
    const content: any[] = [];

    // Add header
    content.push(...buildHeader(submission));

    // Add patient information
    content.push(...buildPatientInfo(submission));

    // Add body measurements (if applicable)
    content.push(...buildBodyMeasurements(submission));

    // Add exam-specific content
    content.push(...this.getExamSpecificContent(submission));

    // Add remarks (if any)
    content.push(...buildRemarks(submission));

    // Add declaration (for submitted exams) - includes clinic and doctor info
    content.push(...buildDeclaration(submission));

    return {
      content,
      styles: pdfStyles,
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60] as [number, number, number, number],
      footer: (currentPage, pageCount) => ({
        text: `Page ${currentPage} of ${pageCount}`,
        alignment: 'center',
        fontSize: 9,
        margin: [0, 20, 0, 0] as [number, number, number, number],
      }),
    };
  }

  private getExamSpecificContent(submission: SubmissionData): any[] {
    const examType = submission.examType;
    this.logger.debug(`Getting exam specific content for exam type: "${examType}"`);

    // Match by enum key
    if (examType === 'SIX_MONTHLY_MDW') {
      this.logger.debug('Matched MDW exam type');
      return generateMdwContent(submission);
    }

    if (examType === 'SIX_MONTHLY_FMW') {
      return generateFmwContent(submission);
    }

    if (examType === 'FULL_MEDICAL_EXAM' || examType === 'WORK_PERMIT') {
      return generateFullMedicalContent(submission);
    }

    if (examType === 'PR_MEDICAL' || examType === 'STUDENT_PASS_MEDICAL' || examType === 'LTVP_MEDICAL') {
      return generateIcaContent(submission);
    }

    if (examType === 'DRIVING_VOCATIONAL_TP_LTA') {
      return generateDriverTpLtaContent(submission);
    }

    if (examType === 'VOCATIONAL_LICENCE_LTA') {
      return generateDriverLtaContent(submission);
    }

    if (examType === 'DRIVING_LICENCE_TP' || examType === 'AGED_DRIVERS') {
      return generateDriverTpContent(submission);
    }

    // Short driver exam forms
    if (examType === 'DRIVING_LICENCE_TP_SHORT' || 
        examType === 'DRIVING_VOCATIONAL_TP_LTA_SHORT' || 
        examType === 'VOCATIONAL_LICENCE_LTA_SHORT') {
      return generateShortDriverExamContent(submission);
    }

    // Default fallback
    this.logger.warn(`No matching generator found for exam type: "${examType}"`);
    return [{
      text: `Exam details not available for exam type: ${examType}`,
      style: 'value',
    }];
  }
}
