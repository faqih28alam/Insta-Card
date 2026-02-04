import swaggerJSDoc, { Options } from "swagger-jsdoc";
import j2s from "joi-to-swagger";
import { registerSchema, loginSchema } from "../validators/auth";
import { updateSchema } from "../validators/user";
import { linkSchema, orderSchema } from "../validators/link";

import { userSwagger } from "./user";
import { authSwagger } from "./auth";
import { linksSwagger } from "./link";

const { swagger: registerSwagger } = j2s(registerSchema);
const { swagger: loginSwagger } = j2s(loginSchema);
const { swagger: updateSwagger } = j2s(updateSchema);
const { swagger: linkSwagger } = j2s(linkSchema);
const { swagger: orderSwagger } = j2s(orderSchema);

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LinkHub API",
      version: "1.0.0",
      description: "API documentation for LinkHub",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterRequest: registerSwagger,
        LoginRequest: loginSwagger,
        UpdateRequest: updateSwagger,
        LinkRequest: linkSwagger,
        OrderRequest: orderSwagger,
      },
    },
    paths: {
      ...authSwagger,
      ...userSwagger,
      ...linksSwagger,
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
