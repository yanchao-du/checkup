import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO for CorpPass OAuth callback query parameters
 */
export class CorpPassCallbackDto {
  @IsNotEmpty()
  @IsString()
  code: string; // Authorization code from CorpPass

  @IsOptional()
  @IsString()
  state?: string; // CSRF protection token
}

/**
 * DTO for CorpPass login request (after code exchange)
 */
export class CorpPassLoginDto {
  @IsNotEmpty()
  @IsString()
  code: string; // Authorization code to exchange for tokens

  @IsOptional()
  @IsString()
  state?: string; // CSRF state parameter
}

/**
 * DTO for CorpPass user information
 */
export class CorpPassUserDto {
  id: string;
  email: string;
  name: string;
  role: string;
  clinicId: string;
  clinicName: string;
  corpPassSub?: string; // CorpPass unique ID
  uen?: string; // Unique Entity Number
  nric?: string; // National Registration ID
}

/**
 * Extended login response to include authentication method
 */
export class CorpPassLoginResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    clinicId: string;
    clinicName: string;
    authMethod: 'email' | 'corppass'; // Authentication method used
  };
}
