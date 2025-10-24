import { createContext, useContext, useState } from "react";
import type { UserProfile } from "../Models/User"
import type { RegisterRequestDto, LoginRequestDto } from "../Models/Identity"
import type { ApiResponse } from "../Models/ApiResponse"
import { registerAPI, loginAPI } from "../Services/AuthService";

type UserContextType = {
    user: UserProfile | null;
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    registerUser: (data: RegisterRequestDto) => Promise<ApiResponse<void>>;
    loginUser: (data: LoginRequestDto) => Promise<ApiResponse<{ accessToken: string }>>;
    logout: () => void;
    isLoggedIn: () => boolean;
}

type Props = {children: React.ReactNode}
const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({children}: Props) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isReady] = useState(true); // Set to true to show content immediately

    const registerUser = async (data: RegisterRequestDto): Promise<ApiResponse<void>> => {
        const result = await registerAPI(data)
        return result
    }

    const loginUser = async (data: LoginRequestDto) => {
        const result = await loginAPI(data)
        
        if (result.success) {
            // Store access token in memory
            setAccessToken(result.data.accessToken)
            // TODO: Fetch user profile and set user state
        }
        
        return result
    }

    const logout = () => {
        setAccessToken(null)
        setUser(null)
        // TODO: Call logout API to clear refresh token cookie
    }
    
    const isLoggedIn = (): boolean => Boolean(user);
    
    return (
        <UserContext.Provider value={
            {
                user,
                accessToken,
                setAccessToken,
                registerUser,
                loginUser,
                logout,
                isLoggedIn
            }
        }>
            {isReady ? children : null}
        </UserContext.Provider>
    )
}

export const useAuth = () => useContext(UserContext);