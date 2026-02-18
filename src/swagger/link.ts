export const linksSwagger = {
  "/links/{id}/click": {
    post: {
      tags: ["Link"],
      summary: "Click analytics",
      parameters: [
        {
          name: "id",
          in: "path",
          description: "Link ID",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: { description: "OK" },
        400: { description: "Bad request" },
      },
    },
  },

  "/links": {
    post: {
      tags: ["Link"],
      summary: "Create link",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LinkRequest",
            },
          },
        },
      },
      responses: {
        200: { description: "OK" },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/links/reorder": {
    post: {
      tags: ["Link"],
      summary: "Reorder links",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/OrderRequest",
            },
          },
        },
      },
      responses: {
        200: { description: "OK" },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/links/{id}": {
    patch: {
      tags: ["Link"],
      summary: "Update link",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          description: "Link ID",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LinkRequest",
            },
          },
        },
      },
      responses: {
        200: { description: "OK" },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
      },
    },

    delete: {
      tags: ["Link"],
      summary: "Delete link",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          description: "Link ID",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: { description: "OK" },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
      },
    },
  },
};
