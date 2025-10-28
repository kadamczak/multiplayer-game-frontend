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
    const refreshPromise = useRef<Promise<boolean> | null>(null);

    // Attempt to refresh token on mount (page reload)
    useEffect(() => {
        const initAuth = async () => {
            if (hasInitialized.current) return;
            hasInitialized.current = true;
            
            console.log('useAuth: Initializing authentication...');
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
        // If a refresh is already in progress, wait for it
        if (refreshPromise.current) {
            console.log('useAuth: Refresh already in progress, waiting...');
            return refreshPromise.current;
        }
        
        // Create and store the refresh promise
        refreshPromise.current = (async () => {
            try {
                const result = await refreshTokenAPI();
                
                if (result.success) {
                    console.log('useAuth: Token refresh succeeded');
                    setAccessToken(result.data.accessToken);
                    const payload = JSON.parse(atob(result.data.accessToken.split('.')[1]));
                    const username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || data.username;
                    
                    setUserName(username);
                    return true;
                }
                
                setAccessToken(null);
                setUserName(null);
                return false;
            } finally {
                setTimeout(() => {
                    refreshPromise.current = null;
                }, 1000);
            }
        })();
        
        return refreshPromise.current;
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