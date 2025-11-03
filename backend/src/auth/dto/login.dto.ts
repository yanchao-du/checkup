import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    clinicId: string;
    clinicName: string;
    mcrNumber?: string; // Medical Council Registration number (for doctors)
    authMethod?: 'email' | 'corppass'; // Optional: authentication method used
  };
}
