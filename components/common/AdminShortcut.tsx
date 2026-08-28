"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminShortcut() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut: Ctrl + Alt + D (or Cmd + Option + D on Mac)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.altKey &&
        (e.key === "d" || e.key === "D" || e.code === "KeyD")
      ) {
        e.preventDefault();
        router.push("/admin/requests");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
