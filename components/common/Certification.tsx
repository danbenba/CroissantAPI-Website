import React from "react";
import CachedImage from "../utils/CachedImage";
export interface ShopItem {
    itemId: string;
    name: string;
    description: string;
    price: number;
    stock?: number; // optionnel, si le backend le fournit,
    iconHash: string;
}
interface User {
    verified: boolean;
    id: string;
    username: string;
    disabled?: boolean;
    admin?: boolean;
    isStudio?: boolean;
    inventory?: ({ itemId: string; name: string; description: string; price: number; iconHash: string; } & { amount: number })[];
    ownedItems?: ShopItem[];
}

export default function Certification({ user, ...props }: { user: User } & React.ImgHTMLAttributes<HTMLImageElement>) {
    const [markSrc, setMarkSrc] = React.useState("");

    React.useEffect(() => {
        if (user?.admin) {
            setMarkSrc("/assets/admin-mark.png");
        } else if (user?.isStudio) {
            setMarkSrc("/assets/brand-verified-mark.png");
        } else {
            setMarkSrc("/assets/verified-mark.png");
        }
    }, [user]);

    return (
        user?.verified ? (
            <img
                src={markSrc || "/assets/verified-mark.png"}
                alt="Verified"
                {...props}
            />
        ) : null
    );
}