// JSON-LD builders. `clinicSchema` is injected once in the root layout with @id
// `${site.url}/#business` — every other page must reference it via that @id instead of
// repeating the MedicalBusiness block (see CLAUDE.md §3.1).
import { site } from './site';
import { ServiceCategory } from './services';
import { doctor } from './doctor';
import { cld, cloudAssets } from './cloud';

const dayMap: Record<string, string> = {
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
  Saturday: 'Saturday',
  Sunday: 'Sunday',
};

export const clinicSchema = {
  '@context': 'https://schema.org',
  '@type': ['MedicalBusiness', 'HealthAndBeautyBusiness'],
  '@id': `${site.url}/#business`,
  name: site.name,
  alternateName: site.nameTh,
  description: site.description,
  url: site.url,
  telephone: site.phoneIntl,
  priceRange: '$$',
  image: cld(cloudAssets.heroHome, { width: 1200, height: 630, crop: 'fill' }),
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
  sameAs: [site.facebook, site.instagram, site.lineUrl].filter(Boolean),
};

export const doctorSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: doctor.name,
  givenName: doctor.givenName,
  familyName: doctor.familyName,
  jobTitle: doctor.role,
  image: `${site.url}${doctor.image}`,
  worksFor: { '@id': `${site.url}/#business` },
  alumniOf: doctor.education.map((item) => ({
    '@type': 'EducationalOrganization',
    name: item.institution,
  })),
  knowsLanguage: doctor.languages,
  url: `${site.url}/about`,
};

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
