import React, { useEffect, useState } from "react";
import Highlight from 'react-highlight'

const API_URL = "https://croissant-api.fr/api";

export default function ApiDocs() {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<Record<string, any[]>>({});
    const [categoryList, setCategoryList] = useState<string[]>([]);

    useEffect(() => {
        fetch(API_URL + "/describe")
            .then((res) => res.json())
            .then((data) => {
                setDocs(data);
                console.log("Fetched docs:", data); // <-- Add this line

                // Group docs by category after fetching
                const grouped = data.reduce((acc: Record<string, any[]>, doc: any) => {
                    const cat = doc.category || "Uncategorized";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(doc);
                    return acc;
                }, {});
                setCategories(grouped);
                setCategoryList(Object.keys(grouped));
                setLoading(false);
            })
            .catch(() => setLoading(false));
        document.title = "Api Docs | Croissant";
    }, []);

    return (
        <div
            className="container"
            style={{
                display: "flex",
                gap: "24px",
                padding: "20px",
                backgroundColor: "#3c3c3c",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                overflow: "auto",
                maxWidth: "100%",
            }}
        >
            {/* Sidebar */}
            <aside
                style={{
                    minWidth: "260px",
                    background: "#292929",
                    borderRadius: "8px",
                    padding: "16px",
                    height: "fit-content",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                }}
            >
                {/* Categories */}
                <div>
                    <h3 style={{ color: "#fff", marginBottom: "12px" }}>Categories</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        <li
                            style={{ marginBottom: "8px", cursor: "pointer", color: selectedCategory === null ? "#1e90ff" : "#fff" }}
                            onClick={() => setSelectedCategory(null)}
                        >
                            All
                        </li>
                        {categoryList.map((cat) => (
                            <li
                                key={cat}
                                style={{ marginBottom: "8px", cursor: "pointer", color: selectedCategory === cat ? "#1e90ff" : "#fff" }}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </li>
                        ))}
                    </ul>
                </div>
                <hr style={{ border: "1px solid #444", margin: "16px 0" }} />
                {/* SDKs */}
                <div>
                    <h3 style={{ color: "#fff", marginBottom: "12px" }}>Libraries/SDKs</h3>
                    <ul style={{
                        listStyleType: "none",
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}>
                        <li>
                            <a href="/downloadables/croissant-api.js" target="_blank" download style={{ color: "#1e90ff", textDecoration: "none" }}>
                                [NodeJs Library]
                            </a>
                        </li>
                        <li>
                            <a href="/downloadables/croissant-api.ts" target="_blank" download style={{ color: "#1e90ff", textDecoration: "none" }}>
                                [Typescript Library]
                            </a>
                        </li>
                        <li>
                            <a href="/downloadables/croissant_api.py" target="_blank" download style={{ color: "#1e90ff", textDecoration: "none" }}>
                                [Python Library]
                            </a>
                        </li>
                        <li>
                            <a href="/downloadables/croissant-api.java" target="_blank" download style={{ color: "#1e90ff", textDecoration: "none" }}>
                                [Java Library]
                            </a>
                        </li>
                        <li>
                            <a href="/downloadables/croissant-api.cs" target="_blank" download style={{ color: "#1e90ff", textDecoration: "none" }}>
                                [C# Library]
                            </a>
                        </li>
                    </ul>
                    <div style={{ marginTop: "12px" }}>
                        <h4 style={{ color: "#fff" }}>Examples</h4>
                        <ul style={{
                            listStyleType: "none",
                            padding: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                        }}>
                            <li>
                                <a href="/downloadables/example-lib.js" target="_blank" download style={{ color: "#1e90ff", textDecoration: "none" }}>
                                    [NodeJs example]
                                </a>
                            </li>
                            <li>
                                <a href="/downloadables/example-lib.ts" target="_blank" download style={{ color: "#1e90ff", textDecoration: "none" }}>
                                    [Typescript example]
                                </a>
                            </li>
                            <li>
                                <a href="/downloadables/example-lib.py" target="_blank" download style={{ color: "#1e90ff", textDecoration: "none" }}>
                                    [Python example]
                                </a>
                            </li>
                            <li>
                                <a href="/downloadables/example-lib.java" target="_blank" download style={{ color: "#1e90ff", textDecoration: "none" }}>
                                    [Java example]
                                </a>
                            </li>
                            <li>
                                <a href="/downloadables/example-lib.cs" target="_blank" download style={{ color: "#1e90ff", textDecoration: "none" }}>
                                    [C# example]
                                </a>
                            </li>
                        </ul>
                    </div>
                    <p style={{ color: "#cccccc", marginTop: "12px" }}>
                        See the <a href="/getting-started" style={{ color: "#1e90ff" }}>Getting Started</a> guide.
                    </p>
                </div>
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ color: "#ffffff" }}>API Documentation</h2>
                <p style={{ fontSize: "16px", color: "#cccccc" }}>
                    You will find the API documentation below.
                </p>
                <div className="content" style={{ color: "#ffffff" }}>
                    {loading ? (
                        <div className="loading-container" style={{ display: "flex", alignItems: "center" }}>
                            <div className="loader" style={{
                                border: "4px solid rgba(255, 255, 255, 0.3)",
                                borderTop: "4px solid #ffffff",
                                borderRadius: "50%",
                                width: "24px",
                                height: "24px",
                                animation: "spin 1s linear infinite",
                            }}></div>
                            <span style={{ marginLeft: "10px" }}>
                                Loading documentation...
                            </span>
                        </div>
                    ) : (
                        (selectedCategory ? [selectedCategory] : categoryList).map((cat) => (
                            <div key={cat} style={{ marginBottom: "32px" }}>
                                <h3 style={{ color: "#1e90ff", borderBottom: "1px solid #444", paddingBottom: "4px" }}>{cat}</h3>
                                {categories[cat]?.map((doc) => (
                                    <div className="api-doc" key={doc.endpoint} id={doc.endpoint} style={{ marginBottom: "24px" }}>
                                        <a href={`#${doc.endpoint}`} className="endpoint-link">
                                            <div className="endpoint-header">
                                                <span className={`method ${doc.method?.toLowerCase()}`}>{doc.method}</span>
                                                <h4 style={{ display: "inline-block", marginLeft: "8px" }}>/api{doc.endpoint}</h4>
                                            </div>
                                            <p className="description">{doc.description}</p>
                                        </a>
                                        <div className="endpoint-details">
                                            <InfoSection title="Response Type" content={doc.responseType} language="javascript" />
                                            <InfoSection title="Params Parameters" content={doc.params} language="javascript" />
                                            <InfoSection title="Query Parameters" content={doc.query} language="javascript" />
                                            <InfoSection title="Body Parameters" content={doc.body} language="javascript" />
                                            <InfoSection title="Example" content={doc.example} language="javascript" />
                                            <InfoSection title="Example Response" content={doc.exampleResponse} language="json" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
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
        <div className={`${title.toLowerCase().replace(" ", "-")}-info`}>
            <h4>{title}:</h4>
            <pre>
                <Highlight className={language}>
                    {content
                        ? typeof content === "string"
                            ? content
                            : JSON.stringify(content, null, 2)
                        : "None"}
                </Highlight>
            </pre>
        </div>
    );
}
