import Cors from "cors";

// Ініціалізуємо CORS з потрібними параметрами
const cors = Cors({
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  origin: "*", // або конкретний домен: "http://localhost:3000"
  credentials: true,
});

// Функція для обгортання middleware в Promises
export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default cors;
