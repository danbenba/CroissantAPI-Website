"use client"

import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Input,
  Button,
  Chip,
  Divider,
  Spinner,
  Code,
  Tabs,
  Tab,
  ScrollShadow,
  Link as NextUILink
} from "@heroui/react";
import { 
  Search,
  Code2,
  ExternalLink,
  Users,
  Book,
  BookOpen,
  Zap,
  Database,
  Globe,
  FileCode,
  Layers,
  Copy,
  Check
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const API_URL = "/api";

// Cache
let apiDocsCache: any[] | null = null;
let apiDocsGroupedCache: Record<string, any[]> | null = null;
let apiDocsCategoryListCache: string[] | null = null;

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

function useApiDocs() {
  const [docs, setDocs] = useState<any[]>(apiDocsCache || []);
  const [categories, setCategories] = useState<Record<string, any[]>>(apiDocsGroupedCache || {});
  const [categoryList, setCategoryList] = useState<string[]>(apiDocsCategoryListCache || []);
  const [loading, setLoading] = useState(!apiDocsCache);

  useEffect(() => {
    if (apiDocsCache && apiDocsGroupedCache && apiDocsCategoryListCache) {
      setDocs(apiDocsCache);
      setCategories(apiDocsGroupedCache);
      setCategoryList(apiDocsCategoryListCache);
      setLoading(false);
    } else {
      setLoading(true);
      fetch(API_URL + "/describe")
        .then((res) => res.json())
        .then((data) => {
          apiDocsCache = data;
          setDocs(data);
          
          const grouped = data.reduce((acc: Record<string, any[]>, doc: any) => {
            const cat = doc.category || "Uncategorized";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(doc);
            return acc;
          }, {});
          
          Object.keys(grouped).forEach((category) => {
            const endpoints: Record<string, any[]> = {};
            grouped[category].forEach((doc: any) => {
              const endpointKey = doc.method + " " + doc.endpoint;
              if (!endpoints[endpointKey]) {
                endpoints[endpointKey] = [];
              }
              endpoints[endpointKey].push(doc);
            });
            grouped[category] = Object.values(endpoints);
          });
          
          apiDocsGroupedCache = grouped;
          apiDocsCategoryListCache = Object.keys(grouped);
          setCategories(grouped);
          setCategoryList(Object.keys(grouped));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  return { docs, categories, categoryList, loading };
}

export default function ApiDocs() {
  const { t } = useTranslation("common");
  const { docs, categories, categoryList, loading } = useApiDocs();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = docs.filter((doc) => 
        doc.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDocs(filtered);
    } else {
      setFilteredDocs([]);
    }
  }, [searchTerm, docs]);

  const displayedCategories = searchTerm ? [] : selectedCategory ? [selectedCategory] : categoryList;

  const getDocsForCategory = (cat: string) => {
    if (searchTerm) {
      return filteredDocs;
    }
    return categories[cat] || [];
  };

  const sdkLanguages = [
    { id: "ts-and-js", name: "TypeScript/JavaScript", icon: <FileCode className="w-4 h-4" /> },
    { id: "python", name: "Python", icon: <FileCode className="w-4 h-4" /> },
    { id: "java", name: "Java", icon: <FileCode className="w-4 h-4" /> },
    { id: "cs", name: "C#", icon: <FileCode className="w-4 h-4" /> },
    { id: "php", name: "PHP", icon: <FileCode className="w-4 h-4" /> },
    { id: "ruby", name: "Ruby", icon: <FileCode className="w-4 h-4" /> },
    { id: "rust", name: "Rust", icon: <FileCode className="w-4 h-4" /> },
    { id: "go", name: "Go", icon: <FileCode className="w-4 h-4" /> },
    { id: "cpp", name: "C++", icon: <FileCode className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-background text-foreground font-sans relative min-h-screen">
      {/* Background Koalyx style - pixel perfect */}
      <div
        className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
        style={{ inset: 0 as unknown as number }}
      />

      <div className="z-10 w-full max-w-[1400px] flex-1 px-3 py-10 flex flex-col gap-8 pb-10 mx-auto relative">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="bg-gradient-to-r bg-clip-text pb-1 text-4xl font-semibold text-transparent from-[#e0e0e0] to-[#d08ed6] mb-4">
            {t("apiDocs.title")}
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            {t("apiDocs.intro")}
          </p>
        </div>

        <div className="flex gap-6 max-lg:flex-col">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-80 lg:sticky lg:top-6 lg:h-fit space-y-6">
            
            {/* Search */}
            <Card className="bg-content1/50 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-white">
                  <Search className="w-5 h-5" />
                  <span className="font-semibold">Rechercher</span>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <Input
                  placeholder={t("apiDocs.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  startContent={<Search className="w-4 h-4 text-default-400" />}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-default-100 border-0"
                  }}
                />
              </CardBody>
            </Card>

            {/* Categories */}
            <Card className="bg-content1/50 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-white">
                  <Layers className="w-5 h-5" />
                  <span className="font-semibold">{t("apiDocs.categories")}</span>
                </div>
              </CardHeader>
              <CardBody className="pt-0 space-y-2">
                <Button
                  variant={selectedCategory === null ? "solid" : "ghost"}
                  color={selectedCategory === null ? "primary" : "default"}
                  className={`w-full justify-start ${selectedCategory === null ? '' : 'text-white'}`}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Globe className="w-4 h-4" />
                  {t("apiDocs.all")}
                </Button>
                {categoryList.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "solid" : "ghost"}
                    color={selectedCategory === cat ? "primary" : "default"}
                    className={`w-full justify-start ${selectedCategory === cat ? '' : 'text-white'}`}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Database className="w-4 h-4" />
                    {cat}
                  </Button>
                ))}
              </CardBody>
            </Card>

            {/* SDKs */}
            <Card className="bg-content1/50 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-white">
                  <Code2 className="w-5 h-5" />
                  <span className="font-semibold">{t("apiDocs.libraries")}</span>
                </div>
              </CardHeader>
              <CardBody className="pt-0 space-y-2">
                {sdkLanguages.map((sdk) => (
                  <NextUILink 
                    key={sdk.id}
                    href={`https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-${sdk.id}/README.md`}
                    isExternal
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-default/20 transition-colors text-white"
                  >
                    {sdk.icon}
                    <span className="flex-1">{sdk.name}</span>
                    <ExternalLink className="w-4 h-4" />
                  </NextUILink>
                ))}
              </CardBody>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* Info Card */}
            <Card className="bg-content1/50 backdrop-blur-sm border-0 shadow-lg">
              <CardBody className="p-6">
                <div className="space-y-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-yellow-500" />
                    <span>{t("apiDocs.requiresAuth")}</span>
                  </div>
                  
                  <Divider className="bg-white/10" />
                  
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Book className="w-5 h-5" />
                      {t("apiDocs.precisions")}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>{t("apiDocs.iconHash")}</p>
                      <p>{t("apiDocs.bannerHash")}</p>
                      <p>{t("apiDocs.splashHash")}</p>
                      <p>{t("apiDocs.hashes")}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* API Endpoints */}
            <Card className="bg-content1/50 backdrop-blur-sm border-0 shadow-lg">
              <CardBody className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center gap-3 py-8">
                    <Spinner color="primary" />
                    <span className="text-white">{t("apiDocs.loading")}</span>
                  </div>
                ) : searchTerm && filteredDocs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Aucun résultat</h3>
                    <p className="text-white/60">Aucun résultat trouvé pour "{searchTerm}"</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {displayedCategories.map((cat) => (
                      <div key={cat}>
                        <div className="flex items-center gap-3 mb-6">
                          <Chip 
                            color="primary" 
                            variant="dot" 
                            className="text-white"
                          >
                            {cat}
                          </Chip>
                        </div>
                        
                        <div className="space-y-6">
                          {getDocsForCategory(cat)?.map((endpointGroup) => {
                            const doc = endpointGroup[0];
                            return (
                              <EndpointCard key={doc.endpoint} doc={doc} />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function EndpointCard({ doc }: { doc: any }) {
  const { t } = useTranslation("common");
  const [selectedTab, setSelectedTab] = useState("overview");

  const getMethodColor = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'get': return 'success';
      case 'post': return 'primary';
      case 'put': return 'warning';
      case 'delete': return 'danger';
      default: return 'default';
    }
  };

  return (
    <Card className="bg-content2/30 backdrop-blur-sm border border-white/5">
      <CardHeader className="flex gap-3">
        <div className="flex items-center gap-3">
          <Chip 
            size="sm" 
            color={getMethodColor(doc.method)}
            variant="solid"
          >
            {doc.method || 'GET'}
          </Chip>
          <Code className="text-white">{doc.endpoint}</Code>
        </div>
      </CardHeader>
      
      <Divider className="bg-white/10" />
      
      <CardBody>
        <Tabs 
          selectedKey={selectedTab} 
          onSelectionChange={(key) => setSelectedTab(key as string)}
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12 text-white",
            tabContent: "group-data-[selected=true]:text-primary"
          }}
        >
          <Tab key="overview" title="Vue d'ensemble">
            {doc.description && (
              <div className="mb-4">
                <p className="text-white/80">{doc.description}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <InfoSection title="Type de réponse" content={doc.responseType} language="typescript" />
              <InfoSection title="Paramètres" content={doc.params} language="typescript" />
              <InfoSection title="Query String" content={doc.query} language="typescript" />
              <InfoSection title="Body" content={doc.body} language="json" />
            </div>
          </Tab>
          
          <Tab key="example" title="Exemple">
            <div className="space-y-4">
              <InfoSection title="Exemple de requête" content={doc.example} language="javascript" />
              <InfoSection title="Réponse exemple" content={doc.exampleResponse} language="json" />
            </div>
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
}

function InfoSection({ title, content, language }: { title: string; content: any; language: string }) {
  const [copied, setCopied] = useState(false);
  
  if (!content) return null;

  const formattedContent = typeof content === "string" ? content : JSON.stringify(content, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div>
      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-primary" />
        {title}
      </h4>
      <Card className="bg-content3/50">
        <CardBody className="p-0">
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 z-10 bg-black/20 hover:bg-black/40 text-white"
              onPress={handleCopy}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <ScrollShadow className="max-h-60">
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-white/90">{formattedContent}</code>
              </pre>
            </ScrollShadow>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
