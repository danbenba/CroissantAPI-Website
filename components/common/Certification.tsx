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

export default function Certification({user, ...props}: {user: User} & React.ImgHTMLAttributes<HTMLImageElement>) {
    let markSrc = "";
    switch (true) {
        case user?.admin:
            markSrc = "/assets/admin-mark.png";
            break;
        case user?.isStudio:
            markSrc = "/assets/brand-verified-mark.png";
            break;
        default:
            markSrc = "/assets/verified-mark.png";
    }

    return (
        user?.verified ? (
            <img
                src={markSrc}
                alt="Verified"
                {...props}
            />
        ) : null
    );
}