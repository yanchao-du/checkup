import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<import("./dto/login.dto").LoginResponseDto>;
    logout(): Promise<{
        message: string;
    }>;
    getMe(user: any): Promise<any>;
}
