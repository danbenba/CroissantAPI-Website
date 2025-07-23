import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [show, setShow] = useState("");
  const [footerPosition, setFooterPosition] = useState<"relative" | "absolute">(
    "relative"
  );

  useEffect(() => {
    const checkFooterPosition = () => {
      if (document.body.scrollHeight <= window.innerHeight) {
        setFooterPosition("absolute");
      } else {
        setFooterPosition("relative");
      }

      requestAnimationFrame(checkFooterPosition);
    };

    checkFooterPosition();

    return () => {
      window.removeEventListener("resize", checkFooterPosition);
    };
  }, []);

  return (
    <footer
      style={{
        display: show,
        width: "100%",
        background: "#191b20",
        color: "#bdbdbd",
        fontSize: "0.92rem",
        textAlign: "center",
        padding: "1.4rem 0 1.2rem 0",
        borderTop: "1px solid #23242a",
        position: footerPosition,
        bottom: 0,
        left: 0,
      }}
    >
      <span style={{ marginRight: 8 }}>Copyright © 2025 Croissant API</span>
      <Link href="/tos" legacyBehavior>
        <a
          style={{
            color: "#8fa1c7",
            textDecoration: "none",
            margin: "0 0.5rem",
          }}
        >
          Terms
        </a>
      </Link>
      <span style={{ color: "#444" }}>|</span>
      <Link href="/privacy" legacyBehavior>
        <a
          style={{
            color: "#8fa1c7",
            textDecoration: "none",
            margin: "0 0.5rem",
          }}
        >
          Privacy
        </a>
      </Link>
    </footer>
  );
}
