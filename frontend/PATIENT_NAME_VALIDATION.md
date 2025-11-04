# Patient Name Validation Rules

## Overview
Patient name validation ensures data integrity and prevents invalid characters from being entered into the medical examination system.

## Validation Rules

### Character Requirements
The patient name field accepts the following characters:
- **Letters**: A-Z (uppercase) and a-z (lowercase)
- **Spaces**: Internal spaces between name parts
- **Hyphens**: `-` (for hyphenated names like "Anne-Marie")
- **Apostrophes**: `'` (for names like "O'Brien" or "D'Angelo")
- **Periods**: `.` (for titles or abbreviations like "Dr. Smith")
- **Parentheses**: `(` and `)` (for aliases or alternative names like "John Smith (Alias)" or "李明 (Lee Ming)")

### Length Requirements
- **Minimum**: 2 characters (after trimming whitespace)
- **Maximum**: 120 characters (after trimming whitespace)

### Whitespace Handling
- Leading and trailing whitespace is automatically trimmed on blur
- Internal spaces between name parts are preserved
- Empty strings or strings with only whitespace are rejected

### Validation Pattern
The validation uses the following regular expression:
```
^[A-Za-z\s'\.\-\(\)]+$
```

#### Pattern Breakdown:
- `^` - Start of string
- `[A-Za-z\s'\.\-\(\)]` - Character class allowing:
  - `A-Z` - Uppercase letters
  - `a-z` - Lowercase letters
  - `\s` - Whitespace/spaces
  - `'` - Apostrophe
  - `\.` - Period/dot (escaped)
  - `\-` - Hyphen (escaped)
  - `\(` - Left parenthesis (escaped)
  - `\)` - Right parenthesis (escaped)
- `+` - One or more of the above characters
- `$` - End of string

## Valid Examples

✅ **Valid Names:**
- "John Smith"
- "Mary O'Brien"
- "Jean-Paul Dubois"
- "Dr. Jane Doe"
- "Anne-Marie D'Angelo"
- "Lee Wei Ming"
- "Muhammad bin Abdullah"
- "José García"
- "O'Connor"
- "John Smith (Alias)"
- "李明 (Lee Ming)"
- "Maria (preferred: Mary)"

## Invalid Examples

❌ **Invalid Names (with reasons):**
- "J" - Too short (minimum 2 characters)
- "John123" - Contains numbers
- "John@Smith" - Contains special character (@)
- "John_Smith" - Contains underscore
- "John/Smith" - Contains forward slash
- "   " - Only whitespace
- "" - Empty string

## Error Messages

The validation provides specific error messages:
- **Empty/required**: "Patient name is required"
- **Too short**: "Patient name must be at least 2 characters"
- **Too long**: "Patient name must not exceed 120 characters"
- **Invalid characters**: "Patient name can only contain letters, spaces, hyphens, apostrophes, periods, and parentheses"

## Implementation Details

### Frontend Validation
- **File**: `frontend/src/lib/validationRules.ts`
- **Function**: `validatePatientName(value: string): string | null`
- **Trigger**: Validates on blur event
- **Visual feedback**: Red border on input field + inline error message

### User Experience
1. User types name in the input field
2. On blur (when leaving the field):
   - Whitespace is trimmed automatically
   - Validation runs
   - If invalid, red border appears with error message below
   - Error clears when user starts typing again

### Component Usage
Located in: `frontend/src/components/NewSubmission.tsx`

The validation is applied to both:
- **MOM exam types** (MDW/FMW) - when NRIC is filled
- **All other exam types** (ICA, Driver exams) - always enabled

## Technical Notes

### Internationalization Support
The current validation supports:
- English names with common punctuation
- Names with accented characters are NOT currently supported (e.g., José, François)
- To support accented characters, the regex would need to be updated to include Unicode letter ranges

### Database Considerations
- The backend should have a corresponding validation check
- Database field should be set to VARCHAR(120) or similar
- Consider adding database constraints for data integrity

### Future Enhancements
Potential improvements:
1. Add support for Unicode characters (accented letters)
2. Add more specific validation for common name patterns
3. Implement smart capitalization (auto-capitalize first letter)
4. Add warning for all-caps names
5. Detect and warn about potential typos (e.g., double spaces)

## Testing Scenarios

When testing patient name validation, verify:
1. ✅ Minimum length enforcement (2 chars)
2. ✅ Maximum length enforcement (120 chars)
3. ✅ Whitespace trimming on blur
4. ✅ Valid characters accepted (letters, spaces, -, ', .)
5. ✅ Invalid characters rejected (numbers, @, #, etc.)
6. ✅ Error message displays correctly
7. ✅ Error clears on typing
8. ✅ Form submission blocked with invalid name
9. ✅ Valid names pass through successfully

## Related Files
- `frontend/src/lib/validationRules.ts` - Validation function
- `frontend/src/components/NewSubmission.tsx` - Form implementation
- `frontend/src/components/ui/InlineError.tsx` - Error display component
