import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV to JSON Converter Online — Fast, Private & Table Preview | desktools.run",
  description:
    "Convert CSV files or text to structured JSON data instantly in your browser. Supports custom delimiters, array/object output formats, and interactive table preview. 100% client-side with zero data uploads.",
  keywords: [
    "csv to json",
    "csv to json converter",
    "convert csv to json online",
    "csv parser",
    "excel to json",
    "CSV JSON 변환",
    "CSV 변환기",
    "CSV から JSON 変換",
    "convertidor csv a json",
    "CSV 转 JSON"
  ],
  alternates: {
    canonical: "https://desktools.run/tools/csv-to-json/",
  },
  openGraph: {
    url: "https://desktools.run/tools/csv-to-json/",
    title: "CSV to JSON Converter | desktools.run",
    description: "Convert CSV data to structured JSON with table preview and custom delimiter support.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "CSV to JSON Converter — desktools.run",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV to JSON Converter | desktools.run",
    description: "Convert CSV data to structured JSON with table preview and custom delimiter support.",
    images: ["/og-banner.jpg"],
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolJsonLd
        title="CSV to JSON Converter"
        description="Convert CSV files or raw text into structured JSON data with interactive table preview."
        toolUrl="https://desktools.run/tools/csv-to-json/"
      />
      {children}
    </>
  );
}
