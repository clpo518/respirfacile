import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

export default function PageViewTracker() {
  const { pathname } = useLocation();
  const lastPath = useRef("");

  useEffect(() => {
    if (pathname !== lastPath.current) {
      lastPath.current = pathname;
      trackPageView(pathname);
    }
  }, [pathname]);

  return null;
}
