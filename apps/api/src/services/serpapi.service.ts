import { getJson } from 'serpapi';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { IStorePrice } from '../models/Product';

// ---------------------------------------------------------------------------
// Types for SerpApi responses
// ---------------------------------------------------------------------------

interface SerpApiShoppingResult {
  title: string;
  link: string;
  source: string;
  price?: string;
  extracted_price?: number;
  thumbnail?: string;
  rating?: number;
  reviews?: number;
  extensions?: string[];
  product_id?: string;
}

interface SerpApiShoppingResponse {
  shopping_results?: SerpApiShoppingResult[];
  search_metadata?: { status: string; id: string };
  error?: string;
}

interface SerpApiLensResult {
  title?: string;
  link?: string;
  source?: string;
  thumbnail?: string;
}

interface SerpApiLensResponse {
  visual_matches?: SerpApiLensResult[];
  knowledge_graph?: Array<{ title?: string }>;
  search_metadata?: { status: string; id: string };
  error?: string;
}

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
  // Major FR retailers
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
  // Electronics & Tech
  'ldlc.com': 'ldlc',
  'materiel.net': 'materiel_net',
  'grosbill.com': 'grosbill',
  'cybertek.fr': 'cybertek',
  'topachat.com': 'topachat',
  'inmac-wstore.com': 'inmac',
  // Refurbished
  'backmarket.fr': 'backmarket',
  'backmarket.com': 'backmarket',
  // General
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
  // Beauty & Health
  'sephora.fr': 'sephora',
  'nocibe.fr': 'nocibe',
  'marionnaud.fr': 'marionnaud',
  // Fashion
  'zalando.fr': 'zalando',
  'asos.com': 'asos',
};

const US_MARKETPLACE_MAP: Record<string, string> = {
  // Major US retailers
  'amazon.com': 'amazon_com',
  'ebay.com': 'ebay',
  'walmart.com': 'walmart',
  'target.com': 'target',
  'bestbuy.com': 'bestbuy',
  'homedepot.com': 'homedepot',
  // Electronics & Tech
  'newegg.com': 'newegg',
  'bhphotovideo.com': 'bhphoto',
  'adorama.com': 'adorama',
  'microcenter.com': 'microcenter',
  // Wholesale / Membership
  'costco.com': 'costco',
  'samsclub.com': 'samsclub',
  // Refurbished
  'backmarket.com': 'backmarket',
  // General / Department
  'kohls.com': 'kohls',
  'macys.com': 'macys',
  'nordstrom.com': 'nordstrom',
  'jcpenney.com': 'jcpenney',
  // Home
  'lowes.com': 'lowes',
  'wayfair.com': 'wayfair',
  'overstock.com': 'overstock',
  // Sports & Outdoor
  'dickssportinggoods.com': 'dickssporting',
  'rei.com': 'rei',
  // Beauty
  'sephora.com': 'sephora',
  'ulta.com': 'ulta',
  // Office
  'staples.com': 'staples',
  'officedepot.com': 'officedepot',
};

const SOURCE_NAME_MAP: Record<string, string> = {
  // --- France ---
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
  // --- United States ---
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

/**
 * Detect our internal marketplace key from the SerpApi result source name
 * and product link URL.
 */
export function detectMarketplace(source: string, link: string): string {
  // 1. Try exact source-name match first
  const fromSource = SOURCE_NAME_MAP[source];
  if (fromSource) return fromSource;

  // 2. Try partial match on source name (case-insensitive)
  const sourceLower = source.toLowerCase();
  for (const [name, key] of Object.entries(SOURCE_NAME_MAP)) {
    if (sourceLower.includes(name.toLowerCase())) {
      return key;
    }
  }

  // 3. Try domain extraction from URL
  try {
    const hostname = new URL(link).hostname.replace(/^www\./, '');

    const frMatch = FR_MARKETPLACE_MAP[hostname];
    if (frMatch) return frMatch;

    const usMatch = US_MARKETPLACE_MAP[hostname];
    if (usMatch) return usMatch;

    // Partial domain match for subdomains
    for (const [domain, key] of Object.entries({ ...FR_MARKETPLACE_MAP, ...US_MARKETPLACE_MAP })) {
      if (hostname.endsWith(domain)) {
        return key;
      }
    }
  } catch {
    // URL parsing failed — fall through
  }

  // 4. Fallback: sanitise source name into a key
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Returns true if a result should be filtered out based on the excluded
 * marketplace list.
 */
function isExcludedMarketplace(source: string, link: string): boolean {
  const combined = `${source} ${link}`.toLowerCase();
  return EXCLUDED_MARKETPLACES.some((name) => combined.includes(name));
}

/**
 * Parse a currency symbol / code into our currency enum.
 */
function parseCurrency(priceString: string | undefined, country: string): 'EUR' | 'USD' {
  if (priceString && priceString.includes('$')) return 'USD';
  if (priceString && priceString.includes('\u20AC')) return 'EUR'; // euro sign
  return country === 'FR' ? 'EUR' : 'USD';
}

/**
 * Map a single SerpApi shopping result to our IStorePrice shape.
 * Note: productUrl is the raw URL here; affiliate wrapping happens at the
 * product-service layer.
 */
function mapToStorePrice(result: SerpApiShoppingResult, country: string): IStorePrice | null {
  const price = result.extracted_price;
  if (price == null || price <= 0) return null;

  const marketplace = detectMarketplace(result.source, result.link);

  return {
    marketplace,
    storeName: result.source,
    storeLogo: '',
    price,
    currency: parseCurrency(result.price, country),
    productUrl: result.link,
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

    // Filter excluded marketplaces, map, deduplicate, sort by price ascending
    const allPrices = rawResults
      .filter((r) => !isExcludedMarketplace(r.source, r.link))
      .map((r) => mapToStorePrice(r, country))
      .filter((p): p is IStorePrice => p !== null);

    // Deduplicate: keep only the cheapest price per marketplace
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

    // Use the first result for product metadata fallback
    const rawTitle = rawResults[0]?.title ?? '';
    const rawThumbnail = rawResults[0]?.thumbnail ?? '';

    logger.info(
      { query, totalRaw: rawResults.length, afterDedup: prices.length },
      'SerpApi shopping results processed',
    );

    return { prices, rawTitle, rawThumbnail };
  } catch (error) {
    logger.error({ error, query }, 'SerpApi Google Shopping request failed');
    throw error;
  }
}

/**
 * Search by barcode / EAN / UPC — simply forwards the barcode string as the
 * search query which works well on Google Shopping.
 */
export async function searchByBarcode(
  barcode: string,
  country: string = 'FR',
): Promise<{
  prices: IStorePrice[];
  rawTitle: string;
  rawThumbnail: string;
}> {
  logger.info({ barcode, country }, 'SerpApi barcode search');
  return searchGoogleShopping(barcode, country);
}

/**
 * Search by image URL using Google Lens, then run a shopping search with the
 * identified product name.
 */
export async function searchByImage(
  imageUrl: string,
  country: string = 'FR',
): Promise<{
  prices: IStorePrice[];
  rawTitle: string;
  rawThumbnail: string;
  identifiedName: string;
}> {
  logger.info({ imageUrl, country }, 'SerpApi Google Lens image search');

  try {
    // Step 1: Identify product via Google Lens
    const lensResponse = (await getJson({
      engine: 'google_lens',
      url: imageUrl,
      api_key: env.SERPAPI_KEY,
    })) as SerpApiLensResponse;

    if (lensResponse.error) {
      logger.error({ error: lensResponse.error }, 'SerpApi Lens returned an error');
      throw new Error(`SerpApi Lens error: ${lensResponse.error}`);
    }

    // Try to extract a product name from knowledge graph first, then visual matches
    let identifiedName = '';

    if (lensResponse.knowledge_graph && lensResponse.knowledge_graph.length > 0) {
      identifiedName = lensResponse.knowledge_graph[0]?.title ?? '';
    }

    if (!identifiedName && lensResponse.visual_matches && lensResponse.visual_matches.length > 0) {
      identifiedName = lensResponse.visual_matches[0]?.title ?? '';
    }

    if (!identifiedName) {
      logger.warn({ imageUrl }, 'Google Lens could not identify product from image');
      return { prices: [], rawTitle: '', rawThumbnail: '', identifiedName: '' };
    }

    logger.info({ identifiedName }, 'Google Lens identified product');

    // Step 2: Search shopping with identified name
    const shoppingResult = await searchGoogleShopping(identifiedName, country);

    return { ...shoppingResult, identifiedName };
  } catch (error) {
    logger.error({ error, imageUrl }, 'SerpApi Google Lens request failed');
    throw error;
  }
}
