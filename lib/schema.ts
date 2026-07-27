// JSON-LD builders. `clinicSchema` is injected once in the root layout with @id
// `${site.url}/#business` — every other page must reference it via that @id instead of
// repeating the MedicalBusiness block (see CLAUDE.md §3.1).
import { localizedAlternates, site } from './site';
import { ServiceCategory, serviceCategories } from './services';
import { doctor } from './doctor';
import { cld } from './cloud';

const dayMap: Record<string, string> = {
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
  Saturday: 'Saturday',
  Sunday: 'Sunday',
};

export function clinicSchema({
  // No fallback image: the slot that feeds this is admin-managed and may legitimately be empty,
  // and `image` is dropped below rather than pointing Google at an asset that isn't there.
  imagePublicId = '',
  logoPublicId = site.logo,
  locale = 'th',
}: {
  imagePublicId?: string;
  logoPublicId?: string;
  locale?: string;
} = {}) {
  const isEnglish = locale === 'en';

  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'HealthAndBeautyBusiness'],
    '@id': `${site.url}/#business`,
    name: site.name,
    alternateName: site.nameTh,
    description: isEnglish ? site.descriptionEn : site.description,
    url: site.url,
    telephone: site.phoneIntl,
    priceRange: '$$',
    // Aesthetic dermatology — the specialty Google maps the entity to for health/beauty queries.
    medicalSpecialty: 'Dermatology',
    ...(imagePublicId && { image: cld(imagePublicId, { width: 1200, height: 630, crop: 'fill' }) }),
    ...(logoPublicId && { logo: cld(logoPublicId, { width: 512, height: 512, crop: 'fit' }) }),
    hasMap: site.mapsUrl,
    areaServed: {
      '@type': 'Place',
      name: 'สุขุมวิท เขตวัฒนา กรุงเทพมหานคร',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.line1} ${site.address.street}`,
      addressLocality: site.address.district,
      addressRegion: site.address.province,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    openingHoursSpecification: site.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: dayMap[h.day],
      opens: h.open,
      closes: h.close,
    })),
    // The clinic's licensed physicians — `identifier` carries the แพทยสภา ว. number, which is
    // the credential a search engine (or a patient) can actually verify us on.
    employee: site.doctors.map((doctor) => ({
      '@type': 'Physician',
      name: doctor.name,
      jobTitle: isEnglish ? doctor.roleEn : doctor.role,
      identifier: doctor.licenseNo,
    })),
    // The service range as procedures the clinic offers, linking the business entity to each
    // category page. Driven by lib/services.ts, so it stays in sync as categories change.
    availableService: serviceCategories.map((category) => ({
      '@type': 'MedicalProcedure',
      name: category.title,
      url: `${site.url}/${category.slug}`,
    })),
    sameAs: [site.facebook, site.instagram, site.lineUrl].filter(Boolean),
  };
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${site.url}/#website`,
  name: site.name,
  url: site.url,
  inLanguage: 'th-TH',
  publisher: { '@id': `${site.url}/#business` },
};

export function homePageSchema(imagePublicId: string = '', locale: string = 'th') {
  const isEnglish = locale === 'en';
  const pageUrl = localizedAlternates(locale).canonical;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    name: isEnglish
      ? `${site.name} — Aesthetic Clinic in Sukhumvit, Bangkok`
      : `${site.name} — คลินิกความงามสุขุมวิท กรุงเทพฯ`,
    url: pageUrl,
    description: isEnglish ? site.descriptionEn : site.description,
    inLanguage: isEnglish ? 'en' : 'th-TH',
    isPartOf: { '@id': `${site.url}/#website` },
    about: { '@id': `${site.url}/#business` },
    // Omitted rather than faked when the home hero slot is empty — an ImageObject whose url 404s
    // is a structured-data error, while a missing optional property is not.
    ...(imagePublicId && {
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: cld(imagePublicId, { width: 1200, height: 630, crop: 'fill' }),
        width: 1200,
        height: 630,
      },
    }),
  };
}

// Fields doctorSchema reads — both lib/doctor.ts profiles satisfy this. `nameTh`/image are
// optional so a doctor without a Thai name or an uploaded photo still produces valid Person JSON-LD.
type DoctorForSchema = {
  name: string;
  givenName: string;
  familyName: string;
  role: string;
  roleEn: string;
  nameTh?: string;
  licenseNo: string;
  education: readonly { degree: string; institution: string }[];
  languages: readonly string[];
  languagesEn: readonly string[];
};

export function doctorSchema(
  doc: DoctorForSchema = doctor,
  imagePublicId?: string,
  locale: string = 'th',
) {
  const isEnglish = locale === 'en';

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: doc.name,
    givenName: doc.givenName,
    familyName: doc.familyName,
    jobTitle: isEnglish ? doc.roleEn : doc.role,
    ...(doc.nameTh && { alternateName: doc.nameTh }),
    identifier: doc.licenseNo,
    ...(imagePublicId && { image: cld(imagePublicId, { width: 800, crop: 'fit' }) }),
    worksFor: { '@id': `${site.url}/#business` },
    alumniOf: doc.education.map((item) => ({
      '@type': 'EducationalOrganization',
      name: item.institution,
    })),
    knowsLanguage: isEnglish ? doc.languagesEn : doc.languages,
    url: localizedAlternates(locale, '/about').canonical,
  };
}

export function serviceItemListSchema(category: ServiceCategory) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.title} — ${site.name}`,
    url: `${site.url}/${category.slug}`,
    itemListElement: category.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'MedicalProcedure',
        name: `${item.name}${item.detail ? ` (${item.detail})` : ''}`,
        provider: { '@id': `${site.url}/#business` },
        // Only emit an Offer when there's a real price — a fabricated/zero price is worse than none.
        ...(item.priceFrom !== undefined && {
          offers: {
            '@type': 'Offer',
            price: item.priceFrom,
            priceCurrency: 'THB',
            url: `${site.url}/${category.slug}`,
          },
        }),
      },
    })),
  };
}

// ItemList for the /services hub — lists the service categories themselves (not procedures).
export function serviceCategoryListSchema(categories: ServiceCategory[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `บริการทั้งหมด — ${site.name}`,
    url: `${site.url}/services`,
    itemListElement: categories.map((category, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: category.title,
      url: `${site.url}/${category.slug}`,
    })),
  };
}

// BlogPosting for a single /blog/[slug] article. Dates are ISO strings; image is a delivered
// Cloudinary URL when the post has a cover. `author` falls back to the clinic entity when the post
// names no writer, and `publisher` always refs the MedicalBusiness @id rather than repeating it.
export function blogPostingSchema(post: {
  title: string;
  excerpt?: string;
  slug: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  imagePublicId?: string;
}) {
  const url = `${site.url}/blog/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    ...(post.excerpt && { description: post.excerpt }),
    ...(post.imagePublicId && {
      image: cld(post.imagePublicId, { width: 1200, height: 630, crop: 'fill' }),
    }),
    ...(post.datePublished && { datePublished: post.datePublished }),
    ...(post.dateModified && { dateModified: post.dateModified }),
    author: post.author
      ? { '@type': 'Person', name: post.author }
      : { '@id': `${site.url}/#business` },
    publisher: { '@id': `${site.url}/#business` },
    mainEntityOfPage: url,
    url,
    inLanguage: 'th-TH',
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
