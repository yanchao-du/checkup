# MOH Doctor Verification Integration - Technical Proposal

**Date**: 9 December 2025  
**Status**: Proposal  
**Author**: System Architecture Team  
**Stakeholders**: CheckUp Medical Submissions Team, MOH Integration Team

---

## Executive Summary

This proposal outlines technical approaches to integrate with the Ministry of Health (MOH) doctor registry to verify registered doctors before allowing medical submissions to government agencies (MOM, ICA, SPF). The system will validate:

- Doctor's NRIC/FIN
- Doctor's full name
- Medical Council Registration (MCR) number

**Recommendation**: **Hybrid Approach** (Real-time API + Daily batch sync) for optimal balance of data freshness, system reliability, and user experience.

---

## Table of Contents

1. [Business Requirements](#business-requirements)
2. [Current System Analysis](#current-system-analysis)
3. [Technical Approaches](#technical-approaches)
4. [Comparative Analysis](#comparative-analysis)
5. [Recommended Solution](#recommended-solution)
6. [Implementation Plan](#implementation-plan)
7. [Risk Assessment](#risk-assessment)
8. [Appendices](#appendices)

---

## Business Requirements

### Functional Requirements

| ID | Requirement | Priority | Agency Impact |
|----|-------------|----------|---------------|
| FR-1 | Verify doctor is registered with MOH before submission | **CRITICAL** | MOM, ICA, SPF |
| FR-2 | Validate MCR number matches NRIC/FIN | **CRITICAL** | All agencies |
| FR-3 | Support name matching with tolerance for variations | **HIGH** | All agencies |
| FR-4 | Block/flag submissions by unverified doctors | **CRITICAL** | All agencies |
| FR-5 | Allow whitelist override for special cases | **MEDIUM** | Internal use |
| FR-6 | Audit trail for verification checks | **HIGH** | Compliance |

### Non-Functional Requirements

| ID | Requirement | Target | Impact |
|----|-------------|--------|--------|
| NFR-1 | Verification response time | < 3 seconds | User experience |
| NFR-2 | System availability | 99.5% | Business continuity |
| NFR-3 | Data freshness | Daily updates | Compliance |
| NFR-4 | Fallback mechanism | Graceful degradation | Reliability |
| NFR-5 | Scalability | 1000 verifications/day | Growth support |

---

## Current System Analysis

### Database Schema (Relevant Tables)

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String
  role         UserRole  // 'doctor' | 'nurse' | 'admin'
  nric         String?   @unique  // ← Used for MOH verification
  mcrNumber    String?   @unique  // ← Must match MOH registry
  clinicId     String
  status       UserStatus @default(active)
  
  // Relationships
  approvedSubmissions  MedicalSubmission[] @relation("ApprovedBy")
  assignedSubmissions  MedicalSubmission[] @relation("AssignedDoctor")
  createdSubmissions   MedicalSubmission[] @relation("CreatedBy")
}

model MedicalSubmission {
  id              String   @id @default(uuid())
  status          String   // 'draft' | 'pending_approval' | 'submitted' | 'rejected'
  examType        String   // Determines agency (MOM/ICA/SPF)
  
  createdById     String
  approvedById    String?  // ← Doctor who approved (must be verified)
  assignedDoctorId String? // ← Doctor assigned to review (must be verified)
  
  submittedDate   DateTime?
  
  createdBy       User @relation("CreatedBy")
  approvedBy      User? @relation("ApprovedBy")
  assignedDoctor  User? @relation("AssignedDoctor")
}
```

### Submission Workflow Points for Verification

```typescript
// Critical verification points:

1. **Doctor Creation/Update** (users.service.ts)
   - Verify MCR/NRIC when doctor account is created
   - Re-verify when MCR number is updated

2. **Submission Approval** (approvals.service.ts:approve())
   - Verify approving doctor before setting status='submitted'
   - Block approval if doctor not verified

3. **Direct Doctor Submission** (submissions.service.ts:create())
   - Verify doctor when userRole='doctor' and status='submitted'
   - Block submission if doctor not verified

4. **Nurse Assignment** (submissions.service.ts:create())
   - Verify assigned doctor when nurse routes for approval
   - Warn if assigned doctor not verified
```

### Current Validation Logic

```typescript
// Current: Basic format validation only
// File: backend/src/users/dto/create-user.dto.ts

@IsNotEmpty({ message: 'MCR Number is required for doctors' })
@Matches(/^[A-Z]\d{5}[A-Z]$/, {
  message: 'MCR Number must be in format: 1 letter + 5 numbers + 1 letter (e.g., M12345A)'
})
mcrNumber?: string;

// ❌ No MOH registry validation
// ❌ No NRIC-MCR matching
// ❌ No name verification
```

---

## Technical Approaches

### Approach 1: Real-Time API Integration

#### Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   CheckUp   │  HTTPS  │     MOH     │  Query  │     MOH     │
│   Backend   │ ──────> │  API Gateway│ ──────> │   Registry  │
│             │ <────── │             │ <────── │   Database  │
└─────────────┘         └─────────────┘         └─────────────┘
      │
      ├─ Create doctor user
      ├─ Approve submission
      ├─ Submit to agency
      └─ Manual verification
```

#### Implementation Details

**API Endpoint (Assumed)**:
```bash
POST https://api.moh.gov.sg/v1/practitioners/verify
Authorization: Bearer {API_KEY}
Content-Type: application/json

Request:
{
  "nric": "S1234567D",
  "mcrNumber": "M12345A",
  "name": "Dr. John Tan"
}

Response (Success):
{
  "verified": true,
  "practitioner": {
    "nric": "S1234567D",
    "mcrNumber": "M12345A",
    "fullName": "TAN KOK BENG, JOHN",
    "registrationDate": "2010-03-15",
    "status": "Active",
    "specializations": ["General Practice"],
    "expiryDate": "2026-03-14"
  }
}

Response (Failed):
{
  "verified": false,
  "reason": "MCR_NOT_FOUND" | "NRIC_MISMATCH" | "NAME_MISMATCH" | "EXPIRED"
}
```

**Service Implementation**:

```typescript
// File: backend/src/moh/moh-verification.service.ts

@Injectable()
export class MohVerificationService {
  private readonly logger = new Logger(MohVerificationService.name);
  private readonly apiUrl = this.configService.get('MOH_API_URL');
  private readonly apiKey = this.configService.get('MOH_API_KEY');
  private readonly timeout = 5000; // 5 second timeout

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private cacheManager: CacheManager,
  ) {}

  async verifyDoctor(
    nric: string,
    mcrNumber: string,
    name: string,
  ): Promise<MohVerificationResult> {
    const cacheKey = `moh:verify:${nric}:${mcrNumber}`;
    
    // Check cache first (TTL: 24 hours)
    const cached = await this.cacheManager.get<MohVerificationResult>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for doctor verification: ${nric}`);
      return cached;
    }

    try {
      const response = await this.httpService.axiosRef.post(
        `${this.apiUrl}/practitioners/verify`,
        { nric, mcrNumber, name },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          timeout: this.timeout,
        },
      );

      const result: MohVerificationResult = {
        verified: response.data.verified,
        verifiedAt: new Date(),
        source: 'realtime_api',
        details: response.data.practitioner,
        reason: response.data.reason,
      };

      // Cache successful verifications for 24 hours
      if (result.verified) {
        await this.cacheManager.set(cacheKey, result, 86400);
      }

      return result;
    } catch (error) {
      this.logger.error(`MOH API verification failed: ${error.message}`);
      
      // Fallback to local cache/database
      return this.fallbackVerification(nric, mcrNumber, name);
    }
  }

  private async fallbackVerification(
    nric: string,
    mcrNumber: string,
    name: string,
  ): Promise<MohVerificationResult> {
    // Check local verification cache table
    const cachedVerification = await this.prisma.doctorVerificationCache.findFirst({
      where: { nric, mcrNumber },
      orderBy: { syncedAt: 'desc' },
    });

    if (cachedVerification && this.isRecentEnough(cachedVerification.syncedAt)) {
      return {
        verified: cachedVerification.isVerified,
        verifiedAt: new Date(),
        source: 'local_cache',
        details: cachedVerification.details,
      };
    }

    // Last resort: mark as unverified but allow with warning
    return {
      verified: false,
      verifiedAt: new Date(),
      source: 'api_unavailable',
      reason: 'MOH_API_UNAVAILABLE',
      allowWithWarning: true,
    };
  }
}
```

**Integration Points**:

```typescript
// 1. User Creation
// File: backend/src/users/users.service.ts

async create(dto: CreateUserDto): Promise<User> {
  if (dto.role === 'doctor') {
    // Verify with MOH
    const verification = await this.mohService.verifyDoctor(
      dto.nric,
      dto.mcrNumber,
      dto.name,
    );

    if (!verification.verified && !verification.allowWithWarning) {
      throw new BadRequestException(
        `Doctor verification failed: ${verification.reason}`,
      );
    }

    if (verification.allowWithWarning) {
      this.logger.warn(
        `Doctor ${dto.email} created with unverified status (MOH API unavailable)`,
      );
    }
  }

  const user = await this.prisma.user.create({
    data: {
      ...dto,
      mohVerified: verification.verified,
      mohVerifiedAt: verification.verifiedAt,
    },
  });

  return user;
}

// 2. Submission Approval
// File: backend/src/approvals/approvals.service.ts

async approve(id: string, doctorId: string, clinicId: string, notes?: string) {
  const doctor = await this.prisma.user.findUnique({
    where: { id: doctorId },
  });

  // Block if doctor not verified
  if (!doctor.mohVerified) {
    const verification = await this.mohService.verifyDoctor(
      doctor.nric,
      doctor.mcrNumber,
      doctor.name,
    );

    if (!verification.verified && !verification.allowWithWarning) {
      throw new ForbiddenException(
        'Doctor must be verified with MOH before approving submissions',
      );
    }

    // Update verification status
    await this.prisma.user.update({
      where: { id: doctorId },
      data: {
        mohVerified: verification.verified,
        mohVerifiedAt: verification.verifiedAt,
      },
    });
  }

  // Proceed with approval...
}
```

#### Pros

✅ **Real-time validation**: Always up-to-date with MOH registry  
✅ **Immediate feedback**: Users know instantly if verification fails  
✅ **No data storage**: No need to sync large datasets  
✅ **Simple architecture**: Direct API calls, no batch jobs  
✅ **Accurate**: Always reflects current MOH status  

#### Cons

❌ **API dependency**: System fails if MOH API is down  
❌ **Latency**: Each verification adds 1-3 seconds to user flow  
❌ **Rate limits**: MOH may impose API call quotas  
❌ **Cost**: Pay-per-call pricing model possible  
❌ **Network issues**: Timeouts in poor connectivity  

---

### Approach 2: SFTP Batch Synchronization

#### Architecture

```
┌─────────────┐                    ┌─────────────┐
│     MOH     │   Daily @ 2 AM     │   CheckUp   │
│ SFTP Server │ ──────────────────>│ SFTP Client │
│             │   doctors.csv      │             │
└─────────────┘                    └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │  ETL Job    │
                                   │  - Download │
                                   │  - Parse    │
                                   │  - Validate │
                                   │  - Load     │
                                   └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │ PostgreSQL  │
                                   │ moh_doctors │
                                   └─────────────┘
```

#### File Format (Expected)

```csv
nric,mcr_number,full_name,specialization,status,registration_date,expiry_date
S1234567D,M12345A,"TAN KOK BENG, JOHN",General Practice,Active,2010-03-15,2026-03-14
S2345678E,M23456B,"LIM MEI LING, SUSAN",Family Medicine,Active,2015-07-20,2027-07-19
S3456789F,M34567C,"KUMAR RAVI",Cardiology,Active,2012-11-10,2028-11-09
```

#### Implementation Details

**Database Schema**:

```prisma
// Add to schema.prisma

model MohDoctorRegistry {
  id                String   @id @default(uuid())
  nric              String   @unique
  mcrNumber         String   @unique @map("mcr_number")
  fullName          String   @map("full_name")
  specialization    String?
  status            String   // 'Active' | 'Suspended' | 'Cancelled'
  registrationDate  DateTime @map("registration_date")
  expiryDate        DateTime? @map("expiry_date")
  
  // Sync metadata
  syncedAt          DateTime @default(now()) @map("synced_at")
  syncBatchId       String   @map("sync_batch_id")
  
  @@index([nric, mcrNumber])
  @@index([status])
  @@index([syncedAt])
  @@map("moh_doctor_registry")
}

model MohSyncLog {
  id              String   @id @default(uuid())
  batchId         String   @unique @map("batch_id")
  startedAt       DateTime @default(now()) @map("started_at")
  completedAt     DateTime? @map("completed_at")
  status          String   // 'running' | 'success' | 'failed'
  recordsProcessed Int     @default(0) @map("records_processed")
  recordsAdded    Int      @default(0) @map("records_added")
  recordsUpdated  Int      @default(0) @map("records_updated")
  recordsDeleted  Int      @default(0) @map("records_deleted")
  errorMessage    String?  @map("error_message")
  
  @@map("moh_sync_logs")
}
```

**SFTP Sync Service**:

```typescript
// File: backend/src/moh/moh-sftp-sync.service.ts

@Injectable()
export class MohSftpSyncService {
  private readonly logger = new Logger(MohSftpSyncService.name);
  
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Cron('0 2 * * *') // Daily at 2 AM SGT
  async syncDoctorRegistry(): Promise<void> {
    const batchId = `sync-${Date.now()}`;
    
    const syncLog = await this.prisma.mohSyncLog.create({
      data: {
        batchId,
        status: 'running',
      },
    });

    try {
      this.logger.log(`Starting MOH doctor registry sync: ${batchId}`);
      
      // 1. Download file from SFTP
      const filePath = await this.downloadFromSftp();
      
      // 2. Parse CSV
      const doctors = await this.parseCSV(filePath);
      
      // 3. Process records
      const stats = await this.processRecords(doctors, batchId);
      
      // 4. Update sync log
      await this.prisma.mohSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'success',
          completedAt: new Date(),
          ...stats,
        },
      });
      
      this.logger.log(`MOH sync completed: ${JSON.stringify(stats)}`);
      
      // 5. Cleanup old records (keep last 30 days)
      await this.cleanupOldRecords();
      
    } catch (error) {
      this.logger.error(`MOH sync failed: ${error.message}`, error.stack);
      
      await this.prisma.mohSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: error.message,
        },
      });
      
      // Send alert
      await this.sendSyncFailureAlert(error);
    }
  }

  private async downloadFromSftp(): Promise<string> {
    const sftp = new SFTPClient();
    
    await sftp.connect({
      host: this.configService.get('MOH_SFTP_HOST'),
      port: 22,
      username: this.configService.get('MOH_SFTP_USERNAME'),
      password: this.configService.get('MOH_SFTP_PASSWORD'),
      // OR use SSH key:
      // privateKey: fs.readFileSync('/path/to/key'),
    });

    const remoteFile = '/exports/doctors_registry.csv';
    const localFile = `/tmp/moh-doctors-${Date.now()}.csv`;
    
    await sftp.get(remoteFile, localFile);
    await sftp.end();
    
    this.logger.log(`Downloaded: ${remoteFile} -> ${localFile}`);
    return localFile;
  }

  private async parseCSV(filePath: string): Promise<MohDoctor[]> {
    const doctors: MohDoctor[] = [];
    
    const stream = fs.createReadStream(filePath)
      .pipe(csvParser());
    
    for await (const row of stream) {
      doctors.push({
        nric: row.nric,
        mcrNumber: row.mcr_number,
        fullName: row.full_name,
        specialization: row.specialization,
        status: row.status,
        registrationDate: new Date(row.registration_date),
        expiryDate: row.expiry_date ? new Date(row.expiry_date) : null,
      });
    }
    
    return doctors;
  }

  private async processRecords(
    doctors: MohDoctor[],
    batchId: string,
  ): Promise<SyncStats> {
    const stats = {
      recordsProcessed: 0,
      recordsAdded: 0,
      recordsUpdated: 0,
      recordsDeleted: 0,
    };

    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < doctors.length; i += batchSize) {
      const batch = doctors.slice(i, i + batchSize);
      
      await this.prisma.$transaction(
        batch.map(doctor => 
          this.prisma.mohDoctorRegistry.upsert({
            where: { nric: doctor.nric },
            create: {
              ...doctor,
              syncBatchId: batchId,
            },
            update: {
              ...doctor,
              syncBatchId: batchId,
              syncedAt: new Date(),
            },
          })
        ),
      );
      
      stats.recordsProcessed += batch.length;
      this.logger.debug(`Processed ${stats.recordsProcessed}/${doctors.length} records`);
    }

    // Count adds vs updates
    const currentBatch = await this.prisma.mohDoctorRegistry.count({
      where: { syncBatchId: batchId },
    });
    
    stats.recordsAdded = currentBatch;
    stats.recordsUpdated = stats.recordsProcessed - currentBatch;
    
    return stats;
  }

  private async cleanupOldRecords(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await this.prisma.mohDoctorRegistry.deleteMany({
      where: {
        syncedAt: { lt: thirtyDaysAgo },
      },
    });
  }
}
```

**Verification Service (Local Lookup)**:

```typescript
// File: backend/src/moh/moh-verification.service.ts

@Injectable()
export class MohVerificationService {
  async verifyDoctor(
    nric: string,
    mcrNumber: string,
    name: string,
  ): Promise<MohVerificationResult> {
    // Look up in local database
    const doctor = await this.prisma.mohDoctorRegistry.findFirst({
      where: {
        nric,
        mcrNumber,
        status: 'Active',
      },
    });

    if (!doctor) {
      return {
        verified: false,
        verifiedAt: new Date(),
        source: 'local_database',
        reason: 'MCR_NOT_FOUND',
      };
    }

    // Check expiry
    if (doctor.expiryDate && doctor.expiryDate < new Date()) {
      return {
        verified: false,
        verifiedAt: new Date(),
        source: 'local_database',
        reason: 'MCR_EXPIRED',
        details: doctor,
      };
    }

    // Name matching (fuzzy)
    const nameMatch = this.fuzzyNameMatch(name, doctor.fullName);
    if (!nameMatch) {
      this.logger.warn(
        `Name mismatch: ${name} vs ${doctor.fullName} for NRIC ${nric}`,
      );
    }

    return {
      verified: true,
      verifiedAt: new Date(),
      source: 'local_database',
      details: doctor,
      nameMatch,
    };
  }

  private fuzzyNameMatch(inputName: string, registryName: string): boolean {
    // Normalize
    const normalize = (name: string) =>
      name.toUpperCase().replace(/[^A-Z]/g, '');
    
    const input = normalize(inputName);
    const registry = normalize(registryName);
    
    // Exact match
    if (input === registry) return true;
    
    // Contains check
    if (registry.includes(input) || input.includes(registry)) return true;
    
    // Levenshtein distance
    const distance = this.levenshteinDistance(input, registry);
    return distance <= 3; // Allow 3 character differences
  }
}
```

#### Pros

✅ **No API dependency**: Works offline, no external calls  
✅ **Fast verification**: Local database lookup (< 100ms)  
✅ **Predictable costs**: No per-call charges  
✅ **Batch efficiency**: Process thousands of records at once  
✅ **Resilient**: Continues working if MOH SFTP is temporarily down  

#### Cons

❌ **Stale data**: Up to 24 hours old  
❌ **Storage overhead**: Need to store entire registry (~50-100k doctors)  
❌ **ETL complexity**: Parsing, validation, error handling  
❌ **Sync failures**: Missed updates if batch job fails  
❌ **Initial setup**: More complex infrastructure  

---

### Approach 3: Hybrid (API + Batch)

#### Architecture

```
┌─────────────────────────────────────────────────────┐
│                 CheckUp Backend                      │
│                                                      │
│  ┌──────────────────────┐    ┌──────────────────┐  │
│  │   Real-time Layer    │    │   Batch Layer    │  │
│  │                      │    │                  │  │
│  │  - Doctor onboarding │    │  - Daily sync    │  │
│  │  - Critical checks   │    │  - Data refresh  │  │
│  │  - Manual verify     │    │  - Cache warming │  │
│  └──────────┬───────────┘    └────────┬─────────┘  │
│             │                         │             │
│             ▼                         ▼             │
│  ┌─────────────────────────────────────────────┐   │
│  │      Local Cache (moh_doctor_registry)       │   │
│  │  - TTL: 24 hours                            │   │
│  │  - Primary lookup source                    │   │
│  │  - Fallback for API failures                │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
            │                         │
            ▼                         ▼
    ┌─────────────┐         ┌─────────────┐
    │  MOH API    │         │ MOH SFTP    │
    │  Gateway    │         │  Server     │
    └─────────────┘         └─────────────┘
```

#### Implementation Strategy

**1. Daily Batch Sync (Background)**:
- Runs at 2 AM SGT daily
- Downloads full doctor registry via SFTP
- Updates local `moh_doctor_registry` table
- Provides baseline data

**2. Real-time API (Critical Paths)**:
- Used for new doctor registration
- Used for manual verification requests
- Used when local cache miss
- Falls back to local cache if API unavailable

**3. Verification Logic**:

```typescript
@Injectable()
export class MohHybridVerificationService {
  async verifyDoctor(
    nric: string,
    mcrNumber: string,
    name: string,
    mode: 'realtime' | 'cached' | 'auto' = 'auto',
  ): Promise<MohVerificationResult> {
    
    // 1. Check local cache first (fastest)
    const cached = await this.checkLocalCache(nric, mcrNumber);
    
    // 2. If cached and recent, return immediately
    if (cached && this.isRecentEnough(cached.syncedAt) && mode !== 'realtime') {
      return {
        verified: cached.status === 'Active',
        verifiedAt: new Date(),
        source: 'local_cache',
        details: cached,
        nameMatch: this.fuzzyNameMatch(name, cached.fullName),
      };
    }

    // 3. For critical operations or cache miss, call API
    if (mode === 'realtime' || mode === 'auto') {
      try {
        const apiResult = await this.callMohApi(nric, mcrNumber, name);
        
        // Update local cache with fresh data
        await this.updateLocalCache(apiResult);
        
        return {
          ...apiResult,
          source: 'realtime_api',
        };
      } catch (error) {
        this.logger.warn(`MOH API failed, falling back to cache: ${error.message}`);
        
        // Fallback to cached data if available
        if (cached) {
          return {
            verified: cached.status === 'Active',
            verifiedAt: new Date(),
            source: 'local_cache_fallback',
            details: cached,
            nameMatch: this.fuzzyNameMatch(name, cached.fullName),
            warning: 'Verification using cached data (API unavailable)',
          };
        }
        
        throw error;
      }
    }

    // 4. No cache, no API success
    throw new BadRequestException('Unable to verify doctor');
  }

  private isRecentEnough(syncedAt: Date): boolean {
    const hoursSinceSync = (Date.now() - syncedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync < 24; // Cache valid for 24 hours
  }
}
```

**4. Usage in Different Scenarios**:

```typescript
// Scenario 1: Doctor Registration (Critical - use API)
async createDoctor(dto: CreateUserDto) {
  const verification = await this.mohService.verifyDoctor(
    dto.nric,
    dto.mcrNumber,
    dto.name,
    'realtime', // Force API call
  );
  
  if (!verification.verified) {
    throw new BadRequestException('Doctor not found in MOH registry');
  }
  
  // Proceed with registration...
}

// Scenario 2: Submission Approval (Fast - use cache)
async approve(submissionId: string, doctorId: string) {
  const doctor = await this.prisma.user.findUnique({ where: { id: doctorId }});
  
  const verification = await this.mohService.verifyDoctor(
    doctor.nric,
    doctor.mcrNumber,
    doctor.name,
    'cached', // Use cache for speed
  );
  
  if (!verification.verified) {
    // Trigger async re-verification
    this.eventEmitter.emit('doctor.reverify', { doctorId });
    
    throw new ForbiddenException('Doctor verification required');
  }
  
  // Proceed with approval...
}

// Scenario 3: Manual Verification (Admin action - use API)
async manualVerify(doctorId: string) {
  const doctor = await this.prisma.user.findUnique({ where: { id: doctorId }});
  
  const verification = await this.mohService.verifyDoctor(
    doctor.nric,
    doctor.mcrNumber,
    doctor.name,
    'realtime', // Force fresh check
  );
  
  await this.prisma.user.update({
    where: { id: doctorId },
    data: {
      mohVerified: verification.verified,
      mohVerifiedAt: verification.verifiedAt,
    },
  });
  
  return verification;
}
```

#### Pros

✅ **Best of both worlds**: Fresh data when needed, fast cache for routine checks  
✅ **High reliability**: Multiple fallback layers  
✅ **Flexible**: Choose strategy per use case  
✅ **Performance**: Fast local lookups, selective API calls  
✅ **Cost-effective**: Minimal API calls  
✅ **Resilient**: Works even if one source fails  

#### Cons

❌ **Complexity**: Two systems to maintain  
❌ **Coordination**: Must keep cache and API in sync  
❌ **More code**: Dual implementation paths  
❌ **Testing**: More scenarios to test  

---

## Comparative Analysis

### Feature Comparison Matrix

| Feature | Real-time API | SFTP Batch | Hybrid | Priority |
|---------|---------------|------------|--------|----------|
| **Data Freshness** | ✅ Immediate | ⚠️ Up to 24h | ✅ Configurable | **HIGH** |
| **Response Time** | ⚠️ 1-3s | ✅ < 100ms | ✅ < 100ms | **HIGH** |
| **Reliability** | ❌ API dependent | ✅ Independent | ✅ High | **CRITICAL** |
| **Cost** | ❌ Per-call fees | ✅ Fixed cost | ✅ Optimized | **MEDIUM** |
| **Complexity** | ✅ Simple | ⚠️ Moderate | ❌ Complex | **MEDIUM** |
| **Storage Needs** | ✅ Minimal | ❌ Full registry | ❌ Full registry | **LOW** |
| **Scalability** | ⚠️ Rate limits | ✅ Unlimited | ✅ Unlimited | **MEDIUM** |
| **Offline Support** | ❌ No | ✅ Yes | ✅ Yes | **HIGH** |

### Use Case Suitability

| Use Case | Real-time API | SFTP Batch | Hybrid | Winner |
|----------|---------------|------------|--------|--------|
| Doctor registration | ✅ Good | ❌ Stale data | ✅ Best | **Hybrid** |
| Submission approval | ⚠️ Slow | ✅ Fast | ✅ Fast | **Hybrid/Batch** |
| Bulk verification | ❌ Expensive | ✅ Efficient | ✅ Efficient | **Batch** |
| Admin manual check | ✅ Fresh | ❌ Stale | ✅ Best | **Hybrid** |
| System health check | ✅ Current | ⚠️ Delayed | ✅ Best | **Hybrid** |

### Cost Analysis (Estimated)

**Assumptions**:
- 500 doctors in system
- 100 new submissions/day
- 50 doctor verifications/day
- MOH API: $0.01 per call

| Approach | Setup Cost | Monthly Operational Cost | Annual Cost |
|----------|------------|--------------------------|-------------|
| **Real-time API** | $2,000 | $1,500 (API calls) | $20,000 |
| **SFTP Batch** | $5,000 | $200 (compute) | $7,400 |
| **Hybrid** | $6,000 | $400 (API + compute) | $10,800 |

### Risk Assessment

| Risk | Real-time API | SFTP Batch | Hybrid | Mitigation |
|------|---------------|------------|--------|-----------|
| MOH API downtime | **HIGH** | **LOW** | **LOW** | Hybrid fallback |
| Stale data issues | **LOW** | **HIGH** | **LOW** | Real-time checks |
| Rate limit breach | **MEDIUM** | **LOW** | **LOW** | Caching layer |
| Data sync failures | **N/A** | **MEDIUM** | **MEDIUM** | Alert + retry |
| Security breach | **MEDIUM** | **MEDIUM** | **MEDIUM** | Encryption |

---

## Recommended Solution

### 🏆 Winner: **Hybrid Approach**

#### Justification

1. **Business Requirement Alignment**:
   - ✅ Critical path verification (doctor registration) uses real-time API
   - ✅ High-performance requirements (submissions) use local cache
   - ✅ Supports both whitelist and blocking strategies
   - ✅ Graceful degradation during outages

2. **Technical Superiority**:
   - Best response times for 90% of operations
   - Resilient to both API and network failures
   - Flexible verification strategies per use case
   - Optimal cost profile

3. **Risk Mitigation**:
   - Multiple fallback layers
   - Works offline with recent data
   - No single point of failure
   - Audit trail for all verification paths

#### Recommended Configuration

```typescript
// config/moh-verification.config.ts

export const MOH_VERIFICATION_CONFIG = {
  // API Configuration
  api: {
    enabled: true,
    url: process.env.MOH_API_URL,
    apiKey: process.env.MOH_API_KEY,
    timeout: 5000, // 5 seconds
    retries: 2,
  },
  
  // SFTP Configuration
  sftp: {
    enabled: true,
    host: process.env.MOH_SFTP_HOST,
    port: 22,
    username: process.env.MOH_SFTP_USERNAME,
    password: process.env.MOH_SFTP_PASSWORD,
    syncSchedule: '0 2 * * *', // Daily at 2 AM
  },
  
  // Cache Configuration
  cache: {
    ttl: 86400, // 24 hours
    maxAge: 172800, // 48 hours (stale but usable)
    warningThreshold: 48, // Warn if cache > 48 hours old
  },
  
  // Verification Strategies
  strategies: {
    doctorRegistration: 'realtime',
    submissionApproval: 'cached',
    manualVerification: 'realtime',
    bulkCheck: 'cached',
  },
  
  // Fallback Behavior
  fallback: {
    allowWithWarning: true, // Allow ops with stale cache
    blockIfNoData: false, // Don't block if no data
    alertOnFallback: true, // Alert admins
  },
};
```

---

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)

#### Database Schema

```bash
# Create migration
npx prisma migrate dev --name add_moh_verification

# Updated schema.prisma
```

```prisma
model User {
  // Existing fields...
  mohVerified       Boolean?  @map("moh_verified")
  mohVerifiedAt     DateTime? @map("moh_verified_at")
  mohVerificationSource String? @map("moh_verification_source")
}

model MohDoctorRegistry {
  id                String   @id @default(uuid())
  nric              String   @unique
  mcrNumber         String   @unique @map("mcr_number")
  fullName          String   @map("full_name")
  specialization    String?
  status            String
  registrationDate  DateTime @map("registration_date")
  expiryDate        DateTime? @map("expiry_date")
  syncedAt          DateTime @default(now()) @map("synced_at")
  syncBatchId       String   @map("sync_batch_id")
  
  @@index([nric, mcrNumber])
  @@index([status])
  @@map("moh_doctor_registry")
}

model MohSyncLog {
  id              String   @id @default(uuid())
  batchId         String   @unique @map("batch_id")
  startedAt       DateTime @default(now()) @map("started_at")
  completedAt     DateTime? @map("completed_at")
  status          String
  recordsProcessed Int     @default(0) @map("records_processed")
  recordsAdded    Int      @default(0) @map("records_added")
  recordsUpdated  Int      @default(0) @map("records_updated")
  errorMessage    String?  @map("error_message")
  
  @@map("moh_sync_logs")
}

model DoctorVerificationLog {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  nric        String
  mcrNumber   String   @map("mcr_number")
  name        String
  verified    Boolean
  source      String   // 'realtime_api' | 'local_cache' | 'manual'
  reason      String?
  verifiedAt  DateTime @default(now()) @map("verified_at")
  verifiedBy  String?  @map("verified_by")
  
  @@index([userId])
  @@index([verifiedAt])
  @@map("doctor_verification_logs")
}
```

#### Core Services

```bash
# Create MOH module
nest g module moh
nest g service moh/moh-verification
nest g service moh/moh-sftp-sync
nest g service moh/moh-api-client
nest g controller moh/moh-verification
```

**Dependencies**:

```json
{
  "dependencies": {
    "@nestjs/axios": "^3.0.0",
    "@nestjs/schedule": "^4.0.0",
    "ssh2-sftp-client": "^10.0.0",
    "csv-parser": "^3.0.0",
    "fast-levenshtein": "^3.0.0"
  }
}
```

### Phase 2: Batch Sync (Week 3)

**Deliverables**:
1. ✅ SFTP download service
2. ✅ CSV parser
3. ✅ Database ETL pipeline
4. ✅ Cron job scheduler
5. ✅ Monitoring & alerting

**Testing**:
- Mock SFTP server with test data
- Verify record upserts
- Test error handling
- Validate data integrity

### Phase 3: API Integration (Week 4)

**Deliverables**:
1. ✅ MOH API client service
2. ✅ Request/response handling
3. ✅ Rate limiting
4. ✅ Retry logic
5. ✅ Caching layer

**Testing**:
- Mock API responses
- Test timeout handling
- Verify rate limiting
- Validate error scenarios

### Phase 4: Hybrid Logic (Week 5)

**Deliverables**:
1. ✅ Verification orchestrator
2. ✅ Strategy selector
3. ✅ Fallback logic
4. ✅ Name matching algorithm
5. ✅ Audit logging

**Testing**:
- Test all verification paths
- Verify fallback behavior
- Validate name matching
- Check audit trails

### Phase 5: Integration Points (Week 6)

**Deliverables**:
1. ✅ Update `UsersService.create()` - verify on doctor registration
2. ✅ Update `ApprovalsService.approve()` - verify before approval
3. ✅ Update `SubmissionsService.create()` - verify for direct doctor submissions
4. ✅ Add admin verification endpoint
5. ✅ Add verification status to UI

**Testing**:
- E2E tests for doctor registration
- E2E tests for submission approval
- E2E tests for blocking unverified doctors
- UI testing for verification badges

### Phase 6: Monitoring & Ops (Week 7)

**Deliverables**:
1. ✅ CloudWatch metrics
2. ✅ Alert rules
3. ✅ Dashboard
4. ✅ Runbooks
5. ✅ Admin tools

**Metrics**:
- API call success rate
- Sync job completion time
- Verification latency
- Cache hit rate
- Fallback usage

### Phase 7: UAT & Launch (Week 8)

**Activities**:
1. User acceptance testing
2. Performance testing
3. Security audit
4. Documentation
5. Training
6. Gradual rollout

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| MOH API unavailable | **MEDIUM** | **HIGH** | Hybrid fallback + monitoring |
| SFTP auth changes | **LOW** | **MEDIUM** | Secret rotation + alerts |
| Data format changes | **MEDIUM** | **HIGH** | Schema validation + alerts |
| Performance degradation | **LOW** | **MEDIUM** | Caching + async processing |
| Name matching false negatives | **MEDIUM** | **MEDIUM** | Manual override + audit |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Sync job failures | **MEDIUM** | **MEDIUM** | Retry logic + alerts |
| Disk space exhaustion | **LOW** | **HIGH** | Cleanup jobs + monitoring |
| Secret exposure | **LOW** | **CRITICAL** | AWS Secrets Manager |
| Compliance violations | **LOW** | **CRITICAL** | Audit logs + access control |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Doctor registration blocked | **MEDIUM** | **HIGH** | Fallback + manual override |
| False positive verifications | **LOW** | **CRITICAL** | Strict validation + audit |
| User frustration (slow) | **LOW** | **MEDIUM** | Performance optimization |
| MOH contract changes | **LOW** | **MEDIUM** | Flexible architecture |

---

## Appendices

### Appendix A: Sample API Contracts

**MOH API Endpoint Documentation** (Assumed):

```yaml
openapi: 3.0.0
info:
  title: MOH Practitioner Verification API
  version: 1.0.0

paths:
  /v1/practitioners/verify:
    post:
      summary: Verify a medical practitioner
      security:
        - ApiKeyAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                nric:
                  type: string
                  pattern: '^[STFG]\d{7}[A-Z]$'
                mcrNumber:
                  type: string
                  pattern: '^[A-Z]\d{5}[A-Z]$'
                name:
                  type: string
      responses:
        '200':
          description: Verification result
          content:
            application/json:
              schema:
                type: object
                properties:
                  verified:
                    type: boolean
                  practitioner:
                    type: object
                  reason:
                    type: string
```

### Appendix B: SFTP File Format Specification

```
File: doctors_registry.csv
Encoding: UTF-8
Delimiter: ,
Quote: "
Escape: \
Header: Yes
Line ending: LF (\n)

Columns:
1. nric (string, required, unique)
2. mcr_number (string, required, unique)
3. full_name (string, required)
4. specialization (string, optional)
5. status (enum: Active|Suspended|Cancelled)
6. registration_date (date, ISO 8601)
7. expiry_date (date, ISO 8601, nullable)

Sample:
nric,mcr_number,full_name,specialization,status,registration_date,expiry_date
S1234567D,M12345A,"TAN KOK BENG, JOHN",General Practice,Active,2010-03-15,2026-03-14
S2345678E,M23456B,"LIM MEI LING, SUSAN",Family Medicine,Active,2015-07-20,2027-07-19
```

### Appendix C: Environment Variables

```bash
# .env.production

# MOH API Configuration
MOH_API_URL=https://api.moh.gov.sg
MOH_API_KEY=your-api-key-here
MOH_API_TIMEOUT=5000
MOH_API_RETRIES=2

# MOH SFTP Configuration
MOH_SFTP_HOST=sftp.moh.gov.sg
MOH_SFTP_PORT=22
MOH_SFTP_USERNAME=checkup-prod
MOH_SFTP_PASSWORD=stored-in-aws-secrets-manager
MOH_SFTP_REMOTE_PATH=/exports/doctors_registry.csv

# Verification Configuration
MOH_VERIFICATION_STRATEGY=hybrid
MOH_CACHE_TTL=86400
MOH_CACHE_MAX_AGE=172800
MOH_FALLBACK_ENABLED=true
MOH_SYNC_SCHEDULE="0 2 * * *"

# Monitoring
MOH_ALERT_EMAIL=ops@checkup.sg
MOH_ALERT_SLACK_WEBHOOK=https://hooks.slack.com/...
```

### Appendix D: Monitoring Dashboard

**CloudWatch Metrics**:

```typescript
// Custom metrics to publish

1. moh.verification.success (count)
2. moh.verification.failure (count)
3. moh.verification.latency (milliseconds)
4. moh.verification.source (api|cache|fallback)
5. moh.api.calls (count)
6. moh.api.errors (count)
7. moh.cache.hits (count)
8. moh.cache.misses (count)
9. moh.sync.duration (seconds)
10. moh.sync.records (count)
```

**Alarms**:

```yaml
Alarms:
  - Name: MOHAPIHighFailureRate
    Metric: moh.api.errors
    Threshold: 10 errors in 5 minutes
    Action: SNS notification + PagerDuty
    
  - Name: MOHSyncJobFailed
    Metric: moh.sync.status
    Threshold: status = failed
    Action: SNS notification + PagerDuty
    
  - Name: MOHHighVerificationLatency
    Metric: moh.verification.latency
    Threshold: p99 > 5000ms
    Action: SNS notification
    
  - Name: MOHCacheTooOld
    Metric: moh.cache.age
    Threshold: > 48 hours
    Action: SNS notification
```

---

## Conclusion

The **Hybrid Approach** provides the optimal balance of:
- ✅ **Data freshness**: Real-time API for critical operations
- ✅ **Performance**: Fast local cache for routine checks
- ✅ **Reliability**: Multiple fallback layers
- ✅ **Cost-effectiveness**: Minimized API calls
- ✅ **User experience**: Sub-second response times

This solution positions CheckUp to:
1. Ensure all submissions are made by verified doctors
2. Maintain high system availability
3. Scale to handle growing transaction volumes
4. Comply with MOH and agency requirements

**Next Steps**:
1. Obtain MOH API credentials and SFTP access
2. Review and approve this proposal
3. Allocate development resources
4. Begin Phase 1 implementation

---

**Document Version**: 1.0  
**Last Updated**: 9 December 2025  
**Review Date**: 16 December 2025
