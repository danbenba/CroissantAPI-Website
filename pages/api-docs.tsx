import React, { useEffect, useState } from "react";
import Highlight from "react-highlight";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

const API_URL = "/api";

// Memoized docs and grouped state (module-level, survives remounts)
let apiDocsCache: any[] | null = null;
let apiDocsGroupedCache: Record<string, any[]> | null = null;
let apiDocsCategoryListCache: string[] | null = null;

function useApiDocs() {
  const [docs, setDocs] = useState<any[]>(apiDocsCache || []);
  const [categories, setCategories] = useState<Record<string, any[]>>(
    apiDocsGroupedCache || {}
  );
  const [categoryList, setCategoryList] = useState<string[]>(
    apiDocsCategoryListCache || []
  );
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
          const grouped = data.reduce(
            (acc: Record<string, any[]>, doc: any) => {
              const cat = doc.category || "Uncategorized";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(doc);
              return acc;
            },
            {}
          );
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
  const { docs, categories, categoryList, loading } = useApiDocs();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);

  useEffect(() => {
    // Filter docs based on searchTerm
    if (searchTerm) {
      const filtered = docs.filter(
        (doc) =>
          doc.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDocs(filtered);
    } else {
      setFilteredDocs([]); // Clear filtered docs when search term is empty
    }
  }, [searchTerm, docs]);

  const displayedCategories = searchTerm
    ? []
    : selectedCategory
    ? [selectedCategory]
    : categoryList;

  const getDocsForCategory = (cat: string) => {
    if (searchTerm) {
      return filteredDocs;
    }
    return categories[cat] || [];
  };

  return (
    <div
      className="container api-docs-container"
      style={{
        display: "flex",
        gap: "24px",
        padding: "20px",
        backgroundColor: "#3c3c3c",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        overflow: "auto",
        maxWidth: "100%",
        zoom: 0.7,
      }}
    >
      {/* Sidebar */}
      <aside
        className="api-docs-sidebar"
        style={{
          // maxWidth: "300px",
          background: "rgb(41, 41, 41)",
          borderRadius: "8px",
          padding: "16px",
          height: "fit-content",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          // gap: "24px",
          width: "90%",
          position: "-webkit-sticky" /* Safari */,
          // position: "sticky",
          top: "20px",
        }}
      >
        {/* Search Input */}
        <div>
          <input
            type="text"
            placeholder="Search endpoints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "95%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #555",
              background: "#444",
              color: "#fff",
            }}
          />
        </div>
        {/* Categories */}
        <div>
          <h3 style={{ color: "#fff", marginBottom: "12px" }}>Categories</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li
              style={{
                marginBottom: "8px",
                cursor: "pointer",
                color: selectedCategory === null ? "#1e90ff" : "#fff",
              }}
              onClick={() => {
                setSelectedCategory(null);
                setSearchTerm(""); // Clear search when "All" is clicked
              }}
            >
              All
            </li>
            {categoryList.map((cat) => (
              <li
                key={cat}
                style={{
                  marginBottom: "8px",
                  cursor: "pointer",
                  color: selectedCategory === cat ? "#1e90ff" : "#fff",
                }}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchTerm(""); // Clear search when a category is clicked
                }}
              >
                {cat}
                <ul
                  style={{
                    listStyle: "none",
                    paddingLeft: "20px",
                    paddingTop: "14px",
                  }}
                >
                  {categories[cat]?.map((endpointGroup, index) => {
                    const doc = endpointGroup[0]; // Assuming all docs in the group have the same endpoint
                    return (
                      <li
                        key={index}
                        style={{
                          marginBottom: "6px",
                          cursor: "pointer",
                          color: selectedCategory === cat ? "#fff" : "#fff",
                        }}
                      >
                        <span className={"method " + doc.method.toLowerCase()}>
                          {doc.method}
                        </span>{" "}
                        {doc.endpoint}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <hr style={{ border: "1px solid #444", margin: "16px 0" }} />
        {/* SDKs */}
        <div>
          <h3 style={{ color: "#fff", marginBottom: "12px" }}>
            Libraries/SDKs
          </h3>
          <ul
            style={{
              listStyleType: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <li>
              <a
                href="https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-ts-and-js/README.md"
                target="_blank"
                style={{ color: "#1e90ff", textDecoration: "none" }}
              >
                [TypeScript/JavaScript Library]
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-python/README.md"
                target="_blank"
                style={{ color: "#1e90ff", textDecoration: "none" }}
              >
                [Python Library]
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-java/README.md"
                target="_blank"
                style={{ color: "#1e90ff", textDecoration: "none" }}
              >
                [Java Library]
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-cs/README.md"
                target="_blank"
                style={{ color: "#1e90ff", textDecoration: "none" }}
              >
                [C# Library]
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-php/README.md"
                target="_blank"
                style={{ color: "#1e90ff", textDecoration: "none" }}
              >
                [PHP Library]
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-ruby/README.md"
                target="_blank"
                style={{ color: "#1e90ff", textDecoration: "none" }}
              >
                [Ruby Library]
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-rust/README.md"
                target="_blank"
                style={{ color: "#1e90ff", textDecoration: "none" }}
              >
                [Rust Library]
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-go/README.md"
                target="_blank"
                style={{ color: "#1e90ff", textDecoration: "none" }}
              >
                [Go Library]
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-cpp/README.md"
                target="_blank"
                style={{ color: "#1e90ff", textDecoration: "none" }}
              >
                [C++ Library]
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ color: "#ffffff" }}>API Documentation</h2>
        <div style={{ fontSize: "16px", color: "#cccccc" }}>
          You will find the API documentation below.
          <br />
          <br />
          <div>
            <FontAwesomeIcon
              icon={faUsers}
              style={{ color: "#808080", marginLeft: "5px" }}
            />{" "}
            Requires authentication via headers Authorization: "Bearer [token]"
            (use <code>/api-key</code> command on Discord to generate your API
            key)
            <br />
            <br />
            <strong>Precisions:</strong>
            <br />
            <br />- <code>iconHash</code> is linked to <code>/games-icons</code>{" "}
            and <code>/items-icons</code>.<br />- <code>bannerHash</code> is
            linked to <code>/banners-icons</code>.<br />-{" "}
            <code>splashHash</code> is now deprecated and will be removed in the
            future.
            <br />- Both hashes can be used to construct URLs for fetching the
            respective assets icons.
          </div>
        </div>
        <div
          className="api-docs-main"
          style={{
            color: "#ffffff",
            padding: "16px",
            background: "#2c2c2c",
            borderRadius: "8px",
            marginTop: "16px",
          }}
        >
          {loading ? (
            <div
              className="loading-container"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                className="loader"
                style={{
                  border: "4px solid rgba(255, 255, 255, 0.3)",
                  borderTop: "4px solid #ffffff",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              <span style={{ marginLeft: "10px" }}>
                Loading documentation...
              </span>
            </div>
          ) : searchTerm ? (
            // Display filtered results directly
            filteredDocs.map((doc) => (
              <div
                className="api-doc"
                key={doc.endpoint}
                id={doc.endpoint}
                style={{ marginBottom: "24px" }}
              >
                <a href={`#${doc.endpoint}`} className="endpoint-link">
                  <div className="endpoint-header">
                    <span className={`method ${doc.method?.toLowerCase()}`}>
                      {doc.method}
                    </span>
                    <h4 style={{ display: "inline-block", marginLeft: "8px" }}>
                      /api{doc.endpoint}
                      {doc.requiresAuth == true ? (
                        <FontAwesomeIcon
                          icon={faUsers}
                          style={{ color: "#808080", marginLeft: "5px" }}
                        />
                      ) : (
                        ""
                      )}
                    </h4>
                  </div>
                  <p className="description">{doc.description}</p>
                </a>
                <div className="endpoint-details">
                  <InfoSection
                    title="Response Type"
                    content={doc.responseType}
                    language="javascript"
                  />
                  <InfoSection
                    title="Params Parameters"
                    content={doc.params}
                    language="javascript"
                  />
                  <InfoSection
                    title="Query Parameters"
                    content={doc.query}
                    language="javascript"
                  />
                  <InfoSection
                    title="Body Parameters"
                    content={doc.body}
                    language="javascript"
                  />
                  <InfoSection
                    title="Example"
                    content={doc.example}
                    language="javascript"
                  />
                  <InfoSection
                    title="Example Response"
                    content={doc.exampleResponse}
                    language="json"
                  />
                </div>
              </div>
            ))
          ) : (
            // Original category-based display
            displayedCategories.map((cat) => (
              <div key={cat} style={{ marginBottom: "32px" }}>
                <h3
                  style={{
                    color: "#1e90ff",
                    borderBottom: "1px solid #444",
                    paddingBottom: "4px",
                  }}
                >
                  {cat}
                </h3>
                {getDocsForCategory(cat)?.map((endpointGroup) => {
                  const doc = endpointGroup[0];
                  return (
                    <div
                      className="api-doc"
                      key={doc.endpoint}
                      id={doc.endpoint}
                      style={{ marginBottom: "24px" }}
                    >
                      <a href={`#${doc.endpoint}`} className="endpoint-link">
                        <div className="endpoint-header">
                          <span
                            className={`method ${doc.method?.toLowerCase()}`}
                          >
                            {doc.method}
                          </span>
                          <h4
                            style={{
                              display: "inline-block",
                              marginLeft: "8px",
                            }}
                          >
                            /api{doc.endpoint}
                            {doc.requiresAuth == true ? (
                              <FontAwesomeIcon
                                icon={faUsers}
                                style={{ color: "#808080", marginLeft: "5px" }}
                              />
                            ) : (
                              ""
                            )}
                          </h4>
                        </div>
                        <p className="description">{doc.description}</p>
                      </a>
                      <div className="endpoint-details">
                        <InfoSection
                          title="Response Type"
                          content={doc.responseType}
                          language="javascript"
                        />
                        <InfoSection
                          title="Params Parameters"
                          content={doc.params}
                          language="javascript"
                        />
                        <InfoSection
                          title="Query Parameters"
                          content={doc.query}
                          language="javascript"
                        />
                        <InfoSection
                          title="Body Parameters"
                          content={doc.body}
                          language="javascript"
                        />
                        <InfoSection
                          title="Example"
                          content={doc.example}
                          language="javascript"
                        />
                        <InfoSection
                          title="Example Response"
                          content={doc.exampleResponse}
                          language="json"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          {searchTerm && filteredDocs.length === 0 && !loading && (
            <div style={{ color: "#fff" }}>
              No results found for "{searchTerm}".
            </div>
          )}
        </div>
        <style>
          {`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
         `}
        </style>
      </div>
    </div>
  );
}

function InfoSection({
  title,
  content,
  language,
}: {
  title: string;
  content: any;
  language: string;
}) {
  return (
    <>
      {content ? (
        <div className={`${title.toLowerCase().replace(" ", "-")}-info`}>
          <h4>{title}:</h4>
          <pre>
            <Highlight className={language}>
              {typeof content === "string"
                ? content
                : JSON.stringify(content, null, 2)}
            </Highlight>
          </pre>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
