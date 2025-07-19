import { useEffect, useState } from "react";

export function getToken() {
    // Récupère le token depuis les cookies
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? match[1] : localStorage.getItem("token") || null;
}

export default function useAuth() {
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

    return { user, loading, setUser, token };
}