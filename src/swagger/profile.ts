export const profileSwagger = {
  "/profile/{public_link}": {
    get: {
      tags: ["Profile"],
      summary: "Get user profile (public page)",
      parameters: [
        {
          name: "public_link",
          in: "path",
          description: "Public link",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: { description: "OK" },
        404: { description: "Profile not found" },
      },
    },
  },

  "/profile/check/{public_link}": {
    get: {
      tags: ["Profile"],
      summary: "Check public link availability",
      parameters: [
        {
          name: "public_link",
          in: "path",
          description: "Public link",
          required: true,
          schema: {
            $ref: "#/components/schemas/PublicLinkRequest",
          },
        },
      ],
      responses: {
        200: { description: "OK" },
        400: { description: "Invalid link format" },
      },
    },
  },

  "/profile/create": {
    post: {
      tags: ["Profile"],
      summary: "Create profile",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ProfileRequest",
            },
          },
        },
      },
      responses: {
        200: { description: "OK" },
        400: { description: "Bad request" },
      },
    },
  },

  "/profile/oauth": {
    post: {
      tags: ["Profile"],
      summary: "OAuth user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/OAuthRequest",
            },
          },
        },
      },
      responses: {
        200: { description: "OK" },
        400: { description: "Bad request" },
      },
    },
  },

  "/profile/update": {
    patch: {
      tags: ["Profile"],
      summary: "Update profile",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
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

  "/profile/theme": {
    patch: {
      tags: ["Profile"],
      summary: "Update profile theme",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ThemeRequest",
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

  "/profile/delete": {
    delete: {
      tags: ["Profile"],
      summary: "Delete user",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "OK" },
        401: { description: "Unauthorized" },
      },
    },
  },
};
