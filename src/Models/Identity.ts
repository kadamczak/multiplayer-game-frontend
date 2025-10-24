export type LoginRequestDto = {
    username: string
    password: string
}

export type TokenResponseDto = {
    accessToken: string
    refreshToken: string | null // stored in cookie for browser clients
    expiresInSeconds: number
}

export type RegisterRequestDto = {
    username: string
    email: string
    password: string
}