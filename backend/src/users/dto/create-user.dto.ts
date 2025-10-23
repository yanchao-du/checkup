import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';

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
}
