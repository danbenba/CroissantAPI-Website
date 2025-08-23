import React, { useState, ChangeEvent, KeyboardEvent, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Searchbar() {
  const [value, setValue] = useState("");
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setValue(e.target.value);

  // Utilisation de useMemo pour éviter de redéfinir la fonction à chaque rendu
  const fromLauncher = useMemo(() => {
    if (typeof document !== "undefined" && document.cookie.includes("from=app"))
      return "&from=launcher";
    else return "";
  }, [
    typeof window !== "undefined" && window.location.pathname,
    typeof window !== "undefined" && window.location.search,
  ]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const query = encodeURIComponent(e.currentTarget.value);
      if (query) {
        router.push("/search?q=" + query + fromLauncher);
      }
    }
  };

  const inputStyle = {
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "8px",
    boxSizing: "border-box" as const,
    backgroundColor: "#2a2a2a",
    color: "#fff",
  };

  return (
    <input
      style={inputStyle}
      placeholder="Search for users and games..."
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}
