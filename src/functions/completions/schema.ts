export default {
  type: "object",
  properties: {
    prompt: { type: "string" },
    session: { type: "object" },
  },
  required: ["prompt", "session"],
} as const;
