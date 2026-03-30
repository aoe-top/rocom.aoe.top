<script setup lang="ts">
import { useRoute } from "vue-router";
import {
    Activity,
    Box,
    CircleUser,
    TableProperties,
    Gamepad2,
    ListTodo,
    Network,
    Settings,
    Wrench,
} from "lucide-vue-next";
import { cn } from "@/lib/utils";

const route = useRoute();

const navItems = [
    { name: "首页", path: "/", icon: Gamepad2 },
    { name: "图鉴", path: "/encyclopedia", icon: TableProperties },
    // { name: "实例", path: "/instances", icon: Box },
    // { name: "任务", path: "/tasks", icon: ListTodo },
    // { name: "联机", path: "/multiplayer", icon: Network },
    // { name: "诊断", path: "/diagnostics", icon: Activity },
    // { name: "工具", path: "/tools", icon: Wrench },
];

// const bottomItems = [{ name: "设置", path: "/settings", icon: Settings }];
</script>

<template>
    <aside
        class="flex w-16 md:w-64 flex-col border-r border-border bg-sidebar/50 backdrop-blur-xl transition-all duration-300">
        <div
            class="flex h-14 items-center justify-center md:justify-start md:px-6"
            data-tauri-drag-region>
            <div class="flex items-center gap-3">
                <div
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <Gamepad2 class="h-5 w-5" />
                </div>
                <span
                    class="hidden font-bold tracking-tight md:inline-block text-lg text-foreground">
                    洛克王国工具箱
                </span>
            </div>
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

        <!-- <div class="p-3 border-t border-border/50">
            <router-link
                v-for="item in bottomItems"
                :key="item.path"
                :to="item.path"
                :class="
                    cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative',
                        route.path === item.path
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    )
                ">
                <component :is="item.icon" class="h-5 w-5 shrink-0" />
                <span class="hidden md:inline-block">{{ item.name }}</span>
            </router-link>

            <button
                class="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
                <CircleUser class="h-5 w-5 shrink-0" />
                 <span class="hidden md:flex flex-col items-start text-left">
                    <span
                        class="text-xs leading-none text-foreground font-semibold"
                        >{{ account.displayName }}</span
                    >
                    <span
                        class="text-[10px] leading-tight text-muted-foreground mt-1"
                        >{{
                            providerLabels[account.provider] ?? account.provider
                        }}
                        · v{{ appVersion }}</span
                    >
                </span> 
            </button>
        </div> -->
    </aside>
</template>
