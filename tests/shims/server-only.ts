// Stand-in for the real `server-only` package under vitest.
//
// `import 'server-only'` in lib/{cloudinary-upload,google-reviews,members/password-reset}.ts is a
// guard against those modules ending up in a client bundle. Next.js's own bundler recognizes the
// specifier and no-ops it at build time; the real npm package instead throws unconditionally
// ("This module cannot be imported from a Client Component module") whenever something other than
// Next's bundler resolves it — which is exactly what vitest's plain Node/Vite resolution does.
//
// vitest.config.ts aliases `server-only` to this empty file so those modules stay importable in
// tests. It intentionally has no exports: the real package doesn't either — it's imported purely
// for its side effect (or, here, the deliberate lack of one).
export {};
