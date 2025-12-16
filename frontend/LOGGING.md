# Frontend Logging Configuration

This setup ensures console logs are **only shown in local development**, not in production (EC2).

## How It Works

### 1. Logger Utility (`src/utils/logger.ts`)

A custom logger that checks `import.meta.env.MODE` and only logs in development:

```typescript
import logger from '@/utils/logger';

// Instead of:
console.log('Hello');
console.error('Error!');

// Use:
logger.log('Hello');      // Only logs in dev
logger.error('Error!');    // Only logs in dev
```

### 2. Build Configuration

The Dockerfile builds with `--mode production` which sets `import.meta.env.MODE === 'production'`:

```dockerfile
RUN npm run build -- --mode production
```

### 3. Environment Detection

- **Local dev** (`npm run dev`): Logs are enabled
- **EC2 production** (`docker build`): Logs are disabled (no-op functions)

## Migration Guide

Replace all `console.*` calls with `logger.*`:

**Before:**
```typescript
console.log('Starting...');
console.error('Failed:', error);
```

**After:**
```typescript
import logger from '@/utils/logger';

logger.log('Starting...');      // Only shows in dev
logger.error('Failed:', error);  // Only shows in dev
```

## Quick Replace All Console Logs

To bulk-replace console logs:

```bash
# In frontend/src directory
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/console\.log/logger.log/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/console\.error/logger.error/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/console\.debug/logger.debug/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/console\.warn/logger.warn/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/console\.info/logger.info/g'

# Then add the import at the top of each file that uses logger
```

## Files Modified

- ✅ `src/utils/logger.ts` - Created logger utility
- ✅ `Dockerfile` - Updated to build in production mode
- ⏳ Component files - Need to import and use `logger` instead of `console`

## Testing

**Local development:**
```bash
npm run dev
# Console logs should appear
```

**Production build:**
```bash
docker-compose -f docker-compose.ec2.yml build frontend
docker-compose -f docker-compose.ec2.yml up frontend
# No console logs in browser
```
