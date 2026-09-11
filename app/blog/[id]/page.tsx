import type { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import BlogDetailClient from "./BlogDetailClient";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = BLOG_POSTS.find((p) => p.id === id);
  if (!post) {
    return {
      title: "Article Not Found | desktools.run",
    };
  }

  const title = `${post.titleKo || post.titleEn} — desktools.run 기술 블로그`;
  const description = post.snippetKo || post.snippetEn;
  const url = `https://desktools.run/blog/${post.id}/`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "desktools.run",
    images: [
      {
        url: "/og-global.jpg",
        width: 1376,
        height: 768,
        alt: "desktools.run — Fast & Free Web Utilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-global.jpg"],
  },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = BLOG_POSTS.find((p) => p.id === id) || BLOG_POSTS[0];
  const url = `https://desktools.run/blog/${post.id}/`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.titleKo || post.titleEn,
    description: post.snippetKo || post.snippetEn,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    publisher: {
      "@type": "Organization",
      name: "desktools.run",
      url: "https://desktools.run/",
      logo: {
        "@type": "ImageObject",
        url: "https://desktools.run/icon-512.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      <BlogDetailClient post={post} />
    </>
  );
}
