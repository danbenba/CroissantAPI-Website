import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useAuth from "../hooks/useAuth";

const TransmitTokenPage = () => {
    const [message, setMessage] = useState("Checking token...");
    const { token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (token) {
            window.location.href = `croissant-launcher://set-token?token=${encodeURIComponent(token)}`;
            router.push("/close");
        } else {
            setMessage("No token found.");
        }
    }, [token, router]);

    return <div>{message}</div>;
};

export default TransmitTokenPage;