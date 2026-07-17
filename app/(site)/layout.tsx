import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MobileContactBar } from '@/components/mobile-contact-bar';
import { clinicSchema, websiteSchema } from '@/lib/schema';
import { getImage } from '@/lib/site-images-store';

/**
 * Chrome for the public site. It lives here rather than in the root layout so /admin doesn't
 * inherit it — the clinic's staff shouldn't be managing images underneath a "จองคิว LINE"
 * button, and the MedicalBusiness/WebSite JSON-LD describes the public site, not the CMS.
 *
 * A route group adds no path segment, so every URL is exactly what it was.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // MedicalBusiness.image is the clinic's hero — resolve it so replacing the photo updates the
  // structured data Google reads, not just the page.
  const heroPublicId = await getImage('hero-home');
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema(heroPublicId)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileContactBar />
    </>
  );
}
