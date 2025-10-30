# Design: Configurable Exam Form Schema System

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  NewSubmission.tsx                                          │
│    ↓ loads schema via                                       │
│  ExamSchemaService.getSchema(examType)                      │
│    ↓ renders                                                │
│  DynamicExamForm                                            │
│    ↓ foreach field                                          │
│  DynamicFormField (text, select, radio, etc.)               │
│    ↓ validates via                                          │
│  SchemaFieldValidator.validate(field, value, schema)        │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP GET /v1/exam-schemas/:type
┌─────────────────────────────────────────────────────────────┐
│                        Backend (NestJS)                      │
├─────────────────────────────────────────────────────────────┤
│  ExamSchemaController.getSchema(type)                       │
│    ↓                                                        │
│  ExamSchemaService                                          │
│    ↓ loads from                                             │
│  /exam-schemas/{type}.json                                  │
│    ↓ validates with                                         │
│  SchemaValidator.validateSchema()                           │
├─────────────────────────────────────────────────────────────┤
│  SubmissionsController.create(dto)                          │
│    ↓                                                        │
│  SubmissionsService                                         │
│    ↓ validates formData with                                │
│  SchemaFieldValidator.validateFormData(formData, schema)    │
└─────────────────────────────────────────────────────────────┘
```

## Schema File Structure

### Example: six-monthly-mdw.json

```json
{
  "examType": "SIX_MONTHLY_MDW",
  "name": "Six-monthly Medical Exam for Migrant Domestic Workers (MOM)",
  "agency": "MOM",
  "version": "1.0.0",
  "description": "Mandatory 6-monthly medical examination for migrant domestic workers",
  "fieldGroups": [
    {
      "id": "vitals",
      "label": "Vital Signs",
      "fields": [
        {
          "id": "height",
          "type": "number",
          "label": "Height (cm)",
          "placeholder": "170",
          "required": false,
          "validation": {
            "min": 50,
            "max": 250,
            "pattern": "^[0-9]+$",
            "errorMessages": {
              "min": "Height must be at least 50 cm",
              "max": "Height cannot exceed 250 cm",
              "pattern": "Please enter a valid number"
            }
          }
        },
        {
          "id": "weight",
          "type": "number",
          "label": "Weight (kg)",
          "placeholder": "65",
          "required": false,
          "validation": {
            "min": 20,
            "max": 300
          }
        },
        {
          "id": "bloodPressure",
          "type": "group",
          "label": "Blood Pressure",
          "fields": [
            {
              "id": "systolic",
              "type": "number",
              "label": "Systolic",
              "placeholder": "120",
              "required": false,
              "validation": {
                "min": 70,
                "max": 250
              }
            },
            {
              "id": "diastolic",
              "type": "number",
              "label": "Diastolic",
              "placeholder": "80",
              "required": false,
              "validation": {
                "min": 40,
                "max": 150
              }
            }
          ]
        }
      ]
    },
    {
      "id": "examSpecific",
      "label": "MDW-Specific Tests",
      "fields": [
        {
          "id": "pregnancyTest",
          "type": "select",
          "label": "Pregnancy Test",
          "placeholder": "Select result",
          "required": false,
          "options": [
            { "value": "Positive", "label": "Positive" },
            { "value": "Negative", "label": "Negative" },
            { "value": "Not Applicable", "label": "Not Applicable" }
          ]
        },
        {
          "id": "chestXray",
          "type": "text",
          "label": "Chest X-Ray Result",
          "placeholder": "Normal / Abnormal findings",
          "required": false,
          "maxLength": 500
        }
      ]
    },
    {
      "id": "additionalInfo",
      "label": "Additional Information",
      "fields": [
        {
          "id": "remarks",
          "type": "textarea",
          "label": "Additional Remarks",
          "placeholder": "Enter any additional medical findings or notes",
          "required": false,
          "rows": 4,
          "maxLength": 2000
        }
      ]
    }
  ]
}
```

## TypeScript Type Definitions

```typescript
// frontend/src/schemas/exam-schema.types.ts

export interface ExamSchema {
  examType: string;
  name: string;
  agency: string;
  version: string;
  description: string;
  fieldGroups: FieldGroup[];
}

export interface FieldGroup {
  id: string;
  label: string;
  fields: Field[];
}

export type Field = 
  | TextField 
  | NumberField 
  | EmailField
  | TelField
  | DateField 
  | SelectField 
  | RadioField 
  | CheckboxField 
  | SwitchField
  | TextareaField
  | GroupField;

interface BaseField {
  id: string;
  label: string;
  placeholder?: string;
  required: boolean;
  helperText?: string;
  defaultValue?: any;
  visibleWhen?: FieldCondition; // For conditional fields (future)
}

export interface TextField extends BaseField {
  type: 'text';
  maxLength?: number;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    errorMessages?: Record<string, string>;
  };
}

export interface EmailField extends BaseField {
  type: 'email';
  maxLength?: number;
  validation?: {
    pattern?: string;
    errorMessages?: Record<string, string>;
  };
}

export interface TelField extends BaseField {
  type: 'tel';
  maxLength?: number;
  validation?: {
    pattern?: string;
    errorMessages?: Record<string, string>;
  };
}

export interface NumberField extends BaseField {
  type: 'number';
  validation?: {
    min?: number;
    max?: number;
    step?: number;
    errorMessages?: Record<string, string>;
  };
}

export interface DateField extends BaseField {
  type: 'date';
  validation?: {
    minDate?: string; // ISO date or 'today', 'today-30d'
    maxDate?: string;
    errorMessages?: Record<string, string>;
  };
}

export interface SelectField extends BaseField {
  type: 'select';
  options: Array<{ value: string; label: string }>;
  multiple?: boolean;
}

export interface RadioField extends BaseField {
  type: 'radio';
  options: Array<{ value: string; label: string }>;
}

export interface CheckboxField extends BaseField {
  type: 'checkbox';
  defaultValue?: boolean;
}

export interface SwitchField extends BaseField {
  type: 'switch';
  defaultValue?: boolean;
}

export interface TextareaField extends BaseField {
  type: 'textarea';
  rows?: number;
  maxLength?: number;
}

export interface GroupField extends BaseField {
  type: 'group';
  fields: Field[];
  layout?: 'horizontal' | 'vertical';
}

export interface FieldCondition {
  field: string; // field id to watch
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}
```

## Component Implementation Strategy

### 1. DynamicFormField Component

Maps schema field types to shadcn/ui components from `frontend/src/components/ui/`:

```typescript
// frontend/src/components/DynamicFormField.tsx
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';

interface DynamicFormFieldProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
      return (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          <FormControl>
            <Input 
              type={field.type} 
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              maxLength={field.maxLength}
            />
          </FormControl>
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      );
      
    case 'number':
      return (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              min={field.validation?.min}
              max={field.validation?.max}
              step={field.validation?.step}
            />
          </FormControl>
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      );
      
    case 'date':
      return (
        <FormItem className="flex flex-col">
          <FormLabel>{field.label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button variant="outline">
                  {value ? format(value, "PPP") : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value}
                onSelect={onChange}
              />
            </PopoverContent>
          </Popover>
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      );
      
    case 'select':
      return (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          <Select onValueChange={onChange} value={value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      );
      
    case 'radio':
      return (
        <FormItem className="space-y-3">
          <FormLabel>{field.label}</FormLabel>
          <FormControl>
            <RadioGroup onValueChange={onChange} value={value}>
              {field.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      );
      
    case 'checkbox':
      return (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={value || false}
              onCheckedChange={onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{field.label}</FormLabel>
          </div>
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      );
      
    case 'switch':
      return (
        <FormItem className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <FormLabel>{field.label}</FormLabel>
          </div>
          <FormControl>
            <Switch
              checked={value || false}
              onCheckedChange={onChange}
            />
          </FormControl>
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      );
      
    case 'textarea':
      return (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          <FormControl>
            <Textarea 
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              rows={field.rows}
              maxLength={field.maxLength}
            />
          </FormControl>
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      );
      
    case 'group':
      return (
        <div className="space-y-4">
          <Label>{field.label}</Label>
          <div className={field.layout === 'horizontal' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
            {field.fields.map((subField) => (
              <DynamicFormField
                key={subField.id}
                field={subField}
                value={value?.[subField.id]}
                onChange={(subValue) => onChange({ ...value, [subField.id]: subValue })}
              />
            ))}
          </div>
        </div>
      );
      
    default:
      return null;
  }
}
```

**Component Mapping Summary**:
- All components imported from `frontend/src/components/ui/`
- Uses shadcn/ui Form components (FormItem, FormLabel, FormControl, FormMessage) for consistent layout and error handling
- Leverages existing components: Input, Textarea, Select, RadioGroup, Checkbox, Calendar, Popover, Switch
- Maintains visual consistency across all dynamically rendered fields

### 2. DynamicExamForm Component

```typescript
// frontend/src/components/DynamicExamForm.tsx

interface DynamicExamFormProps {
  schema: ExamSchema;
  formData: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  errors?: Record<string, string>;
}

export function DynamicExamForm({ schema, formData, onChange, errors }: DynamicExamFormProps) {
  return (
    <div className="space-y-6">
      {schema.fieldGroups.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle>{group.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {group.fields.map((field) => (
              <DynamicFormField
                key={field.id}
                field={field}
                value={formData[field.id]}
                onChange={(value) => onChange(field.id, value)}
                error={errors?.[field.id]}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 3. Schema Service (Frontend)

```typescript
// frontend/src/services/exam-schema.service.ts

class ExamSchemaService {
  private cache: Map<string, ExamSchema> = new Map();

  async getSchema(examType: string): Promise<ExamSchema> {
    // Check cache first
    if (this.cache.has(examType)) {
      return this.cache.get(examType)!;
    }

    // Fetch from backend
    const response = await fetch(`${API_BASE_URL}/exam-schemas/${examType}`);
    if (!response.ok) {
      throw new Error(`Failed to load schema for ${examType}`);
    }

    const schema: ExamSchema = await response.json();
    
    // Validate schema structure (basic check)
    this.validateSchema(schema);
    
    // Cache it
    this.cache.set(examType, schema);
    
    return schema;
  }

  clearCache() {
    this.cache.clear();
  }

  private validateSchema(schema: ExamSchema) {
    if (!schema.examType || !schema.fieldGroups || schema.fieldGroups.length === 0) {
      throw new Error('Invalid schema structure');
    }
  }
}

export const examSchemaService = new ExamSchemaService();
```

### 4. Backend Schema Service

```typescript
// backend/src/exam-schemas/exam-schema.service.ts

@Injectable()
export class ExamSchemaService {
  private schemas: Map<string, ExamSchema> = new Map();

  onModuleInit() {
    this.loadSchemas();
  }

  private loadSchemas() {
    const schemaDir = path.join(__dirname, '../../exam-schemas');
    const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(schemaDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const schema = JSON.parse(content);
      
      // Validate schema
      this.validateSchema(schema);
      
      this.schemas.set(schema.examType, schema);
    }

    console.log(`Loaded ${this.schemas.size} exam schemas`);
  }

  getSchema(examType: string): ExamSchema {
    const schema = this.schemas.get(examType);
    if (!schema) {
      throw new NotFoundException(`Schema for exam type '${examType}' not found`);
    }
    return schema;
  }

  getAllSchemas(): ExamSchema[] {
    return Array.from(this.schemas.values());
  }

  validateFormData(examType: string, formData: Record<string, any>): ValidationResult {
    const schema = this.getSchema(examType);
    const errors: Record<string, string> = {};

    // Flatten all fields from groups
    const allFields = schema.fieldGroups.flatMap(g => g.fields);

    for (const field of allFields) {
      const value = formData[field.id];
      const fieldErrors = this.validateField(field, value);
      if (fieldErrors) {
        errors[field.id] = fieldErrors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  private validateField(field: Field, value: any): string | null {
    // Required check
    if (field.required && (value === null || value === undefined || value === '')) {
      return `${field.label} is required`;
    }

    if (!value) return null; // Skip further validation if empty and not required

    // Type-specific validation
    switch (field.type) {
      case 'number':
        return this.validateNumberField(field, value);
      case 'text':
        return this.validateTextField(field, value);
      case 'date':
        return this.validateDateField(field, value);
      // ... other types
    }

    return null;
  }

  private validateNumberField(field: NumberField, value: any): string | null {
    const num = Number(value);
    if (isNaN(num)) {
      return `${field.label} must be a valid number`;
    }

    if (field.validation) {
      if (field.validation.min !== undefined && num < field.validation.min) {
        return field.validation.errorMessages?.min || 
               `${field.label} must be at least ${field.validation.min}`;
      }
      if (field.validation.max !== undefined && num > field.validation.max) {
        return field.validation.errorMessages?.max || 
               `${field.label} must not exceed ${field.validation.max}`;
      }
    }

    return null;
  }

  // ... similar validators for other field types
}
```

## API Endpoints

### GET /v1/exam-schemas

Returns list of all available exam schemas (metadata only).

**Response**:
```json
[
  {
    "examType": "SIX_MONTHLY_MDW",
    "name": "Six-monthly Medical Exam for Migrant Domestic Workers (MOM)",
    "agency": "MOM",
    "version": "1.0.0"
  },
  {
    "examType": "WORK_PERMIT",
    "name": "Full Medical Exam for Work Permit (MOM)",
    "agency": "MOM",
    "version": "1.0.0"
  }
]
```

### GET /v1/exam-schemas/:examType

Returns full schema for specific exam type.

**Response**:
```json
{
  "examType": "SIX_MONTHLY_MDW",
  "name": "Six-monthly Medical Exam for Migrant Domestic Workers (MOM)",
  "agency": "MOM",
  "version": "1.0.0",
  "fieldGroups": [ /* ... */ ]
}
```

## Migration Path

### Step 1: Create schema for SIX_MONTHLY_MDW
- Extract existing hardcoded fields from `NewSubmission.tsx`
- Define in JSON schema format
- Test schema loading and validation

### Step 2: Build DynamicExamForm
- Create reusable field components
- Implement schema-driven rendering
- Add validation from schema rules

### Step 3: Parallel rendering (transition)
- Keep hardcoded form for WORK_PERMIT and AGED_DRIVERS
- Use DynamicExamForm for SIX_MONTHLY_MDW
- Verify both approaches work side-by-side

### Step 4: Migrate remaining exam types
- Create schemas for WORK_PERMIT and AGED_DRIVERS
- Remove hardcoded conditional blocks
- Clean up legacy code

### Step 5: Testing and validation
- Unit tests for schema validation
- E2E tests for dynamic form rendering
- Verify all exam types work correctly

## Future Enhancements

1. **Conditional Fields**: Implement `visibleWhen` logic
2. **Custom Validators**: Support custom validation functions (e.g., NRIC checksum)
3. **Field Dependencies**: One field's value affects another (e.g., if diabetes=Yes, show medication field)
4. **Multi-language**: Support label translations
5. **Schema Versioning**: Track schema versions, support migration
6. **Admin UI**: Web interface to create/edit schemas
7. **Database Storage**: Move schemas from files to database for runtime updates
8. **Calculated Fields**: Auto-compute values (e.g., BMI from height/weight)
