'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import AdminBreadcrumbs from '@/components/admin/admin-breadcrumbs';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Switch } from '@heroui/switch';
import { Chip } from '@heroui/chip';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Spinner } from '@heroui/spinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/use-auth';
import MarkdownRenderer from '@/components/markdown-renderer';
import { secureGet, securePost, secureDelete } from '@/lib/api-client';

interface Article {
  id: number;
  titre: string;
  contenu: string;
  contenu_type: 'markdown' | 'html';
  resume?: string;
  auteur_nom: string;
  date_publication: string;
  date_creation: string;
  statut: 'brouillon' | 'publie' | 'archive';
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
}

interface ArticleForm {
  titre: string;
  contenu: string;
  contenu_type: 'markdown' | 'html';
  resume: string;
  image_principale: string;
  tags: string[];
  categories: string[];
  statut: 'brouillon' | 'publie' | 'archive';
  date_publication?: string;
}

export default function AdminArticlesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: previewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [formData, setFormData] = useState<ArticleForm>({
    titre: '',
    contenu: '',
    contenu_type: 'markdown',
    resume: '',
    image_principale: '',
    tags: [],
    categories: [],
    statut: 'brouillon'
  });

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/';
    }
  }, [user]);

  // Fetch articles and categories
  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await secureGet('/api/admin/articles?status=all&limit=50');
      const data = await response.json();
      console.log('📝 Response data:', data);
      
      if (data.success) {
        const articlesData = data.data?.articles || data.articles || [];
        console.log('📝 Articles extracted:', articlesData.length, 'articles');
        setArticles(articlesData);
      } else {
        console.error('❌ API returned error:', data);
        setArticles([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await secureGet('/api/articles/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      const url = editingArticle ? `/api/admin/articles/${editingArticle.id}` : '/api/admin/articles';
      const method = editingArticle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date_publication: formData.statut === 'publie' ? new Date().toISOString() : null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchArticles();
        onClose();
        resetForm();
      } else {
        alert(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    
    try {
      const response = await secureDelete(`/api/admin/articles/${id}`);
      const data = await response.json();
      
      if (data.success) {
        await fetchArticles();
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      contenu: '',
      contenu_type: 'markdown',
      resume: '',
      image_principale: '',
      tags: [],
      categories: [],
      statut: 'brouillon'
    });
    setEditingArticle(null);
  };

  const openEditModal = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      titre: article.titre,
      contenu: article.contenu,
      contenu_type: article.contenu_type,
      resume: article.resume || '',
      image_principale: article.image_principale || '',
      tags: article.tags || [],
      categories: article.categories || [],
      statut: article.statut as 'brouillon' | 'publie' | 'archive'
    });
    onOpen();
  };

  const openNewModal = () => {
    resetForm();
    onOpen();
  };

  const handlePreview = () => {
    setPreviewContent(formData.contenu);
    onPreviewOpen();
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const toggleCategory = (categoryName: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryName)
        ? prev.categories.filter(c => c !== categoryName)
        : [...prev.categories, categoryName]
    }));
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div
        className="min-h-screen bg-background text-foreground font-sans relative flex items-center justify-center"
      >
        {/* voile violet identique */}
        <div
          className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-main-overlay"
          style={{ inset: 0 as unknown as number }}
        />

        {/* contenu de chargement */}
        <div className="relative z-10 text-center">
          <Spinner size="lg" color="primary" label="Vérification des permissions..." />
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
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-main-overlay"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Breadcrumbs */}
      <div className="relative z-10 pt-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AdminBreadcrumbs 
            items={[
              { label: "Administration", href: "/admin", icon: "fas fa-shield-alt" },
              { label: "Articles", icon: "fas fa-newspaper" }
            ]} 
          />
        </div>
      </div>

      {/* Hero Section avec titre */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge Admin */}
          <div className="inline-flex items-center gap-2 bg-orange-600/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce border border-orange-500/30">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
            Administration Articles
          </div>
          
          {/* Titre principal */}
          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tight text-white" 
              style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
            Articles
          </h1>
          
          {/* Sous-titre */}
          <p className="text-xl md:text-2xl text-gray-300 mb-16">
            Créez, modifiez et gérez tous les articles d'Koalyx
          </p>

          {/* Bouton principal */}
          <Button
            color="primary"
            variant="shadow"
            size="lg"
            className="text-lg px-8 py-6"
            startContent={<i className="fas fa-plus text-xl"></i>}
            onClick={() => router.push('/admin/articles/add')}
          >
            Créer un Nouvel Article
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Section Gestion des Articles */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-white text-center">
            <i className="fas fa-newspaper text-orange-500 mr-3"></i>
            Gestion des Articles
          </h2>

          {/* Table des articles */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
            <CardBody>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" color="primary" />
              </div>
            ) : (
              <Table 
                aria-label="Articles"
                classNames={{
                  wrapper: "bg-transparent",
                  th: "bg-gray-700/50 text-white border-b border-white/10",
                  td: "text-gray-300 border-b border-white/5"
                }}
              >
                <TableHeader>
                  <TableColumn>TITRE</TableColumn>
                  <TableColumn>AUTEUR</TableColumn>
                  <TableColumn>STATUT</TableColumn>
                  <TableColumn>CATÉGORIES</TableColumn>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>VUES</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-newspaper text-2xl text-orange-400"></i>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Aucun article trouvé</h3>
                    <p className="text-gray-400 mb-4">Commencez par créer votre premier article.</p>
                    <Button
                      color="primary"
                      variant="shadow"
                      startContent={<i className="fas fa-plus"></i>}
                      onClick={() => router.push('/admin/articles/add')}
                    >
                      Créer un article
                    </Button>
                  </div>
                }>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{article.titre}</p>
                          {article.resume && (
                            <p className="text-sm text-gray-400 truncate max-w-xs">
                              {article.resume}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-white">{article.auteur_nom}</span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="shadow"
                          color={
                            article.statut === 'publie' ? 'success' :
                            article.statut === 'brouillon' ? 'warning' : 'default'
                          }
                        >
                          {article.statut}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {article.categories.map(cat => (
                            <Chip key={cat} size="sm" variant="flat" color="primary">
                              {cat}
                            </Chip>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-300">
                          {formatDate(article.date_publication || article.date_creation)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="secondary">
                          {article.vues}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="primary"
                            onClick={() => window.open(`/articles/${article.id}`, '_blank')}
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="warning"
                            onClick={() => router.push(`/admin/articles/edit/${article.id}`)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onClick={() => handleDelete(article.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Modal d'édition/création */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="5xl"
          scrollBehavior="inside"
          classNames={{
            base: "bg-gray-800/95 backdrop-blur-xl border border-white/10",
            header: "text-white border-b border-white/10",
            body: "text-white",
            footer: "border-t border-white/10"
          }}
        >
          <ModalContent>
            <ModalHeader className="text-white">
              <i className="fas fa-newspaper text-orange-400 mr-2"></i>
              {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Titre"
                  placeholder="Titre de l'article"
                  value={formData.titre}
                  onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                  classNames={{
                    input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-400",
                    inputWrapper: "border-white/20 hover:border-blue-500/50 focus-within:border-blue-500 bg-gray-700/50",
                    label: "text-white"
                  }}
                />
                
                <Textarea
                  label="Résumé"
                  placeholder="Résumé de l'article"
                  value={formData.resume}
                  onChange={(e) => setFormData(prev => ({ ...prev, resume: e.target.value }))}
                  classNames={{
                    input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-400",
                    inputWrapper: "border-white/20 hover:border-blue-500/50 focus-within:border-blue-500 bg-gray-700/50",
                    label: "text-white"
                  }}
                />
                
                <Input
                  label="Image principale (URL)"
                  placeholder="https://exemple.com/image.jpg"
                  value={formData.image_principale}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_principale: e.target.value }))}
                  classNames={{
                    input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-400",
                    inputWrapper: "border-white/20 hover:border-blue-500/50 focus-within:border-blue-500 bg-gray-700/50",
                    label: "text-white"
                  }}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Type de contenu"
                    selectedKeys={[formData.contenu_type]}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      setFormData(prev => ({ ...prev, contenu_type: selectedKey as 'markdown' | 'html' }));
                    }}
                    classNames={{
                      trigger: "bg-gray-700/50 border-white/20 hover:border-blue-500/50 data-[focus=true]:border-blue-500",
                      label: "text-white",
                      value: "text-white"
                    }}
                  >
                    <SelectItem key="markdown">Markdown</SelectItem>
                    <SelectItem key="html">HTML</SelectItem>
                  </Select>
                  
                  <Select
                    label="Statut"
                    selectedKeys={[formData.statut]}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      setFormData(prev => ({ ...prev, statut: selectedKey as 'brouillon' | 'publie' | 'archive' }));
                    }}
                    classNames={{
                      trigger: "bg-gray-700/50 border-white/20 hover:border-blue-500/50 data-[focus=true]:border-blue-500",
                      label: "text-white",
                      value: "text-white"
                    }}
                  >
                    <SelectItem key="brouillon">Brouillon</SelectItem>
                    <SelectItem key="publie">Publié</SelectItem>
                    <SelectItem key="archive">Archivé</SelectItem>
                  </Select>
                </div>
                
                {/* Catégories */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">
                    <i className="fas fa-tags text-purple-400 mr-2"></i>
                    Catégories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Chip
                        key={category.id}
                        variant={formData.categories.includes(category.nom) ? 'shadow' : 'bordered'}
                        color={formData.categories.includes(category.nom) ? 'primary' : 'default'}
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleCategory(category.nom)}
                      >
                        {category.nom}
                      </Chip>
                    ))}
                  </div>
                </div>
                
                {/* Tags */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">
                    <i className="fas fa-hashtag text-pink-400 mr-2"></i>
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <Chip
                        key={tag}
                        variant="shadow"
                        color="secondary"
                        onClose={() => removeTag(tag)}
                      >
                        #{tag}
                      </Chip>
                    ))}
                  </div>
                  <Input
                    placeholder="Ajouter un tag (Entrée pour confirmer)"
                    classNames={{
                      input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-400",
                      inputWrapper: "border-white/20 hover:border-blue-500/50 focus-within:border-blue-500 bg-gray-700/50"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                
                {/* Contenu */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-white">
                      <i className="fas fa-edit text-blue-400 mr-2"></i>
                      Contenu
                    </label>
                    <Button size="sm" variant="light" color="primary" onClick={handlePreview}>
                      <i className="fas fa-eye mr-2"></i>
                      Aperçu
                    </Button>
                  </div>
                  <Textarea
                    placeholder={
                      formData.contenu_type === 'markdown' 
                        ? "Écrivez votre contenu en Markdown...\n\n# Titre\n\n**Texte en gras**\n\n[Lien](https://example.com)\n\nhttps://youtube.com/watch?v=XXXXX (sera transformé en lecteur YouTube)"
                        : "Écrivez votre contenu HTML..."
                    }
                    value={formData.contenu}
                    onChange={(e) => setFormData(prev => ({ ...prev, contenu: e.target.value }))}
                    minRows={15}
                    className="font-mono"
                    classNames={{
                      input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-400 font-mono",
                      inputWrapper: "border-white/20 hover:border-blue-500/50 focus-within:border-blue-500 bg-gray-700/50"
                    }}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" color="default" onClick={onClose}>
                <i className="fas fa-times mr-2"></i>
                Annuler
              </Button>
              <Button
                color="primary"
                variant="shadow"
                onClick={handleSubmit}
                isLoading={saving}
                isDisabled={!formData.titre || !formData.contenu}
                startContent={<i className="fas fa-save"></i>}
              >
                {editingArticle ? 'Mettre à jour' : 'Créer'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal d'aperçu */}
        <Modal
          isOpen={previewOpen}
          onClose={onPreviewClose}
          size="5xl"
          scrollBehavior="inside"
          classNames={{
            base: "bg-gray-800/95 backdrop-blur-xl border border-white/10",
            header: "text-white border-b border-white/10",
            body: "text-white",
            footer: "border-t border-white/10"
          }}
        >
          <ModalContent>
            <ModalHeader className="text-white">
              <i className="fas fa-eye text-blue-400 mr-2"></i>
              Aperçu de l'article
            </ModalHeader>
            <ModalBody>
              <div className="p-4 bg-gray-700/30 rounded-lg">
                {formData.contenu_type === 'markdown' ? (
                  <MarkdownRenderer content={previewContent} />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onClick={onPreviewClose}>
                <i className="fas fa-times mr-2"></i>
                Fermer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
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
    </div>
  );
}
