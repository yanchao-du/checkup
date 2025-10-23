import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, Matches, ValidateIf } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsEnum(['doctor', 'nurse', 'admin'])
  role: 'doctor' | 'nurse' | 'admin';

  @ValidateIf(o => o.role === 'doctor')
  @IsNotEmpty({ message: 'MCR Number is required for doctors' })
  @IsString()
  @Matches(/^[A-Z]\d{5}[A-Z]$/, {
    message: 'MCR Number must be in format: 1 letter + 5 numbers + 1 letter (e.g., M12345A)'
  })
  mcrNumber?: string;
}
