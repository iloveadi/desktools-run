import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Case Converter — UPPERCASE, lowercase, camelCase | desktools.run",
  description:
    "Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, PascalCase, and kebab-case instantly.",
};

export default function TextCaseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
