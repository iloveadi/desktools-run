"use client";

import { useEffect } from "react";

export default function AdSenseLoader() {
  useEffect(() => {
    let loaded = false;

    const loadScript = () => {
      if (loaded) return;
      loaded = true;

      // Ensure it's not injected twice
      if (document.querySelector('script[src*="adsbygoogle.js"]')) return;

      const script = document.createElement("script");
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3724667631368235";
      script.crossOrigin = "anonymous";
      script.async = true;
      document.head.appendChild(script);

      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("scroll", loadScript);
      window.removeEventListener("mousemove", loadScript);
      window.removeEventListener("touchstart", loadScript);
      window.removeEventListener("keydown", loadScript);
    };

    // Trigger on first user interaction
    window.addEventListener("scroll", loadScript, { passive: true, once: true });
    window.addEventListener("mousemove", loadScript, { passive: true, once: true });
    window.addEventListener("touchstart", loadScript, { passive: true, once: true });
    window.addEventListener("keydown", loadScript, { passive: true, once: true });

    // Fallback: load after 2.5 seconds idle
    const timer = setTimeout(loadScript, 2500);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, []);

  return null;
}
