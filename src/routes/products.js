import { getByBarcode } from "../controllers/productController.js";

export default async function (fastify) {
  fastify.get("/barcode/:ean", getByBarcode);
}
