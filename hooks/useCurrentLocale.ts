import { useRouter } from "next/router";
import { useEffect } from "react";

export function useCurrentLocale() {
  const router = useRouter();
  const locale = router.locale || "en";

  // Optionnel : mémoriser la langue dans un cookie
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    }
  }, [locale]);

  return locale;
}