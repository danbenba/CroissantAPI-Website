import { useEffect, useState } from "react";

export default function useIsMobile(breakpoint = 700) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.screen.width <= breakpoint);
    check();
    console.log("Checking mobile status:", window.screen.width ,isMobile);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}