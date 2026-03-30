<script setup lang="ts">
import { ArrowRight, ShieldPlus, Sparkles } from "lucide-vue-next";
</script>

<template>
    <section
        class="grid min-h-[calc(100vh-7rem)] gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card
            class="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_18%),radial-gradient(circle_at_82%_16%,rgba(56,189,248,0.14),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] py-0 shadow-[0_28px_110px_-48px_rgba(0,0,0,0.92)]">
            <CardContent
                class="flex h-full flex-col justify-between gap-8 p-8 md:p-10">
                <div class="space-y-5">
                    <Badge
                        variant="secondary"
                        class="w-fit rounded-full border border-white/10 bg-white/8 px-3 py-1 text-slate-200">
                        <ShieldPlus class="h-3.5 w-3.5 text-emerald-300" />
                        Team Builder
                    </Badge>

                    <div class="space-y-4">
                        <h1
                            class="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                            配队页面已预留，后续可以直接扩展成阵容构建器。
                        </h1>
                        <p class="max-w-2xl text-base leading-7 text-slate-300">
                            当前先提供一致的暗色占位页，避免侧边导航跳转到空路由。后续可以在这里接入属性克制、技能覆盖和阵容角色分工分析。
                        </p>
                    </div>
                </div>

                <div class="flex flex-wrap gap-3">
                    <Button as-child class="rounded-full px-6">
                        <RouterLink to="/encyclopedia">
                            继续查看图鉴
                            <ArrowRight class="h-4 w-4" />
                        </RouterLink>
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card class="border-white/10 bg-black/25 shadow-sm">
            <CardHeader>
                <CardTitle class="flex items-center gap-2 text-white">
                    <Sparkles class="h-4 w-4 text-primary" />
                    后续可接入内容
                </CardTitle>
                <CardDescription class="text-slate-400">
                    这个页面已经接入同一套暗色视觉，可以直接承接后续功能开发。
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-3 text-sm leading-7 text-slate-300">
                <div class="rounded-3xl border border-white/10 bg-white/5 p-4">
                    按主副属性、定位和速度阈值快速筛选候选精灵。
                </div>
                <div class="rounded-3xl border border-white/10 bg-white/5 p-4">
                    根据技能覆盖、遗传系别和进化阶段补足阵容短板。
                </div>
                <div class="rounded-3xl border border-white/10 bg-white/5 p-4">
                    展示队伍的输出结构、抗性分布与首领形态占比。
                </div>
            </CardContent>
        </Card>
    </section>
</template>

<style scoped></style>
