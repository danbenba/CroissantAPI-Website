import React, { createContext, useContext, useEffect, useState } from "react";

export function getToken() {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? match[1] : localStorage.getItem("token") || null;
}

interface AuthContextType {
    user: any;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<any>>;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [token, setTokenState] = useState<string | null>(getToken());

    useEffect(() => {
        const token = getToken();
        setTokenState(token);
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        fetch("/api/users/@me", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async (res) => {
                if (res.status === 200) {
                    setUser(await res.json());
                } else if (res.status === 401) {
                    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    setUser(null);
                    setTokenState(null);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, setUser, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
    return context;
}
