import { getJson } from 'serpapi';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { IStorePrice } from '../models/Product';
import { resolveBarcode } from './barcode.service';

// ---------------------------------------------------------------------------
// Types for SerpApi responses
// ---------------------------------------------------------------------------

interface SerpApiShoppingResult {
  title: string;
  link: string;
  product_link?: string;
  source: string;
  price?: string;
  extracted_price?: number;
  thumbnail?: string;
  rating?: number;
  reviews?: number;
  extensions?: string[];
  product_id?: string;
  // SerpApi sometimes returns these additional URL fields
  second_hand_condition?: string;
  snippet?: string;
}

interface SerpApiShoppingResponse {
  shopping_results?: SerpApiShoppingResult[];
  search_metadata?: { status: string; id: string };
  error?: string;
}

// Google Lens types removed — image search deprecated.

// ---------------------------------------------------------------------------
// Excluded low-quality marketplaces
// ---------------------------------------------------------------------------

const EXCLUDED_MARKETPLACES = [
  'aliexpress',
  'temu',
  'wish',
  'shein',
  'banggood',
  'dhgate',
  'gearbest',
  'joom',
  'vova',
  'lightinthebox',
];

// ---------------------------------------------------------------------------
// Marketplace detection maps
// ---------------------------------------------------------------------------

const FR_MARKETPLACE_MAP: Record<string, string> = {
  'amazon.fr': 'amazon_fr',
  'cdiscount.com': 'cdiscount',
  'fnac.com': 'fnac',
  'darty.com': 'darty',
  'boulanger.com': 'boulanger',
  'rakuten.com': 'rakuten_fr',
  'fr.shopping.rakuten.com': 'rakuten_fr',
  'leclerc.com': 'leclerc',
  'e.leclerc': 'leclerc',
  'carrefour.fr': 'carrefour',
  'ldlc.com': 'ldlc',
  'materiel.net': 'materiel_net',
  'grosbill.com': 'grosbill',
  'cybertek.fr': 'cybertek',
  'topachat.com': 'topachat',
  'inmac-wstore.com': 'inmac',
  'backmarket.fr': 'backmarket',
  'backmarket.com': 'backmarket',
  'ebay.fr': 'ebay',
  'rueducommerce.fr': 'rueducommerce',
  'conforama.fr': 'conforama',
  'but.fr': 'but',
  'auchan.fr': 'auchan',
  'intersport.fr': 'intersport',
  'decathlon.fr': 'decathlon',
  'leroymerlin.fr': 'leroymerlin',
  'cultura.com': 'cultura',
  'micromania.fr': 'micromania',
  'electrodepot.fr': 'electrodepot',
  'sephora.fr': 'sephora',
  'nocibe.fr': 'nocibe',
  'marionnaud.fr': 'marionnaud',
  'zalando.fr': 'zalando',
  'asos.com': 'asos',
};

const US_MARKETPLACE_MAP: Record<string, string> = {
  'amazon.com': 'amazon_com',
  'ebay.com': 'ebay',
  'walmart.com': 'walmart',
  'target.com': 'target',
  'bestbuy.com': 'bestbuy',
  'homedepot.com': 'homedepot',
  'newegg.com': 'newegg',
  'bhphotovideo.com': 'bhphoto',
  'adorama.com': 'adorama',
  'microcenter.com': 'microcenter',
  'costco.com': 'costco',
  'samsclub.com': 'samsclub',
  'backmarket.com': 'backmarket',
  'kohls.com': 'kohls',
  'macys.com': 'macys',
  'nordstrom.com': 'nordstrom',
  'jcpenney.com': 'jcpenney',
  'lowes.com': 'lowes',
  'wayfair.com': 'wayfair',
  'overstock.com': 'overstock',
  'dickssportinggoods.com': 'dickssporting',
  'rei.com': 'rei',
  'sephora.com': 'sephora',
  'ulta.com': 'ulta',
  'staples.com': 'staples',
  'officedepot.com': 'officedepot',
};

const SOURCE_NAME_MAP: Record<string, string> = {
  'Amazon.fr': 'amazon_fr',
  'Cdiscount': 'cdiscount',
  'Fnac': 'fnac',
  'Darty': 'darty',
  'Boulanger': 'boulanger',
  'Rakuten': 'rakuten_fr',
  'E.Leclerc': 'leclerc',
  'Carrefour': 'carrefour',
  'LDLC': 'ldlc',
  'LDLC.com': 'ldlc',
  'Materiel.net': 'materiel_net',
  'Rue du Commerce': 'rueducommerce',
  'Conforama': 'conforama',
  'BUT': 'but',
  'Auchan': 'auchan',
  'Decathlon': 'decathlon',
  'Leroy Merlin': 'leroymerlin',
  'Cultura': 'cultura',
  'Micromania': 'micromania',
  'Electro Dépôt': 'electrodepot',
  'Back Market': 'backmarket',
  'Sephora': 'sephora',
  'Nocibé': 'nocibe',
  'Marionnaud': 'marionnaud',
  'Zalando': 'zalando',
  'ASOS': 'asos',
  'Intersport': 'intersport',
  'Grosbill': 'grosbill',
  'Cybertek': 'cybertek',
  'TopAchat': 'topachat',
  'Amazon.com': 'amazon_com',
  'Amazon': 'amazon_com',
  'eBay': 'ebay',
  'Walmart': 'walmart',
  'Target': 'target',
  'Best Buy': 'bestbuy',
  'Home Depot': 'homedepot',
  'Newegg': 'newegg',
  'B&H Photo': 'bhphoto',
  'B&H Photo Video': 'bhphoto',
  'Costco': 'costco',
  'Adorama': 'adorama',
  'Micro Center': 'microcenter',
  "Sam's Club": 'samsclub',
  "Kohl's": 'kohls',
  "Macy's": 'macys',
  'Nordstrom': 'nordstrom',
  'JCPenney': 'jcpenney',
  "Lowe's": 'lowes',
  'Wayfair': 'wayfair',
  'Overstock': 'overstock',
  "Dick's Sporting Goods": 'dickssporting',
  'REI': 'rei',
  'Ulta': 'ulta',
  'Staples': 'staples',
  'Office Depot': 'officedepot',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function detectMarketplace(source: string, link: string): string {
  const fromSource = SOURCE_NAME_MAP[source];
  if (fromSource) return fromSource;

  const sourceLower = source.toLowerCase();
  for (const [name, key] of Object.entries(SOURCE_NAME_MAP)) {
    if (sourceLower.includes(name.toLowerCase())) {
      return key;
    }
  }

  try {
    const hostname = new URL(link).hostname.replace(/^www\./, '');

    const frMatch = FR_MARKETPLACE_MAP[hostname];
    if (frMatch) return frMatch;

    const usMatch = US_MARKETPLACE_MAP[hostname];
    if (usMatch) return usMatch;

    for (const [domain, key] of Object.entries({ ...FR_MARKETPLACE_MAP, ...US_MARKETPLACE_MAP })) {
      if (hostname.endsWith(domain)) {
        return key;
      }
    }
  } catch {
    // URL parsing failed
  }

  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function isExcludedMarketplace(source: string, link: string): boolean {
  const combined = `${source} ${link}`.toLowerCase();
  return EXCLUDED_MARKETPLACES.some((name) => combined.includes(name));
}

function parseCurrency(priceString: string | undefined, country: string): 'EUR' | 'USD' {
  if (priceString && priceString.includes('$')) return 'USD';
  if (priceString && priceString.includes('\u20AC')) return 'EUR';
  return country === 'FR' ? 'EUR' : 'USD';
}

/**
 * Extract a direct merchant URL from a Google redirect/tracking URL.
 *
 * SerpApi Google Shopping `link` fields often look like:
 *   https://www.google.com/url?q=https://www.amazon.fr/dp/B0x...&sa=...
 *   https://www.google.fr/aclk?sa=...&adurl=https://www.fnac.com/...
 *
 * We extract the actual merchant URL from the `q`, `adurl`, or `url` param.
 * If the URL is already a direct merchant link, we return it as-is.
 */
function extractDirectUrl(rawUrl: string): string {
  if (!rawUrl || !rawUrl.startsWith('http')) return '';

  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.replace(/^www\./, '');

    // If NOT a Google redirect — it's already a merchant URL
    if (!hostname.includes('google.')) {
      return rawUrl;
    }

    // Try to extract the real merchant URL from known Google redirect params
    const candidateParams = ['q', 'adurl', 'url', 'dest'];
    for (const param of candidateParams) {
      const value = parsed.searchParams.get(param);
      if (value && value.startsWith('http')) {
        return value;
      }
    }

    // Some Google URLs embed the target URL as a path segment (e.g. /aclk)
    // Check if there's a URL-encoded merchant URL in the full query string
    const fullQuery = parsed.search;
    const urlMatch = fullQuery.match(/(?:adurl|url|q|dest)=([^&]+)/);
    if (urlMatch) {
      const decoded = decodeURIComponent(urlMatch[1]);
      if (decoded.startsWith('http') && !decoded.includes('google.')) {
        return decoded;
      }
    }

    // Fallback: return the original (even though it's Google, it will redirect)
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

/**
 * Get the best available URL from a SerpApi shopping result.
 * Extracts direct merchant URLs from Google redirect wrappers.
 */
function getBestUrl(result: SerpApiShoppingResult): string {
  // Try result.link first (usually present)
  if (result.link) {
    const directFromLink = extractDirectUrl(result.link);
    if (directFromLink && !directFromLink.includes('google.')) {
      return directFromLink;
    }
  }

  // Try product_link (Google comparison page — may contain embedded merchant URL)
  if (result.product_link) {
    const directFromProduct = extractDirectUrl(result.product_link);
    if (directFromProduct && !directFromProduct.includes('google.')) {
      return directFromProduct;
    }
  }

  // Last resort: return original link (Google redirect, will still work via browser)
  // The Google redirect URL will at least work — the user's browser will follow it
  if (result.link && result.link.startsWith('http')) {
    return result.link;
  }
  if (result.product_link && result.product_link.startsWith('http')) {
    return result.product_link;
  }

  return '';
}

/**
 * Build a search URL on the merchant's own website as a last-resort fallback.
 * This is used when we have a store name but couldn't extract a direct product URL.
 */
function buildMerchantSearchUrl(storeName: string, productTitle: string): string {
  const query = encodeURIComponent(productTitle);
  const storeKey = storeName.toLowerCase();

  const searchUrls: Record<string, string> = {
    'amazon.fr': `https://www.amazon.fr/s?k=${query}`,
    'amazon.com': `https://www.amazon.com/s?k=${query}`,
    'cdiscount': `https://www.cdiscount.com/search/10/${query}.html`,
    'fnac': `https://www.fnac.com/SearchResult/ResultList.aspx?Search=${query}`,
    'darty': `https://www.darty.com/nav/recherche/${query}.html`,
    'boulanger': `https://www.boulanger.com/resultats?tr=${query}`,
    'walmart': `https://www.walmart.com/search?q=${query}`,
    'target': `https://www.target.com/s?searchTerm=${query}`,
    'bestbuy': `https://www.bestbuy.com/site/searchpage.jsp?st=${query}`,
    'best buy': `https://www.bestbuy.com/site/searchpage.jsp?st=${query}`,
    'ebay': `https://www.ebay.com/sch/i.html?_nkw=${query}`,
    'ebay.com': `https://www.ebay.com/sch/i.html?_nkw=${query}`,
    'ebay.fr': `https://www.ebay.fr/sch/i.html?_nkw=${query}`,
    'newegg': `https://www.newegg.com/p/pl?d=${query}`,
    'rakuten': `https://fr.shopping.rakuten.com/s/${query}`,
    'carrefour': `https://www.carrefour.fr/s?q=${query}`,
    'e.leclerc': `https://www.e.leclerc/recherche?q=${query}`,
    'leclerc': `https://www.e.leclerc/recherche?q=${query}`,
  };

  // Try exact match first
  if (searchUrls[storeKey]) return searchUrls[storeKey];

  // Try partial match
  for (const [key, url] of Object.entries(searchUrls)) {
    if (storeKey.includes(key) || key.includes(storeKey)) {
      return url;
    }
  }

  // Generic Google Shopping fallback for this specific store
  return `https://www.google.com/search?tbm=shop&q=${query}+site:${encodeURIComponent(storeName)}`;
}

function mapToStorePrice(result: SerpApiShoppingResult, country: string): IStorePrice | null {
  const price = result.extracted_price;
  if (price == null || price <= 0) return null;

  let url = getBestUrl(result);
  if (!url) {
    logger.warn({ source: result.source, title: result.title }, 'Skipping result — no URL');
    return null;
  }

  // If the resolved URL is still a Google URL, build a merchant search URL instead
  try {
    const urlHost = new URL(url).hostname;
    if (urlHost.includes('google.')) {
      const merchantUrl = buildMerchantSearchUrl(result.source, result.title);
      if (merchantUrl && !merchantUrl.includes('google.com/search')) {
        logger.info({
          store: result.source,
          originalUrl: url.substring(0, 60),
          merchantUrl: merchantUrl.substring(0, 80),
        }, 'Replaced Google URL with merchant search URL');
        url = merchantUrl;
      }
    }
  } catch {
    // URL parsing failed, keep original
  }

  const marketplace = detectMarketplace(result.source, url);

  logger.debug({
    store: result.source,
    resolvedUrl: url.substring(0, 100),
  }, 'mapToStorePrice final URL');

  return {
    marketplace,
    storeName: result.source,
    storeLogo: '',
    price,
    currency: parseCurrency(result.price, country),
    productUrl: url,
    inStock: true,
    lastChecked: new Date(),
    externalId: result.product_id,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search Google Shopping via SerpApi and return normalised store prices.
 */
export async function searchGoogleShopping(
  query: string,
  country: string = 'FR',
): Promise<{
  prices: IStorePrice[];
  rawTitle: string;
  rawThumbnail: string;
}> {
  const gl = country === 'FR' ? 'fr' : 'us';
  const hl = country === 'FR' ? 'fr' : 'en';

  logger.info({ query, gl, hl }, 'SerpApi Google Shopping search');

  try {
    const response = (await getJson({
      engine: 'google_shopping',
      q: query,
      gl,
      hl,
      api_key: env.SERPAPI_KEY,
      num: 20,
    })) as SerpApiShoppingResponse;

    if (response.error) {
      logger.error({ error: response.error }, 'SerpApi returned an error');
      throw new Error(`SerpApi error: ${response.error}`);
    }

    const rawResults = response.shopping_results ?? [];

    if (rawResults.length === 0) {
      logger.info({ query }, 'No shopping results found');
      return { prices: [], rawTitle: '', rawThumbnail: '' };
    }

    // Debug: log raw first result structure
    const r0 = rawResults[0];
    logger.info({
      firstLink: r0?.link?.substring(0, 100),
      firstProductLink: (r0 as any)?.product_link?.substring(0, 100),
      firstSource: r0?.source,
      rawKeys: Object.keys(r0),
      totalRaw: rawResults.length,
    }, 'SerpApi raw first result');

    const allPrices = rawResults
      .filter((r) => !isExcludedMarketplace(r.source, r.link || ''))
      .map((r) => mapToStorePrice(r, country))
      .filter((p): p is IStorePrice => p !== null);

    // Deduplicate: cheapest per marketplace
    const pricesByStore = new Map<string, IStorePrice>();
    for (const p of allPrices) {
      const existing = pricesByStore.get(p.marketplace);
      if (!existing || p.price < existing.price) {
        pricesByStore.set(p.marketplace, p);
      }
    }

    const prices = Array.from(pricesByStore.values())
      .sort((a, b) => a.price - b.price)
      .slice(0, 10);

    const rawTitle = rawResults[0]?.title ?? '';
    const rawThumbnail = rawResults[0]?.thumbnail ?? '';

    // Debug: log first processed price
    if (prices.length > 0) {
      logger.info({
        firstPriceUrl: prices[0].productUrl?.substring(0, 100),
        firstPriceStore: prices[0].storeName,
        count: prices.length,
      }, 'SerpApi processed prices');
    }

    return { prices, rawTitle, rawThumbnail };
  } catch (error) {
    logger.error({ error, query }, 'SerpApi Google Shopping request failed');
    throw error;
  }
}

/**
 * Search by barcode / EAN / UPC.
 *
 * Strategy (cost-optimised):
 *   1. Try FREE barcode APIs (UPCitemdb, Open Food Facts) → product name
 *   2. If free APIs fail, fall back to SerpApi Google Search (1 SerpApi credit)
 *   3. Search Google Shopping with the resolved name (1 SerpApi credit)
 *
 * Best case: 1 SerpApi credit (Shopping only).
 * Worst case: 2 SerpApi credits (Google Search + Shopping).
 */
export async function searchByBarcode(
  barcode: string,
  country: string = 'FR',
): Promise<{
  prices: IStorePrice[];
  rawTitle: string;
  rawThumbnail: string;
}> {
  logger.info({ barcode, country }, 'Barcode search');

  // ── Step 1: Try FREE barcode resolution ───────────────────────────
  try {
    const freeResult = await resolveBarcode(barcode);
    if (freeResult && freeResult.productName.length > 3) {
      logger.info({ barcode, productName: freeResult.productName, source: 'free_api' }, 'Barcode resolved for free');
      return searchGoogleShopping(freeResult.productName, country);
    }
  } catch (error) {
    logger.debug({ error, barcode }, 'Free barcode lookup failed');
  }

  // ── Step 2: Fall back to SerpApi Google Search (costs 1 credit) ───
  const gl = country === 'FR' ? 'fr' : 'us';
  const hl = country === 'FR' ? 'fr' : 'en';

  try {
    const googleResponse = await getJson({
      engine: 'google',
      q: barcode,
      gl,
      hl,
      api_key: env.SERPAPI_KEY,
      num: 5,
    }) as any;

    let productName = '';

    // Try knowledge graph first (most reliable)
    if (googleResponse.knowledge_graph?.title) {
      productName = googleResponse.knowledge_graph.title;
      logger.info({ barcode, productName, source: 'serpapi_knowledge_graph' }, 'Barcode resolved');
    }
    // Try organic results
    else if (googleResponse.organic_results?.[0]?.title) {
      productName = googleResponse.organic_results[0].title
        .replace(/\s*[-|:]?\s*(Amazon|Fnac|Cdiscount|eBay|Darty|Boulanger|Walmart|Target|Best Buy|Rakuten|Leclerc|Carrefour).*$/i, '')
        .replace(/\s*[-|:]\s*Achat\s*.*/i, '')
        .replace(/\s*[-|:]\s*Prix\s*.*/i, '')
        .trim();
      logger.info({ barcode, productName, source: 'serpapi_organic' }, 'Barcode resolved');
    }

    if (productName && productName.length > 3) {
      return searchGoogleShopping(productName, country);
    }

    // Fallback: direct barcode number search on Shopping
    logger.info({ barcode }, 'Could not resolve barcode to name, searching directly');
    return searchGoogleShopping(barcode, country);
  } catch (error) {
    logger.error({ error, barcode }, 'Barcode lookup failed, falling back to direct search');
    return searchGoogleShopping(barcode, country);
  }
}

// Image search (Google Lens) removed — feature deprecated to reduce costs.
