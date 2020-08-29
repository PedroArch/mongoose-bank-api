import express from "express";
import { router } from "./routes/bankRoutes.js";
import { db } from "./models/config.js";

const app = express();
app.use(express.json());
app.use(router);

(async () => {
  try {
    await db.mongoose.connect(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log("Conectado com o mongoDB");
  } catch (err) {
    console.log("Erro ao conectar ao mongoDB " + err);
  }
})();

app.listen(process.env.PORT, () => {
  console.log("API started");
});
