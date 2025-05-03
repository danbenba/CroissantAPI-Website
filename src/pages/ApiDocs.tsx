import React, { useEffect, useState } from "react";
import Highlight from 'react-highlight'

const API_URL = "/api";

export default function ApiDocs() {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(API_URL + "/describe")
            .then((res) => res.json())
            .then((data) => {
                setDocs(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
        document.title = "Api Docs | Croissant";
    }, []);

    return (
        <div
            className="container"
            style={{
                padding: "20px",
                backgroundColor: "#3c3c3c",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
        >
            <h2 style={{ color: "#ffffff" }}>Available Libraries/SDKs</h2>
            <div className="library-info" style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "16px", color: "#cccccc" }}>
                    Explore our libraries/SDKs for the Croissant Inventory System:
                </p>
                <ul
                    style={{
                        listStyleType: "none",
                        padding: 0,
                        display: "flex",
                        flexWrap: "wrap",
                        flexDirection: "row",
                        gap: "10px",
                    }}
                    className="indent"
                >
                    <li style={{ margin: "10px 0" }}>
                        <strong style={{ color: "#ffffff" }}>
                            <a
                                href="/downloadables/croissant-api.js"
                                target="_blank"
                                download
                                style={{ color: "#1e90ff", textDecoration: "none" }}
                            >
                                [NodeJs Library]
                            </a>
                        </strong>
                    </li>
                    <li style={{ margin: "10px 0" }}>
                        <strong style={{ color: "#ffffff" }}>
                            <a
                                href="/downloadables/croissant-api.ts"
                                target="_blank"
                                download
                                style={{ color: "#1e90ff", textDecoration: "none" }}
                            >
                                [Typescript Library]
                            </a>
                        </strong>
                    </li>
                    <li style={{ margin: "10px 0" }}>
                        <strong style={{ color: "#ffffff" }}>
                            <a
                                href="/downloadables/croissant_api.py"
                                target="_blank"
                                download
                                style={{ color: "#1e90ff", textDecoration: "none" }}
                            >
                                [Python Library]
                            </a>
                        </strong>
                    </li>
                    <li style={{ margin: "10px 0" }}>
                        <strong style={{ color: "#ffffff" }}>
                            <a
                                href="/downloadables/croissant-api.java"
                                target="_blank"
                                download
                                style={{ color: "#1e90ff", textDecoration: "none" }}
                            >
                                [Java Library]
                            </a>
                        </strong>
                    </li>
                </ul>
                <div>
                    <p style={{ fontSize: "16px", color: "#cccccc" }}>
                        Check out an example of how to use the library:
                    </p>
                    <ul
                        style={{
                            listStyleType: "none",
                            padding: 0,
                            display: "flex",
                            flexWrap: "wrap",
                            flexDirection: "row",
                            gap: "10px",
                        }}
                        className="indent"
                    >
                        <li style={{ margin: "10px 0" }}>
                            <strong style={{ color: "#ffffff" }}>
                                <a
                                    href="/downloadables/example-lib.js"
                                    target="_blank"
                                    download
                                    style={{ color: "#1e90ff", textDecoration: "none" }}
                                >
                                    [NodeJs example]
                                </a>
                            </strong>
                        </li>
                        <li style={{ margin: "10px 0" }}>
                            <strong style={{ color: "#ffffff" }}>
                                <a
                                    href="/downloadables/example-lib.ts"
                                    target="_blank"
                                    download
                                    style={{ color: "#1e90ff", textDecoration: "none" }}
                                >
                                    [Typescript example]
                                </a>
                            </strong>
                        </li>
                        <li style={{ margin: "10px 0" }}>
                            <strong style={{ color: "#ffffff" }}>
                                <a
                                    href="/downloadables/example-lib.py"
                                    target="_blank"
                                    download
                                    style={{ color: "#1e90ff", textDecoration: "none" }}
                                >
                                    [Python example]
                                </a>
                            </strong>
                        </li>
                        <li style={{ margin: "10px 0" }}>
                            <strong style={{ color: "#ffffff" }}>
                                <a
                                    href="/downloadables/example-lib.java"
                                    target="_blank"
                                    download
                                    style={{ color: "#1e90ff", textDecoration: "none" }}
                                >
                                    [Java example]
                                </a>
                            </strong>
                        </li>
                    </ul>
                </div>
                <p>
                    You can also find a getting started guide in the{" "}
                    <a href="/getting-started">Getting Started</a> section.
                </p>
            </div>

            <h2 style={{ color: "#ffffff" }}>API Documentation</h2>
            <p style={{ fontSize: "16px", color: "#cccccc" }}>
                You will find the API documentation below.
            </p>
            <div className="content" style={{ color: "#ffffff" }}>
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
                ) : (
                    docs.map((doc) => (
                        <div className="api-doc" key={doc.endpoint} id={doc.endpoint}>
                            <a href={`#${doc.endpoint}`} className="endpoint-link">
                                <div className="endpoint-header">
                                    <span className={`method ${doc.method?.toLowerCase()}`}>{doc.method}</span>
                                    <h3>/api{doc.endpoint}</h3>
                                </div>
                                <p className="description">{doc.description}</p>
                            </a>
                            <div className="endpoint-details">
                                <InfoSection title="Response Type" content={doc.responseType} language="javascript" />
                                <InfoSection title="Query Parameters" content={doc.query} language="javascript" />
                                <InfoSection title="Body Parameters" content={doc.body} language="javascript" />
                                <InfoSection title="Example" content={doc.example} language="javascript" />
                                <InfoSection title="Example Response" content={doc.exampleResponse} language="json" />
                            </div>
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
