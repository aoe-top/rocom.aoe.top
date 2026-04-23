<script setup lang="ts">
import { ref, watch } from "vue";
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
    Menu,
    X,
    ExternalLink,
    LifeBuoy
} from "lucide-vue-next";
import { cn } from "@/lib/utils";

const route = useRoute();
const isMobileMenuOpen = ref(false);

watch(
    () => route.path,
    () => {
        isMobileMenuOpen.value = false;
    }
);

const navItems = [
    { name: "首页", path: "/", icon: Gamepad2 },
    { name: "图鉴", path: "/encyclopedia", icon: TableProperties },
    { name: "表格", path: "/table", icon: Table },
    { name: "配队", path: "/team", icon: Gamepad2 },
    { name: "配种", path: "/breeding", icon: HeartPulse },
    { name: "孵蛋", path: "/incubate", icon: Egg },
    { name: "星图", path: "/egggroup", icon: Sparkle },
    { name: "属性", path: "/attributes", icon: LifeBuoy }
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
    <!-- Desktop Sidebar -->
    <aside
        class="hidden md:flex w-64 flex-col border-r border-border bg-sidebar/50 backdrop-blur-xl transition-all duration-300">
        <div class="flex h-14 items-center justify-start px-6" data-tauri-drag-region>
            <router-link to="/" class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground shadow-sm">
                    <img src="/favicon.ico" alt="Logo" class="h-8 w-8" />
                </div>
                <span class="font-bold tracking-tight inline-block text-lg text-foreground">
                    洛克王国工具箱
                </span>
            </router-link>
        </div>

        <div class="flex-1 overflow-auto py-4 flex flex-col gap-1 px-3">
            <router-link v-for="item in navItems" :key="item.path" :to="item.path" :class="cn(
                'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative overflow-hidden',
                route.path === item.path
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )
                ">
                <component :is="item.icon" class="h-5 w-5 shrink-0" />
                <span>{{ item.name }}</span>

                <div v-if="route.path === item.path"
                    class="absolute left-0 top-1/2 h-1/2 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
            </router-link>
        </div>

        <div class="p-3 border-t border-border/50">
            <a v-for="item in bottomItems" :key="item.path" :href="item.path" target="_blank"
                class="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative text-muted-foreground hover:bg-accent/50 hover:text-foreground">
                <component :is="item.icon" class="h-5 w-5 shrink-0" />
                <span>{{ item.name }}</span>
                <ExternalLink class="h-4 w-4 shrink-0" />
            </a>
        </div>
    </aside>

    <!-- Mobile Header -->
    <header
        class="md:hidden flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 shrink-0 z-40 sticky top-0">
        <router-link to="/" class="flex items-center gap-3">
            <img src="/favicon.ico" alt="Logo" class="h-8 w-8" />
            <span class="font-bold text-lg tracking-tight">洛克王国工具箱</span>
        </router-link>
        <button @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="p-2 -mr-2 text-foreground flex items-center justify-center">
            <Menu v-if="!isMobileMenuOpen" class="h-6 w-6" />
            <X v-else class="h-6 w-6" />
        </button>
    </header>

    <!-- Mobile Navigation Overlay -->
    <div v-if="isMobileMenuOpen"
        class="md:hidden fixed inset-0 top-14 z-50 bg-background/95 backdrop-blur-md flex flex-col p-4 overflow-y-auto duration-300 animate-in fade-in slide-in-from-top-4">
        <div class="flex-1 flex flex-col gap-2">
            <router-link v-for="item in navItems" :key="item.path" :to="item.path" @click="isMobileMenuOpen = false"
                :class="cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                    route.path === item.path
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )
                    ">
                <component :is="item.icon" class="h-6 w-6 shrink-0" />
                <span>{{ item.name }}</span>
            </router-link>
        </div>
        <div class="border-t border-border/50 pt-4 mt-4 flex flex-col gap-2 pb-8">
            <a v-for="item in bottomItems" :key="item.path" :href="item.path" target="_blank"
                class="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
                <component :is="item.icon" class="h-6 w-6 shrink-0" />
                <span>{{ item.name }}</span>
                <ExternalLink class="h-5 w-5 shrink-0 ml-auto opacity-50" />
            </a>
        </div>
    </div>
</template>
