# Design Document: PDF Generation

## Architecture Overview

### High-Level Flow
```
User clicks "Download PDF" button
    ↓
Frontend: GET /v1/submissions/:id/pdf (JWT in header)
    ↓
Backend: JwtAuthGuard validates token
    ↓
Backend: Verify user has access to submission
    ↓
Backend: Retrieve submission with full details
    ↓
Backend: Generate PDF from HTML template
    ↓
Backend: Stream PDF to client
    ↓
Frontend: Browser downloads PDF file
```

## Technology Selection

### PDF Library Comparison

#### Option 1: Puppeteer (Recommended)
**Description**: Headless Chrome for HTML-to-PDF conversion

**Pros**:
- ✅ Renders HTML/CSS exactly as browser would display
- ✅ Supports complex layouts with Tailwind CSS classes
- ✅ Can reuse existing component styling
- ✅ Better for complex medical forms with tables and sections
- ✅ Handles multi-page PDFs automatically
- ✅ Supports CSS print media queries
- ✅ Well-maintained and widely used in production
- ✅ Perfect for document-style reports

**Cons**:
- ❌ **Larger package size (~280MB with chromium)**
  - *Impact*: Increases Docker image size, slower deployments, more storage costs
  - *Mitigation*: 
    - Use `puppeteer-core` (2MB) + system Chrome to avoid bundling Chromium
    - Use multi-stage Docker builds to minimize final image size
    - Share Chromium layer across containers in orchestrated environments
    - Consider separate PDF service if other services don't need Puppeteer
  - *Real Cost*: ~$0.10-0.20/month additional EBS storage per instance

- ❌ **Slightly slower than pure programmatic generation (~2-5 seconds per PDF)**
  - *Impact*: Users wait 2-5s for download to start, higher latency than pdfmake (0.1-0.5s)
  - *Mitigation*:
    - Implement async generation with job queue (future enhancement)
    - Show loading indicator immediately so users expect wait
    - Cache generated PDFs for 5-10 minutes for re-downloads
    - Generate PDFs in background after submission approval (proactive)
    - Optimize template HTML (minimize CSS, inline critical styles)
  - *Real Impact*: Acceptable for medical documents where quality > speed
  - *User Perception*: "Generating your PDF..." message makes wait feel purposeful

- ❌ **Requires more memory (~50-100MB per generation)**
  - *Impact*: Limits concurrent generations, increases EC2 costs for high traffic
  - *Mitigation*:
    - Reuse single browser instance across requests (don't launch per request)
    - Implement queue with max concurrency limit (e.g., 10 concurrent generations)
    - Add memory monitoring and alerts at 80% usage
    - Use swap space as safety buffer (slower but prevents OOM crashes)
    - Scale horizontally with load balancer for high traffic
  - *Real Cost*: Requires t3.large ($65/mo) vs t3.small ($15/mo) for 5000 PDFs/day
  - *ROI*: Extra $50/mo is worth it for maintainable, high-quality PDFs

- ❌ **More complex to deploy (needs Chrome dependencies)**
  - *Impact*: Dockerfile needs additional system packages, longer build times
  - *Mitigation*:
    - Use official Puppeteer Docker base image: `FROM node:18-slim` + apt packages
    - Add to Dockerfile:
      ```dockerfile
      RUN apt-get update && apt-get install -y \
          chromium \
          fonts-liberation \
          libnss3 \
          libatk-bridge2.0-0 \
          libx11-xcb1 \
          libxcomposite1 \
          libxdamage1 \
          && rm -rf /var/lib/apt/lists/*
      ```
    - Cache Docker layers to speed up rebuilds
    - Test in staging environment before production deploy
    - Document required packages in README
  - *Real Impact*: One-time setup cost (~1-2 hours), minimal ongoing maintenance

**Best For**: Complex documents with styled layouts, medical reports, forms with multiple sections

**Trade-off Summary**: Puppeteer's downsides are **manageable** and worth the benefits of HTML templating, visual consistency, and developer experience. For a medical examination system where quality and accuracy are paramount, 2-5 seconds of generation time is acceptable.

---

#### Option 2: pdfmake
**Description**: Client-side and server-side PDF generation with declarative document definition

**Pros**:
- ✅ Lightweight (~2MB package size)
- ✅ Fast generation (~100-500ms per PDF)
- ✅ Low memory footprint
- ✅ Good for structured documents with tables
- ✅ Built-in table support with styling
- ✅ No external dependencies (no browser needed)
- ✅ Works in Node.js and browsers
- ✅ Supports headers, footers, page numbers
- ✅ Good documentation and examples

**Cons**:
- ❌ Declarative API requires more code for complex layouts
- ❌ Limited CSS support (no Tailwind, custom styling needed)
- ❌ Cannot reuse HTML/React components
- ❌ More manual layout programming required
- ❌ Steeper learning curve for complex documents
- ❌ Less flexible for pixel-perfect designs

**Best For**: Simple structured documents, invoices, receipts, data tables, forms with predictable layouts

---

#### Option 3: pdfkit
**Description**: Low-level PDF generation library for Node.js

**Pros**:
- ✅ Very lightweight (~1MB)
- ✅ Fast generation
- ✅ Low memory usage
- ✅ Fine-grained control over PDF structure
- ✅ No external dependencies

**Cons**:
- ❌ Very low-level API (manual positioning of every element)
- ❌ No HTML/CSS support
- ❌ Time-consuming to build complex layouts
- ❌ Difficult to maintain for multi-section forms
- ❌ Requires extensive custom code

**Best For**: Simple documents with basic text and graphics, when you need maximum control

---

#### Option 4: jsPDF
**Description**: Client-side focused PDF generation

**Cons**:
- ❌ Primarily client-side library (security concern)
- ❌ Limited HTML support through html2canvas plugin
- ❌ Less suitable for server-side generation

**Not Recommended**: Security requirements mandate server-side generation

---

#### Option 5: pdf-lib
**Description**: PDF manipulation and creation library

**Cons**:
- ❌ More suited for PDF manipulation than generation from scratch
- ❌ Low-level API similar to pdfkit

**Not Recommended**: Better alternatives exist for document generation

---

### **Engineering Effort Comparison: pdfmake vs Puppeteer**

#### Code Complexity Example: Rendering a Medical Submission

**Scenario**: Generate PDF for a Work Permit medical exam with patient info, vitals, test results, and declaration.

##### **pdfmake Implementation** (~200-300 lines per exam type)

```typescript
// pdf.service.ts with pdfmake
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

async generateSubmissionPdf(submission: MedicalSubmission): Promise<Buffer> {
  const docDefinition = {
    content: [
      // Header section - manual layout
      {
        columns: [
          { text: submission.clinic.name, style: 'header' },
          { text: `Submission ID: ${submission.id}`, style: 'subheader', alignment: 'right' }
        ]
      },
      { text: 'Medical Examination Report', style: 'title', margin: [0, 20, 0, 10] },
      
      // Patient Information - manual table definition
      {
        style: 'table',
        table: {
          headerRows: 1,
          widths: [120, '*'],
          body: [
            [{ text: 'Patient Information', colSpan: 2, style: 'tableHeader' }, {}],
            ['NRIC/FIN', submission.patientNric],
            ['Name', submission.patientName],
            ['Date of Birth', new Date(submission.patientDateOfBirth).toLocaleDateString()],
            ['Gender', submission.patientGender],
            ['Examination Date', new Date(submission.examinationDate).toLocaleDateString()]
          ]
        }
      },
      
      // Body Measurements - conditional rendering, manual
      ...(submission.formData.height ? [{
        style: 'table',
        margin: [0, 20, 0, 0],
        table: {
          headerRows: 1,
          widths: [120, '*'],
          body: [
            [{ text: 'Body Measurements', colSpan: 2, style: 'tableHeader' }, {}],
            ['Height', `${submission.formData.height} cm`],
            ['Weight', `${submission.formData.weight} kg`],
            ['Blood Pressure', submission.formData.bloodPressure || '-']
          ]
        }
      }] : []),
      
      // Test Results - exam-specific logic
      {
        style: 'table',
        margin: [0, 20, 0, 0],
        table: {
          headerRows: 1,
          widths: [120, '*'],
          body: [
            [{ text: 'Test Results', colSpan: 2, style: 'tableHeader' }, {}],
            ['HIV Test', submission.formData.hivTest || 'Not specified'],
            ['TB Test', submission.formData.tbTest || 'Not specified']
          ]
        }
      },
      
      // Remarks section
      ...(submission.formData.remarks ? [{
        text: 'Remarks',
        style: 'sectionHeader',
        margin: [0, 20, 0, 5]
      }, {
        text: submission.formData.remarks,
        style: 'remarks'
      }] : []),
      
      // Declaration - only if submitted
      ...(submission.status === 'submitted' ? [{
        text: 'Declaration',
        style: 'sectionHeader',
        margin: [0, 20, 0, 5],
        pageBreak: 'before'
      }, {
        text: 'I certify that I have personally examined the patient...',
        style: 'declaration'
      }, {
        columns: [
          { text: `Doctor: ${submission.approvedBy?.name}`, width: '*' },
          { text: `MCR: ${submission.approvedBy?.mcrNumber}`, width: 'auto' }
        ],
        margin: [0, 20, 0, 0]
      }] : [])
    ],
    
    // Define all styles manually
    styles: {
      header: { fontSize: 18, bold: true },
      title: { fontSize: 16, bold: true },
      tableHeader: { bold: true, fillColor: '#f3f4f6', fontSize: 12 },
      sectionHeader: { fontSize: 14, bold: true },
      table: { margin: [0, 5, 0, 5] },
      remarks: { fontSize: 10, italics: true },
      declaration: { fontSize: 10, margin: [0, 5, 0, 5] }
    }
  };
  
  return new Promise((resolve, reject) => {
    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer((buffer) => resolve(buffer));
  });
}
```

**For 9 exam types, you need**:
- 9 separate document definitions (~200 lines each = **1800 lines**)
- Manual table layouts for each section
- Conditional logic for each exam type's specific fields
- Custom styling for every element
- Manual positioning and spacing

##### **Puppeteer Implementation** (~50-100 lines total)

```typescript
// pdf.service.ts with Puppeteer
import * as puppeteer from 'puppeteer';

async generateSubmissionPdf(submission: MedicalSubmission): Promise<Buffer> {
  const html = this.renderTemplate(submission);
  const page = await this.browser.newPage();
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
  });
  
  await page.close();
  return pdf;
}

private renderTemplate(submission: MedicalSubmission): string {
  // Reuse existing component logic
  const patientName = this.getDisplayName(submission);
  const examTypeLabel = formatExamTypeFull(submission.examType);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; font-size: 14pt; margin-bottom: 10px; border-bottom: 2px solid #333; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          td:first-child { font-weight: bold; width: 150px; }
          .remarks { background: #f9f9f9; padding: 10px; margin: 10px 0; }
          @media print { .section { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${submission.clinic.name}</h2>
          <p>Submission ID: ${submission.id}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Patient Information</div>
          <table>
            <tr><td>NRIC/FIN</td><td>${submission.patientNric}</td></tr>
            <tr><td>Name</td><td>${patientName}</td></tr>
            <tr><td>Date of Birth</td><td>${new Date(submission.patientDateOfBirth).toLocaleDateString()}</td></tr>
            <tr><td>Gender</td><td>${submission.patientGender}</td></tr>
            <tr><td>Examination Date</td><td>${new Date(submission.examinationDate).toLocaleDateString()}</td></tr>
          </table>
        </div>
        
        ${this.renderExamSpecificContent(submission)}
        
        ${submission.formData.remarks ? `
          <div class="section">
            <div class="section-title">Remarks</div>
            <div class="remarks">${submission.formData.remarks}</div>
          </div>
        ` : ''}
        
        ${submission.status === 'submitted' ? this.renderDeclaration(submission) : ''}
      </body>
    </html>
  `;
}

private renderExamSpecificContent(submission: MedicalSubmission): string {
  // Import existing component rendering logic
  if (submission.examType === 'WORK_PERMIT') {
    return WorkPermitPdfTemplate(submission);
  }
  // ... other exam types
}
```

**For 9 exam types**:
- 1 main template (~100 lines)
- 9 small exam-specific helpers (~20 lines each = **180 lines**)
- Can reuse existing ViewSubmission component logic
- CSS handles all styling (familiar syntax)
- **Total: ~300 lines vs 1800 lines**

---

#### Task Breakdown Comparison

##### **pdfmake Implementation**

| Phase | Task | Effort | Complexity |
|-------|------|--------|------------|
| **Phase 1: Setup** | Install pdfmake, configure fonts | 0.5h | Low |
| **Phase 2: Base Service** | Create PDF service with pdfmake | 1h | Low |
| **Phase 3: Document Structure** | Design base document definition structure | 2h | Medium |
| **Phase 4: Patient Info Section** | Build patient info table layout | 2h | Medium |
| **Phase 5: Vitals Section** | Build body measurements table | 1.5h | Medium |
| **Phase 6: Work Permit Fields** | Build test results table for Work Permit | 2h | Medium |
| **Phase 7: MDW Fields** | Build test results for Six-Monthly MDW | 2h | Medium |
| **Phase 8: FMW Fields** | Build test results for Six-Monthly FMW | 2h | Medium |
| **Phase 9: ICA Fields** | Build test results for ICA exams (3 types) | 4h | Medium-High |
| **Phase 10: Driver Exam Fields** | Build complex driver exam sections (3 types) | 6h | High |
| **Phase 11: Full Medical Exam** | Build accordion-style medical history sections | 8h | High |
| **Phase 12: Declaration Section** | Build declaration with conditional logic | 2h | Medium |
| **Phase 13: Styling** | Fine-tune all styles, spacing, page breaks | 4h | Medium-High |
| **Phase 14: Conditional Rendering** | Add logic for status-based rendering | 2h | Medium |
| **Phase 15: Name Masking** | Implement patient name masking logic | 1h | Low |
| **Phase 16: Testing** | Test all 9 exam types, fix layout issues | 6h | Medium-High |
| **Phase 17: Refinement** | Fix alignment, spacing, formatting issues | 4h | Medium |
| **Total** | | **~50-55 hours** | **Medium-High** |

**Challenges**:
- Manual positioning and spacing for every element
- Debugging layout issues requires trial and error
- Different exam types need separate document definitions
- Hard to maintain consistency across exam types
- Difficult to match existing UI exactly

##### **Puppeteer Implementation**

| Phase | Task | Effort | Complexity |
|-------|------|--------|------------|
| **Phase 1: Setup** | Install Puppeteer, update Dockerfile | 1h | Low |
| **Phase 2: Base Service** | Create PDF service with browser lifecycle | 1.5h | Low |
| **Phase 3: HTML Template Base** | Create base HTML template structure | 1h | Low |
| **Phase 4: CSS Styling** | Add CSS for professional document look | 1.5h | Low |
| **Phase 5: Patient Info Section** | HTML table for patient info | 0.5h | Low |
| **Phase 6: Reuse Exam Components** | Import/adapt existing ViewSubmission logic | 3h | Low-Medium |
| **Phase 7: Work Permit Template** | HTML template for Work Permit | 1h | Low |
| **Phase 8: MDW Template** | HTML template for MDW | 1h | Low |
| **Phase 9: FMW Template** | HTML template for FMW | 1h | Low |
| **Phase 10: ICA Templates** | HTML templates for ICA exams (3 types) | 2h | Low-Medium |
| **Phase 11: Driver Exam Templates** | HTML templates for driver exams (3 types) | 3h | Medium |
| **Phase 12: Full Medical Exam** | HTML template for FME with sections | 2h | Medium |
| **Phase 13: Declaration Section** | HTML template for declaration | 1h | Low |
| **Phase 14: Conditional Rendering** | Status-based template logic | 1h | Low |
| **Phase 15: Name Masking** | Reuse existing name masking function | 0.5h | Low |
| **Phase 16: Testing** | Test all 9 exam types, fix CSS issues | 3h | Low-Medium |
| **Phase 17: Print Optimization** | Add print media queries, page breaks | 1h | Low |
| **Total** | | **~25-28 hours** | **Low-Medium** |

**Advantages**:
- HTML/CSS is familiar to developers
- Can copy structure from ViewSubmission page
- CSS handles consistent styling automatically
- Visual debugging is easier (open HTML in browser)
- Changes are faster (HTML is more forgiving than pdfmake)

---

#### Engineering Effort Summary

|  | **pdfmake** | **Puppeteer** | **Difference** |
|---|-------------|---------------|----------------|
| **Initial Implementation** | 50-55 hours | 25-28 hours | **~50% faster** |
| **Lines of Code** | ~1800-2000 | ~300-500 | **~75% less code** |
| **Complexity** | Medium-High | Low-Medium | **Easier** |
| **Debugging Effort** | High (trial and error) | Low (visual preview) | **Much easier** |
| **Maintenance** | High (update 9 templates) | Low (centralized CSS) | **Much easier** |
| **Adding New Exam Type** | 4-6 hours | 1-2 hours | **~70% faster** |
| **UI Consistency** | Manual matching | Automatic (reuse components) | **Guaranteed** |
| **Developer Experience** | Frustrating (declarative API) | Smooth (familiar HTML/CSS) | **Better** |

---

#### AI Agent Impact on Engineering Effort

**With AI Assistant (like GitHub Copilot or this conversation)**:

##### pdfmake with AI
- **Initial Implementation**: 50-55h → **~35-40h** (30% reduction)
  - AI can generate table definitions
  - Still requires manual tweaking and debugging
  - Layout issues need human problem-solving
  - AI struggles with complex positioning logic

##### Puppeteer with AI
- **Initial Implementation**: 25-28h → **~15-18h** (40% reduction)
  - AI excels at generating HTML/CSS
  - Can copy-paste from ViewSubmission components
  - CSS issues are easier to describe to AI
  - AI can generate complete templates quickly

**Net Result with AI**:
- pdfmake: ~35-40 hours
- Puppeteer: ~15-18 hours
- **Puppeteer is still ~55% faster even with AI assistance**

**Why Puppeteer benefits more from AI**:
1. HTML/CSS is in AI's training data more than pdfmake's API
2. Can show AI existing ViewSubmission code to replicate
3. CSS debugging prompts are clearer ("make this bold" vs "adjust widths[1]")
4. HTML is more composable (AI can generate small snippets)

---

### **Final Choice: pdfmake**

**Decision Rationale**:
1. **Deployment Simplicity**: No Docker changes required, no Chromium dependencies, Alpine base image stays as-is
2. **Performance**: Fast generation (~100-500ms vs 2-5s), low memory footprint (~10-20MB vs 50-100MB per PDF)
3. **Package Size**: Lightweight (~2MB vs 280MB), minimal impact on Docker image size
4. **Production Stability**: No browser process to manage, fewer moving parts, more predictable resource usage
5. **Cost Efficiency**: Can run on smaller EC2 instances (t3.small vs t3.large), ~$50/month savings
6. **Scalability**: Better suited for high-volume generation (5000+ PDFs/day) without memory concerns
7. **Team Decision**: Client prefers operational simplicity over development speed

**Trade-offs Accepted**:
- ❌ More initial development time (~50-55 hours vs ~25-28 hours)
- ❌ More code to maintain (~1800 lines vs ~300 lines)
- ❌ Steeper learning curve for declarative API
- ❌ More manual work for each exam type
- ✅ **However**: These are one-time costs vs ongoing operational benefits

**Mitigation for Development Complexity**:
- Use AI assistance extensively to generate document definitions
- Create reusable helper functions for common patterns (tables, sections, headers)
- Build incrementally, starting with simplest exam type (Work Permit)
- Copy-paste and adapt patterns across exam types
- Use pdfmake playground (http://pdfmake.org/playground.html) for rapid prototyping

**When to Reconsider**:
- If development time becomes a blocker (can switch to Puppeteer mid-implementation)
- If maintaining 9 exam type definitions becomes too burdensome
- If visual consistency with UI becomes critical requirement
- If team struggles with declarative API despite AI assistance

## Backend Implementation

### Module Structure
```
backend/src/pdf/
├── pdf.module.ts          # NestJS module
├── pdf.service.ts         # PDF generation logic
├── pdf.controller.ts      # HTTP endpoints
└── templates/
    ├── base.html          # Base template with styles
    └── submission.html    # Submission details template
```

### API Endpoint

**Route**: `GET /v1/submissions/:id/pdf`

**Authentication**: JwtAuthGuard (required)

**Authorization**: Same rules as `GET /v1/submissions/:id`
- Admin: Can download any submission in their clinic
- Creator: Can download submissions they created
- Approver: Can download submissions they approved
- Assigned Doctor: Can download submissions assigned to them
- Same Clinic: Can download submissions from their clinic

**Response**:
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="SUB-{id}.pdf"`
- Status: 200 OK (success), 403 Forbidden, 404 Not Found, 500 Internal Server Error

**Error Handling**:
- 404: Submission not found
- 403: User not authorized to access submission
- 500: PDF generation failed (log error, return generic message)

### PDF Service Design

```typescript
@Injectable()
export class PdfService {
  private fonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
  };

  async generateSubmissionPdf(submission: MedicalSubmission): Promise<Buffer> {
    // 1. Build document definition based on exam type
    const docDefinition = this.buildDocumentDefinition(submission);
    
    // 2. Create PDF with pdfmake
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    
    // 3. Generate buffer
    return new Promise((resolve, reject) => {
      pdfDocGenerator.getBuffer((buffer) => {
        if (buffer) resolve(buffer);
        else reject(new Error('Failed to generate PDF buffer'));
      });
    });
  }

  private buildDocumentDefinition(submission: MedicalSubmission): any {
    return {
      content: [
        this.buildHeader(submission),
        this.buildPatientInfo(submission),
        this.buildExamSpecificContent(submission),
        this.buildRemarks(submission),
        this.buildDeclaration(submission)
      ],
      styles: this.getStyles(),
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10
      }
    };
  }

  private buildHeader(submission: MedicalSubmission): any {
    return {
      columns: [
        { text: submission.clinic.name, style: 'header' },
        { text: `Submission ID: ${submission.id}`, style: 'subheader', alignment: 'right' }
      ],
      margin: [0, 0, 0, 20]
    };
  }

  private buildPatientInfo(submission: MedicalSubmission): any {
    return {
      style: 'table',
      table: {
        headerRows: 1,
        widths: [120, '*'],
        body: [
          [{ text: 'Patient Information', colSpan: 2, style: 'tableHeader' }, {}],
          ['NRIC/FIN', submission.patientNric],
          ['Name', this.getDisplayName(submission)],
          ['Date of Birth', new Date(submission.patientDateOfBirth).toLocaleDateString()],
          ['Gender', submission.patientGender],
          ['Examination Date', new Date(submission.examinationDate).toLocaleDateString()]
        ]
      },
      layout: 'lightHorizontalLines'
    };
  }

  private buildExamSpecificContent(submission: MedicalSubmission): any[] {
    // Route to specific exam type builder
    switch (submission.examType) {
      case 'WORK_PERMIT':
        return this.buildWorkPermitContent(submission);
      case 'SIX_MONTHLY_MDW':
        return this.buildMdwContent(submission);
      case 'SIX_MONTHLY_FMW':
        return this.buildFmwContent(submission);
      // ... other exam types
      default:
        return [];
    }
  }

  private getStyles() {
    return {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 12, color: '#666' },
      tableHeader: { bold: true, fillColor: '#f3f4f6', fontSize: 12 },
      sectionHeader: { fontSize: 14, bold: true, margin: [0, 15, 0, 5] },
      table: { margin: [0, 5, 0, 15] },
      remarks: { fontSize: 10, italics: true, margin: [0, 5, 0, 5] }
    };
  }
}
```

### PDF Template Design

**Layout**:
1. **Header**: Clinic name, logo (if available), submission ID
2. **Patient Information Section**: NRIC, name, DOB, gender, etc.
3. **Exam Details Section**: Exam type, examination date, vitals, test results
4. **Exam-Specific Fields**: Conditional rendering based on exam type
5. **Remarks**: Medical remarks from nurse/doctor
6. **Declaration**: Official declaration text (for submitted exams)
7. **Footer**: Doctor signature, MCR number, clinic details, generation date

**Styling**:
- Professional medical document aesthetic
- Black and white for printing
- Clear section headers
- Table layout for structured data
- Page breaks handled automatically
- A4 page size (210mm x 297mm)

**Conditional Rendering**:
- Hide body measurements for ICA/FMW exams (as per existing UI)
- Show exam-specific fields based on exam type
- Only show declaration for submitted/approved exams
- Mask patient names for draft/pending submissions (as per existing UI)

## Frontend Implementation

### ViewSubmission Component Changes

**Location of Download Button**:
- Place in header area next to status badge
- Only visible for submitted/approved submissions
- Disabled while PDF is generating

**UI Flow**:
1. User views submission details
2. Download button appears if authorized and status is submitted/approved
3. User clicks "Download PDF"
4. Button shows loading spinner
5. API call to `/v1/submissions/:id/pdf`
6. Browser receives PDF and triggers download
7. Button returns to normal state

**Error Handling**:
- Network errors: Show toast "Failed to download PDF. Please try again."
- 403 Forbidden: Show toast "You don't have permission to download this PDF"
- 500 Server Error: Show toast "PDF generation failed. Please contact support."

### API Client

```typescript
// frontend/src/services/submissions.service.ts
async downloadPdf(id: string): Promise<Blob> {
  const response = await fetch(`${API_URL}/submissions/${id}/pdf`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to download PDF');
  }
  
  return response.blob();
}
```

## Data Flow

### 1. Authorization Check
```
Frontend → Backend
Request: GET /v1/submissions/:id/pdf
Headers: Authorization: Bearer <JWT>

Backend validates:
- JWT is valid
- User exists
- User has access to submission (same logic as GET /v1/submissions/:id)
```

### 2. Submission Retrieval
```
Backend queries database with full includes:
- createdBy (name, MCR)
- approvedBy (name, MCR)
- assignedDoctor (name, MCR)
- clinic (name, HCI code, phone, address)
```

### 3. PDF Generation
```
Backend:
1. Render HTML template with submission data
2. Launch Puppeteer page
3. Set HTML content
4. Generate PDF buffer
5. Stream to client
```

### 4. File Download
```
Backend → Frontend
Response: application/pdf
Content-Disposition: attachment; filename="SUB-{id}.pdf"

Frontend:
1. Receive blob
2. Create download link
3. Trigger browser download
4. Cleanup
```

## Performance Considerations

### Backend Performance with pdfmake
- **PDF Generation Time**: ~100-500ms per PDF (5-10x faster than Puppeteer)
- **Concurrent Requests**: Can handle many concurrent generations (no browser limitation)
- **Memory Usage**: ~10-20MB per PDF generation (5x less than Puppeteer)
- **CPU Usage**: ~20-30% of 1 vCPU per generation
- **No Startup Overhead**: Instant, no browser launch delay

### Optimizations
- Add timeout to prevent hanging (5 seconds max, vs 30s for Puppeteer)
- Implement request queue for high traffic (e.g., max 20 concurrent generations)
- Consider adding caching for recently generated PDFs (future enhancement)
- Monitor generation times and alert if exceeding 1 second

### EC2 Sizing for 5000 PDFs/day

**Traffic Pattern Analysis**:
- 5000 PDFs per day = ~208 PDFs per hour (assuming 24-hour spread)
- Peak hours (9 AM - 5 PM, 8 hours): ~625 PDFs per hour = ~10.4 PDFs per minute
- Average: ~3.5 PDFs per minute
- Peak (assume 3x average during busy hours): ~31 PDFs per minute

**Resource Requirements per PDF (pdfmake)**:
- Generation time: 100-500ms (avg 300ms)
- Memory: 10-20MB per concurrent generation
- CPU: ~20-30% of 1 vCPU during generation

**Recommended EC2 Instance: t3.small or t3.medium (much smaller than Puppeteer!)**

#### Option 1: **t3.small** (Recommended for 5000 PDFs/day)
```
Specs:
- 2 vCPUs
- 2 GB RAM
- Burstable CPU performance
- ~$15-17/month

Capacity:
- Can handle 10-15 concurrent PDF generations (pdfmake is lightweight!)
- ~120-180 PDFs per minute sustained
- More than sufficient for 5000 PDFs/day (~10 PDFs/min peak)

Pros:
- Very cost-effective ($15/month vs $65/month for Puppeteer)
- 2GB RAM sufficient for 15-20 concurrent pdfmake generations
- CPU credits easily handle peak bursts (pdfmake is CPU-light)
- Huge headroom for growth (can handle 20,000+ PDFs/day)

Cons:
- Less powerful than larger instances
- May throttle if running other heavy workloads

Best For:
- 5000 PDFs/day with pdfmake
- Cost-conscious deployments
- Most production scenarios
```

#### Option 2: **t3.medium** (Over-provisioned but safer)
```
Specs:
- 2 vCPUs
- 4 GB RAM
- Burstable CPU performance
- ~$30-35/month

Capacity:
- Can handle 20-30 concurrent PDF generations
- ~240-360 PDFs per minute sustained
- Massive overkill for 5000 PDFs/day

Pros:
- Even more headroom
- Can handle other workloads alongside PDF generation
- Better CPU credit balance
- Room for 5x growth (25,000 PDFs/day)

Cons:
- 2x cost of t3.small
- Likely overprovisioned for current needs

Best For:
- If backend handles other heavy workloads
- If you want maximum safety margin
- If growth to 20,000+ PDFs/day is expected
```

#### Option 3: **Keep current instance** (if already on t3.medium+)
If your backend is already running on t3.medium or larger, **no upgrade needed** - pdfmake will use minimal resources.

**Recommendation for 5000 PDFs/day**: **t3.small** ⭐

**Reasoning**:
1. **Perfect Match**: pdfmake's low memory footprint (10-20MB) means 2GB can handle 15-20 concurrent generations
2. **Fast Generation**: 100-500ms means you can process 2-10 PDFs per second per instance
3. **Huge Headroom**: Can handle 120+ PDFs/minute vs needed ~10 PDFs/minute peak
4. **Cost Savings**: ~$50/month cheaper than t3.large recommended for Puppeteer
5. **Scalability**: Can handle 4-5x growth before needing upgrade

**Cost Comparison**:
- pdfmake on t3.small: ~$15-17/month
- Puppeteer on t3.large: ~$60-70/month
- **Savings: ~$50/month (~75% cost reduction)**

**Scaling Considerations**:
- **If traffic grows to 20,000+ PDFs/day**: Upgrade to t3.medium (~$30/month)
- **If traffic is highly bursty**: Current t3.small can handle bursts easily
- **If traffic exceeds 50,000 PDFs/day**: Consider t3.large or horizontal scaling

**Monitoring Metrics**:
- Track CPU credits (should stay healthy with pdfmake)
- Monitor memory usage (should stay below 50% with pdfmake)
- Alert on PDF generation times >1 second (pdfmake baseline is <500ms)
- Track concurrent PDF generations (should stay below 15-20 on t3.small)

## Security Considerations

### 1. Server-Side Only
- PDF generation happens exclusively on backend
- Frontend cannot manipulate PDF content
- No client-side PDF libraries used

### 2. Authorization
- Reuse existing submission access control logic
- Verify user can access submission before generating PDF
- Same rules as viewing submission details

### 3. Input Validation
- Validate submission ID is valid UUID format
- Check submission exists before generation
- Sanitize any user-generated content in PDF

### 4. Rate Limiting (Future)
- Consider adding rate limits (e.g., 10 PDFs per user per minute)
- Prevent abuse and resource exhaustion

## Testing Strategy

### Unit Tests
```typescript
describe('PdfService', () => {
  it('should generate PDF from submission data')
  it('should include clinic header information')
  it('should render exam-specific fields correctly')
  it('should handle missing optional fields gracefully')
  it('should mask patient names for draft submissions')
  it('should include declaration for submitted exams')
})
```

### E2E Tests
```typescript
describe('GET /v1/submissions/:id/pdf', () => {
  it('should download PDF for authorized doctor')
  it('should download PDF for nurse who created submission')
  it('should return 403 for unauthorized user')
  it('should return 404 for non-existent submission')
  it('should return valid PDF with correct content-type')
  it('should include correct filename in header')
})
```

### Manual Testing
- Verify PDF content matches submission details page
- Test all exam types (MDW, FMW, Work Permit, Driver exams, ICA, FME)
- Test with different submission statuses
- Verify formatting and layout on different PDF viewers
- Test multi-page PDFs with long remarks

## Deployment Considerations

### Docker Changes Required

#### Good News: Minimal Changes with pdfmake

Your current `backend/Dockerfile` uses `node:22-alpine` which **works perfectly with pdfmake** - no changes needed! pdfmake is a pure Node.js library with no system dependencies.

#### Optional: Add Custom Fonts (Recommended)

pdfmake comes with standard fonts, but you can add custom fonts for better aesthetics:

```dockerfile
# In backend/Dockerfile - add after WORKDIR /app
# Optional: Copy custom fonts for pdfmake
COPY fonts ./fonts
```

**No other Dockerfile changes required!**

#### docker-compose.ec2.yml Changes

**Minimal changes - only environment variables**:

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  environment:
    # ... existing vars ...
    - PDF_GENERATION_TIMEOUT=30000  # Optional timeout setting
```

**No memory increase needed** - pdfmake uses ~10-20MB per generation vs Puppeteer's 50-100MB.

### Build Process Changes

#### Build Time Impact
```
Before pdfmake:
- Build time: ~3-5 minutes
- Image size: ~150MB
- Dependencies: Node.js only

After pdfmake:
- Build time: ~3-5 minutes (unchanged)
- Image size: ~152MB (+2MB for pdfmake)
- Dependencies: Node.js + pdfmake (~2MB)
```

**Result: Virtually no impact on build process!**

#### Local Development
**No changes to local dev workflow**:
```bash
# Just install the package
npm install pdfmake

# pdfmake includes fonts by default, ready to use
```

#### CI/CD Pipeline
**No special changes required** - pdfmake works like any other npm package.

### Package Installation

```bash
# In backend directory
npm install pdfmake
npm install --save-dev @types/pdfmake  # TypeScript types
```

Add to `backend/package.json`:
```json
{
  "dependencies": {
    "pdfmake": "^0.2.10"
  },
  "devDependencies": {
    "@types/pdfmake": "^0.2.9"
  }
}
```

### Custom Fonts Setup (Optional)

1. **Download fonts** (e.g., Roboto, Arial):
```bash
# In backend directory
mkdir -p fonts
# Download .ttf files to fonts/ directory
```

2. **Configure in PDF service**:
```typescript
const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  }
};

const printer = new pdfMake(fonts);
```

Or use **default fonts** (Roboto included):
```typescript
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
// Ready to use with default Roboto fonts
```

### Environment Variables
```bash
# .env file additions (optional)
PDF_GENERATION_TIMEOUT=30000
```

### Performance Characteristics

**pdfmake Performance**:
- Generation time: ~100-500ms per PDF
- Memory usage: ~10-20MB per concurrent generation
- CPU usage: ~20-30% of 1 vCPU during generation
- No browser process to manage
- Fast startup (no browser launch delay)

**EC2 Sizing Impact**:
- Can use **t3.small** instead of t3.large for 5000 PDFs/day
- ~$50/month cost savings compared to Puppeteer
- Less memory pressure = more stable under load

### Health Check Considerations
No changes needed - pdfmake has no startup overhead:
```yaml
backend:
  healthcheck:
    test: ["CMD", "node", "-e", "require('http').get('http://localhost:3344/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s  # No change needed
```

### Monitoring
- Log PDF generation times (expect 100-500ms)
- Track failures and error rates
- Monitor memory usage (should be low, ~10-20MB per generation)
- Alert on generation times >2 seconds (indicates issue)

### Deployment Checklist
- [ ] Install pdfmake: `npm install pdfmake`
- [ ] Install types: `npm install --save-dev @types/pdfmake`
- [ ] (Optional) Add custom fonts to `backend/fonts/` directory
- [ ] Add `PDF_GENERATION_TIMEOUT=30000` to `.env` file
- [ ] Test locally: Generate sample PDF and verify output
- [ ] Build Docker image: `docker build -t checkup-backend:test ./backend`
- [ ] Verify image size is ~152MB (not 400MB+)
- [ ] Test PDF generation in container
- [ ] Deploy to staging - no special considerations needed
- [ ] Monitor generation times (should be <500ms)
- [ ] Deploy to production

### Deployment Advantages with pdfmake
✅ No Dockerfile changes required
✅ No Docker image size increase (~2MB only)
✅ No system dependencies to manage
✅ Works with existing Alpine base image
✅ No Chromium installation or configuration
✅ Faster deployments (same build time)
✅ Lower memory requirements
✅ Can use smaller EC2 instances
✅ Simpler CI/CD pipeline
✅ Less operational complexity

## Future Enhancements
1. **Digital Signatures**: Add cryptographic signatures to PDFs
2. **Watermarks**: Add "OFFICIAL" or "COPY" watermarks
3. **Batch Generation**: Generate multiple PDFs in one request
4. **Email Integration**: Email PDF directly to patient
5. **Caching**: Cache generated PDFs for faster re-downloads
6. **Template Customization**: Per-clinic PDF templates
7. **Compression**: Optimize PDF file size
