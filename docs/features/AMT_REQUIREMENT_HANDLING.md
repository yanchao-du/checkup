# AMT (Abbreviated Mental Test) Requirement Handling

## Overview
The AMT is a cognitive assessment required for certain driving licence examinations based on patient age, licence class, and medical conditions. The system dynamically calculates whether AMT is required and enforces completion when necessary.

## Business Rules

### When AMT is Required

The AMT is **required** if ANY of the following conditions are met:

#### 1. Age 70-74 on Next Birthday + Specific License Classes
- **Age criterion**: Patient will be 70-74 years old on their next birthday
- **License classes**: 4, 4A, 4P, 4AP, 5, 5P
- **Example**: Patient born Jan 1953, exam date Nov 2025 → next birthday age = 73 → AMT required for class 4

#### 2. Age 70-74 on Next Birthday + Private Driving Instructor
- **Age criterion**: Patient will be 70-74 years old on their next birthday
- **Additional criterion**: Patient is a private driving instructor
- **License class**: Any class
- **Example**: Age 72, class 3, private instructor = Yes → AMT required

#### 3. Age 70+ on Examination Date + LTA Vocational Licence
- **Age criterion**: Patient is 70 years or older on the examination date
- **Additional criterion**: Patient holds an LTA vocational licence
- **Example**: Age 70 on exam date, LTA vocational licence = Yes → AMT required

#### 4. Cognitive Impairment Observed
- **Medical condition**: Doctor checks "Sign of cognitive impairment" in abnormality checklist
- **Age/License**: Regardless of age or license class
- **Example**: Age 65, class 2B, cognitive impairment checked → AMT required

### When AMT is NOT Required

AMT is **not required** when:
- Patient age < 70 AND no cognitive impairment
- Patient age > 74 (outside critical range) AND no LTA vocational licence AND no cognitive impairment
- License class not in AMT-check list (2, 2A, 2B, 3, 3A) AND age < 70 AND not private instructor AND no cognitive impairment

## Implementation

### Frontend Logic

#### Calculation Function
**File:** `frontend/src/components/NewSubmission.tsx`

**Function:** `recalculateAMTRequirement()` (lines 1300-1380)

```typescript
const recalculateAMTRequirement = () => {
  // Returns: true (required), false (not required), null (cannot determine)
  
  // 1. Check if we have required data
  if (!drivingLicenseClass || !patientDateOfBirth || !examinationDate) {
    return null; // Cannot determine without these fields
  }

  // 2. Check cognitive impairment (highest priority)
  if (formData.abnormalityChecklist?.cognitiveImpairment) {
    return true;
  }

  // 3. Calculate ages
  const ageNextBirthday = calculateAgeOnNextBirthday(dob, examDate);
  const ageOnExamDate = calculateAgeOnExamDate(dob, examDate);

  // 4. Early exit if outside critical age ranges
  if (ageNextBirthday < 70 && ageOnExamDate < 70) {
    return false;
  }

  // 5. Check Condition 1: Age 70-74 next birthday + AMT class or instructor
  if (ageNextBirthday >= 70 && ageNextBirthday <= 74) {
    if (AMT_AGE_CHECK_CLASSES.includes(drivingLicenseClass) || 
        formData.isPrivateDrivingInstructor === 'yes') {
      return true;
    }
  }

  // 6. Check Condition 2: Age 70+ on exam date + LTA vocational
  if (ageOnExamDate >= 70 && formData.holdsLTAVocationalLicence === 'yes') {
    return true;
  }

  // 7. Cannot determine if missing optional fields
  if (formData.isPrivateDrivingInstructor === undefined || 
      formData.holdsLTAVocationalLicence === undefined) {
    return null;
  }

  return false;
};
```

#### Age Calculation Helpers

**Age on Next Birthday:**
```typescript
const calculateAgeOnNextBirthday = (dob: string, examDate: string) => {
  const dobDate = new Date(dob);
  const examDateObj = new Date(examDate);
  
  // Find next birthday relative to exam date
  const nextBirthday = new Date(dobDate);
  nextBirthday.setFullYear(examDateObj.getFullYear());
  
  if (nextBirthday < examDateObj) {
    nextBirthday.setFullYear(examDateObj.getFullYear() + 1);
  }
  
  return nextBirthday.getFullYear() - dobDate.getFullYear();
};
```

**Age on Examination Date:**
```typescript
const calculateAgeOnExamDate = (dob: string, examDate: string) => {
  const dobDate = new Date(dob);
  const examDateObj = new Date(examDate);
  
  let age = examDateObj.getFullYear() - dobDate.getFullYear();
  const monthDiff = examDateObj.getMonth() - dobDate.getMonth();
  const dayDiff = examDateObj.getDate() - dobDate.getDate();
  
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  
  return age;
};
```

### Dynamic Recalculation Triggers

The system recalculates AMT requirement when:

1. **Patient Date of Birth changes** (affects both age calculations)
2. **Examination Date changes** (affects both age calculations)
3. **Driving License Class changes** (affects age 70-74 + class check)
4. **Private Driving Instructor status changes** (affects age 70-74 + instructor check)
5. **LTA Vocational Licence status changes** (affects age 70+ + vocational check)
6. **Cognitive Impairment checkbox changes** (immediate requirement)

### Navigation Enforcement

**File:** `frontend/src/components/NewSubmission.tsx`

**Function:** `handleContinue()` (lines 1050-1160)

When user tries to navigate from AMT section to Summary:

```typescript
if (isEditingFromSummary && isDriverExamType(examType)) {
  // Recalculate AMT requirement
  const newAmtRequired = recalculateAMTRequirement();
  
  // Update formData if requirement changed
  if (newAmtRequired !== null && newAmtRequired !== formData.amtRequired) {
    setFormData(prev => ({ ...prev, amtRequired: newAmtRequired }));
    
    // Clear AMT completion status if it became required
    if (newAmtRequired === true && formData.amtRequired === false) {
      setCompletedSections(prev => {
        const newSet = new Set(prev);
        newSet.delete('amt');
        return newSet;
      });
    }
  }
  
  // Block navigation if AMT required but not completed
  if (newAmtRequired === true || newAmtRequired === null) {
    if (!completedSections.has('amt')) {
      // Show appropriate toast message
      if (newAmtRequired === null) {
        toast.warning('Please complete the AMT questions to continue.');
      } else if (newAmtRequired !== formData.amtRequired) {
        toast.warning('AMT is now required. Please complete the AMT questions.');
      } else {
        toast.warning('Please complete the AMT questions before continuing.');
      }
      
      // Keep user on AMT section
      setActiveAccordion('amt');
      setIsEditingFromSummary(false);
      return; // Block navigation
    }
  }
  
  // AMT check passed - allow navigation to summary
  setActiveAccordion('summary');
  setIsEditingFromSummary(false);
}
```

### UI Display

#### AMT Not Required State
**File:** `frontend/src/components/submission-form/summary/DrivingVocationalTpLtaSummary.tsx`

```tsx
{formData.amtRequired === false ? (
  <div className="py-6">
    <p className="text-lg text-slate-600">AMT not required</p>
  </div>
) : (
  // Show AMT score and results
)}
```

#### AMT Required State
Shows:
- Result: Pass/Fail (based on score >= 8)
- Total Score: X/10
- Warning if score < 8 (suggests cognitive impairment)

## User Experience Flow

### Scenario 1: AMT Becomes Required After Age Change

1. User creates submission with age 65, class 4
2. Navigates to AMT section → sees "AMT not required"
3. User edits Patient Info, changes DOB to age 72
4. Returns to AMT section and clicks "Continue to Summary"
5. **System Response:**
   - ❌ Blocks navigation
   - ⚠️ Shows toast: "AMT is now required. Please complete the AMT questions."
   - 📋 Displays AMT questions
   - 🔒 Keeps accordion open on AMT section

### Scenario 2: AMT Required But Not Answered

1. User creates submission with age 72, class 4
2. AMT section shows 10 questions
3. User doesn't answer any questions
4. Clicks "Continue to Summary"
5. **System Response:**
   - ❌ Blocks navigation
   - ⚠️ Shows toast: "Please complete the AMT questions before continuing."
   - 🔒 Stays on AMT section

### Scenario 3: Cognitive Impairment Triggers AMT

1. User creates submission with age 65, class 3 (normally no AMT)
2. In Abnormality Checklist, checks "Sign of cognitive impairment"
3. Navigates to AMT section → questions now appear
4. Must complete AMT before continuing

### Scenario 4: License Class Change

1. User creates submission with age 72, class 3 (no AMT)
2. AMT shows "AMT not required"
3. User edits, changes class to 4
4. Returns to AMT → must now answer questions

## Toast Messages

| Scenario | Toast Message |
|----------|---------------|
| AMT newly became required | "AMT is now required. Please complete the AMT questions." |
| AMT was already required | "Please complete the AMT questions before continuing." |
| Cannot determine requirement | "Please complete the AMT questions to continue." |

## Data Storage

### Form Data Structure

```typescript
interface FormData {
  // AMT requirement flag
  amtRequired: boolean | undefined;
  
  // AMT answers and score
  amt: {
    q1: boolean;  // Age
    q2: boolean;  // Time
    q3: boolean;  // Address recall
    q4: boolean;  // Year
    q5: boolean;  // Place
    q6: boolean;  // Recognition
    q7: boolean;  // Date of birth
    q8: boolean;  // Year of WWII
    q9: boolean;  // Name of monarch/president
    q10: boolean; // Count backwards
    score: number; // Total correct (0-10)
  };
  
  // Fields affecting requirement
  patientDateOfBirth: string;
  examinationDate: string;
  drivingLicenseClass: string;
  isPrivateDrivingInstructor: 'yes' | 'no' | undefined;
  holdsLTAVocationalLicence: 'yes' | 'no' | undefined;
  abnormalityChecklist: {
    cognitiveImpairment: boolean;
    // ... other abnormalities
  };
}
```

## Testing

### Test Coverage

**File:** `frontend/src/components/__tests__/NewSubmission.amt.test.tsx`

Test scenarios include:
1. ✅ Age 70-74 with AMT-check classes (4, 4A, 4P, 4AP, 5, 5P)
2. ✅ Age 70-74 with non-AMT classes (2, 2A, 2B, 3, 3A)
3. ✅ Age below 70 (no AMT regardless of class)
4. ✅ Age above 74 (no AMT unless LTA vocational)
5. ✅ Cognitive impairment (AMT required regardless of age)
6. ✅ Private driving instructor (AMT required if age 70-74)
7. ✅ LTA vocational licence (AMT required if age 70+)
8. ✅ Multiple condition combinations
9. ✅ Age change triggering requirement update
10. ✅ License class change triggering requirement update

### Manual Testing Guide

**File:** `AMT_TEST_GUIDE.md` (root directory)

Quick test steps for common scenarios:
- Age change triggers AMT
- AMT required but not answered
- AMT completed successfully
- Cognitive impairment triggers
- License class change
- Private driving instructor
- Edit from summary

## Pass/Fail Criteria

### AMT Scoring
- **Total questions**: 10
- **Passing score**: 8 or above (≥ 8)
- **Failing score**: Below 8 (< 8)

### Clinical Significance
⚠️ A score of less than 8 suggests cognitive impairment and may require:
- Specialist referral for further diagnosis
- Additional medical evaluation
- Follow-up assessment

## Related Files

### Frontend
- `frontend/src/components/NewSubmission.tsx` - Main calculation logic
- `frontend/src/components/submission-form/AMTSection.tsx` - AMT questions UI
- `frontend/src/components/submission-form/summary/DrivingVocationalTpLtaSummary.tsx` - Summary display
- `frontend/src/components/__tests__/NewSubmission.amt.test.tsx` - Unit tests

### Documentation
- `AMT_TEST_GUIDE.md` - Manual testing guide
- `docs/features/AMT_REQUIREMENT_HANDLING.md` - This document

### Constants
```typescript
const AMT_AGE_CHECK_CLASSES = ['4', '4A', '4P', '4AP', '5', '5P'];
```

## Edge Cases

### 1. Birthday on Examination Date
- **Scenario**: Patient born Nov 4, 1953, exam date Nov 4, 2025
- **Age on exam date**: Exactly 72 years old
- **Age on next birthday**: 73 years old
- **Result**: Both conditions evaluate correctly

### 2. Missing Optional Fields
- **Scenario**: Age 71, class 4, but isPrivateDrivingInstructor is undefined
- **Result**: `recalculateAMTRequirement()` returns `null`
- **Behavior**: System assumes AMT might be required, blocks navigation with warning

### 3. Age Exactly 70
- **Scenario**: Patient will be exactly 70 on next birthday
- **Result**: AMT required if meets class/instructor criteria (70 is inclusive in 70-74 range)

### 4. Age Exactly 74
- **Scenario**: Patient will be exactly 74 on next birthday
- **Result**: AMT required if meets class/instructor criteria (74 is inclusive in 70-74 range)

### 5. Age Exactly 75
- **Scenario**: Patient will be 75 on next birthday
- **Result**: AMT NOT required based on age alone (outside 70-74 range)
- **Exception**: Still required if age 70+ on exam date with LTA vocational licence

## Performance Considerations

### Calculation Frequency
- Triggered on every relevant field change
- Optimized with early returns to avoid unnecessary calculations
- Returns `null` when missing required data instead of making assumptions

### State Management
- AMT requirement stored in `formData.amtRequired`
- Automatically updated when dependencies change
- Completion status tracked separately in `completedSections` Set

## Future Enhancements

### Potential Improvements
1. **Visual Indicator**: Show badge when AMT becomes required after edit
2. **Notification**: Alert doctor when requirement changes
3. **Audit Trail**: Log when AMT requirement changes and why
4. **Help Text**: Context-sensitive help explaining why AMT is required
5. **Pre-flight Check**: Validate AMT before allowing "Continue" button click

## Summary

The AMT requirement handling system:
- ✅ Dynamically calculates requirement based on multiple criteria
- ✅ Enforces completion before submission when required
- ✅ Provides clear user feedback with toast messages
- ✅ Handles edge cases and missing data gracefully
- ✅ Recalculates on any relevant field change
- ✅ Blocks navigation to summary if incomplete
- ✅ Displays appropriate UI based on requirement status
- ✅ Supports complex age-based and condition-based rules
