import { IsEmail, IsOptional, IsString, MinLength, IsEnum, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(['doctor', 'nurse', 'admin'])
  role?: 'doctor' | 'nurse' | 'admin';

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]\d{5}[A-Z]$/, {
    message: 'MCR Number must be in format: 1 letter + 5 numbers + 1 letter (e.g., M12345A)'
  })
  mcrNumber?: string;
}
