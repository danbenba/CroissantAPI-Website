// lib/auth-client.ts
export type Role = "admin" | "moderateur" | "support" | "plus" | "ultra" | "membre";

export function getRoleLabel(role: Role) {
  switch (role) {
    case "admin":
      return { label: "Administrateur", color: "#8B0000" };
    case "moderateur":
      return { label: "Modérateur", color: "#0000FF" };
    case "support":
      return { label: "Support", color: "#008000" };
    case "ultra":
      return { label: "Ultra", color: "#9333EA" };
    case "plus":
      return { label: "Plus", color: "#FFD700" };
    case "membre":
    default:
      return { label: "Membre", color: "#808080" };
  }
}
