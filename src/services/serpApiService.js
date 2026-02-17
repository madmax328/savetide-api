import axios from "axios";

export async function searchProductByEAN(ean, country) {
  const url = "https://serpapi.com/search.json";

  const params = {
    api_key: process.env.SERPAPI_KEY,
    engine: "google_shopping",
    q: ean,
    gl: country === "US" ? "us" : "fr",
    hl: "en"
  };

  const { data } = await axios.get(url, { params });

  const results = data.shopping_results || [];

  const normalized = results.map((item) => ({
    title: item.title,
    price: parseFloat(item.price?.replace(/[^0-9.]/g, "")) || 0,
    source: item.source,
    link: item.link,
    thumbnail: item.thumbnail
  }));

  normalized.sort((a, b) => a.price - b.price);

  return {
    product: normalized[0] || null,
    prices: normalized
  };
}

