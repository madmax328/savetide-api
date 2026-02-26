export interface AffiliateConfig {
  enabled: boolean;
  networkName: string;
  affiliateId: string;
  strategy: 'query_param' | 'awin_deeplink' | 'rakuten_deeplink' | 'ebay_partner';
  paramName?: string;
  awinPublisherId?: string;
  awinAdvertiserId?: string;
  rakutenMid?: string;
}

export const AFFILIATE_CONFIGS: Record<string, AffiliateConfig> = {
  // =====================================================================
  // FRANCE
  // =====================================================================

  // --- Major Retailers ---
  amazon_fr: {
    enabled: false,
    networkName: 'Amazon Associates',
    affiliateId: '', // TODO: Add your Amazon FR tag (e.g., savetide-21)
    strategy: 'query_param',
    paramName: 'tag',
  },
  cdiscount: {
    enabled: false,
    networkName: 'Awin',
    affiliateId: '',
    strategy: 'awin_deeplink',
    awinPublisherId: '',
    awinAdvertiserId: '',
  },
  fnac: {
    enabled: false,
    networkName: 'Awin',
    affiliateId: '',
    strategy: 'awin_deeplink',
    awinPublisherId: '',
    awinAdvertiserId: '',
  },
  darty: {
    enabled: false,
    networkName: 'Awin',
    affiliateId: '',
    strategy: 'awin_deeplink',
    awinPublisherId: '',
    awinAdvertiserId: '',
  },
  boulanger: {
    enabled: false,
    networkName: 'Awin',
    affiliateId: '',
    strategy: 'awin_deeplink',
    awinPublisherId: '',
    awinAdvertiserId: '',
  },
  rakuten_fr: {
    enabled: false,
    networkName: 'Rakuten Advertising',
    affiliateId: '',
    strategy: 'rakuten_deeplink',
    rakutenMid: '',
  },
  leclerc: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  carrefour: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },

  // --- Electronics & Tech FR ---
  ldlc: {
    enabled: false,
    networkName: 'Awin',
    affiliateId: '',
    strategy: 'awin_deeplink',
    awinPublisherId: '',
    awinAdvertiserId: '',
  },
  materiel_net: {
    enabled: false,
    networkName: 'Awin',
    affiliateId: '',
    strategy: 'awin_deeplink',
    awinPublisherId: '',
    awinAdvertiserId: '',
  },
  grosbill: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  cybertek: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  topachat: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  rueducommerce: {
    enabled: true,
    networkName: 'Awin',
    affiliateId: '2780990',
    strategy: 'awin_deeplink',
    awinPublisherId: '2780990',
    awinAdvertiserId: '6901',
  },

  // --- General / Home FR ---
  conforama: {
    enabled: false,
    networkName: 'Awin',
    affiliateId: '',
    strategy: 'awin_deeplink',
    awinPublisherId: '',
    awinAdvertiserId: '',
  },
  but: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  auchan: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  leroymerlin: {
    enabled: false,
    networkName: 'Awin',
    affiliateId: '',
    strategy: 'awin_deeplink',
    awinPublisherId: '',
    awinAdvertiserId: '',
  },

  // --- Sports / Outdoor FR ---
  decathlon: {
    enabled: false,
    networkName: 'Awin',
    affiliateId: '',
    strategy: 'awin_deeplink',
    awinPublisherId: '',
    awinAdvertiserId: '',
  },
  intersport: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },

  // --- Entertainment / Culture FR ---
  cultura: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  micromania: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  electrodepot: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },

  // --- Beauty FR ---
  sephora: {
    enabled: false,
    networkName: 'Rakuten Advertising',
    affiliateId: '',
    strategy: 'rakuten_deeplink',
    rakutenMid: '',
  },
  nocibe: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  marionnaud: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },

  // --- Fashion FR ---
  zalando: {
    enabled: false,
    networkName: 'Awin',
    affiliateId: '',
    strategy: 'awin_deeplink',
    awinPublisherId: '',
    awinAdvertiserId: '',
  },
  asos: {
    enabled: false,
    networkName: 'Awin',
    affiliateId: '',
    strategy: 'awin_deeplink',
    awinPublisherId: '',
    awinAdvertiserId: '',
  },

  // --- Refurbished (FR + US) ---
  backmarket: {
    enabled: false,
    networkName: 'Awin',
    affiliateId: '',
    strategy: 'awin_deeplink',
    awinPublisherId: '',
    awinAdvertiserId: '',
  },

  // =====================================================================
  // UNITED STATES
  // =====================================================================

  // --- Major Retailers ---
  amazon_com: {
    enabled: false,
    networkName: 'Amazon Associates',
    affiliateId: '', // TODO: Add your Amazon US tag
    strategy: 'query_param',
    paramName: 'tag',
  },
  ebay: {
    enabled: false,
    networkName: 'eBay Partner Network',
    affiliateId: '',
    strategy: 'ebay_partner',
  },
  walmart: {
    enabled: false,
    networkName: 'Walmart Affiliate',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'affiliateId',
  },
  target: {
    enabled: false,
    networkName: 'Target Affiliate',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  bestbuy: {
    enabled: false,
    networkName: 'Best Buy Affiliate',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  homedepot: {
    enabled: false,
    networkName: 'Home Depot Affiliate',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },

  // --- Electronics & Tech US ---
  newegg: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  bhphoto: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  adorama: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  microcenter: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },

  // --- Wholesale / Membership US ---
  costco: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  samsclub: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },

  // --- Department Stores US ---
  kohls: {
    enabled: false,
    networkName: 'Rakuten Advertising',
    affiliateId: '',
    strategy: 'rakuten_deeplink',
    rakutenMid: '',
  },
  macys: {
    enabled: false,
    networkName: 'Rakuten Advertising',
    affiliateId: '',
    strategy: 'rakuten_deeplink',
    rakutenMid: '',
  },
  nordstrom: {
    enabled: false,
    networkName: 'Rakuten Advertising',
    affiliateId: '',
    strategy: 'rakuten_deeplink',
    rakutenMid: '',
  },
  jcpenney: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },

  // --- Home US ---
  lowes: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  wayfair: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  overstock: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },

  // --- Sports US ---
  dickssporting: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  rei: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },

  // --- Beauty US ---
  ulta: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },

  // --- Office US ---
  staples: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
  officedepot: {
    enabled: false,
    networkName: 'Direct',
    affiliateId: '',
    strategy: 'query_param',
    paramName: 'ref',
  },
};
