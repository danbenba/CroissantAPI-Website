"use client"

import { Card, CardBody, CardHeader, Button, Chip } from "@nextui-org/react"
import { StarIcon } from "@heroicons/react/24/solid"
import type { Programme } from "@/lib/database"

interface ProgramCardProps {
  programme: Programme
  onLearnMore: (programme: Programme) => void
  animationDelay?: number
}

export default function ProgramCard({ programme, onLearnMore, animationDelay = 0 }: ProgramCardProps) {
  const getCategoryColor = (categorie?: string) => {
    switch (categorie) {
      case "Compression":
        return "danger"
      case "Téléchargement":
        return "primary"
      case "Multimédia":
        return "secondary"
      case "Sécurité":
        return "success"
      case "Productivité":
        return "warning"
      default:
        return "default"
    }
  }

  return (
    <Card
      className="hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <CardHeader className="flex flex-col items-center pb-2">
        <div className="w-20 h-20 mb-4 flex items-center justify-center">
          <img
            src={programme.icone_url || "/placeholder.svg?height=80&width=80&query=software icon"}
            alt={`Icône ${programme.nom}`}
            className="w-full h-full object-contain transition-transform duration-300 hover:rotate-12"
            onError={(e) => {
              e.currentTarget.src = "/generic-software-icon.png"
            }}
          />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold text-center">{programme.nom}</h2>
          {programme.categorie && (
            <Chip color={getCategoryColor(programme.categorie)} size="sm" variant="flat">
              {programme.categorie}
            </Chip>
          )}
        </div>

        {programme.note_moyenne && programme.note_moyenne > 0 && (
          <div className="flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">{programme.note_moyenne.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({programme.nombre_votes} votes)</span>
          </div>
        )}
      </CardHeader>

      <CardBody className="pt-0">
        <p className="text-gray-600 text-sm mb-6 line-clamp-4 leading-relaxed">{programme.description}</p>

        <Button color="primary" variant="solid" className="w-full font-medium" onClick={() => onLearnMore(programme)}>
          En savoir plus
        </Button>
      </CardBody>
    </Card>
  )
}
