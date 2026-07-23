import type { Metadata } from 'next';
import { serviceCategories } from '@/lib/services';
import { getAllPosts } from '@/lib/blog-store';
import {
  BlogEditor,
  type AdminPost,
  type CategoryOption,
} from '@/components/admin/blog-editor';
import { PageHeading } from '@/components/admin/ui';

export const metadata: Metadata = { title: 'บทความ' };

// The clinic's posts are per-request state, not build output.
export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const rows = await getAllPosts();
  const posts: AdminPost[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    body: row.body,
    author: row.author ?? '',
    coverImagePublicId: row.cover_image_public_id,
    published: row.published === 1,
    publishedAt: row.published_at,
    category: row.category,
  }));

  const categories: CategoryOption[] = serviceCategories.map((category) => ({
    slug: category.slug,
    title: category.title,
  }));

  const live = posts.filter((post) => post.published).length;

  return (
    <>
      <PageHeading
        eyebrow="Blog / Knowledge Hub"
        title="บทความ"
        description="เขียนบทความสาระความรู้เพื่อดึงผู้อ่านจาก Google — แสดงบนหน้า /blog เฉพาะบทความที่กดเผยแพร่แล้ว"
        stat={
          <span>
            ทั้งหมด {posts.length} · เผยแพร่ <span className="text-forest">{live}</span>
          </span>
        }
      />

      <BlogEditor posts={posts} categories={categories} />
    </>
  );
}
