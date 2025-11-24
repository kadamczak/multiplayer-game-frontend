export type LoginRequestDto = {
    username: string;
    password: string;
}

export type TokenResponseDto = {
    accessToken: string;
    refreshToken: string | null; // stored in cookie for browser clients
    expiresInSeconds: number;
}

export type RegisterRequestDto = {
    userName: string;
    email: string;
    password: string;
}

export type ChangePasswordRequest = {
    currentPassword: string;
    newPassword: string;
    //refreshToken: null; // only used by Game clients
}

export type DeleteAccountRequest = {
    password: string;
}

export type ForgotPasswordRequest = {
    email: string;
}

export type ResetPasswordRequest = {
    email: string;
    resetToken: string;
    newPassword: string;
}

export type ConfirmEmailRequest = {
    email: string;
    token: string;
}