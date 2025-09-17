import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, discordId, photoUrl } = await request.json()

    // Validations basiques
    if (!username || !email) {
      return NextResponse.json({ 
        error: 'Le nom d\'utilisateur et l\'email sont requis' 
      }, { status: 400 })
    }

    // Le mot de passe est toujours requis maintenant
    if (!password) {
      return NextResponse.json({ 
        error: 'Le mot de passe est requis' 
      }, { status: 400 })
    }

    // Validation de la longueur du mot de passe
    if (password.length < 6) {
      return NextResponse.json({ 
        error: 'Le mot de passe doit contenir au moins 6 caractères' 
      }, { status: 400 })
    }

    // Créer l'utilisateur
    const newUser = await createUser(username, email, password, discordId, photoUrl)

    return NextResponse.json({ 
      success: true, 
      message: 'Compte créé avec succès',
      user: {
        id: newUser.id,
        nom_utilisateur: newUser.nom_utilisateur,
        email: newUser.email,
        role: newUser.role
      }
    })

  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erreur lors de la création du compte' 
    }, { status: 500 })
  }
}
