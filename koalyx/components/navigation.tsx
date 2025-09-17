"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/contexts/LanguageContext'
import VipPopup from '@/components/vip-popup'
import SupportPopup from '@/components/support-popup'
import NotificationsDropdown from '@/components/notifications-dropdown'
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
    User,
    Chip,
    Spinner,
    Skeleton
} from "@heroui/react"

export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isVipPopupOpen, setIsVipPopupOpen] = useState(false)
    const [isSupportPopupOpen, setIsSupportPopupOpen] = useState(false)
    const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false)
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { user, loading, loadingMessage, logout } = useAuth()
    const { t } = useLanguage()


    const navItems = [
        { href: '/', label: t('nav.home'), icon: 'fas fa-home' }
    ]

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrateur'
            case 'moderateur': return 'Modérateur'
            case 'support': return 'Support'
            case 'plus': return 'Plus'
            case 'ultra': return 'Ultra'
            case 'membre': return 'Membre'
            default: return role
        }
    }

    // Fonction pour obtenir les dégradés selon le rôle
    const getRoleGradient = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-gradient-to-r from-red-500 to-red-600'
            case 'moderateur':
                return 'bg-gradient-to-r from-blue-500 to-blue-600'
            case 'support':
                return 'bg-gradient-to-r from-green-500 to-green-600'
            case 'plus':
                return 'bg-gradient-to-r from-yellow-400 to-orange-500'
            case 'ultra':
                return 'bg-gradient-to-r from-purple-500 to-indigo-600'
            case 'membre':
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600'
        }
    }

    // Fonction pour obtenir les couleurs de texte selon le rôle
    const getRoleTextGradient = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent'
            case 'moderateur':
                return 'bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent'
            case 'support':
                return 'bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent'
            case 'plus':
                return 'bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent'
            case 'ultra':
                return 'bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent'
            case 'membre':
            default:
                return 'bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent'
        }
    }

    const handleLogout = async () => {
        await logout()
    }

    // Fonction pour gérer le toggle du menu étendu sans fermer le dropdown
    const handleToggleExtendedMenu = () => {
        setIsUserMenuExpanded(!isUserMenuExpanded)
    }

    // Fonction pour fermer le dropdown
    const handleCloseDropdown = () => {
        setIsUserDropdownOpen(false)
        setIsUserMenuExpanded(false) // Reset l'état étendu aussi
    }

    // Créer les éléments du menu utilisateur avec le rendu conditionnel
    const getUserMenuItems = () => {
        const baseItems = [
            <DropdownItem key="profile-header" className="h-auto py-4 cursor-default" textValue="Profile">
                <div className="flex items-center gap-3">
                    <Avatar
                        src={user?.photo || "/storage/icons/default_profile.png"}
                        className="w-12 h-12"
                        showFallback
                        fallback={<i className="fas fa-user text-white"></i>}
                    />
                    <div className="flex flex-col">
                        <span className={`font-semibold ${getRoleTextGradient(user?.role || '')}`}>{user?.nom_utilisateur}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Vous êtes:</span>
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleGradient(user?.role || '')} shadow-lg`}>
                                <span className="text-white">
                                    {getRoleLabel(user?.role || '')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </DropdownItem>,

            <DropdownItem
                key="profile"
                startContent={<i className="fas fa-user text-blue-400"></i>}
                className="text-white hover:text-blue-300"
                onPress={handleCloseDropdown}
                textValue="Mon compte"
            >
                <Link href="/account" className="w-full block">Mon compte</Link>
            </DropdownItem>,

            <DropdownItem
                key="favorites"
                startContent={<i className="fas fa-heart text-red-400"></i>}
                className="text-white hover:text-red-300"
                onPress={handleCloseDropdown}
                textValue="Jeux favoris"
            >
                <Link href="/account/favorites" className="w-full block">Jeux favoris</Link>
            </DropdownItem>
        ]

        // Ajouter les éléments admin si applicable
        if (user?.role === 'admin') {
            baseItems.push(
                <DropdownItem
                    key="admin"
                    startContent={<i className="fas fa-cog text-purple-400"></i>}
                    className="text-white hover:text-purple-300"
                    onPress={handleCloseDropdown}
                    textValue="Panneau Admin"
                >
                    <Link href="/admin" className="w-full block">Panneau Admin</Link>
                </DropdownItem>,
                <DropdownItem
                    key="test-api"
                    startContent={<i className="fas fa-vials text-blue-400"></i>}
                    className="text-white hover:text-blue-300"
                    onPress={handleCloseDropdown}
                    textValue="Tests API"
                >
                    <Link href="/test-api" className="w-full block">Tests API</Link>
                </DropdownItem>
            )
        }

        // Bouton "Voir plus" simple
        baseItems.push(
            <DropdownItem
                key="voir-plus"
                className="border-t border-white/10 text-white hover:text-blue-300"
                startContent={
                    <i className={`fas fa-chevron-down text-blue-400 transition-transform duration-300 ease-in-out ${
                        isUserMenuExpanded ? 'rotate-180' : 'rotate-0'
                    }`}></i>
                }
                onPress={handleToggleExtendedMenu}
                textValue="Voir plus"
            >
                Voir plus
            </DropdownItem>
        )

        // Ajouter les éléments étendus si le menu est ouvert
        if (isUserMenuExpanded) {
            baseItems.push(
                <DropdownItem
                    key="about"
                    className="text-white hover:text-blue-300"
                    startContent={<i className="fas fa-info-circle text-blue-400"></i>}
                    onPress={handleCloseDropdown}
                    textValue="À propos"
                >
                    <Link href="/about" className="w-full block">À propos</Link>
                </DropdownItem>,
                
                <DropdownItem
                    key="support"
                    className="text-white hover:text-green-300"
                    startContent={<i className="fas fa-headset text-green-400"></i>}
                    onPress={() => {
                        setIsSupportPopupOpen(true)
                        handleCloseDropdown()
                    }}
                    textValue="Support"
                >
                    Support
                </DropdownItem>,

                <DropdownItem
                    key="logout"
                    color="danger"
                    startContent={<i className="fas fa-sign-out-alt"></i>}
                    className="text-white hover:text-red-300 border-t border-white/10"
                    onPress={() => {
                        handleLogout()
                        handleCloseDropdown()
                    }}
                    textValue="Déconnexion"
                >
                    Déconnexion
                </DropdownItem>


            )
        }

        return baseItems
    }

    return (
        <Navbar
            onMenuOpenChange={setIsMenuOpen}
            isMenuOpen={isMenuOpen}
            isBordered
            className="bg-black/30 backdrop-blur-lg border-white/10"
        >
            <NavbarContent justify="start">
                <NavbarBrand as={Link} href="/" className="gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
                        <i className="fas fa-globe text-white text-xl"></i>
                    </div>
                    <p className="font-bold text-inherit text-white">Koalyx</p>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden sm:flex gap-6" justify="center">
                <NavbarItem isActive={pathname === '/'}>
                    <Link href="/" aria-current={pathname === '/' ? "page" : undefined} className={`flex items-center gap-2 transition-colors ${pathname === '/' ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                        <i className="fas fa-home"></i>{t('nav.home')}
                    </Link>
                </NavbarItem>


                <NavbarItem isActive={pathname.startsWith('/explore')}>
                    <Link href={"/explore" as any} aria-current={pathname.startsWith('/explore') ? "page" : undefined} className={`flex items-center gap-2 transition-colors ${pathname.startsWith('/explore') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                        <i className="fas fa-gamepad"></i>{t('nav.games')}
                    </Link>
                </NavbarItem>

                <NavbarItem isActive={pathname.startsWith('/articles')}>
                    <Link href="/articles" aria-current={pathname.startsWith('/articles') ? "page" : undefined} className={`flex items-center gap-2 transition-colors ${pathname.startsWith('/articles') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                        <i className="fas fa-newspaper"></i>{t('nav.articles')}
                    </Link>
                </NavbarItem>

                <NavbarItem isActive={pathname === '/shop'}>
                    <Link href="/shop" aria-current={pathname === '/shop' ? "page" : undefined} className={`flex items-center gap-2 transition-colors ${pathname === '/shop' ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                        <i className="fas fa-shopping-cart"></i>{t('nav.shop')}
                    </Link>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent justify="end">
                {user && <NotificationsDropdown />}
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-24 h-4 rounded" />
                    </div>
                ) : user ? (
                    <Dropdown
                        placement="bottom-end"
                        isOpen={isUserDropdownOpen}
                        onOpenChange={setIsUserDropdownOpen}
                    >
                        <DropdownTrigger>
                            <Button
                                variant="light"
                                className="bg-transparent data-[hover=true]:bg-white/10 text-white p-2 h-auto"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={user.photo || "/storage/icons/default_profile.png"}
                                        className="w-10 h-10"
                                        showFallback
                                        fallback={<i className="fas fa-user text-white"></i>}
                                    />
                                    <div className="hidden md:flex flex-col items-start text-left">
                                        <span className={`font-semibold text-sm ${getRoleTextGradient(user.role)}`}>{user.nom_utilisateur}</span>
                                    </div>
                                    <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                                </div>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Actions du profil"
                            className="w-80"
                            closeOnSelect={false}
                        >
                            {getUserMenuItems()}
                        </DropdownMenu>
                    </Dropdown>
                ) : (
                    <>
                        <NavbarItem className="hidden lg:flex">
                            <Button as={Link} href="/login" variant="light" className="text-white">
                                {t('nav.login')}
                            </Button>
                        </NavbarItem>
                        <NavbarItem>
                            <Button as={Link} href="/register" color="primary" variant="shadow">
                                {t('nav.register')}
                            </Button>
                        </NavbarItem>
                    </>
                )}
            </NavbarContent>

            <NavbarMenuToggle
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                className="sm:hidden text-white"
            />

            <NavbarMenu className="bg-black/80 backdrop-blur-xl border-t border-white/10 pt-6">
                {[...navItems, {href: '/explore', label: 'Jeux', icon: 'fas fa-gamepad'}, {href: '/articles', label: 'Articles', icon: 'fas fa-newspaper'}, {href: '/shop', label: 'Shop', icon: 'fas fa-shopping-cart'}].map((item, index) => (
                    <NavbarMenuItem key={`${item.href}-${index}`}>
                        <button
                            onClick={() => {
                                router.push(item.href as any)
                                setIsMenuOpen(false)
                            }}
                            className={`w-full flex items-center gap-4 py-3 text-lg transition-colors ${
                                pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')
                                    ? "text-blue-400 font-semibold"
                                    : "text-gray-300 hover:text-white"
                            }`}
                        >
                            <i className={item.icon}></i>
                            {item.label}
                        </button>
                    </NavbarMenuItem>
                ))}

                {loading ? (
                    <NavbarMenuItem className="pt-6 border-t border-white/10">
                        <div className="w-full flex items-center gap-4 py-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex flex-col gap-2 flex-1">
                                <Skeleton className="w-20 h-4 rounded" />
                                <Skeleton className="w-16 h-3 rounded" />
                            </div>
                        </div>
                    </NavbarMenuItem>
                ) : user ? (
                    <>
                        <NavbarMenuItem className="pt-6 border-t border-white/10">
                            <div className="w-full flex items-center gap-4 py-3">
                                <Avatar
                                    src={user.photo || "/storage/icons/default_profile.png"}
                                    className="w-10 h-10"
                                />
                                <div className="flex flex-col">
                                    <span className={`font-semibold ${getRoleTextGradient(user.role)}`}>{user.nom_utilisateur}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-sm">Vous êtes:</span>
                                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getRoleGradient(user.role)} shadow-lg`}>
                                            <span className="text-white">
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </NavbarMenuItem>
                        <NavbarMenuItem>
                            <Link href="/account" className="w-full flex items-center gap-4 py-3 text-lg text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                                <i className="fas fa-user text-blue-400"></i>
                                Mon compte
                            </Link>
                        </NavbarMenuItem>
                        {user.role === 'admin' && (
                            <>
                                <NavbarMenuItem>
                                    <Link href="/admin" className="w-full flex items-center gap-4 py-3 text-lg text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                                        <i className="fas fa-cog text-purple-400"></i>
                                        Panneau Admin
                                    </Link>
                                </NavbarMenuItem>
                                <NavbarMenuItem>
                                    <Link href="/test-api" className="w-full flex items-center gap-4 py-3 text-lg text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                                        <i className="fas fa-vials text-blue-400"></i>
                                        Tests API
                                    </Link>
                                </NavbarMenuItem>
                            </>
                        )}
                        <NavbarMenuItem>
                            <Button variant="ghost" fullWidth className="text-red-400 hover:text-red-300" onPress={handleLogout}>
                                <i className="fas fa-sign-out-alt mr-2"></i>
                                Déconnexion
                            </Button>
                        </NavbarMenuItem>
                        <NavbarMenuItem>
                            <Button
                                variant="ghost"
                                fullWidth
                                className="text-blue-400 hover:text-blue-300 justify-between"
                                onPress={() => setIsUserMenuExpanded(!isUserMenuExpanded)}
                            >
                                <span className="flex items-center gap-4">
                                    <i className="fas fa-ellipsis-h"></i>
                                    Voir plus
                                </span>
                                <i className={`fas fa-chevron-down transition-transform duration-300 ease-in-out ${
                                    isUserMenuExpanded ? 'rotate-180' : 'rotate-0'
                                }`}></i>
                            </Button>
                        </NavbarMenuItem>

                        {isUserMenuExpanded && (
                            <>
                                <NavbarMenuItem>
                                    <Button
                                        variant="light"
                                        fullWidth
                                        className="text-gray-300 hover:text-blue-400 flex items-center gap-4 py-3 text-lg justify-start"
                                        onPress={() => {
                                            router.push('/about')
                                            setIsMenuOpen(false)
                                        }}
                                    >
                                        <i className="fas fa-info-circle text-blue-400"></i>À propos
                                    </Button>
                                </NavbarMenuItem>

                                <NavbarMenuItem>
                                    <Button
                                        variant="light"
                                        fullWidth
                                        className="text-gray-300 hover:text-green-400 flex items-center gap-4 py-3 text-lg justify-start"
                                        onPress={() => {
                                            setIsSupportPopupOpen(true)
                                            setIsMenuOpen(false)
                                        }}
                                    >
                                        <i className="fas fa-headset text-green-400"></i>Support
                                    </Button>
                                </NavbarMenuItem>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <NavbarMenuItem className="pt-6">
                            <Button as={Link} href="/login" variant="ghost" fullWidth className="text-white">
                                Connexion
                            </Button>
                        </NavbarMenuItem>
                        <NavbarMenuItem>
                            <Button as={Link} href="/register" color="primary" variant="shadow" fullWidth>
                                Inscription
                            </Button>
                        </NavbarMenuItem>
                    </>
                )}
            </NavbarMenu>

            <VipPopup
                isOpen={isVipPopupOpen}
                onOpenChange={setIsVipPopupOpen}
            />

            <SupportPopup
                isOpen={isSupportPopupOpen}
                onOpenChange={setIsSupportPopupOpen}
            />
        </Navbar>
    )
}
