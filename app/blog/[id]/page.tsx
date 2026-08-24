import { BLOG_POSTS } from "@/lib/blog";
import BlogDetailClient from "./BlogDetailClient";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    id: post.id,
  }));
}

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = BLOG_POSTS.find((p) => p.id === id) || BLOG_POSTS[0];

  return <BlogDetailClient post={post} />;
}
