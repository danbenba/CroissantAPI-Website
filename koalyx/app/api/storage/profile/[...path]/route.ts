import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    
    if (!path || path.length < 2) {
      return new NextResponse('Invalid path', { status: 400 })
    }

    // Construire le chemin du fichier
    const username = path[0]
    const filename = path[1]
    const filePath = join(process.cwd(), 'storage', 'profile', username, filename)

    // Vérifier que le fichier existe
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Lire le fichier
    const fileBuffer = await readFile(filePath)
    
    // Déterminer le type MIME
    const getContentType = (filename: string) => {
      const ext = filename.split('.').pop()?.toLowerCase()
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg'
        case 'png':
          return 'image/png'
        case 'gif':
          return 'image/gif'
        case 'webp':
          return 'image/webp'
        default:
          return 'application/octet-stream'
      }
    }

    const contentType = getContentType(filename)

    // Retourner le fichier avec les bons headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving profile image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
