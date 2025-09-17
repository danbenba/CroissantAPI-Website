'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
import { Avatar } from '@heroui/avatar';
import { Spinner } from '@heroui/spinner';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Article {
  id: number;
  titre: string;
  contenu: string;
  resume?: string;
  auteur_nom: string;
  auteur_photo?: string;
  date_publication: string;
  date_creation: string;
  categories: string[];
  tags: string[];
  vues: number;
  image_principale?: string;
}

interface Category {
  id: number;
  nom: string;
  description?: string;
  couleur: string;
  article_count: number;
}

export default function ArticlesPage() {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const articlesPerPage = 6;

  // Fetch articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: articlesPerPage.toString(),
        status: 'publie'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.data.articles);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/articles/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans relative">
        <Navigation />
  
        {/* voile violet identique */}
        <div
          className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
          style={{ inset: 0 as unknown as number }}
        />
  
        {/* Skeleton du contenu principal */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
  
            {/* Skeleton Sidebar gauche */}
            <div className="lg:col-span-1 space-y-6">
              {/* Skeleton Recherche */}
              <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-gray-600 rounded animate-pulse mr-2"></div>
                    <div className="w-20 h-5 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="w-full h-10 bg-gray-700/50 rounded-lg animate-pulse"></div>
                </CardBody>
              </Card>
  
              {/* Skeleton Catégories */}
              <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-gray-600 rounded animate-pulse mr-2"></div>
                    <div className="w-24 h-5 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardBody className="space-y-2">
                  <div className="w-full h-10 bg-gray-700/50 rounded animate-pulse"></div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between w-full h-10 bg-gray-700/50 rounded animate-pulse p-3">
                      <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-6 h-4 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
  
            {/* Skeleton Articles principal */}
            <div className="lg:col-span-2 space-y-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="bg-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
                  <CardBody className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Skeleton Image d'article */}
                      <div className="md:w-1/3 flex-shrink-0">
                        <div className="w-full h-48 bg-gray-700/50 rounded-lg animate-pulse"></div>
                      </div>
  
                      {/* Skeleton Contenu de l'article */}
                      <div className="flex-grow space-y-3">
                        {/* Skeleton Catégories chips */}
                        <div className="flex gap-2">
                          <div className="w-16 h-6 bg-gray-600 rounded-full animate-pulse"></div>
                          <div className="w-20 h-6 bg-gray-600 rounded-full animate-pulse"></div>
                        </div>
  
                        {/* Skeleton Titre */}
                        <div className="space-y-2">
                          <div className="w-full h-6 bg-gray-600 rounded animate-pulse"></div>
                          <div className="w-3/4 h-6 bg-gray-600 rounded animate-pulse"></div>
                        </div>
  
                        {/* Skeleton Résumé */}
                        <div className="space-y-2">
                          <div className="w-full h-4 bg-gray-700 rounded animate-pulse"></div>
                          <div className="w-full h-4 bg-gray-700 rounded animate-pulse"></div>
                          <div className="w-2/3 h-4 bg-gray-700 rounded animate-pulse"></div>
                        </div>
  
                        {/* Skeleton Métadonnées */}
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
                            <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
                            <div className="w-24 h-4 bg-gray-600 rounded animate-pulse"></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
                            <div className="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
                          </div>
                        </div>
  
                        {/* Skeleton Tags */}
                        <div className="flex gap-2">
                          <div className="w-12 h-5 bg-gray-700 rounded animate-pulse"></div>
                          <div className="w-16 h-5 bg-gray-700 rounded animate-pulse"></div>
                          <div className="w-14 h-5 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
  
              {/* Skeleton Pagination */}
              <div className="flex justify-center gap-2 mt-8">
                <div className="w-20 h-10 bg-gray-700/50 rounded animate-pulse"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-gray-700/50 rounded animate-pulse"></div>
                ))}
                <div className="w-20 h-10 bg-gray-700/50 rounded animate-pulse"></div>
              </div>
            </div>
  
            {/* Skeleton Sidebar droite */}
            <div className="lg:col-span-1 space-y-6">
              {/* Skeleton Articles récents */}
              <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-gray-600 rounded animate-pulse mr-2"></div>
                    <div className="w-28 h-5 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border-b border-white/10 last:border-b-0 pb-3 last:pb-0 space-y-2">
                        <div className="w-full h-4 bg-gray-600 rounded animate-pulse"></div>
                        <div className="w-3/4 h-4 bg-gray-600 rounded animate-pulse"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
                          <div className="w-20 h-3 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
  
              {/* Skeleton Statistiques */}
              <Card className="bg-gradient-to-br from-purple-600/20 to-blue-800/20 border border-purple-500/30 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-gray-600 rounded animate-pulse mr-2"></div>
                    <div className="w-24 h-5 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
                        <div className="w-12 h-6 bg-gray-600 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
  
        {/* Skeleton Bouton scroll vers le haut */}
        <div className="fixed bottom-8 right-8 z-50">
          <div className="w-14 h-14 bg-gray-700/50 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }  

  return (
    <div
      className="min-h-screen bg-background text-foreground font-sans relative flex flex-col"
      style={{}}
    >
      <Navigation />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">

      {/* voile violet en arrière-plan, calqué sur la page HTML */}
      <div
        className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Contenu principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar gauche - Filtres et Recherche */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recherche */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">
                  <i className="fas fa-search text-blue-400 mr-2"></i>
{t('articles.search')}
                </h3>
              </CardHeader>
              <CardBody>
                <Input
                  placeholder={t('articles.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  classNames={{
                    input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-400",
                    inputWrapper: "border-white/20 hover:border-blue-500/50 focus-within:border-blue-500 bg-gray-700/50 backdrop-blur-sm"
                  }}
                  startContent={
                    <i className="fas fa-search text-gray-400"></i>
                  }
                />
              </CardBody>
            </Card>

            {/* Catégories */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">
                  <i className="fas fa-tags text-purple-400 mr-2"></i>
{t('articles.categories')}
                </h3>
              </CardHeader>
              <CardBody className="space-y-2">
                <Button
                  variant={selectedCategory === '' ? 'solid' : 'light'}
                  color={selectedCategory === '' ? 'primary' : 'default'}
                  className="w-full justify-start text-white"
                  onClick={() => setSelectedCategory('')}
                >
{t('articles.allCategories')}
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.nom ? 'solid' : 'light'}
                    color={selectedCategory === category.nom ? 'primary' : 'default'}
                    className="w-full justify-between text-white"
                    onClick={() => setSelectedCategory(category.nom)}
                  >
                    <span>{category.nom}</span>
                    <Chip size="sm" variant="flat" color="primary">
                      {category.article_count}
                    </Chip>
                  </Button>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Contenu principal - Articles */}
          <div className="lg:col-span-2 space-y-6">
            {articles.length === 0 ? (
              <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
                <CardBody className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-5">
                    <i className="fas fa-newspaper text-3xl text-white"></i>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t('articles.noArticles')}</h3>
                  <p className="text-gray-400">
                    {t('articles.noArticlesDesc')}
                  </p>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-6">
                {articles.map((article) => (
                  <Card key={article.id} className="bg-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]">
                    <CardBody className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Image d'article */}
                        {article.image_principale && (
                          <div className="md:w-1/3 flex-shrink-0">
                            <Image
                              src={article.image_principale}
                              alt={article.titre}
                              width={300}
                              height={200}
                              className="w-full h-48 object-cover rounded-lg border border-white/10"
                            />
                          </div>
                        )}
                        
                        {/* Contenu de l'article */}
                        <div className="flex-grow">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {article.categories.map((category) => (
                              <Chip key={category} size="sm" variant="shadow" color="primary">
                                {category}
                              </Chip>
                            ))}
                          </div>
                          
                          <Link href={`/articles/${article.id}`}>
                            <h2 className="text-xl font-bold mb-3 text-white hover:text-blue-400 transition-colors cursor-pointer">
                              {article.titre}
                            </h2>
                          </Link>
                          
                          {article.resume && (
                            <p className="text-gray-300 mb-4">
                              {truncateText(article.resume, 150)}
                            </p>
                          )}
                          
                          {/* Métadonnées de l'article */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <Avatar 
                                size="sm" 
                                src={article.auteur_photo} 
                                name={article.auteur_nom}
                                className="bg-gradient-to-r from-purple-500 to-blue-600"
                              />
                              <span className="text-white">{article.auteur_nom}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <i className="fas fa-calendar text-blue-400"></i>
                              <span>{formatDate(article.date_publication)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <i className="fas fa-eye text-green-400"></i>
                              <span>{article.vues} vues</span>
                            </div>
                          </div>
                          
                          {/* Tags */}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {article.tags.map((tag) => (
                                <Chip key={tag} size="sm" variant="bordered" className="border-white/20 text-gray-300">
                                  #{tag}
                                </Chip>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="light"
                  color="primary"
                  isDisabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="text-white"
                >
{t('articles.previous')}
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'solid' : 'light'}
                      color="primary"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? '' : 'text-white'}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  variant="light"
                  color="primary"
                  isDisabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="text-white"
                >
{t('articles.next')}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar droite - Articles récents et autres infos */}
          <div className="lg:col-span-1 space-y-6">
            {/* Articles récents */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">
                  <i className="fas fa-clock text-orange-400 mr-2"></i>
{t('articles.recentArticles')}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {articles.slice(0, 3).map((article) => (
                    <div key={`recent-${article.id}`} className="border-b border-white/10 last:border-b-0 pb-3 last:pb-0">
                      <Link href={`/articles/${article.id}`}>
                        <h4 className="text-sm font-medium text-white hover:text-blue-400 transition-colors cursor-pointer mb-1">
                          {truncateText(article.titre, 60)}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <i className="fas fa-calendar text-blue-400"></i>
                        <span>{formatDate(article.date_publication)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Widget statistiques */}
            <Card className="bg-gradient-to-br from-purple-600/20 to-blue-800/20 border border-purple-500/30 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">
                  <i className="fas fa-chart-bar text-purple-400 mr-2"></i>
{t('articles.statistics')}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">{t('articles.totalArticles')}</span>
                    <Chip size="sm" variant="shadow" color="primary" className="font-semibold">
                      {articles.length}
                    </Chip>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">{t('games.totalCategories')}</span>
                    <Chip size="sm" variant="shadow" color="secondary" className="font-semibold">
                      {categories.length}
                    </Chip>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">{t('articles.totalViews')}</span>
                    <Chip size="sm" variant="shadow" color="success" className="font-semibold">
                      {articles.reduce((sum, article) => sum + article.vues, 0)}
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
      
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
