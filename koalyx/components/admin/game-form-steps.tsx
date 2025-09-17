"use client"

import React from 'react'
import {
  Input,
  Textarea,
  Checkbox,
  Button,
  Card,
  CardBody
} from "@heroui/react"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import GameMediaManager from '@/components/game-media-manager'

interface Category {
  id: number
  name: string
  type: string
  description?: string
}

interface Badge {
  id: number
  name: string
  display_name: string
  color: string
  icon: string
  description: string
}

interface DownloadLink {
  id?: number
  icon_url: string
  title: string
  description: string
  download_url: string
  is_vip: boolean
  access_level: 'free' | 'plus' | 'ultra' | 'differentiated'
  position: number
  is_differentiated?: boolean
  member_url?: string
  plus_url?: string
  ultra_url?: string
}

interface GameFormData {
  title: string
  description: string
  banner_url: string
  zip_password: string
  is_vip: boolean
  access_level: 'free' | 'plus' | 'ultra'
  category_id: number
  platform: string
  specifications: string
  year: number
  banner_file: File | null
}

interface BadgeData {
  badgeId: number
  expiresAt: string
}

interface GameFormStepsProps {
  step: number
  formData: GameFormData
  badgeData: BadgeData
  downloadLinks: DownloadLink[]
  categories: Category[]
  platforms: string[]
  years: number[]
  badges: Badge[]
  editingGame?: { id: number; title: string } | null
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFormDataChange: (newData: Partial<GameFormData>) => void
  onBadgeDataChange: (newData: Partial<BadgeData>) => void
     onDownloadLinkChange: (index: number, field: keyof DownloadLink, value: any) => void
   onAddDownloadLink: (type?: 'normal' | 'differentiated') => void
   onRemoveDownloadLink: (index: number) => void
}

export default function GameFormSteps({
  step,
  formData,
  badgeData,
  downloadLinks,
  categories,
  platforms,
  years,
  badges,
  editingGame,
  onInputChange,
  onCheckboxChange,
  onFormDataChange,
  onBadgeDataChange,
  onDownloadLinkChange,
  onAddDownloadLink,
  onRemoveDownloadLink
}: GameFormStepsProps) {

  // Debug des liens reçus
  console.log('🔍 GameFormSteps - Liens reçus:', downloadLinks);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-6 border border-white/10 backdrop-blur-sm shadow-2xl transform transition-all duration-500 hover:scale-[1.01] hover:shadow-blue-500/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25 animate-pulse">
                <i className="fas fa-info-circle text-lg"></i>
              </div>
              <div>
                <h5 className="text-xl font-semibold text-white mb-1">Informations de base</h5>
                <p className="text-sm text-gray-400">Définissez les informations principales du jeu</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Titre du jeu"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                required
                variant="bordered"
                classNames={{
                  input: "text-white bg-gray-800/80 border-white/20 placeholder:text-gray-500",
                  label: "text-gray-300 font-medium",
                  inputWrapper: "border-white/20 hover:border-purple-500/50 focus-within:border-purple-500 bg-gray-800/80"
                }}
              />
              
              <Input
                label="URL de la bannière"
                name="banner_url"
                value={formData.banner_url}
                onChange={onInputChange}
                variant="bordered"
                classNames={{
                  input: "text-white bg-gray-800/80 border-white/20 placeholder:text-gray-500",
                  label: "text-gray-300 font-medium",
                  inputWrapper: "border-white/20 hover:border-purple-500/50 focus-within:border-purple-500 bg-gray-800/80"
                }}
              />
            </div>

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              required
              variant="bordered"
              classNames={{
                input: "text-white bg-gray-800/80 border-white/20 placeholder:text-gray-500",
                label: "text-gray-300 font-medium",
                inputWrapper: "border-white/20 hover:border-purple-500/50 focus-within:border-purple-500 bg-gray-800/80"
              }}
            />
          </div>
        )

      case 2:
        return (
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-6 border border-white/10 backdrop-blur-sm shadow-2xl transform transition-all duration-500 hover:scale-[1.01] hover:shadow-green-500/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/25 animate-pulse">
                <i className="fas fa-cogs text-lg"></i>
              </div>
              <div>
                <h5 className="text-xl font-semibold text-white mb-1">Configuration du jeu</h5>
                <p className="text-sm text-gray-400">Configurez les paramètres techniques</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Catégorie</label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => onFormDataChange({ category_id: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-800/80 border border-white/20 text-white rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id} className="bg-gray-800 text-white">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">Plateforme</label>
                <select
                  value={formData.platform || ''}
                  onChange={(e) => onFormDataChange({ platform: e.target.value })}
                  className="w-full bg-gray-800/80 border border-white/20 text-white rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Sélectionner une plateforme</option>
                  {platforms.map(platform => (
                    <option key={platform} value={platform} className="bg-gray-800 text-white">
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">Année</label>
                <select
                  value={formData.year || ''}
                  onChange={(e) => onFormDataChange({ year: parseInt(e.target.value) || 2024 })}
                  className="w-full bg-gray-800/80 border border-white/20 text-white rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                >
                  {years.map(year => (
                    <option key={year} value={year} className="bg-gray-800 text-white">
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Input
                label="Mot de passe ZIP"
                name="zip_password"
                value={formData.zip_password}
                onChange={onInputChange}
                variant="bordered"
                classNames={{
                  input: "text-white bg-gray-800/80 border-white/20 placeholder:text-gray-500",
                  label: "text-gray-300 font-medium",
                  inputWrapper: "border-white/20 hover:border-purple-500/50 focus-within:border-purple-500 bg-gray-800/80"
                }}
              />
              
                              <div className="space-y-2">
                  <label className="text-gray-300 font-medium text-sm flex items-center gap-2">
                    <i className="fas fa-shield-alt text-purple-400"></i>
                    Niveau d'Accès
                  </label>
                  <div className="relative">
                    <select
                      name="access_level"
                      value={formData.access_level}
                      onChange={onInputChange}
                      className="w-full bg-gray-800/80 border border-white/20 text-white rounded-lg px-3 py-2 pl-10 focus:border-purple-500 focus:outline-none hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                    >
                      <option value="free" className="bg-gray-800 text-white">
                        Gratuit - Accessible à tous
                      </option>
                      <option value="plus" className="bg-gray-800 text-white">
                        Plus - Abonnés Plus et niveaux supérieurs
                      </option>
                      <option value="ultra" className="bg-gray-800 text-white">
                        Ultra - Abonnés Ultra uniquement
                      </option>
                    </select>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <i className={`fas ${
                        formData.access_level === 'ultra' ? 'fa-crown text-purple-400' :
                        formData.access_level === 'plus' ? 'fa-star text-yellow-400' :
                        'fa-unlock text-green-400'
                      } text-sm`}></i>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <i className="fas fa-info-circle text-blue-400"></i>
                    Définit qui peut accéder à ce jeu. Les administrateurs ont toujours accès.
                  </p>
                </div>
            </div>

            <Textarea
              label="Spécifications"
              name="specifications"
              value={formData.specifications}
              onChange={onInputChange}
              variant="bordered"
              classNames={{
                input: "text-white bg-gray-800/80 border-white/20 placeholder:text-gray-500",
                label: "text-gray-300 font-medium",
                inputWrapper: "border-white/20 hover:border-purple-500/50 focus-within:border-purple-500 bg-gray-800/80"
              }}
            />
          </div>
        )

      case 3:
        return (
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-6 border border-white/10 backdrop-blur-sm shadow-2xl transform transition-all duration-500 hover:scale-[1.01] hover:shadow-purple-500/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/25 animate-pulse">
                <i className="fas fa-link text-lg"></i>
              </div>
              <div>
                <h5 className="text-xl font-semibold text-white mb-1">Badges et liens</h5>
                <p className="text-sm text-gray-400">Ajoutez des badges et liens de téléchargement</p>
              </div>
            </div>

            {/* Badge Section */}
            <div className="mb-6">
              <h6 className="text-md font-medium text-gray-300 mb-4">Badge du jeu</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Type de badge</label>
                  <select
                    value={badgeData.badgeId || ''}
                    onChange={(e) => onBadgeDataChange({ badgeId: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-800/80 border border-white/20 text-white rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Choisir un badge</option>
                    {badges.map(badge => (
                      <option key={badge.id} value={badge.id} className="bg-gray-800 text-white">
                        {badge.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="Date d'expiration"
                  type="datetime-local"
                  value={badgeData.expiresAt}
                  onChange={(e) => onBadgeDataChange({ expiresAt: e.target.value })}
                  variant="bordered"
                  classNames={{
                    input: "text-white bg-gray-800/80 border-white/20 placeholder:text-gray-500",
                    label: "text-gray-300 font-medium",
                    inputWrapper: "border-white/20 hover:border-purple-500/50 focus-within:border-purple-500 bg-gray-800/80"
                  }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Si aucune date n'est spécifiée, le badge expirera dans 10 jours par défaut.
              </div>
            </div>

                         {/* Download Links Section */}
             <div>
               <div className="flex items-center justify-between mb-4">
                 <h6 className="text-md font-medium text-gray-300">Liens de téléchargement</h6>
                 <div className="relative">
                   <select
                     onChange={(e) => {
                       if (e.target.value === 'normal') {
                         onAddDownloadLink('normal');
                       } else if (e.target.value === 'differentiated') {
                         onAddDownloadLink('differentiated');
                       }
                       e.target.value = ''; // Reset selection
                     }}
                     disabled={downloadLinks.length >= 10}
                     className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                   >
                     <option value="" className="bg-gray-800 text-white">
                       ➕ Ajouter un lien
                     </option>
                     <option value="normal" className="bg-gray-800 text-white">
                       🔗 Lien Normal
                     </option>
                     <option value="differentiated" className="bg-gray-800 text-white">
                       👥 Lien Différencié
                     </option>
                   </select>
                 </div>
               </div>

                             <div className="space-y-4">
                 {downloadLinks.map((link, index) => {
                   // Déterminer si c'est un lien différencié
                   const isDifferentiated = link.access_level === 'differentiated' || link.is_differentiated;

                   return (
                     <Card 
                       key={index} 
                       className={`border ${
                         isDifferentiated 
                           ? 'bg-blue-900/20 border-blue-500/30' 
                           : 'bg-gray-800/50 border-white/10'
                       }`}
                     >
                       <CardBody className="p-4">
                         {/* En-tête avec type de lien et bouton supprimer */}
                         <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2">
                             {isDifferentiated ? (
                               <>
                                 <i className="fas fa-users-cog text-blue-400"></i>
                                 <span className="text-blue-400 font-medium">Lien Différencié</span>
                               </>
                             ) : (
                               <>
                                 <i className={`fas ${
                                   link.access_level === 'ultra' ? 'fa-crown text-purple-400' :
                                   link.access_level === 'plus' ? 'fa-star text-yellow-400' :
                                   'fa-link text-green-400'
                                 }`}></i>
                                 <span className="text-gray-300 font-medium">Lien Normal ({link.access_level})</span>
                               </>
                             )}
                           </div>
                           {downloadLinks.length > 1 && (
                             <Button
                               size="sm"
                               color="danger"
                               variant="light"
                               onPress={() => onRemoveDownloadLink(index)}
                               startContent={<TrashIcon className="w-4 h-4" />}
                             >
                               Supprimer
                             </Button>
                           )}
                         </div>

                         {/* Rendu conditionnel selon le type */}
                         {isDifferentiated ? (
                           // Bloc pour liens différenciés
                           <div className="space-y-4">
                             <Input
                               label="Titre du lien"
                               value={link.title}
                               onChange={(e) => onDownloadLinkChange(index, 'title', e.target.value)}
                               variant="bordered"
                               classNames={{
                                 input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-500",
                                 label: "text-blue-300 font-medium",
                                 inputWrapper: "border-blue-500/30 hover:border-blue-500/50 focus-within:border-blue-500 bg-gray-700/50"
                               }}
                             />
                             
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <Input
                                 label="Lien Membre (défaut)"
                                 value={link.member_url || ''}
                                 onChange={(e) => onDownloadLinkChange(index, 'member_url', e.target.value)}
                                 placeholder="https://lockr.com/exemple"
                                 variant="bordered"
                                 startContent={<i className="fas fa-user text-gray-400" />}
                                 classNames={{
                                   input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-500",
                                   label: "text-gray-300 font-medium",
                                   inputWrapper: "border-white/20 hover:border-gray-500/50 focus-within:border-gray-500 bg-gray-700/50"
                                 }}
                               />
                               
                               <Input
                                 label="Lien Plus"
                                 value={link.plus_url || ''}
                                 onChange={(e) => onDownloadLinkChange(index, 'plus_url', e.target.value)}
                                 placeholder="https://linkvertise.com/exemple"
                                 variant="bordered"
                                 startContent={<i className="fas fa-star text-yellow-400" />}
                                 classNames={{
                                   input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-500",
                                   label: "text-gray-300 font-medium",
                                   inputWrapper: "border-white/20 hover:border-yellow-500/50 focus-within:border-yellow-500 bg-gray-700/50"
                                 }}
                               />
                               
                               <Input
                                 label="Lien Ultra (direct)"
                                 value={link.ultra_url || ''}
                                 onChange={(e) => onDownloadLinkChange(index, 'ultra_url', e.target.value)}
                                 placeholder="https://direct-link.com/exemple"
                                 variant="bordered"
                                 startContent={<i className="fas fa-crown text-purple-400" />}
                                 classNames={{
                                   input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-500",
                                   label: "text-gray-300 font-medium",
                                   inputWrapper: "border-white/20 hover:border-purple-500/50 focus-within:border-purple-500 bg-gray-700/50"
                                 }}
                               />
                             </div>

                             <Input
                               label="URL de l'icône"
                               value={link.icon_url}
                               onChange={(e) => onDownloadLinkChange(index, 'icon_url', e.target.value)}
                               variant="bordered"
                               classNames={{
                                 input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-500",
                                 label: "text-blue-300 font-medium",
                                 inputWrapper: "border-blue-500/30 hover:border-blue-500/50 focus-within:border-blue-500 bg-gray-700/50"
                               }}
                             />
                           </div>
                         ) : (
                           // Bloc pour liens normaux
                           <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <Input
                                 label="Titre du lien"
                                 value={link.title}
                                 onChange={(e) => onDownloadLinkChange(index, 'title', e.target.value)}
                                 variant="bordered"
                                 classNames={{
                                   input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-500",
                                   label: "text-gray-300 font-medium",
                                   inputWrapper: "border-white/20 hover:border-purple-500/50 focus-within:border-purple-500 bg-gray-700/50"
                                 }}
                               />
                               
                               <Input
                                 label="URL de téléchargement"
                                 value={link.download_url}
                                 onChange={(e) => onDownloadLinkChange(index, 'download_url', e.target.value)}
                                 variant="bordered"
                                 classNames={{
                                   input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-500",
                                   label: "text-gray-300 font-medium",
                                   inputWrapper: "border-white/20 hover:border-purple-500/50 focus-within:border-purple-500 bg-gray-700/50"
                                 }}
                               />
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <Input
                                 label="URL de l'icône"
                                 value={link.icon_url}
                                 onChange={(e) => onDownloadLinkChange(index, 'icon_url', e.target.value)}
                                 variant="bordered"
                                 classNames={{
                                   input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-500",
                                   label: "text-gray-300 font-medium",
                                   inputWrapper: "border-white/20 hover:border-purple-500/50 focus-within:border-purple-500 bg-gray-700/50"
                                 }}
                               />
                               
                               <div className="space-y-2">
                                 <label className="text-gray-300 font-medium text-sm flex items-center gap-2">
                                   <i className="fas fa-key text-purple-400"></i>
                                   Niveau d'accès
                                 </label>
                                 <div className="relative">
                                   <select
                                     value={link.access_level}
                                     onChange={(e) => {
                                       onDownloadLinkChange(index, 'access_level', e.target.value);
                                     }}
                                     className="w-full bg-gray-700/50 border border-white/20 text-white rounded-lg px-3 py-2 pl-10 focus:border-purple-500 focus:outline-none hover:border-purple-500/50 transition-all duration-300"
                                   >
                                     <option value="free" className="bg-gray-800 text-white">Gratuit</option>
                                     <option value="plus" className="bg-gray-800 text-white">Plus</option>
                                     <option value="ultra" className="bg-gray-800 text-white">Ultra</option>
                                   </select>
                                   <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                     <i className={`fas ${
                                       link.access_level === 'ultra' ? 'fa-crown text-purple-400' :
                                       link.access_level === 'plus' ? 'fa-star text-yellow-400' :
                                       'fa-unlock text-green-400'
                                     } text-sm`}></i>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           </div>
                         )}
                       </CardBody>
                     </Card>
                   );
                 })}
               </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-6 border border-white/10 backdrop-blur-sm shadow-2xl transform transition-all duration-500 hover:scale-[1.01] hover:shadow-orange-500/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/25 animate-pulse">
                <i className="fas fa-images text-lg"></i>
              </div>
              <div>
                <h5 className="text-xl font-semibold text-white mb-1">Médias du jeu</h5>
                <p className="text-sm text-gray-400">Ajoutez des images et vidéos</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 text-sm mb-4">
                Ajoutez des images et vidéos pour enrichir la présentation de votre jeu. 
                La première image sera utilisée comme bannière principale.
              </p>
              
              {editingGame && (
                <GameMediaManager 
                  gameId={editingGame.id} 
                  gameTitle={editingGame.title} 
                />
              )}
              
              {!editingGame && (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-white/10 text-center">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-image text-2xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-400 mb-2">Gestion des médias</p>
                  <p className="text-gray-500 text-sm">
                    Les médias pourront être ajoutés après la création du jeu.
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-6 border border-white/10 backdrop-blur-sm shadow-2xl transform transition-all duration-500 hover:scale-[1.01] hover:shadow-pink-500/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/25 animate-pulse">
                <i className="fas fa-check-circle text-lg"></i>
              </div>
              <div>
                <h5 className="text-xl font-semibold text-white mb-1">Finalisation</h5>
                <p className="text-sm text-gray-400">Vérifiez et validez les informations</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-white text-xs"></i>
                </div>
                <span className="text-green-400 font-medium">
                  {editingGame ? 'Prêt à être modifié !' : 'Prêt à être créé !'}
                </span>
              </div>
              <p className="text-gray-300 text-sm">
                {editingGame 
                  ? 'Vérifiez que toutes les informations sont correctes avant de finaliser la modification du jeu.'
                  : 'Vérifiez que toutes les informations sont correctes avant de finaliser la création du jeu.'
                }
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return renderStepContent()
}
