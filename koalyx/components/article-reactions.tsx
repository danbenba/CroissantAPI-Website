'use client';

import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Tooltip } from '@heroui/tooltip';
import { useRouter } from 'next/navigation';

interface ArticleReactionsProps {
  articleId: number;
  initialLikes?: number;
  initialDislikes?: number;
  initialUserReaction?: 'like' | 'dislike' | null;
}

interface ReactionStats {
  likes: number;
  dislikes: number;
  total: number;
  userReaction: 'like' | 'dislike' | null;
  netScore: number;
}

export default function ArticleReactions({ 
  articleId, 
  initialLikes = 0, 
  initialDislikes = 0, 
  initialUserReaction = null 
}: ArticleReactionsProps) {
  const [stats, setStats] = useState<ReactionStats>({
    likes: initialLikes,
    dislikes: initialDislikes,
    total: initialLikes + initialDislikes,
    userReaction: initialUserReaction,
    netScore: initialLikes - initialDislikes
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Charger les statistiques depuis l'API
  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/reactions`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Erreur lors du chargement des réactions');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réactions:', error);
      setError('Erreur de connexion');
    }
  };

  useEffect(() => {
    fetchStats();
  }, [articleId]);

  // Gérer une réaction (like/dislike)
  const handleReaction = async (reactionType: 'like' | 'dislike') => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles/${articleId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactionType }),
      });

      const data = await response.json();

      if (data.success) {
        // Recharger les statistiques pour avoir les données à jour
        await fetchStats();
      } else {
        if (response.status === 401) {
          // Rediriger vers la connexion
          router.push('/auth/login' as any);
          return;
        }
        setError(data.error || 'Erreur lors de la réaction');
      }
    } catch (error) {
      console.error('Erreur lors de la réaction:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const getLikeButtonVariant = () => {
    if (stats.userReaction === 'like') return 'solid';
    return 'bordered';
  };

  const getDislikeButtonVariant = () => {
    if (stats.userReaction === 'dislike') return 'solid';
    return 'bordered';
  };

  const getLikeButtonColor = () => {
    if (stats.userReaction === 'like') return 'success';
    return 'default';
  };

  const getDislikeButtonColor = () => {
    if (stats.userReaction === 'dislike') return 'danger';
    return 'default';
  };

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10">
      <CardBody>
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <i className="fas fa-thumbs-up text-blue-400 mr-2"></i>
            Votre avis sur cet article
          </h3>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Boutons de réaction */}
          <div className="flex items-center justify-center space-x-4">
            <Tooltip 
              content="J'aime cet article"
              className="bg-black/90 text-white border border-white/20"
              classNames={{
                content: "bg-black/90 text-white border border-white/20 px-3 py-2"
              }}
            >
              <Button
                variant={getLikeButtonVariant()}
                color={getLikeButtonColor()}
                size="lg"
                startContent={<i className="fas fa-thumbs-up"></i>}
                onClick={() => handleReaction('like')}
                isLoading={loading}
                disabled={loading}
                className="min-w-24"
              >
                {stats.likes}
              </Button>
            </Tooltip>

            <Tooltip 
              content="Je n'aime pas cet article"
              className="bg-black/90 text-white border border-white/20"
              classNames={{
                content: "bg-black/90 text-white border border-white/20 px-3 py-2"
              }}
            >
              <Button
                variant={getDislikeButtonVariant()}
                color={getDislikeButtonColor()}
                size="lg"
                startContent={<i className="fas fa-thumbs-down"></i>}
                onClick={() => handleReaction('dislike')}
                isLoading={loading}
                disabled={loading}
                className="min-w-24"
              >
                {stats.dislikes}
              </Button>
            </Tooltip>
          </div>

          {/* Statistiques */}
          <div className="text-center text-sm text-gray-400">
            <div className="flex items-center justify-center space-x-4">
              <span>
                <i className="fas fa-users mr-1"></i>
                {stats.total} réaction{stats.total !== 1 ? 's' : ''}
              </span>
              <span className={`${stats.netScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <i className={`fas ${stats.netScore >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                Score: {stats.netScore > 0 ? '+' : ''}{stats.netScore}
              </span>
            </div>
          </div>

          {/* Indication de l'état de la réaction utilisateur */}
          {stats.userReaction && (
            <div className="text-xs text-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full ${
                stats.userReaction === 'like' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                <i className={`fas ${stats.userReaction === 'like' ? 'fa-thumbs-up' : 'fa-thumbs-down'} mr-1`}></i>
                Vous avez {stats.userReaction === 'like' ? 'aimé' : 'n\'aimez pas'} cet article
              </span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}



