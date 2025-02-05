import { Category } from "@/models/Category";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";
import cors, { runMiddleware } from "@/lib/init-middleware";

export default async function handle(req, res) {
  const { method } = req;

  // Підключення до бази даних
  await mongooseConnect();
  await runMiddleware(req, res, cors);

  // Перевірка прав доступу тільки для методів, які змінюють дані
  if (method === "POST" || method === "PUT" || method === "DELETE") {
    await isAdminRequest(req, res);
  }

  if (method === "GET") {
    // Публічний доступ до списку категорій
    res.json(await Category.find().populate("parent"));
  }

  if (method === "POST") {
    const { name, parentCategory, properties } = req.body;
    const categoryDoc = await Category.create({
      name,
      parent: parentCategory || undefined,
      properties,
    });
    res.json(categoryDoc);
  }

  if (method === "PUT") {
    const { name, parentCategory, properties, _id } = req.body;
    const categoryDoc = await Category.updateOne(
      { _id },
      {
        name,
        parent: parentCategory || undefined,
        properties,
      }
    );
    res.json(categoryDoc);
  }

  if (method === "DELETE") {
    const { _id } = req.query;
    await Category.deleteOne({ _id });
    res.json("ok");
  }
}
