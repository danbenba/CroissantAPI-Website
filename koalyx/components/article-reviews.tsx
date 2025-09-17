'use client';

import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Avatar } from '@heroui/avatar';
import { Chip } from '@heroui/chip';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { Pagination } from '@heroui/pagination';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  nom_utilisateur: string;
  role: string;
  email: string;
  photo?: string;
}

interface Review {
  id: number;
  article_id: number;
  user_id: number;
  username: string;
  avatar_url?: string;
  role: string;
  rating: number;
  title?: string;
  content: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_featured: boolean;
  helpful_count: number;
  date_created: string;
  date_updated: string;
  helpful_reactions: number;
  not_helpful_reactions: number;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ArticleReviewsProps {
  articleId: number;
}

export default function ArticleReviews({ articleId }: ArticleReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('recent');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // État pour le formulaire de nouvel avis
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
    isVerifiedPurchase: false
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  // Charger les avis
  const fetchReviews = async (page = 1, sort = sortBy) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${articleId}/reviews?page=${page}&limit=10&sort=${sort}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
        setCurrentPage(data.data.pagination.page);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError(data.error || 'Erreur lors du chargement des avis');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchCurrentUser();
  }, [articleId]);

  // Charger les informations de l'utilisateur connecté
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
    }
  };

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    fetchReviews(page, sortBy);
  };

  // Gérer le changement de tri
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    fetchReviews(1, sort);
  };

  // Supprimer un avis (admin seulement)
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${articleId}/reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Recharger les avis
        fetchReviews(currentPage, sortBy);
      } else {
        alert(data.error || 'Erreur lors de la suppression de l\'avis');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'avis:', error);
      alert('Erreur de connexion');
    }
  };

  // Soumettre un nouvel avis
  const handleSubmitReview = async () => {
    if (!newReview.content.trim() || newReview.content.length < 10) {
      setError('Le contenu doit contenir au moins 10 caractères');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles/${articleId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      });

      const data = await response.json();

      if (data.success) {
        // Réinitialiser le formulaire
        setNewReview({
          rating: 5,
          title: '',
          content: '',
          isVerifiedPurchase: false
        });
        onClose();
        // Recharger les avis
        fetchReviews();
      } else {
        if (response.status === 401) {
          router.push('/auth/login' as any);
          return;
        }
        setError(data.error || 'Erreur lors de la création de l\'avis');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'avis:', error);
      setError('Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  // Réaction à un avis
  const handleReviewReaction = async (reviewId: number, reactionType: 'helpful' | 'not_helpful') => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactionType }),
      });

      const data = await response.json();

      if (data.success) {
        // Recharger les avis pour mettre à jour les compteurs
        fetchReviews(currentPage, sortBy);
      } else {
        if (response.status === 401) {
          router.push('/auth/login' as any);
          return;
        }
        console.error('Erreur réaction:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la réaction:', error);
    }
  };

  // Rendu des étoiles
  const renderStars = (rating: number, size = 'text-sm') => {
    return (
      <div className={`flex items-center ${size}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${
              star <= rating ? 'text-yellow-400' : 'text-gray-600'
            }`}
          ></i>
        ))}
      </div>
    );
  };

  // Rendu de la distribution des notes
  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.distribution[rating as keyof typeof stats.distribution];
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-2 text-sm">
              <span className="w-3 text-gray-400">{rating}</span>
              <i className="fas fa-star text-yellow-400 text-xs"></i>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="w-8 text-gray-400 text-xs">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'moderateur': return 'warning';
      case 'support': return 'secondary';
      case 'ultra': return 'primary';
      case 'plus': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <h3 className="text-xl font-semibold text-white flex items-center">
            <i className="fas fa-star text-yellow-400 mr-2"></i>
            Avis des utilisateurs
          </h3>
        </CardHeader>
        <CardBody>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Note moyenne */}
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(stats.averageRating), 'text-lg')}
                <div className="text-sm text-gray-400 mt-1">
                  {stats.totalReviews} avis
                </div>
              </div>

              {/* Distribution des notes */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Distribution des notes</h4>
                {renderRatingDistribution()}
              </div>
            </div>
          )}

          {/* Bouton pour ajouter un avis */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <Button
              color="primary"
              variant="shadow"
              startContent={<i className="fas fa-plus"></i>}
              onClick={onOpen}
            >
              Laisser un avis
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Contrôles de tri */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">
          {stats?.totalReviews || 0} avis
        </h4>
        <Select
          placeholder="Trier par"
          value={sortBy}
          onSelectionChange={(value) => handleSortChange(value as string)}
          className="w-48"
          size="sm"
          classNames={{
            trigger: "bg-gray-800 text-white border border-white/20",
            value: "text-white",
            popoverContent: "bg-gray-800 border border-white/20",
            listbox: "bg-gray-800"
          }}
        >
          <SelectItem key="recent" className="text-white hover:bg-gray-700">
            Plus récents
          </SelectItem>
          <SelectItem key="helpful" className="text-white hover:bg-gray-700">
            Plus utiles
          </SelectItem>
          <SelectItem key="rating_high" className="text-white hover:bg-gray-700">
            Meilleures notes
          </SelectItem>
          <SelectItem key="rating_low" className="text-white hover:bg-gray-700">
            Notes les plus basses
          </SelectItem>
        </Select>
      </div>

      {/* Liste des avis */}
      {loading ? (
        <div className="text-center py-8">
          <Spinner size="lg" color="primary" label="Chargement des avis..." />
        </div>
      ) : error ? (
        <Card className="bg-red-500/10 border border-red-500/20">
          <CardBody className="text-center py-8">
            <i className="fas fa-exclamation-triangle text-red-400 text-3xl mb-4"></i>
            <p className="text-red-400">{error}</p>
          </CardBody>
        </Card>
      ) : reviews.length === 0 ? (
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10">
          <CardBody className="text-center py-8">
            <i className="fas fa-comments text-gray-400 text-3xl mb-4"></i>
            <p className="text-gray-400">Aucun avis pour le moment</p>
            <p className="text-sm text-gray-500 mt-2">Soyez le premier à laisser un avis !</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-gray-800/50 backdrop-blur-sm border border-white/10">
              <CardBody className="p-6">
                {/* En-tête de l'avis */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <Avatar
                      src={review.avatar_url}
                      name={review.username}
                      size="md"
                      className="bg-gradient-to-r from-purple-500 to-blue-600"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="font-semibold text-white">{review.username}</h5>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getRoleBadgeColor(review.role)}
                        >
                          {review.role}
                        </Chip>
                        {review.is_verified_purchase && (
                          <Chip size="sm" variant="flat" color="success">
                            <i className="fas fa-check-circle mr-1"></i>
                            Achat vérifié
                          </Chip>
                        )}
                        {review.is_featured && (
                          <Chip size="sm" variant="flat" color="warning">
                            <i className="fas fa-star mr-1"></i>
                            En vedette
                          </Chip>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-400">
                          {format(new Date(review.date_created), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Titre de l'avis */}
                {review.title && (
                  <h6 className="font-medium text-white mb-2">{review.title}</h6>
                )}

                {/* Contenu de l'avis */}
                <p className="text-gray-300 mb-4 whitespace-pre-wrap">{review.content}</p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-4">
                    <Button
                      size="sm"
                      variant="light"
                      startContent={<i className="fas fa-thumbs-up"></i>}
                      onClick={() => handleReviewReaction(review.id, 'helpful')}
                      className="text-gray-400 hover:text-green-400"
                    >
                      Utile ({review.helpful_reactions})
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      startContent={<i className="fas fa-thumbs-down"></i>}
                      onClick={() => handleReviewReaction(review.id, 'not_helpful')}
                      className="text-gray-400 hover:text-red-400"
                    >
                      Pas utile ({review.not_helpful_reactions})
                    </Button>
                    
                    {/* Bouton de suppression pour les admins */}
                    {currentUser && ['admin', 'moderateur', 'support'].includes(currentUser.role) && (
                      <Button
                        size="sm"
                        variant="light"
                        startContent={<i className="fas fa-trash"></i>}
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                  
                  {review.date_updated !== review.date_created && (
                    <span className="text-xs text-gray-500">
                      Modifié le {format(new Date(review.date_updated), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            variant="light"
          />
        </div>
      )}

      {/* Modal pour nouveau avis */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" backdrop="blur">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-semibold">Laisser un avis</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Note */}
              <div>
                <label className="block text-sm font-medium mb-2">Note *</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className={`text-2xl transition-colors ${
                        star <= newReview.rating
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-gray-600 hover:text-gray-500'
                      }`}
                    >
                      <i className="fas fa-star"></i>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-400">
                    ({newReview.rating}/5)
                  </span>
                </div>
              </div>

              {/* Titre */}
              <Input
                label="Titre (optionnel)"
                placeholder="Donnez un titre à votre avis"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                maxLength={255}
              />

              {/* Contenu */}
              <Textarea
                label="Votre avis *"
                placeholder="Partagez votre expérience avec cet article..."
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                minRows={4}
                maxRows={8}
                description={`${newReview.content.length} caractères (minimum 10)`}
              />

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Annuler
            </Button>
            <Button
              color="primary"
              onPress={handleSubmitReview}
              isLoading={submitting}
              disabled={submitting || newReview.content.length < 10}
            >
              Publier l'avis
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}



