import { IsNotEmpty, IsString, IsOptional, Matches, IsEmail } from 'class-validator';

export class CreateClinicDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9]{7}$/, {
    message: 'HCI Code must be 7 alphanumeric characters (e.g., HCI0001)'
  })
  hciCode?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
