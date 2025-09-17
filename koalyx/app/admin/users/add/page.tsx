"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import AdminBreadcrumbs from "@/components/admin/admin-breadcrumbs"
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react"

interface CreateUserData {
  nom_utilisateur: string
  email: string
  role: string
  password: string
}

export default function AddUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateUserData>({
    nom_utilisateur: "",
    email: "",
    role: "membre",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        router.push('/admin/users')
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.message}`)
      }
    } catch (error) {
      alert("Erreur lors de la création de l'utilisateur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
      <Navigation />

      {/* voile violet en arrière-plan */}
      <div
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Hero Section */}
      <div className="relative z-10 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <AdminBreadcrumbs 
            items={[
              { label: "Administration", href: "/admin", icon: "fas fa-shield-alt" },
              { label: "Utilisateurs", href: "/admin/users", icon: "fas fa-users" },
              { label: "Créer un utilisateur", icon: "fas fa-plus" }
            ]} 
          />

          {/* Badge et Titre */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-blue-600/20 text-green-300 px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-green-500/30">
              <i className="fas fa-plus"></i>
              Création Utilisateur
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-white" 
                style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
              Nouvel Utilisateur
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Créez un nouveau compte utilisateur sur la plateforme
            </p>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                color="default" 
                variant="bordered" 
                size="lg"
                startContent={<i className="fas fa-arrow-left"></i>}
                onPress={() => router.push('/admin/users')}
                className="border-white/20 text-white hover:bg-white/10 transition-all duration-300"
              >
                Retour à la liste
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-user-plus text-white text-lg"></i>
              </div>
              <h2 className="text-xl font-bold text-white">Informations de l'utilisateur</h2>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nom d'utilisateur"
                  placeholder="johndoe"
                  value={formData.nom_utilisateur}
                  onChange={(e) => setFormData({ ...formData, nom_utilisateur: e.target.value })}
                  isRequired
                  className="text-white"
                  classNames={{
                    label: "text-gray-300",
                    input: "text-white bg-gray-700/50 border-white/20",
                    inputWrapper: "bg-gray-700/50 border-white/20 hover:border-blue-500/50 focus-within:border-blue-500"
                  }}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  isRequired
                  className="text-white"
                  classNames={{
                    label: "text-gray-300",
                    input: "text-white bg-gray-700/50 border-white/20",
                    inputWrapper: "bg-gray-700/50 border-white/20 hover:border-blue-500/50 focus-within:border-blue-500"
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Rôle"
                  selectedKeys={[formData.role]}
                  onSelectionChange={(keys) => setFormData({ ...formData, role: Array.from(keys)[0] as string })}
                  isRequired
                  className="text-white"
                  classNames={{
                    label: "text-gray-300",
                    trigger: "bg-gray-700/50 border-white/20 hover:border-blue-500/50 data-[focus=true]:border-blue-500",
                    value: "text-white",
                    listbox: "bg-gray-700 border-white/20"
                  }}
                >
                  <SelectItem key="membre" className="text-white">Membre</SelectItem>
                  <SelectItem key="plus" className="text-white">Plus</SelectItem>
                  <SelectItem key="ultra" className="text-white">Ultra</SelectItem>
                  <SelectItem key="support" className="text-white">Support</SelectItem>
                  <SelectItem key="moderateur" className="text-white">Modérateur</SelectItem>
                  <SelectItem key="admin" className="text-white">Administrateur</SelectItem>
                </Select>

                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="Mot de passe sécurisé"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  isRequired
                  className="text-white"
                  classNames={{
                    label: "text-gray-300",
                    input: "text-white bg-gray-700/50 border-white/20",
                    inputWrapper: "bg-gray-700/50 border-white/20 hover:border-blue-500/50 focus-within:border-blue-500"
                  }}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  type="button"
                  color="default" 
                  variant="light" 
                  onPress={() => router.push('/admin/users')}
                  className="flex-1"
                >
                  <i className="fas fa-times mr-2"></i>
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  color="primary" 
                  variant="shadow" 
                  isLoading={loading}
                  isDisabled={!formData.nom_utilisateur || !formData.email || !formData.password}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-600"
                  startContent={!loading ? <i className="fas fa-save"></i> : undefined}
                >
                  Créer l'utilisateur
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* Bouton scroll vers le haut */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          isIconOnly
          color="primary"
          variant="shadow"
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-300 animate-bounce"
          onPress={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <i className="fas fa-arrow-up text-white text-xl"></i>
        </Button>
      </div>
    </div>
  )
}
