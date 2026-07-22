const fs = require('fs');
const crypto = require('crypto');

const markdownPath = '/Users/bank/.gemini/antigravity/brain/531257e4-13e4-4e64-9aeb-4dfb1dd8f341/kazumi_clinic_articles.md';
const content = fs.readFileSync(markdownPath, 'utf-8');

// Use regex to match sections starting with '### '
const articleRegex = /###\s+(\d+\.\s+)(.*?)\n([\s\S]*?)(?=(###\s+\d+\.|$|---|\n##\s))/g;

let match;
const posts = [];
let count = 0;

while ((match = articleRegex.exec(content)) !== null) {
  if (count >= 20) break;
  const title = match[2].trim();
  const body = match[3].trim();
  const excerpt = body.substring(0, 150) + (body.length > 150 ? '...' : '');
  
  // create slug from title (remove thai chars might make it empty, so let's use article number + short ascii)
  count++;
  const slug = `article-${count}-${crypto.randomBytes(4).toString('hex')}`;
  const id = crypto.randomUUID();
  const now = Date.now();
  const author = 'Kazumi Clinic Team';
  
  posts.push({
    id,
    slug,
    title,
    excerpt,
    body,
    author,
    published: 1,
    published_at: now,
    updated_at: now,
    updated_by: 'seed-script'
  });
}

// Generate SQL
let sql = '';
for (const p of posts) {
  // escape single quotes
  const safeTitle = p.title.replace(/'/g, "''");
  const safeExcerpt = p.excerpt.replace(/'/g, "''");
  const safeBody = p.body.replace(/'/g, "''");
  const safeAuthor = p.author.replace(/'/g, "''");
  
  sql += `INSERT INTO posts (id, slug, title, excerpt, body, author, published, published_at, updated_at, updated_by) VALUES ('${p.id}', '${p.slug}', '${safeTitle}', '${safeExcerpt}', '${safeBody}', '${safeAuthor}', ${p.published}, ${p.published_at}, ${p.updated_at}, '${p.updated_by}');\n`;
}

fs.writeFileSync('/Users/bank/Desktop/kazami clinic/seed-blogs.sql', sql);
console.log(`Generated SQL for ${posts.length} articles.`);
