import { type NextRequest, NextResponse } from "next/server"
import { createUser, generateToken } from "@/lib/auth"
import { validateInput, createErrorResponse, createSuccessResponse, ValidationSchema } from "@/lib/api-security"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Schéma de validation strict pour l'inscription
    const schema: ValidationSchema = {
      username: {
        required: true,
        type: 'string',
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_-]+$/
      },
      email: {
        required: true,
        type: 'email',
        maxLength: 255
      },
      password: {
        required: true,
        type: 'string',
        minLength: 8,
        maxLength: 128
      },
      confirmPassword: {
        required: true,
        type: 'string',
        minLength: 8,
        maxLength: 128
      }
    }

    const validation = validateInput(body, schema)
    if (!validation.valid) {
      return createErrorResponse(`Données invalides: ${validation.errors.join(', ')}`, 400)
    }

    const { username, email, password, confirmPassword } = validation.sanitized

    if (password !== confirmPassword) {
      return createErrorResponse("Les mots de passe ne correspondent pas", 400)
    }

    const user = await createUser(username, email, password)

    const token = generateToken(user)

    const response = createSuccessResponse({
      user: user
    }, "Compte créé avec succès")

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error("Erreur inscription:", error)
    return createErrorResponse("Erreur interne du serveur", 500)
  }
}
