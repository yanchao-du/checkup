import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LookupPatientDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[STFGM]\d{7}[A-Z]$/i, {
    message: 'NRIC must be in valid Singapore format (e.g., S1234567A, F1234567B)',
  })
  nric: string;
}
