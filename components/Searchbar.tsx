import React, { useState, ChangeEvent, KeyboardEvent, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Searchbar() {
  const [value, setValue] = useState("");
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setValue(e.target.value);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const query = encodeURIComponent(e.currentTarget.value);
      if (query) {
        router.push("/search?q=" + query);
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
