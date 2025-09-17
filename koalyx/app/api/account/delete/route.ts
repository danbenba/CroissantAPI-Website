import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api-security'
import bcrypt from 'bcryptjs'

/**
 * DELETE - Supprimer définitivement le compte utilisateur
 */
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification (tous les utilisateurs connectés)
    const authResult = await requireRole(request, ['admin', 'moderateur', 'support', 'plus', 'ultra', 'membre'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const userId = authResult.user!.id
    const requestData = await request.json()
    const { password, deleteWord } = requestData

    // Vérifications de sécurité
    if (!password) {
      return createErrorResponse('Le mot de passe est requis pour supprimer le compte', 400)
    }

    // Vérifier que le mot "delete" a été tapé
    if (!deleteWord || deleteWord !== 'delete') {
      return createErrorResponse('Vous devez taper exactement "delete" pour confirmer la suppression', 400)
    }

    // Récupérer les informations utilisateur pour vérifier le mot de passe
    const [userRows] = await db.execute(
      'SELECT mot_de_passe FROM utilisateurs WHERE id = ?',
      [userId]
    ) as any[]

    if (!userRows || userRows.length === 0) {
      return createErrorResponse('Utilisateur non trouvé', 404)
    }

    const user = userRows[0]

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe)
    if (!isPasswordValid) {
      return createErrorResponse('Mot de passe incorrect', 401)
    }

    // Log de sécurité avant suppression
    console.log(`🚨 SUPPRESSION DE COMPTE - Utilisateur ID: ${userId} à ${new Date().toISOString()}`)

    // Commencer la transaction de suppression
    const connection = await db.getConnection()
    
    try {
      await connection.beginTransaction()

      // Supprimer toutes les données associées à l'utilisateur
      // Note: Nous supprimons seulement les tables qui existent réellement
      
      // Supprimer les données optionnelles (si les tables existent)
      const optionalTables = [
        { table: 'user_favorites', column: 'user_id' },
        { table: 'support_messages', query: 'DELETE FROM support_messages WHERE ticket_id IN (SELECT id FROM support_tickets WHERE user_id = ?)' },
        { table: 'support_tickets', column: 'user_id' },
        { table: 'dead_link_reports', column: 'user_id' },
        { table: 'game_update_requests', column: 'user_id' },
        { table: 'user_sessions', column: 'user_id' },
        { table: 'logs_connexion', column: 'utilisateur_id' }
      ]

      for (const tableInfo of optionalTables) {
        try {
          if (tableInfo.query) {
            // Requête personnalisée
            await connection.execute(tableInfo.query, [userId])
          } else {
            // Requête standard
            await connection.execute(`DELETE FROM ${tableInfo.table} WHERE ${tableInfo.column} = ?`, [userId])
          }
          console.log(`✅ Données supprimées de ${tableInfo.table}`)
        } catch (error: any) {
          if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log(`ℹ️ Table ${tableInfo.table} non trouvée, ignorée`)
          } else {
            console.error(`❌ Erreur lors de la suppression de ${tableInfo.table}:`, error.message)
            // Continue malgré l'erreur pour les tables optionnelles
          }
        }
      }
      
      // Supprimer l'utilisateur lui-même (table obligatoire)
      await connection.execute('DELETE FROM utilisateurs WHERE id = ?', [userId])

      // Confirmer la transaction
      await connection.commit()

      console.log(`✅ COMPTE SUPPRIMÉ - Utilisateur ID: ${userId} supprimé avec succès`)

      return createSuccessResponse({
        message: 'Compte supprimé avec succès',
        deleted: true
      })

    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await connection.rollback()
      throw error
    } finally {
      // Libérer la connexion
      connection.release()
    }

  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error)
    return createErrorResponse('Erreur lors de la suppression du compte', 500)
  }
}
