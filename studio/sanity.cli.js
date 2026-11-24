import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || "missingid",
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
  studioHost: "smerd",
  deployment: {
    appId: "iwnx7bd4ivyuw3rmgqcrxncp",
  },
});
