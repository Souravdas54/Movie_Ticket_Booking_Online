import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import path from "path";
import { Express } from "express";

export const swaggerSetup = (app: Express) => {
  const swaggerPath = path.join(__dirname, "swagger", "swagger.yaml");
  const swaggerDocument = yaml.load(swaggerPath);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
