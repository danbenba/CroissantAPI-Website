import React, { useState, ChangeEvent, KeyboardEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "next-i18next";

export default function Searchbar() {
  const [value, setValue] = useState("");
  const router = useRouter();
  const { t } = useTranslation("common");

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
      placeholder={t("searchbar.placeholder")}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}
