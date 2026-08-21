"use client";

import { useEffect } from "react";
import { incrementToolUsage } from "@/lib/stats";

export default function ToolUsageTracker({ toolId }: { toolId: string }) {
  useEffect(() => {
    if (toolId) {
      incrementToolUsage(toolId);
    }
  }, [toolId]);

  return null;
}
