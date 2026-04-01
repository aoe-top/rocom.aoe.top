<script setup lang="ts">
import {
    ArrowRight,
    HeartPulse,
    ShieldCheck,
    Sparkles,
    Swords,
    TableProperties,
} from "lucide-vue-next";

const heroLinks = [
    {
        title: "图鉴检索",
        description: "按属性、打法与特殊标签快速定位目标精灵。",
        to: "/encyclopedia",
        icon: TableProperties,
        badge: "检索优先",
        accent: "from-sky-400/20 via-cyan-400/10 to-transparent",
    },
    {
        title: "配种模拟",
        description: "直接判断蛋组重叠、父母体资格与孵化结果归属。",
        to: "/breeding",
        icon: HeartPulse,
        badge: "高频工具",
        accent: "from-amber-300/20 via-orange-300/10 to-transparent",
    },
    {
        title: "配队规划",
        description: "围绕技能、性格与定位快速搭建六人阵容。",
        to: "/team",
        icon: Swords,
        badge: "策略构建",
        accent: "from-emerald-300/20 via-teal-300/10 to-transparent",
    },
];

const valuePoints = [
    {
        title: "数据直达",
        description:
            "把图鉴、育种和队伍构建收敛到同一套站内入口，减少来回切换。",
    },
    {
        title: "决策更快",
        description: "把常用判断条件直接放到页面上，避免手动翻表和重复比对。",
    },
    {
        title: "结果可落地",
        description: "首页不是装饰页，而是进入具体工作流之前的快速分流面板。",
    },
];

// 标题
document.title = "洛克王国工具箱";
</script>

<template>
    <section class="space-y-6">
        <Card
            class="relative overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.18),transparent_24%),radial-gradient(circle_at_84%_12%,rgba(56,189,248,0.16),transparent_22%),linear-gradient(145deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] py-0 shadow-[0_28px_110px_-48px_rgba(0,0,0,0.92)]">
            <div
                class="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_32%,transparent_58%)]" />

            <CardContent class="relative px-6 py-8 md:px-8 md:py-10 xl:px-10">
                <div
                    class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
                    <div class="max-w-3xl space-y-6">
                        <div class="space-y-4">
                            <h1
                                class="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl xl:text-6xl">
                                洛克王国工具箱
                            </h1>
                        </div>

                        <div class="flex flex-wrap gap-3">
                            <Button
                                as-child
                                size="lg"
                                class="rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200">
                                <RouterLink to="/encyclopedia">
                                    查看图鉴
                                    <ArrowRight class="h-4 w-4" />
                                </RouterLink>
                            </Button>
                            <Button
                                as-child
                                size="lg"
                                variant="outline"
                                class="rounded-full border-white/10 bg-white/6 text-slate-100 hover:bg-white/10">
                                <RouterLink to="/breeding">
                                    配种模拟
                                </RouterLink>
                            </Button>
                            <Button
                                as-child
                                size="lg"
                                variant="outline"
                                class="rounded-full border-white/10 bg-white/6 text-slate-100 hover:bg-white/10">
                                <a
                                    href="https://github.com/aoe-top/rocom.aoe.top"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    GitHub
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-3 mt-5 md:flex-row">
                    <RouterLink
                        v-for="item in heroLinks"
                        :key="item.to"
                        :to="item.to"
                        class="group rounded-[1.75rem] border border-white/10 bg-black/24 p-5 transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/8">
                        <div class="relative overflow-hidden p-4">
                            <div
                                class="relative flex items-start justify-between gap-4">
                                <div class="space-y-3">
                                    <div>
                                        <h2
                                            class="text-xl font-semibold text-white">
                                            {{ item.title }}
                                        </h2>
                                        <p
                                            class="mt-2 text-sm leading-6 text-slate-300">
                                            {{ item.description }}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-100">
                                    <component
                                        :is="item.icon"
                                        class="h-5 w-5" />
                                </div>
                            </div>

                            <div
                                class="relative mt-5 flex items-center gap-2 text-sm text-slate-200">
                                进入模块
                                <ArrowRight
                                    class="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </RouterLink>
                </div>
            </CardContent>
        </Card>
        <FriendlyLinks />
    </section>
</template>

<style scoped></style>
