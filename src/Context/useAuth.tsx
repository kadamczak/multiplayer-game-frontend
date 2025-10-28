import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { RegisterRequestDto, LoginRequestDto, TokenResponseDto } from "../Models/Identity"
import type { ApiResponse } from "../Models/ApiResponse"
import { registerAPI, loginAPI, logoutAPI, refreshTokenAPI } from "../Services/AuthService";
import { useNavigate } from "react-router-dom";

type UserContextType = {
    userName: string | null;
    accessToken: string | null;
    isLoading: boolean;
    setAccessToken: (token: string | null) => void;
    registerUser: (data: RegisterRequestDto) => Promise<ApiResponse<void>>;
    loginUser: (data: LoginRequestDto) => Promise<ApiResponse<TokenResponseDto>>;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
    isLoggedIn: () => boolean;
}

type Props = {children: React.ReactNode}
const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({children}: Props) => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasInitialized = useRef(false);

    // Attempt to refresh token on mount (page reload)
    useEffect(() => {
        const initAuth = async () => {
            if (hasInitialized.current) return;
            hasInitialized.current = true;
            
            await refresh();
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const registerUser = async (data: RegisterRequestDto): Promise<ApiResponse<void>> => {
        const result = await registerAPI(data);
        return result;
    }

    const loginUser = async (data: LoginRequestDto) => {
        const result = await loginAPI(data);
        
        if (result.success) {
            setAccessToken(result.data.accessToken); // access token -> in memory
            setUserName(data.username);
        }
    
        return result;
    }

    const refresh = async (): Promise<boolean> => {
        const result = await refreshTokenAPI();
        
        if (result.success) {
            setAccessToken(result.data.accessToken);
            // TODO: Extract username from token or fetch user profile
            // For now, you might need to decode the JWT or make another API call
            setUserName("REFRESHED USER");
            return true;
        }
        
        // Clear state if refresh fails
        setAccessToken(null);
        setUserName(null);
        return false;
    }

    const logout = async () => {
        setAccessToken(null);
        setUserName(null);
        await logoutAPI();
        navigate("/login");
    }
    
    const isLoggedIn = (): boolean => Boolean(accessToken);
    
    return (
        <UserContext.Provider value={
            {
                userName: userName,
                accessToken,
                isLoading,
                setAccessToken,
                registerUser,
                loginUser,
                logout,
                refreshToken: refresh,
                isLoggedIn
            }
        }>
            {isLoading ? <div>Loading...</div> : children}
        </UserContext.Provider>
    )
}

export const useAuth = () => useContext(UserContext);