"use client"

import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Link from "next/link";
import useIsMobile from "../../hooks/useIsMobile";
import Certification from "../../components/common/Certification";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Input,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
  Badge,
  Tooltip,
  Divider,
  Textarea,
  Switch,
  Select,
  SelectItem,
  Avatar,
  Skeleton,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";

const endpoint = "/api"; // Replace with your actual API endpoint

type Game = {
  gameId: string;
  name: string;
  description: string;
  price: number;
  showInStore: boolean;
  iconHash?: string;
  bannerHash?: string;
  genre?: string;
  release_date?: string;
  developer?: string;
  publisher?: string;
  platforms?: string;
  website?: string;
  trailer_link?: string;
  multiplayer?: boolean;
  download_link?: string;
};

const MyGames = () => {
  const isMobile = useIsMobile();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    game: Game;
  } | null>(null);
  
  // Ownership Transfer States
  const [ownershipTransferGame, setOwnershipTransferGame] = useState<Game | null>(null);
  const [ownershipUserId, setOwnershipUserId] = useState<string>("");
  const [ownershipUserSearch, setOwnershipUserSearch] = useState<string>("");
  const [ownershipUserResults, setOwnershipUserResults] = useState<any[]>([]);
  const [ownershipUserDropdownOpen, setOwnershipUserDropdownOpen] = useState(false);
  const [transferOwnershipLoading, setTransferOwnershipLoading] = useState(false);

  // Modal states
  const {isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose} = useDisclosure();
  const {isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose} = useDisclosure();
  const {isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose} = useDisclosure();
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch(`${endpoint}/games/my`);
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
      } else {
        console.error("Failed to fetch games");
      }
    } catch (err) {
      console.error("Error fetching games:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (game: Game) => {
    setEditingId(game.gameId);
    setFormData({
      ...game,
      markAsUpdated: false,
    });
    setIconFile(null);
    setBannerFile(null);
    setErrors({});
    setSuccess(null);
    onEditOpen();
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e: any, type: "icon" | "banner") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "icon") {
        setIconFile(file);
      } else {
        setBannerFile(file);
      }
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    let iconHash = formData.iconHash;
    let bannerHash = formData.bannerHash;

    if (iconFile) {
      const iconData = new FormData();
      iconData.append("icon", iconFile);
      try {
        const res = await fetch("/upload/game-icon", {
          method: "POST",
          body: iconData,
        });
        if (res.ok) {
          const data = await res.json();
          iconHash = data.hash;
        } else {
          const err = await res.json();
          setErrors({ submit: err.error || "Failed to upload icon." });
          setSubmitting(false);
          return;
        }
      } catch (err: any) {
        setErrors({ submit: err.message || "Failed to upload icon." });
        setSubmitting(false);
        return;
      }
    }

    if (bannerFile) {
      const bannerData = new FormData();
      bannerData.append("banner", bannerFile);
      try {
        const res = await fetch("/upload/banner", {
          method: "POST",
          body: bannerData,
        });
        if (res.ok) {
          const data = await res.json();
          bannerHash = data.hash;
        } else {
          const err = await res.json();
          setErrors({ submit: err.error || "Failed to upload banner." });
          setSubmitting(false);
          return;
        }
      } catch (err: any) {
        setErrors({ submit: err.message || "Failed to upload banner." });
        setSubmitting(false);
        return;
      }
    }

    const payload = { ...formData, iconHash, bannerHash };
    delete payload.gameId;

    try {
      const res = await fetch(`${endpoint}/games/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("Game updated successfully!");
        fetchGames();
        setTimeout(() => {
          setEditingId(null);
          setFormData(null);
          setIconFile(null);
          setBannerFile(null);
          setSuccess(null);
          onEditClose();
        }, 2000);
      } else {
        const err = await res.json();
        setErrors({ submit: err.error || "Failed to update game." });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || "Failed to update game." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!gameToDelete) return;

    try {
      const res = await fetch(`${endpoint}/games/${gameToDelete.gameId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setGames(games.filter(g => g.gameId !== gameToDelete.gameId));
        onDeleteClose();
        setGameToDelete(null);
      } else {
        console.error("Failed to delete game");
      }
    } catch (err) {
      console.error("Error deleting game:", err);
    }
  };

  const handleOwnershipTransfer = (game: Game) => {
    setOwnershipTransferGame(game);
    setOwnershipUserId("");
    setOwnershipUserSearch("");
    setOwnershipUserResults([]);
    onTransferOpen();
  };

  const handleOwnershipUserSearchChange = async (value: string) => {
    setOwnershipUserSearch(value);
    if (value.length > 0) {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(value)}&limit=10`);
        if (res.ok) {
          const users = await res.json();
          setOwnershipUserResults(users);
          setOwnershipUserDropdownOpen(true);
        }
      } catch (err) {
        console.error("Failed to search users:", err);
      }
    } else {
      setOwnershipUserResults([]);
      setOwnershipUserDropdownOpen(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!ownershipTransferGame || !ownershipUserId) return;

    setTransferOwnershipLoading(true);
    try {
      const res = await fetch(`/api/games/${ownershipTransferGame.gameId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOwnerId: ownershipUserId }),
      });

      if (res.ok) {
        await fetchGames();
        onTransferClose();
      } else {
        console.error("Failed to transfer ownership");
      }
    } catch (err) {
      console.error("Error transferring ownership:", err);
    } finally {
      setTransferOwnershipLoading(false);
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background relative">
        <div
          className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
          style={{ inset: 0 }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-sm bg-content1/60 backdrop-blur-md">
            <CardBody className="text-center p-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-default-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Non disponible sur mobile</h2>
              <p className="text-default-500">
                Cette page est uniquement accessible depuis un ordinateur.<br />
                Veuillez utiliser un PC pour gérer vos jeux.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
      {/* Background violet en arrière-plan, identique à la page /games/ */}
      <div
        className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
        style={{ inset: 0 }}
      />
      
      {/* Contenu principal */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mes Jeux
          </h1>
          <p className="text-default-500 text-lg">Gérez et modifiez vos jeux publiés</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="bg-content1/60 backdrop-blur-md">
                <CardBody className="p-0">
                  <Skeleton className="w-full h-48 rounded-t-large" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="w-3/4 h-4 rounded" />
                    <Skeleton className="w-full h-3 rounded" />
                    <Skeleton className="w-1/2 h-3 rounded" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : games.length === 0 ? (
          /* Empty State */
          <Card className="bg-content1/60 backdrop-blur-md">
            <CardBody className="text-center py-16">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-default-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucun jeu trouvé</h3>
              <p className="text-default-500 mb-6">Vous n'avez pas encore publié de jeux.</p>
              <Button 
                as={Link}
                href="/publish"
                color="primary"
                variant="shadow"
                startContent={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Publier un jeu
              </Button>
            </CardBody>
          </Card>
        ) : (
          /* Games Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <Card
                key={game.gameId}
                className="bg-content1/60 backdrop-blur-md hover:bg-content1/80 transition-all duration-300 cursor-pointer group"
                isPressable
                onPress={() => window.open(`/game/${game.gameId}`, '_blank')}
              >
                <CardHeader className="p-0">
                  <div className="relative w-full h-48 overflow-hidden rounded-t-large">
                    <Image
                      src={game.bannerHash ? `/banner/${game.bannerHash}` : "/assets/default-banner.jpg"}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackSrc="/assets/default-banner.jpg"
                    />
                    
                    {/* Price Badge */}
                    <div className="absolute top-2 left-2">
                      <Chip
                        color={game.price === 0 ? "success" : "warning"}
                        variant="shadow"
                        startContent={
                          game.price === 0 ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24Zm40,112H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32a8,8,0,0,1,0,16Z"></path>
                            </svg>
                          ) : (
                            <Image src="/assets/credit.avif" alt="Credit" className="w-4 h-4" />
                          )
                        }
                        size="sm"
                        className="text-white font-semibold"
                      >
                        {game.price === 0 ? 'Gratuit' : game.price}
                      </Chip>
                    </div>

                    {/* Store Status */}
                    <div className="absolute top-2 right-2">
                      <Chip
                        color={game.showInStore ? "success" : "default"}
                        variant="shadow"
                        size="sm"
                        className="text-white"
                      >
                        {game.showInStore ? 'Publié' : 'Brouillon'}
                      </Chip>
                    </div>

                    {/* Game Icon */}
                    <div className="absolute bottom-2 left-2">
                      <Avatar
                        src={game.iconHash ? `/icon/${game.iconHash}` : "/assets/default-icon.png"}
                        className="w-12 h-12 border-2 border-white/20"
                        fallback={
                          <svg className="w-6 h-6 text-default-400" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M208,56H48A16,16,0,0,0,32,72V184a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V72A16,16,0,0,0,208,56ZM48,72H208V184H48Z"/>
                          </svg>
                        }
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardBody className="px-4 py-3">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold line-clamp-1">{game.name}</h3>
                    <p className="text-default-500 text-sm line-clamp-2">{game.description}</p>
                    
                    {/* Game Info */}
                    <div className="flex flex-wrap gap-1">
                      {game.genre && (
                        <Chip size="sm" variant="flat" color="primary">{game.genre}</Chip>
                      )}
                      {game.multiplayer && (
                        <Chip size="sm" variant="flat" color="secondary">Multijoueur</Chip>
                      )}
                      {game.platforms && (
                        <Chip size="sm" variant="flat">{game.platforms}</Chip>
                      )}
                    </div>
                  </div>
                </CardBody>

                <CardFooter className="px-4 py-3 pt-0">
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => {
                        handleEdit(game);
                      }}
                      startContent={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      }
                      className="flex-1"
                    >
                      Modifier
                    </Button>
                    
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          size="sm"
                          variant="flat"
                          isIconOnly
                          onPress={() => {}}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="copy"
                          startContent={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          }
                          onPress={() => {
                            navigator.clipboard.writeText(game.gameId);
                          }}
                        >
                          Copier l'ID
                        </DropdownItem>
                        <DropdownItem
                          key="transfer"
                          startContent={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          }
                          onPress={() => handleOwnershipTransfer(game)}
                        >
                          Transférer
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          color="danger"
                          startContent={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          }
                          onPress={() => {
                            setGameToDelete(game);
                            onDeleteOpen();
                          }}
                        >
                          Supprimer
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="4xl"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          base: "bg-content1/95 backdrop-blur-md",
          header: "border-b border-divider",
          footer: "border-t border-divider",
        }}
      >
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              <h3 className="text-xl font-bold">Modifier le jeu</h3>
            </ModalHeader>
            <ModalBody className="py-6">
              {success && (
                <Card className="mb-4 bg-success/10 border border-success/20">
                  <CardBody>
                    <p className="text-success">{success}</p>
                  </CardBody>
                </Card>
              )}
              
              {errors.submit && (
                <Card className="mb-4 bg-danger/10 border border-danger/20">
                  <CardBody>
                    <p className="text-danger">{errors.submit}</p>
                  </CardBody>
                </Card>
              )}

              {formData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <Input
                      label="Nom du jeu"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      isRequired
                      variant="bordered"
                    />
                    
                    <Textarea
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      isRequired
                      variant="bordered"
                      minRows={3}
                    />
                    
                    <Input
                      label="Prix"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      min={0}
                      isRequired
                      variant="bordered"
                      endContent={
                        <Image src="/assets/credit.avif" alt="Credit" className="w-4 h-4" />
                      }
                    />
                    
                    <Input
                      label="Genre"
                      name="genre"
                      value={formData.genre || ''}
                      onChange={handleChange}
                      variant="bordered"
                    />
                    
                    <Input
                      label="Développeur"
                      name="developer"
                      value={formData.developer || ''}
                      onChange={handleChange}
                      variant="bordered"
                    />
                    
                    <Input
                      label="Éditeur"
                      name="publisher"
                      value={formData.publisher || ''}
                      onChange={handleChange}
                      variant="bordered"
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <Input
                      label="Plateformes"
                      name="platforms"
                      value={formData.platforms || ''}
                      onChange={handleChange}
                      variant="bordered"
                    />
                    
                    <Input
                      label="Date de sortie"
                      name="release_date"
                      type="date"
                      value={formData.release_date || ''}
                      onChange={handleChange}
                      variant="bordered"
                    />
                    
                    <Input
                      label="Site web"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleChange}
                      variant="bordered"
                    />
                    
                    <Input
                      label="Lien de la bande-annonce"
                      name="trailer_link"
                      value={formData.trailer_link || ''}
                      onChange={handleChange}
                      variant="bordered"
                    />
                    
                    <Input
                      label="Lien de téléchargement"
                      name="download_link"
                      value={formData.download_link || ''}
                      onChange={handleChange}
                      variant="bordered"
                    />
                    
                    <div className="space-y-3">
                      <Switch
                        name="showInStore"
                        isSelected={formData.showInStore}
                        onValueChange={(checked) => setFormData({...formData, showInStore: checked})}
                        color="success"
                      >
                        Afficher dans la boutique
                      </Switch>
                      
                      <Switch
                        name="multiplayer"
                        isSelected={formData.multiplayer}
                        onValueChange={(checked) => setFormData({...formData, multiplayer: checked})}
                        color="primary"
                      >
                        Multijoueur
                      </Switch>
                      
                      <Switch
                        name="markAsUpdated"
                        isSelected={formData.markAsUpdated}
                        onValueChange={(checked) => setFormData({...formData, markAsUpdated: checked})}
                        color="warning"
                      >
                        Marquer comme mis à jour (badge 10 jours)
                      </Switch>
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="md:col-span-2 space-y-4">
                    <Divider />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Icône du jeu</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "icon")}
                          className="block w-full text-sm text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-600"
                        />
                        {formData.iconHash && (
                          <Image
                          src={`/icon/${formData.iconHash}`}
                          alt="Current icon"
                          className="mt-2 w-16 h-16 rounded-lg"
                          fallbackSrc="/assets/default-icon.png"
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Bannière du jeu</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "banner")}
                        className="block w-full text-sm text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-600"
                      />
                      {formData.bannerHash && (
                        <Image
                          src={`/banner/${formData.bannerHash}`}
                          alt="Current banner"
                          className="mt-2 w-32 h-20 rounded-lg object-cover"
                          fallbackSrc="/assets/default-banner.jpg"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={onEditClose}
              isDisabled={submitting}
            >
              Annuler
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={submitting}
            >
              {submitting ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>

    {/* Transfer Ownership Modal */}
    <Modal
      isOpen={isTransferOpen}
      onClose={onTransferClose}
      size="md"
      backdrop="blur"
      classNames={{
        base: "bg-content1/95 backdrop-blur-md",
        header: "border-b border-divider",
        footer: "border-t border-divider",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-bold">Transférer la propriété</h3>
        </ModalHeader>
        <ModalBody className="py-6">
          {ownershipTransferGame && (
            <div className="space-y-4">
              <Card className="bg-content1/50">
                <CardBody>
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={ownershipTransferGame.iconHash ? `/icon/${ownershipTransferGame.iconHash}` : "/assets/default-icon.png"}
                      className="w-12 h-12"
                      fallback={
                        <svg className="w-6 h-6 text-default-400" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M208,56H48A16,16,0,0,0,32,72V184a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V72A16,16,0,0,0,208,56ZM48,72H208V184H48Z"/>
                        </svg>
                      }
                    />
                    <div>
                      <h4 className="font-semibold">{ownershipTransferGame.name}</h4>
                      <p className="text-sm text-default-500">ID: {ownershipTransferGame.gameId}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              
              <div className="relative">
                <Input
                  label="Rechercher un utilisateur"
                  placeholder="Tapez le nom d'utilisateur..."
                  value={ownershipUserSearch}
                  onChange={(e) => handleOwnershipUserSearchChange(e.target.value)}
                  variant="bordered"
                  startContent={
                    <svg className="w-4 h-4 text-default-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
                
                {ownershipUserDropdownOpen && ownershipUserResults.length > 0 && (
                  <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
                    <CardBody className="p-0">
                      {ownershipUserResults.map((user) => (
                        <div
                          key={user.userId || user.user_id || user.id}
                          className="flex items-center gap-3 p-3 hover:bg-default-100 cursor-pointer transition-colors"
                          onClick={() => {
                            setOwnershipUserId(user.userId || user.user_id || user.id);
                            setOwnershipUserSearch(user.username);
                            setOwnershipUserDropdownOpen(false);
                          }}
                        >
                          <Avatar
                            src={`/avatar/${user.userId || user.user_id || user.id}`}
                            className="w-8 h-8"
                            fallback={user.username?.charAt(0).toUpperCase()}
                          />
                          <span className="text-sm">{user.username}</span>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                )}
              </div>
              
              {ownershipUserId && (
                <Card className="bg-warning/10 border border-warning/20">
                  <CardBody>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-warning mt-0.5" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM128,72a8,8,0,0,1,8,8v56a8,8,0,0,1-16,0V80A8,8,0,0,1,128,72Zm8,112a12,12,0,1,1-12-12A12,12,0,0,1,136,184Z"/>
                      </svg>
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Attention !</p>
                        <p>Cette action est irréversible. Une fois transféré, vous ne pourrez plus modifier ce jeu.</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={onTransferClose}
            isDisabled={transferOwnershipLoading}
          >
            Annuler
          </Button>
          <Button
            color="warning"
            onPress={handleTransferOwnership}
            isLoading={transferOwnershipLoading}
            isDisabled={!ownershipUserId}
          >
            {transferOwnershipLoading ? "Transfert..." : "Transférer"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Delete Confirmation Modal */}
    <Modal
      isOpen={isDeleteOpen}
      onClose={onDeleteClose}
      size="md"
      backdrop="blur"
      classNames={{
        base: "bg-content1/95 backdrop-blur-md",
        header: "border-b border-divider",
        footer: "border-t border-divider",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-bold text-danger">Supprimer le jeu</h3>
        </ModalHeader>
        <ModalBody className="py-6">
          {gameToDelete && (
            <div className="space-y-4">
              <Card className="bg-content1/50">
                <CardBody>
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={gameToDelete.iconHash ? `/icon/${gameToDelete.iconHash}` : "/assets/default-icon.png"}
                      className="w-12 h-12"
                      fallback={
                        <svg className="w-6 h-6 text-default-400" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M208,56H48A16,16,0,0,0,32,72V184a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V72A16,16,0,0,0,208,56ZM48,72H208V184H48Z"/>
                        </svg>
                      }
                    />
                    <div>
                      <h4 className="font-semibold">{gameToDelete.name}</h4>
                      <p className="text-sm text-default-500">{gameToDelete.description}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              
              <Card className="bg-danger/10 border border-danger/20">
                <CardBody>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-danger mt-0.5" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM128,72a8,8,0,0,1,8,8v56a8,8,0,0,1-16,0V80A8,8,0,0,1,128,72Zm8,112a12,12,0,1,1-12-12A12,12,0,0,1,136,184Z"/>
                    </svg>
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Cette action est irréversible !</p>
                      <p>Le jeu sera définitivement supprimé de la plateforme. Toutes les données associées seront perdues.</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={onDeleteClose}
          >
            Annuler
          </Button>
          <Button
            color="danger"
            onPress={handleDelete}
            startContent={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          >
            Supprimer définitivement
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Floating Action Button */}
    <div className="fixed bottom-8 right-8 z-40">
      <Tooltip content="Publier un nouveau jeu" placement="left">
        <Button
          as={Link}
          href="/publish"
          color="primary"
          size="lg"
          isIconOnly
          className="w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
          radius="full"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </Tooltip>
    </div>

    {/* Footer Links */}
    <div className="relative z-10 mt-16 pb-8">
      <div className="container mx-auto px-4">
        <Card className="bg-content1/60 backdrop-blur-md">
          <CardBody className="text-center py-6">
            <div className="flex flex-wrap justify-center items-center gap-6">
              <Link 
                href="/explore?categoryId=1" 
                className="text-default-500 hover:text-primary transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M208,56H48A16,16,0,0,0,32,72V184a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V72A16,16,0,0,0,208,56ZM48,72H208V184H48Z"/>
                </svg>
                Outils
              </Link>
              <Link 
                href="/explore?categoryId=2" 
                className="text-default-500 hover:text-primary transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
                </svg>
                OS
              </Link>
              <Link 
                href="/explore?categoryId=3" 
                className="text-default-500 hover:text-primary transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM32,64H224V88H32ZM32,192V104H224v88Z"/>
                </svg>
                Kits
              </Link>
            </div>
            <Divider className="my-4" />
            <p className="text-default-400 text-sm">
              Gérez vos jeux publiés sur Koalyx
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  </div>
);
};

export default MyGames;
