// Authentication utilities for Koalyx
import "server-only";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User } from "./database";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthUser {
  id: number;
  nom_utilisateur: string;
  email: string;
  role: "admin" | "moderateur" | "support" | "plus" | "ultra" | "membre";
  photo?: string;
  discord_id?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      nom_utilisateur: user.nom_utilisateur,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(username: string, password: string): Promise<AuthUser | null> {
  try {
    const { executeQuery } = await import("./database");

    const users = (await executeQuery(
      "SELECT * FROM utilisateurs WHERE nom_utilisateur = ? AND actif = TRUE",
      [username],
    )) as User[];

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    const isValidPassword = await verifyPassword(password, user.mot_de_passe);

    if (!isValidPassword) {
      return null;
    }

    await executeQuery("UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = ?", [user.id]);

    await executeQuery(
      "INSERT INTO logs_connexion (utilisateur_id, adresse_ip, succes) VALUES (?, ?, TRUE)",
      [user.id, "unknown"],
    );

    return {
      id: user.id,
      nom_utilisateur: user.nom_utilisateur,
      email: user.email,
      role: user.role as AuthUser["role"],
      photo: user.photo || undefined,
      discord_id: user.discord_id || undefined,
    };
  } catch (error) {
    console.error("[v0] Authentication error:", error);
    return null;
  }
}

export async function createUser(
  username: string, 
  email: string, 
  password: string, 
  discordId?: string, 
  photoUrl?: string
): Promise<AuthUser> {
  const { executeQuery } = await import("./database");

  // Vérifier les utilisateurs existants (séparément pour un meilleur diagnostic)
  const existingUsernames = (await executeQuery(
    "SELECT id FROM utilisateurs WHERE nom_utilisateur = ?",
    [username],
  )) as Array<{ id: number }>;

  if (existingUsernames.length > 0) {
    throw new Error("Ce nom d'utilisateur existe déjà");
  }

  const existingEmails = (await executeQuery(
    "SELECT id FROM utilisateurs WHERE email = ?",
    [email],
  )) as Array<{ id: number }>;

  if (existingEmails.length > 0) {
    throw new Error("Cet email est déjà utilisé");
  }

  // Vérifier Discord ID seulement s'il est fourni
  if (discordId) {
    const existingDiscord = (await executeQuery(
      "SELECT id FROM utilisateurs WHERE discord_id = ?",
      [discordId],
    )) as Array<{ id: number }>;

    if (existingDiscord.length > 0) {
      throw new Error("Ce compte Discord est déjà lié à un autre utilisateur");
    }
  }

  // Le mot de passe est maintenant toujours requis
  const hashedPassword = await hashPassword(password);

  const result = (await executeQuery(
    "INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe, discord_id, photo, role, date_creation, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
    [username, email, hashedPassword, discordId, photoUrl, "membre"],
  )) as any;

  return {
    id: Number(result?.insertId),
    nom_utilisateur: username,
    email: email,
    role: "membre",
    photo: photoUrl,
  };
}

export function getRoleLabel(role: string): { label: string; color: string } {
  switch (role) {
    case "admin":
      return { label: "Administrateur", color: "#8B0000" };
    case "moderateur":
      return { label: "Modérateur", color: "#0000FF" };
    case "support":
      return { label: "Support", color: "#008000" };
    case "plus":
      return { label: "Plus", color: "#FFD700" };
    case "ultra":
      return { label: "Ultra", color: "#9333EA" };
    case "membre":
    default:
      return { label: "Membre", color: "#808080" };
  }
}
