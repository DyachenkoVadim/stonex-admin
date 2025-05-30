import { Product } from "@/models/Product";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import cors, { runMiddleware } from "@/lib/init-middleware";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  await runMiddleware(req, res, cors);

  if (method === "GET") {
    if (req.query?.id) {
      res.json(await Product.findOne({ _id: req.query.id }));
    } else {
      res.json(await Product.find());
    }
  }

  await isAdminRequest(req, res);

  if (method === "POST") {
    const { title, description, price, images, category, properties } =
      req.body;
    const productDoc = await Product.create({
      title,
      description,
      price,
      images,
      category: category || undefined,
      properties,
    });
    res.json(productDoc);
  }

  if (method === "PUT") {
    const { title, description, price, images, category, properties, _id } =
      req.body;
    await Product.updateOne(
      { _id },
      {
        title,
        description,
        price,
        images,
        category: category || null,
        properties,
      }
    );
    res.json(true);
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      await Product.deleteOne({ _id: req.query?.id });
      res.json(true);
    }
  }
}
