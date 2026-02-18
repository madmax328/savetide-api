/**
 * Store configuration — display name, brand color, and FontAwesome icon
 * for each known marketplace. Used in the Results screen to give each
 * store card a recognisable identity without loading external images.
 *
 * `icon` is a FontAwesome icon name (from @expo/vector-icons/FontAwesome).
 * `color` is the primary brand colour (used as accent on the store chip).
 */

export interface StoreDisplayConfig {
  displayName: string;
  color: string;
  icon: string; // FontAwesome icon name
}

const STORE_CONFIGS: Record<string, StoreDisplayConfig> = {
  // =====================================================================
  // FRANCE
  // =====================================================================
  amazon_fr:     { displayName: 'Amazon.fr',       color: '#FF9900', icon: 'amazon' },
  cdiscount:     { displayName: 'Cdiscount',        color: '#00A0E1', icon: 'shopping-cart' },
  fnac:          { displayName: 'Fnac',             color: '#E1A400', icon: 'book' },
  darty:         { displayName: 'Darty',            color: '#D10019', icon: 'plug' },
  boulanger:     { displayName: 'Boulanger',        color: '#003DA5', icon: 'desktop' },
  rakuten_fr:    { displayName: 'Rakuten',          color: '#BF0000', icon: 'shopping-bag' },
  leclerc:       { displayName: 'E.Leclerc',        color: '#005DA6', icon: 'shopping-basket' },
  carrefour:     { displayName: 'Carrefour',        color: '#004E9E', icon: 'shopping-basket' },
  ldlc:          { displayName: 'LDLC',             color: '#FF6600', icon: 'microchip' },
  materiel_net:  { displayName: 'Materiel.net',     color: '#1A7FC4', icon: 'microchip' },
  grosbill:      { displayName: 'Grosbill',         color: '#E50012', icon: 'desktop' },
  cybertek:      { displayName: 'Cybertek',         color: '#00A0E1', icon: 'desktop' },
  topachat:      { displayName: 'TopAchat',         color: '#E85D00', icon: 'microchip' },
  rueducommerce: { displayName: 'Rue du Commerce',  color: '#FF6600', icon: 'shopping-cart' },
  conforama:     { displayName: 'Conforama',        color: '#D2003B', icon: 'home' },
  but:           { displayName: 'BUT',              color: '#004A99', icon: 'home' },
  auchan:        { displayName: 'Auchan',           color: '#E10915', icon: 'shopping-basket' },
  decathlon:     { displayName: 'Decathlon',        color: '#0082C3', icon: 'futbol-o' },
  intersport:    { displayName: 'Intersport',       color: '#003DA5', icon: 'futbol-o' },
  leroymerlin:   { displayName: 'Leroy Merlin',     color: '#78BE20', icon: 'wrench' },
  cultura:       { displayName: 'Cultura',          color: '#6B2C91', icon: 'book' },
  micromania:    { displayName: 'Micromania',       color: '#FF0000', icon: 'gamepad' },
  electrodepot:  { displayName: 'Electro Depot',    color: '#FFD500', icon: 'bolt' },
  backmarket:    { displayName: 'Back Market',      color: '#4DED8D', icon: 'recycle' },
  sephora:       { displayName: 'Sephora',          color: '#000000', icon: 'paint-brush' },
  nocibe:        { displayName: 'Nocibe',           color: '#E50695', icon: 'paint-brush' },
  marionnaud:    { displayName: 'Marionnaud',       color: '#C8006E', icon: 'paint-brush' },
  zalando:       { displayName: 'Zalando',          color: '#FF6900', icon: 'shopping-bag' },
  asos:          { displayName: 'ASOS',             color: '#2D2D2D', icon: 'shopping-bag' },
  inmac:         { displayName: 'Inmac Wstore',     color: '#0072BC', icon: 'desktop' },

  // =====================================================================
  // UNITED STATES
  // =====================================================================
  amazon_com:    { displayName: 'Amazon.com',       color: '#FF9900', icon: 'amazon' },
  ebay:          { displayName: 'eBay',             color: '#E53238', icon: 'gavel' },
  walmart:       { displayName: 'Walmart',          color: '#0071CE', icon: 'shopping-cart' },
  target:        { displayName: 'Target',           color: '#CC0000', icon: 'bullseye' },
  bestbuy:       { displayName: 'Best Buy',         color: '#0046BE', icon: 'tv' },
  homedepot:     { displayName: 'Home Depot',       color: '#F96302', icon: 'wrench' },
  newegg:        { displayName: 'Newegg',           color: '#D95E00', icon: 'microchip' },
  bhphoto:       { displayName: 'B&H Photo',        color: '#000000', icon: 'camera' },
  costco:        { displayName: 'Costco',           color: '#005DAA', icon: 'shopping-basket' },
  adorama:       { displayName: 'Adorama',          color: '#E31937', icon: 'camera' },
  microcenter:   { displayName: 'Micro Center',     color: '#CF202F', icon: 'microchip' },
  samsclub:      { displayName: "Sam's Club",       color: '#0060A9', icon: 'shopping-basket' },
  kohls:         { displayName: "Kohl's",           color: '#000000', icon: 'shopping-bag' },
  macys:         { displayName: "Macy's",           color: '#E31937', icon: 'shopping-bag' },
  nordstrom:     { displayName: 'Nordstrom',        color: '#000000', icon: 'shopping-bag' },
  jcpenney:      { displayName: 'JCPenney',         color: '#D72229', icon: 'shopping-bag' },
  lowes:         { displayName: "Lowe's",           color: '#004990', icon: 'wrench' },
  wayfair:       { displayName: 'Wayfair',          color: '#7B189F', icon: 'home' },
  overstock:     { displayName: 'Overstock',        color: '#D40000', icon: 'home' },
  dickssporting: { displayName: "Dick's Sporting",  color: '#0B6623', icon: 'futbol-o' },
  rei:           { displayName: 'REI',              color: '#1A5632', icon: 'tree' },
  ulta:          { displayName: 'Ulta Beauty',      color: '#FB5B0F', icon: 'paint-brush' },
  staples:       { displayName: 'Staples',          color: '#CC0000', icon: 'briefcase' },
  officedepot:   { displayName: 'Office Depot',     color: '#CC0000', icon: 'briefcase' },
};

/**
 * Get display configuration for a marketplace key.
 * Falls back to a generic config if the key is unknown.
 */
export function getStoreConfig(marketplace: string): StoreDisplayConfig {
  return (
    STORE_CONFIGS[marketplace] ?? {
      displayName: prettifyMarketplaceName(marketplace),
      color: '#6B7280', // neutral gray
      icon: 'shopping-bag',
    }
  );
}

/**
 * Turn a snake_case marketplace key into a readable name.
 * e.g. "some_store" → "Some Store"
 */
function prettifyMarketplaceName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
