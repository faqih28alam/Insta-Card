import swaggerJSDoc, { Options } from "swagger-jsdoc";
import j2s from "joi-to-swagger";
import { registerSchema, loginSchema } from "../validators/auth";
import {
  updateSchema,
  publicLinkSchema,
  profileSchema,
  oAuthSchema,
  themeSchema,
} from "../validators/profile";
import { linkSchema, orderSchema } from "../validators/link";

import { profileSwagger } from "./profile";
import { authSwagger } from "./auth";
import { linksSwagger } from "./link";

const { swagger: registerSwagger } = j2s(registerSchema);
const { swagger: loginSwagger } = j2s(loginSchema);
const { swagger: updateSwagger } = j2s(updateSchema);
const { swagger: linkSwagger } = j2s(linkSchema);
const { swagger: orderSwagger } = j2s(orderSchema);
const { swagger: publicLinkSwagger } = j2s(publicLinkSchema);
const { swagger: createProfileSwagger } = j2s(profileSchema);
const { swagger: oAuthSwagger } = j2s(oAuthSchema);
const { swagger: themeSwagger } = j2s(themeSchema);

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
        PublicLinkRequest: publicLinkSwagger,
        ProfileRequest: createProfileSwagger,
        OAuthRequest: oAuthSwagger,
        ThemeRequest: themeSwagger,
      },
    },
    paths: {
      ...authSwagger,
      ...profileSwagger,
      ...linksSwagger,
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
