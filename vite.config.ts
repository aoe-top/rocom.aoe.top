import path from "node:path";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";
import VueRouter from "vue-router/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        tailwindcss(),
        VueRouter({
            // Recommended: auto-included by tsconfig
            dts: "src/typed-router.d.ts",
        }),
        AutoImport({
            imports: ["vue", "vue-router", "@vueuse/core", "pinia"],
            dts: "src/auto-imports.d.ts",
        }),
        Components({
            dirs: ["src/components/ui", "src/components"],
            resolvers: [
                (name) => {
                    if (name.startsWith("Icon")) {
                        return {
                            name: name.slice(4),
                            from: "lucide-vue-next",
                        };
                    }
                },
            ],
            dts: "src/components.d.ts",
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
