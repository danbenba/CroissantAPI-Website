import React, { useEffect, useState } from "react";
import Highlight from "react-highlight";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import useIsMobile from "../hooks/useIsMobile"; // Ajoutez ce hook
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const API_URL = "/api";

// Memoized docs and grouped state (module-level, survives remounts)
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
          // Group docs by category and then by endpoint
          const grouped = data.reduce((acc: Record<string, any[]>, doc: any) => {
            const cat = doc.category || "Uncategorized";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(doc);
            return acc;
          }, {});
          // Further group by endpoint
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
  const isMobile = useIsMobile();
  return isMobile ? <ApiDocsMobile /> : <ApiDocsDesktop />;
}

// Version Desktop
function ApiDocsDesktop() {
  const { t } = useTranslation("common");
  const { docs, categories, categoryList, loading } = useApiDocs();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = docs.filter((doc) => doc.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) || doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
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

  const sdkLanguages = ["ts-and-js:TypeScript/JavaScript", "python:Python", "java:Java", "cs:C#", "php:PHP", "ruby:Ruby", "rust:Rust", "go:Go", "cpp:C++"];

  return (
    <div className="flex gap-6 p-5 bg-[#3c3c3c] rounded-lg shadow-lg overflow-auto max-w-full">
      {/* Sidebar */}
      <aside className="bg-[#292929] rounded-lg p-6 h-fit flex-shrink-0 flex flex-col w-[300px] sticky top-5">
        {/* Search Input */}
        <div className="mb-6">
          <input type="text" placeholder={t("apiDocs.searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2.5 rounded-md bg-[#444] border border-[#555] text-white placeholder:text-[#999]" />
        </div>
        {/* Categories */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-medium mb-4">{t("apiDocs.categories")}</h3>
          <ul className="list-none p-0 space-y-2.5">
            <li className={`cursor-pointer transition-colors hover:text-[#1e90ff] ${selectedCategory === null ? "text-[#1e90ff] font-medium" : "text-[#e2e8f0]"}`} onClick={() => setSelectedCategory(null)}>
              {t("apiDocs.all")}
            </li>
            {categoryList.map((cat) => (
              <li key={cat} className={`cursor-pointer transition-colors hover:text-[#1e90ff] ${selectedCategory === cat ? "text-[#1e90ff] font-medium" : "text-[#e2e8f0]"}`} onClick={() => setSelectedCategory(cat)}>
                {cat}
              </li>
            ))}
          </ul>
        </div>
        <hr className="border-[#444] my-6" />
        {/* SDKs */}
        <div>
          <h3 className="text-white text-lg font-medium mb-4">{t("apiDocs.libraries")}</h3>
          <ul className="list-none p-0 flex flex-col space-y-2.5">
            {sdkLanguages.map((sdk) => {
              const [id, name] = sdk.split(":");
              return (
                <li key={id}>
                  <a href={`https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-${id}/README.md`} target="_blank" className="text-[#1e90ff] no-underline hover:underline">
                    [{name} Library]
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <h2 className="text-white">{t("apiDocs.title")}</h2>
        <div className="text-base text-[#cccccc]">
          {t("apiDocs.intro")}
          <br />
          <br />
          <div>
            <FontAwesomeIcon icon={faUsers} className="text-[#808080] ml-[5px]" /> {t("apiDocs.requiresAuth")}
            <br />
            <br />
            <strong>{t("apiDocs.precisions")}</strong>
            <br />
            <br />
            {t("apiDocs.iconHash")}
            <br />
            {t("apiDocs.bannerHash")}
            <br />
            {t("apiDocs.splashHash")}
            <br />
            {t("apiDocs.hashes")}
          </div>
        </div>

        <div className="text-white p-4 bg-[#2c2c2c] rounded-lg mt-4">
          {loading ? (
            <div className="flex items-center">
              <div className="loader w-6 h-6 border-4 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin"></div>
              <span className="ml-[10px]">{t("apiDocs.loading")}</span>
            </div>
          ) : searchTerm && filteredDocs.length === 0 && !loading ? (
            <div className="text-white">{t("apiDocs.noResults", { searchTerm })}</div>
          ) : (
            // Original category-based display
            displayedCategories.map((cat) => (
              <div key={cat} className="mb-8">
                <h3 className="text-[#1e90ff] border-b border-[#444] pb-1">{cat}</h3>
                {getDocsForCategory(cat)?.map((endpointGroup) => {
                  const doc = endpointGroup[0];
                  return (
                    <div className="mb-6" key={doc.endpoint} id={doc.endpoint}>
                      <a href={`#${doc.endpoint}`} className="text-[#1e90ff] no-underline hover:underline">
                        {doc.endpoint}
                      </a>
                      <div className="mt-2">
                        <InfoSection title="apiDocs.responseType" content={doc.responseType} language="javascript" />
                        <InfoSection title="apiDocs.params" content={doc.params} language="javascript" />
                        <InfoSection title="apiDocs.query" content={doc.query} language="javascript" />
                        <InfoSection title="apiDocs.body" content={doc.body} language="javascript" />
                        <InfoSection title="apiDocs.example" content={doc.example} language="javascript" />
                        <InfoSection title="apiDocs.exampleResponse" content={doc.exampleResponse} language="json" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Version Mobile
function ApiDocsMobile() {
  const { t } = useTranslation("common");
  const { docs, categories, categoryList, loading } = useApiDocs();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = docs.filter((doc) => doc.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) || doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
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

  const sdkLanguages = ["ts-and-js:TypeScript/JavaScript", "python:Python", "java:Java", "cs:C#", "php:PHP", "ruby:Ruby", "rust:Rust", "go:Go", "cpp:C++"];

  return (
    <div className="block p-4 bg-[#3c3c3c] rounded-lg shadow-lg max-w-full text-[0.95rem] m-0">
      {/* Barre de recherche et catégories en haut */}
      <div className="mb-3">
        <input type="text" placeholder={t("apiDocs.searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-[85vw] p-2 rounded bg-[#444] border border-[#555] text-white text-base" />
      </div>
      <div>
        <h3 className="text-white mb-2 text-[1.1em]">{t("apiDocs.categories")}</h3>
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-[10px] py-1 rounded cursor-pointer mb-1 font-medium ${selectedCategory === null ? "bg-[#1e90ff]" : "bg-[#444]"} text-white`}
            onClick={() => {
              setSelectedCategory(null);
              setSearchTerm("");
            }}
          >
            {t("apiDocs.all")}
          </span>
          {categoryList.map((cat) => (
            <span
              key={cat}
              className={`px-[10px] py-1 rounded cursor-pointer mb-1 font-medium ${selectedCategory === cat ? "bg-[#1e90ff]" : "bg-[#444]"} text-white`}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchTerm("");
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
      <hr className="border-[#444] my-3" />
      {/* SDKs */}
      <div>
        <h3 className="text-white mb-2 text-[1.1em]">{t("apiDocs.libraries")}</h3>
        <ul className="list-none p-0 text-[0.98em] flex flex-wrap gap-1">
          {sdkLanguages.map((sdk) => {
            const [id, name] = sdk.split(":");
            return (
              <li key={id}>
                <a href={`https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-${id}/README.md`} target="_blank" className="text-[#1e90ff] no-underline hover:underline">
                  [{name} Library]
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mt-[18px]">
        <h2 className="text-white text-[1.2em]">{t("apiDocs.title")}</h2>
        <div className="text-[0.98em] text-[#cccccc]">
          {t("apiDocs.intro")}
          <br />
          <br />
          <div>
            <FontAwesomeIcon icon={faUsers} className="text-[#808080] ml-[5px]" /> {t("apiDocs.requiresAuth")}
            <br />
            <br />
            <strong>{t("apiDocs.precisions")}</strong>
            <br />
            <br />
            {t("apiDocs.iconHash")}
            <br />
            {t("apiDocs.bannerHash")}
            <br />
            {t("apiDocs.splashHash")}
            <br />
            {t("apiDocs.hashes")}
          </div>
        </div>
        <div className="text-white p-2 bg-[#2c2c2c] rounded-lg mt-3 text-[0.97em]">
          {loading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-4 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin"></div>
              <span className="ml-2">{t("apiDocs.loading")}</span>
            </div>
          ) : searchTerm ? (
            filteredDocs.map((doc) => <DocBlock key={doc.endpoint} doc={doc} />)
          ) : (
            displayedCategories.map((cat) => (
              <div key={cat} className="mb-[22px]">
                <h3 className="text-[#1e90ff] border-b border-[#444] pb-[2px] text-[1.05em]">{cat}</h3>
                {getDocsForCategory(cat)?.map((endpointGroup) => {
                  const doc = endpointGroup[0];
                  return <DocBlock key={doc.endpoint} doc={doc} />;
                })}
              </div>
            ))
          )}
          {searchTerm && filteredDocs.length === 0 && !loading && <div className="text-white">No results found for "{searchTerm}".</div>}
        </div>
      </div>
    </div>
  );
}

// Bloc d'affichage d'un endpoint (utilisé dans mobile et desktop)
function DocBlock({ doc }: { doc: any }) {
  const { t } = useTranslation("common");
  return (
    <div className="mb-[18px]" key={doc.endpoint} id={doc.endpoint}>
      <a href={`#${doc.endpoint}`} className="text-[#1e90ff] no-underline hover:underline">
        {doc.endpoint}
      </a>
      <div className="mt-2">
        <InfoSection title="apiDocs.responseType" content={doc.responseType} language="javascript" />
        <InfoSection title="apiDocs.params" content={doc.params} language="javascript" />
        <InfoSection title="apiDocs.query" content={doc.query} language="javascript" />
        <InfoSection title="apiDocs.body" content={doc.body} language="javascript" />
        <InfoSection title="apiDocs.example" content={doc.example} language="javascript" />
        <InfoSection title="apiDocs.exampleResponse" content={doc.exampleResponse} language="json" />
      </div>
    </div>
  );
}

function InfoSection({ title, content, language }: { title: string; content: any; language: string }) {
  const { t } = useTranslation("common");
  return (
    <>
      {content ? (
        <div className="mb-4">
          <h4 className="text-[#1e90ff] mb-2">{t(title)}:</h4>
          <div className="bg-[#1c1c1c] p-3 rounded overflow-x-auto">
            <Highlight className={language}>{typeof content === "string" ? content : JSON.stringify(content, null, 2)}</Highlight>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
