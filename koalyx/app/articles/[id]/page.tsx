'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/navigation';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Avatar } from '@heroui/avatar';
import { Spinner } from '@heroui/spinner';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MarkdownRenderer from '@/components/markdown-renderer';
import ArticleReactions from '@/components/article-reactions';
import ArticleReviews from '@/components/article-reviews';
import SharePopup from '@/components/share-popup';

interface Article {
  id: number;
  titre: string;
  contenu: string;
  contenu_type: 'markdown' | 'html';
  resume?: string;
  auteur_nom: string;
  auteur_photo?: string;
  auteur_email?: string;
  date_publication: string;
  date_creation: string;
  date_modification: string;
  categories: string[];
  tags: string[];
  vues: number;
  image_principale?: string;
  media?: ArticleMedia[];
}

interface ArticleMedia {
  id: number;
  type: 'image' | 'video' | 'document';
  url: string;
  titre?: string;
  description?: string;
  position: number;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharePopupOpen, setSharePopupOpen] = useState(false);

  const articleId = params.id;

  // Fetch article details
  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${articleId}`);
      const data = await response.json();

      if (data.success) {
        setArticle(data.data);
        // Fetch related articles based on categories
        if (data.data.categories && data.data.categories.length > 0) {
          fetchRelatedArticles(data.data.categories[0]);
        }
      } else {
        setError(data.error || 'Article non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'article:', error);
      setError('Erreur lors du chargement de l\'article');
    } finally {
      setLoading(false);
    }
  };

  // Fetch related articles
  const fetchRelatedArticles = async (category: string) => {
    try {
      const response = await fetch(`/api/articles?category=${category}&limit=3`);
      const data = await response.json();
      if (data.success) {
        // Filter out current article
        const filtered = data.data.articles.filter((a: Article) => a.id !== parseInt(articleId as string));
        setRelatedArticles(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des articles liés:', error);
    }
  };

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  const shareArticle = () => {
    setSharePopupOpen(true);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-background text-foreground font-sans relative flex items-center justify-center"
      >
        {/* voile violet identique */}
        <div
          className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
          style={{ inset: 0 as unknown as number }}
        />

        {/* contenu de chargement */}
        <div className="relative z-10 text-center">
          <Spinner size="lg" color="primary" label="Chargement de l'article..." />
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div
        className="min-h-screen bg-background text-foreground font-sans relative flex items-center justify-center"
      >
        {/* voile violet identique */}
        <div
          className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
          style={{ inset: 0 as unknown as number }}
        />

        <div className="relative z-10">
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 max-w-md mx-auto">
            <CardBody className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-5">
                <i className="fas fa-exclamation-triangle text-3xl text-white"></i>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Erreur</h1>
              <p className="text-gray-400 mb-6">
                {error || 'Article non trouvé'}
              </p>
              <Link href="/articles">
                <Button color="primary" variant="shadow">
                  Retour aux articles
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground font-sans relative"
      style={{}}
    >
      <Navigation />

      {/* voile violet en arrière-plan */}
      <div
          className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
          style={{ inset: 0 as unknown as number }}
      />
      {/* Hero Section avec titre */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Navigation */}
          <div className="mb-8">
            <Link href="/articles">
              <Button variant="light" color="primary" className="text-white" startContent={<i className="fas fa-arrow-left"></i>}>
                Retour aux articles
              </Button>
            </Link>
          </div>

          {/* Badge Article */}
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce border border-blue-500/30">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Article
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {article.categories.map((category) => (
              <Chip key={category} size="sm" variant="shadow" color="primary">
                {category}
              </Chip>
            ))}
          </div>
          
          {/* Titre principal */}
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight text-white" 
              style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
            {article.titre}
          </h1>
          
          {/* Résumé */}
          {article.resume && (
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-4xl">
              {article.resume}
            </p>
          )}
          
          {/* Métadonnées */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-300 mb-8">
            <div className="flex items-center gap-3">
              <Avatar 
                size="md" 
                src={article.auteur_photo} 
                name={article.auteur_nom}
                className="bg-gradient-to-r from-purple-500 to-blue-600"
              />
              <div className="text-left">
                <p className="font-medium text-white">{article.auteur_nom}</p>
                <p className="text-gray-400">Auteur</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <i className="fas fa-calendar text-blue-400"></i>
              <span>{formatDate(article.date_publication)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <i className="fas fa-eye text-green-400"></i>
              <span>{article.vues} vues</span>
            </div>
            
            <Button
              variant="light"
              size="sm"
              color="primary"
              startContent={<i className="fas fa-share"></i>}
              onClick={shareArticle}
              className="text-white hover:bg-blue-500/20"
            >
              Partager
            </Button>
          </div>

          {/* Image principale si présente */}
          {article.image_principale && (
            <div className="max-w-4xl mx-auto">
              <Image
                src={article.image_principale}
                alt={article.titre}
                width={800}
                height={400}
                className="w-full h-64 md:h-96 object-cover rounded-lg border border-white/10 shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
              <CardBody className="p-8">
                {/* Contenu de l'article */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {article.contenu_type === 'markdown' ? (
                    <MarkdownRenderer content={article.contenu} />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: article.contenu }} />
                  )}
                </div>

                {/* Médias additionnels */}
                {article.media && article.media.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-white/10">
                    <h3 className="text-xl font-semibold mb-6 text-white">
                      <i className="fas fa-images text-blue-400 mr-2"></i>
                      Médias
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {article.media.map((media) => (
                        <div key={media.id} className="relative">
                          {media.type === 'image' && (
                            <Image
                              src={media.url}
                              alt={media.titre || ''}
                              width={400}
                              height={300}
                              className="rounded-lg object-cover w-full h-48 border border-white/10"
                            />
                          )}
                          {media.type === 'video' && (
                            <video
                              src={media.url}
                              controls
                              className="rounded-lg w-full h-48 object-cover border border-white/10"
                            >
                              Votre navigateur ne supporte pas la lecture vidéo.
                            </video>
                          )}
                          {media.titre && (
                            <p className="text-sm font-medium mt-2 text-white">{media.titre}</p>
                          )}
                          {media.description && (
                            <p className="text-sm text-gray-400 mt-1">
                              {media.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-lg font-semibold mb-4 text-white">
                      <i className="fas fa-hashtag text-pink-400 mr-2"></i>
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Chip key={tag} size="sm" variant="bordered" className="border-white/20 text-gray-300">
                          #{tag}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Informations sur l'auteur */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h4 className="text-lg font-semibold mb-4 text-white">
                    <i className="fas fa-user text-green-400 mr-2"></i>
                    À propos de l'auteur
                  </h4>
                  <div className="flex items-start gap-4">
                    <Avatar 
                      size="lg" 
                      src={article.auteur_photo} 
                      name={article.auteur_nom}
                      className="bg-gradient-to-r from-purple-500 to-blue-600"
                    />
                    <div>
                      <h5 className="font-semibold text-lg text-white">{article.auteur_nom}</h5>
                      <p className="text-gray-400 mt-1">
                        Article publié le {formatDate(article.date_publication)}
                        {article.date_modification !== article.date_creation && (
                          <span className="block text-sm">
                            Dernière modification: {formatDate(article.date_modification)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Section des avis et réactions */}
            <div className="mt-8 space-y-8">
              {/* Composant des avis */}
              <ArticleReviews articleId={article.id} />
            </div>
          </div>

          {/* Sidebar - Articles liés */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Réactions de l'article */}
              <ArticleReactions articleId={article.id} />

              {/* Articles liés */}
              {relatedArticles.length > 0 && (
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-white">
                      <i className="fas fa-newspaper text-blue-400 mr-2"></i>
                      Articles similaires
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {relatedArticles.map((relatedArticle) => (
                        <div key={relatedArticle.id} className="border-b border-white/10 last:border-b-0 pb-4 last:pb-0">
                          {relatedArticle.image_principale && (
                            <Image
                              src={relatedArticle.image_principale}
                              alt={relatedArticle.titre}
                              width={300}
                              height={150}
                              className="w-full h-24 object-cover rounded-lg mb-2 border border-white/10"
                            />
                          )}
                          <Link href={`/articles/${relatedArticle.id}`}>
                            <h4 className="text-sm font-medium text-white hover:text-blue-400 transition-colors cursor-pointer mb-1">
                              {relatedArticle.titre}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <i className="fas fa-calendar text-blue-400"></i>
                            <span>{format(new Date(relatedArticle.date_publication), 'dd MMM yyyy', { locale: fr })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Widget partage */}
              <Card className="bg-gradient-to-br from-blue-600/20 to-purple-800/20 border border-blue-500/30 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-white">
                    <i className="fas fa-share text-green-400 mr-2"></i>
                    Partager cet article
                  </h3>
                </CardHeader>
                <CardBody>
                  <Button
                    color="primary"
                    variant="shadow"
                    className="w-full"
                    startContent={<i className="fas fa-share"></i>}
                    onClick={shareArticle}
                  >
                    Partager
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton scroll vers le haut */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          isIconOnly
          color="primary"
          variant="shadow"
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-300 animate-bounce"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <i className="fas fa-arrow-up text-white text-xl"></i>
        </Button>
      </div>

      {/* Popup de partage */}
      {article && (
        <SharePopup
          isOpen={sharePopupOpen}
          onClose={() => setSharePopupOpen(false)}
          title={article.titre}
          description={article.resume}
          url={typeof window !== 'undefined' ? window.location.href : ''}
        />
      )}
    </div>
  );
}
