import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

export default function Searchbar() {
    const [value, setValue] = useState("");
    const router = useRouter();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const isFromLauncher = () => {
        return typeof window !== "undefined" &&
        (window.location.pathname.startsWith("/launcher") || window.location.search.includes("from=launcher")) ? "&from=launcher" : "";
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const query = encodeURIComponent(e.currentTarget.value);
            if (query) {
                router.push("/search?q=" + query + isFromLauncher());
            }
        }
    };

    return (
        <input
            style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "8px",
                // width: "30%",
                boxSizing: "border-box",
                backgroundColor: "#2a2a2a",
                color: "#fff",
            }}
            placeholder="Search for users..."
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
        />
    );
}