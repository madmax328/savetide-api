import { searchProductByEAN } from "../services/serpApiService.js";

export const getByBarcode = async (req) => {
  const { ean } = req.params;
  const { country = "FR" } = req.query;

  const data = await searchProductByEAN(ean, country);

  return data;
};
