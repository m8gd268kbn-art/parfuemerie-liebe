import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Server-only-Module sind in Unit-Tests erlaubt (Node-Umgebung, kein Client-Bundle).
      "server-only": fileURLToPath(new URL("./tests/stubs/empty.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    env: {
      DATABASE_URL: "postgres://unit:unit@localhost:5432/unit",
      PAYMENT_PROVIDER: "test",
      TEST_PAYMENT_SECRET: "unit-test-secret-0123456789",
      STRIPE_WEBHOOK_SECRET: "whsec_unit_test_secret",
      STRIPE_SECRET_KEY: "sk_test_unit",
    },
  },
});
