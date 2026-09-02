"use client";

import { useEffect } from "react";
import { incrementToolUsage } from "@/lib/stats";
import { recordRecentTool } from "@/lib/favorites";

export default function ToolUsageTracker({ toolId }: { toolId: string }) {
  useEffect(() => {
    if (toolId) {
      incrementToolUsage(toolId);
      recordRecentTool(toolId);
    }
  }, [toolId]);

  return null;
}
