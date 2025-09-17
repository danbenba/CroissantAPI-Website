'use client';

import React from 'react';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Avatar } from '@heroui/avatar';
import { CalendarIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ArticleCardProps {
  article: {
    id: number;
    titre: string;
    resume?: string;
    auteur_nom: string;
    auteur_photo?: string;
    date_publication: string;
    categories: string[];
    tags: string[];
    vues: number;
    image_principale?: string;
  };
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export default function ArticleCard({ article, variant = 'default', className = '' }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (variant === 'compact') {
    return (
      <Card className={`hover:shadow-md transition-shadow ${className}`}>
        <CardBody className="p-4">
          <div className="flex gap-3">
            {article.image_principale && (
              <div className="flex-shrink-0">
                <Image
                  src={article.image_principale}
                  alt={article.titre}
                  width={80}
                  height={60}
                  className="w-20 h-15 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-grow min-w-0">
              <div className="flex flex-wrap gap-1 mb-2">
                {article.categories.slice(0, 2).map((category) => (
                  <Chip key={category} size="sm" variant="flat" color="primary">
                    {category}
                  </Chip>
                ))}
              </div>
              
              <Link href={`/articles/${article.id}`}>
                <h3 className="text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer mb-1 line-clamp-2">
                  {article.titre}
                </h3>
              </Link>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-3 h-3" />
                <span>{formatDate(article.date_publication)}</span>
                <EyeIcon className="w-3 h-3" />
                <span>{article.vues}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className={`hover:shadow-xl transition-shadow ${className}`}>
        <CardBody className="p-0">
          {article.image_principale && (
            <div className="relative h-48 overflow-hidden">
              <Image
                src={article.image_principale}
                alt={article.titre}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {article.categories.slice(0, 2).map((category) => (
                  <Chip key={category} size="sm" variant="solid" color="primary">
                    {category}
                  </Chip>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-6">
            <Link href={`/articles/${article.id}`}>
              <h2 className="text-xl font-bold mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                {article.titre}
              </h2>
            </Link>
            
            {article.resume && (
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {article.resume}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar 
                  size="sm" 
                  src={article.auteur_photo} 
                  name={article.auteur_nom}
                />
                <div className="text-sm">
                  <p className="font-medium">{article.auteur_nom}</p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {formatDate(article.date_publication)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <EyeIcon className="w-4 h-4" />
                <span>{article.vues}</span>
              </div>
            </div>
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {article.tags.slice(0, 3).map((tag) => (
                  <Chip key={tag} size="sm" variant="bordered">
                    #{tag}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardBody className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {article.image_principale && (
            <div className="md:w-1/3 flex-shrink-0">
              <Image
                src={article.image_principale}
                alt={article.titre}
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="flex-grow">
            <div className="flex flex-wrap gap-2 mb-3">
              {article.categories.map((category) => (
                <Chip key={category} size="sm" variant="flat" color="primary">
                  {category}
                </Chip>
              ))}
            </div>
            
            <Link href={`/articles/${article.id}`}>
              <h2 className="text-xl font-bold mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                {article.titre}
              </h2>
            </Link>
            
            {article.resume && (
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {truncateText(article.resume, 150)}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Avatar 
                  size="sm" 
                  src={article.auteur_photo} 
                  name={article.auteur_nom}
                />
                <span>{article.auteur_nom}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(article.date_publication)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <EyeIcon className="w-4 h-4" />
                <span>{article.vues} vues</span>
              </div>
            </div>
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {article.tags.slice(0, 5).map((tag) => (
                  <Chip key={tag} size="sm" variant="bordered">
                    #{tag}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
