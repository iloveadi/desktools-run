import { TOOLS } from "@/lib/tools";
import DevToolClient from "@/components/common/DevToolClient";

export function generateStaticParams() {
  const devTools = TOOLS.filter((t) => t.isDev).map((t) => ({ id: t.id }));
  if (devTools.length === 0) {
    return [{ id: "coming-soon" }];
  }
  return devTools;
}

export default async function DevToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = TOOLS.find((t) => t.id === id);
  const title = tool?.title || id;

  return <DevToolClient title={title} />;
}
