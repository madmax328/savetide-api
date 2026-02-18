import { AFFILIATE_CONFIGS } from '../config/affiliates';

export function buildAffiliateUrl(rawUrl: string, marketplace: string): string {
  const config = AFFILIATE_CONFIGS[marketplace];

  if (!config || !config.enabled || !config.affiliateId) {
    return rawUrl;
  }

  try {
    switch (config.strategy) {
      case 'query_param': {
        const url = new URL(rawUrl);
        url.searchParams.set(config.paramName!, config.affiliateId);
        return url.toString();
      }

      case 'awin_deeplink': {
        return `https://www.awin1.com/cread.php?awinmid=${config.awinAdvertiserId}&awinaffid=${config.awinPublisherId}&ued=${encodeURIComponent(rawUrl)}`;
      }

      case 'rakuten_deeplink': {
        return `https://click.linksynergy.com/deeplink?id=${config.affiliateId}&mid=${config.rakutenMid}&murl=${encodeURIComponent(rawUrl)}`;
      }

      case 'ebay_partner': {
        return `https://rover.ebay.com/rover/1/${config.affiliateId}/1?mpre=${encodeURIComponent(rawUrl)}&toolid=10001`;
      }

      default:
        return rawUrl;
    }
  } catch {
    return rawUrl;
  }
}
