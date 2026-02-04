export const userSwagger = {
  "/user/{username}": {
    get: {
      tags: ["User"],
      summary: "Get user profile (public page)",
      parameters: [
        {
          name: "username",
          in: "path",
          description: "Username",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: { description: "OK" },
        404: { description: "User not found" },
      },
    },
  },

  "/user/check/{username}": {
    get: {
      tags: ["User"],
      summary: "Check username availability (for username update)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "username",
          in: "path",
          description: "Username",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: { description: "OK" },
        400: { description: "Invalid username format" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/user/delete": {
    delete: {
      tags: ["User"],
      summary: "Delete user",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "OK" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/user/update": {
    patch: {
      tags: ["User"],
      summary: "Update user",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              allOf: [
                {
                  type: "object",
                  properties: {
                    avatar: {
                      type: "string",
                      format: "binary",
                    },
                  },
                },
                { $ref: "#/components/schemas/UpdateRequest" },
              ],
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
};
