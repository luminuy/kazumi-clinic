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
  // One cached D1 read resolves all three slots. Keeping these in the public layout makes the
  // admin-controlled logo and business schema consistent on every public route.
  const [brandMark, brandLogo, heroImage] = await Promise.all([
    getImage('brand-mark'),
    getImage('brand-logo'),
    getImage('hero-home'),
  ]);
  const businessSchema = clinicSchema({
    imagePublicId: heroImage,
    logoPublicId: brandLogo,
  });

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Header logoMark={brandMark} />
      <main>{children}</main>
      <Footer logoMark={brandMark} />
      <MobileContactBar />
    </>
  );
}
