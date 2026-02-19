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
  product_link?: string;
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

interface SerpApiLensVisualMatch {
  title?: string;
  link?: string;
  source?: string;
  thumbnail?: string;
}

interface SerpApiLensResponse {
  visual_matches?: SerpApiLensVisualMatch[];
  knowledge_graph?: Array<{ title?: string; subtitle?: string }>;
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
 * Get the best available URL from a SerpApi shopping result.
 * Prefers direct retailer link, falls back to product_link (Google comparison).
 */
function getBestUrl(result: SerpApiShoppingResult): string {
  if (result.link && result.link.startsWith('http')) {
    return result.link;
  }
  if (result.product_link && result.product_link.startsWith('http')) {
    return result.product_link;
  }
  return '';
}

function mapToStorePrice(result: SerpApiShoppingResult, country: string): IStorePrice | null {
  const price = result.extracted_price;
  if (price == null || price <= 0) return null;

  const url = getBestUrl(result);
  if (!url) {
    logger.warn({ source: result.source, title: result.title }, 'Skipping result — no URL');
    return null;
  }

  const marketplace = detectMarketplace(result.source, url);

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
 * Strategy: first look up the barcode on regular Google Search to find the
 * actual product name, then search Google Shopping with that name.
 * This gives much better results than searching Shopping with a raw number.
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

  const gl = country === 'FR' ? 'fr' : 'us';
  const hl = country === 'FR' ? 'fr' : 'en';

  try {
    // Step 1: Google search to resolve barcode → product name
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
      logger.info({ barcode, productName, source: 'knowledge_graph' }, 'Barcode resolved');
    }
    // Try organic results
    else if (googleResponse.organic_results?.[0]?.title) {
      productName = googleResponse.organic_results[0].title
        .replace(/\s*[-|:]?\s*(Amazon|Fnac|Cdiscount|eBay|Darty|Boulanger|Walmart|Target|Best Buy|Rakuten|Leclerc|Carrefour).*$/i, '')
        .replace(/\s*[-|:]\s*Achat\s*.*/i, '')
        .replace(/\s*[-|:]\s*Prix\s*.*/i, '')
        .trim();
      logger.info({ barcode, productName, source: 'organic_results' }, 'Barcode resolved');
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

/**
 * Search by image.
 *
 * SerpApi Google Lens requires a PUBLICLY ACCESSIBLE URL (not base64).
 * Since we receive base64 from the mobile app, we need to upload it first.
 * For now we upload to imgbb (free, no auth needed for small images).
 * If that fails, we return empty results.
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
  logger.info({ country, isBase64: imageUrl.startsWith('data:') }, 'Image search requested');

  let publicUrl = imageUrl;

  // If base64, upload to get a public URL
  if (imageUrl.startsWith('data:')) {
    try {
      publicUrl = await uploadBase64ToPublicUrl(imageUrl);
      logger.info({ publicUrl: publicUrl.substring(0, 80) }, 'Image uploaded for Lens');
    } catch (uploadError) {
      logger.error({ error: uploadError }, 'Failed to upload image for Google Lens');
      return { prices: [], rawTitle: '', rawThumbnail: '', identifiedName: '' };
    }
  }

  try {
    const lensResponse = (await getJson({
      engine: 'google_lens',
      url: publicUrl,
      api_key: env.SERPAPI_KEY,
    })) as SerpApiLensResponse;

    if (lensResponse.error) {
      logger.error({ error: lensResponse.error }, 'SerpApi Lens returned an error');
      throw new Error(`SerpApi Lens error: ${lensResponse.error}`);
    }

    let identifiedName = '';

    if (lensResponse.knowledge_graph && lensResponse.knowledge_graph.length > 0) {
      identifiedName = lensResponse.knowledge_graph[0]?.title ?? '';
    }

    if (!identifiedName && lensResponse.visual_matches && lensResponse.visual_matches.length > 0) {
      identifiedName = lensResponse.visual_matches[0]?.title ?? '';
    }

    if (!identifiedName) {
      logger.warn('Google Lens could not identify product from image');
      return { prices: [], rawTitle: '', rawThumbnail: '', identifiedName: '' };
    }

    logger.info({ identifiedName }, 'Google Lens identified product');

    const shoppingResult = await searchGoogleShopping(identifiedName, country);
    return { ...shoppingResult, identifiedName };
  } catch (error) {
    logger.error({ error }, 'SerpApi Google Lens request failed');
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Image upload helper
// ---------------------------------------------------------------------------

/**
 * Upload a base64 image to imgbb (free image hosting) to get a public URL.
 * This is needed because SerpApi Google Lens requires a public URL.
 */
async function uploadBase64ToPublicUrl(dataUri: string): Promise<string> {
  // Extract raw base64 (remove data:image/...;base64, prefix)
  const base64Data = dataUri.replace(/^data:image\/[a-z]+;base64,/, '');

  // Use imgbb free API (no key needed for anonymous uploads)
  // Alternative: we can use a simple POST to a free service
  const formData = new URLSearchParams();
  formData.append('image', base64Data);

  const response = await fetch('https://api.imgbb.com/1/upload?key=00000000000000000000000000000000', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    // Fallback: try freeimage.host
    const fallbackForm = new URLSearchParams();
    fallbackForm.append('source', base64Data);
    fallbackForm.append('type', 'base64');
    fallbackForm.append('action', 'upload');

    const fallbackResponse = await fetch('https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5', {
      method: 'POST',
      body: fallbackForm,
    });

    if (!fallbackResponse.ok) {
      throw new Error('Failed to upload image to any hosting service');
    }

    const fallbackData = await fallbackResponse.json() as any;
    if (fallbackData?.image?.url) {
      return fallbackData.image.url as string;
    }
    throw new Error('No URL in freeimage response');
  }

  const data = await response.json() as any;
  if (data?.data?.url) {
    return data.data.url as string;
  }

  throw new Error('No URL in imgbb response');
}
