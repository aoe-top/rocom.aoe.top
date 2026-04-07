<script setup lang="ts">
import { useRoute } from "vue-router";
import {
    Table,
    TableProperties,
    Gamepad2,
    HeartPulse,
    Egg,
    Gift,
    Github,
    Sparkle,
} from "lucide-vue-next";
import { cn } from "@/lib/utils";

const route = useRoute();

const navItems = [
    { name: "首页", path: "/", icon: Gamepad2 },
    { name: "图鉴", path: "/encyclopedia", icon: TableProperties },
    { name: "表格", path: "/table", icon: Table },
    { name: "配队", path: "/team", icon: Gamepad2 },
    { name: "配种", path: "/breeding", icon: HeartPulse },
    { name: "孵蛋", path: "/incubate", icon: Egg },
    { name: "星图", path: "/egggroup", icon: Sparkle },
];

const bottomItems = [
    {
        name: "GitHub",
        path: "https://github.com/aoe-top/rocom.aoe.top",
        icon: Github,
    },
    { name: "赞助", path: "https://sponsor.aoe.top/", icon: Gift },
];
</script>

<template>
    <aside
        class="flex w-16 md:w-64 flex-col border-r border-border bg-sidebar/50 backdrop-blur-xl transition-all duration-300">
        <div
            class="flex h-14 items-center justify-center md:justify-start md:px-6"
            data-tauri-drag-region>
            <router-link to="/" class="flex items-center gap-3">
                <div
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground shadow-sm">
                    <img src="/favicon.ico" alt="Logo" class="h-8 w-8" />
                </div>
                <span
                    class="hidden font-bold tracking-tight md:inline-block text-lg text-foreground">
                    洛克王国工具箱
                </span>
            </router-link>
        </div>

        <div class="flex-1 overflow-auto py-4 flex flex-col gap-1 px-3">
            <router-link
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                :class="
                    cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative overflow-hidden',
                        route.path === item.path
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    )
                ">
                <component :is="item.icon" class="h-5 w-5 shrink-0" />
                <span class="hidden md:inline-block">{{ item.name }}</span>

                <div
                    v-if="route.path === item.path"
                    class="absolute left-0 top-1/2 h-1/2 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
            </router-link>
        </div>

        <div class="p-3 border-t border-border/50">
            <a
                v-for="item in bottomItems"
                :key="item.path"
                :href="item.path"
                target="_blank"
                class="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative text-muted-foreground hover:bg-accent/50 hover:text-foreground">
                <component :is="item.icon" class="h-5 w-5 shrink-0" />
                <span class="hidden md:inline-block">{{ item.name }}</span>
                <IconExternalLink class="h-4 w-4 shrink-0" />
            </a>
        </div>
    </aside>
</template>
