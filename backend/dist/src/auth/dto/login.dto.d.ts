export declare class LoginDto {
    email: string;
    password: string;
}
export declare class LoginResponseDto {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        clinicId: string;
        clinicName: string;
    };
}
