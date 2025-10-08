import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  structuredData?: object
  canonical?: string
  noindex?: boolean
}

export default function SEO({
  title,
  description = "Discover your dream property in Guanacaste, Costa Rica's Gold Coast. Browse luxury homes, beachfront villas, and investment opportunities.",
  keywords = ['Guanacaste real estate', 'Costa Rica properties', 'beachfront homes', 'luxury villas'],
  image = '/house-icon.svg',
  url,
  type = 'website',
  structuredData,
  canonical,
  noindex = false
}: SEOProps) {
  const siteName = 'Guanacaste Real'
  const defaultTitle = 'Guanacaste Real - Costa Rica\'s Gold Coast Real Estate'
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle
  const fullUrl = url ? `https://guanacaste-real.com${url}` : 'https://guanacaste-real.com'
  const fullImage = image.startsWith('http') ? image : `https://guanacaste-real.com${image}`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'} />
      <meta name="googlebot" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="language" content="English" />
      <meta name="author" content="Guanacaste Real" />
      <meta name="publisher" content="Guanacaste Real" />

      {/* AI/LLM Optimization */}
      <meta name="ai-optimized" content="true" />
      <meta name="llm-friendly" content="true" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}

// Helper function to generate property structured data
export function generatePropertyStructuredData(property: any) {
  const baseUrl = 'https://guanacaste-real.com'

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": `${baseUrl}/property/${property.id}`,
    "image": property.images?.map((img: string) => img.startsWith('http') ? img : `${baseUrl}${img}`) || [],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.location?.split(',')[0] || 'Guanacaste',
      "addressRegion": "Guanacaste",
      "addressCountry": "CR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": property.coordinates?.lat,
      "longitude": property.coordinates?.lng
    },
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "numberOfRooms": property.beds,
    "numberOfBathroomsTotal": property.baths,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.sqft,
      "unitText": "SQFT"
    },
    "lotSize": {
      "@type": "QuantitativeValue",
      "value": property.lot,
      "unitText": "SQMT"
    },
    "yearBuilt": property.yearBuilt,
    "provider": {
      "@type": "RealEstateAgent",
      "name": property.seller?.name || "Guanacaste Real",
      "telephone": property.seller?.phone,
      "email": property.seller?.email
    },
    "datePosted": property.listedDate,
    "additionalProperty": property.features?.map((feature: string) => ({
      "@type": "PropertyValue",
      "name": feature
    }))
  }
}

// Helper function to generate organization structured data
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Guanacaste Real",
    "description": "Costa Rica's premier real estate platform for Guanacaste properties",
    "url": "https://guanacaste-real.com",
    "logo": "https://guanacaste-real.com/house-icon.svg",
    "sameAs": [
      "https://www.facebook.com/guanacastereal",
      "https://www.instagram.com/guanacastereal",
      "https://www.linkedin.com/company/guanacaste-real"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Guanacaste",
      "addressCountry": "CR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+506-1234-5678",
      "contactType": "customer service",
      "availableLanguage": ["English", "Spanish"]
    },
    "areaServed": {
      "@type": "Place",
      "name": "Guanacaste Province",
      "addressCountry": "CR"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Guanacaste Real Estate Listings",
      "itemListElement": [] // Will be populated dynamically
    }
  }
}

// Helper function to generate website structured data
export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Guanacaste Real",
    "description": "Discover your dream property in Guanacaste, Costa Rica's Gold Coast",
    "url": "https://guanacaste-real.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://guanacaste-real.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Guanacaste Real"
    }
  }
}

// Helper function to generate breadcrumb structured data
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string, url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `https://guanacaste-real.com${crumb.url}`
    }))
  }
}