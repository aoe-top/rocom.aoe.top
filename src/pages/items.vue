<script setup lang="ts">
import type { IItem } from "@/lib/interface";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Package,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Sparkles,
} from "lucide-vue-next";

const PAGE_SIZE_OPTIONS = [24, 48, 96];

const QUALITY_OPTIONS = [
    { value: "all", label: "全部品质" },
    { value: "5", label: "传说" },
    { value: "4", label: "史诗" },
    { value: "3", label: "精良" },
    { value: "2", label: "优秀" },
    { value: "1", label: "普通" },
];

const QUALITY_STYLES: Record<number, { border: string; bg: string; text: string; dot: string }> = {
    5: { border: "border-amber-400/30", bg: "bg-amber-400/10", text: "text-amber-200", dot: "bg-amber-400" },
    4: { border: "border-purple-400/30", bg: "bg-purple-400/10", text: "text-purple-200", dot: "bg-purple-400" },
    3: { border: "border-blue-400/30", bg: "bg-blue-400/10", text: "text-blue-200", dot: "bg-blue-400" },
    2: { border: "border-emerald-400/30", bg: "bg-emerald-400/10", text: "text-emerald-200", dot: "bg-emerald-400" },
    1: { border: "border-slate-400/30", bg: "bg-slate-400/10", text: "text-slate-300", dot: "bg-slate-400" },
};

const items = ref<IItem[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const searchQuery = ref("");
const selectedCategory = ref("all");
const selectedQuality = ref("all");
const currentPage = ref(1);
const pageSize = ref(48);
const expandedItemId = ref<number | null>(null);
const failedIcons = ref(new Set<number>());

let controller: AbortController | null = null;

const categoryOptions = computed(() => {
    const categories = new Set<string>();

    for (const item of items.value) {
        if (item.category) {
            categories.add(item.category);
        }
    }

    return [...categories].sort((a, b) => a.localeCompare(b, "zh-CN"));
});

const filteredItems = computed(() => {
    let result = items.value;
    const query = searchQuery.value.trim().toLowerCase();

    if (query) {
        result = result.filter((item) => {
            return (
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                String(item.id).includes(query) ||
                (item.type_desc && item.type_desc.toLowerCase().includes(query)) ||
                item.related_pets.some((pet) => pet.name.toLowerCase().includes(query))
            );
        });
    }

    if (selectedCategory.value !== "all") {
        result = result.filter((item) => item.category === selectedCategory.value);
    }

    if (selectedQuality.value !== "all") {
        const qualityNumber = Number(selectedQuality.value);
        result = result.filter((item) => item.quality === qualityNumber);
    }

    return result;
});

const pageCount = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)));

const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredItems.value.slice(start, start + pageSize.value);
});

const currentRangeStart = computed(() => {
    if (filteredItems.value.length === 0) return 0;
    return (currentPage.value - 1) * pageSize.value + 1;
});

const currentRangeEnd = computed(() => {
    return Math.min(currentPage.value * pageSize.value, filteredItems.value.length);
});

const hasActiveFilters = computed(() => {
    return searchQuery.value.trim() !== "" || selectedCategory.value !== "all" || selectedQuality.value !== "all";
});

const summaryItems = computed(() => [
    { label: "道具总数", value: items.value.length },
    { label: "当前筛选", value: filteredItems.value.length },
    { label: "分类数", value: categoryOptions.value.length },
    { label: "关联精灵", value: countRelatedPets() },
]);

const pageItems = computed(() => {
    return buildPageItems(currentPage.value, pageCount.value);
});

const pageSizeModel = computed({
    get: () => String(pageSize.value),
    set: (value: string) => {
        pageSize.value = Number(value);
        currentPage.value = 1;
    },
});

watch([searchQuery, selectedCategory, selectedQuality], () => {
    currentPage.value = 1;
});

function countRelatedPets() {
    const petIds = new Set<number>();

    for (const item of items.value) {
        for (const pet of item.related_pets) {
            petIds.add(pet.id);
        }
    }

    return petIds.size;
}

function setPage(page: number) {
    currentPage.value = Math.max(1, Math.min(page, pageCount.value));
}

function resetFilters() {
    searchQuery.value = "";
    selectedCategory.value = "all";
    selectedQuality.value = "all";
    currentPage.value = 1;
}

function toggleExpand(itemId: number) {
    expandedItemId.value = expandedItemId.value === itemId ? null : itemId;
}

function getQualityStyle(quality: number) {
    return QUALITY_STYLES[quality] ?? QUALITY_STYLES[1];
}

function getIconSrc(item: IItem) {
    if (!item.icon_id || failedIcons.value.has(item.id)) {
        return null;
    }

    return `/assets/webp/items/${item.icon_id}.webp`;
}

function onIconError(itemId: number) {
    failedIcons.value.add(itemId);
}

function buildPageItems(current: number, total: number) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => ({
            kind: "page" as const,
            value: index + 1,
            key: `p${index + 1}`,
        }));
    }

    const result: { kind: "page" | "ellipsis"; value?: number; key: string }[] = [];
    result.push({ kind: "page", value: 1, key: "p1" });

    if (current > 3) {
        result.push({ kind: "ellipsis", key: "e1" });
    }

    for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page++) {
        result.push({ kind: "page", value: page, key: `p${page}` });
    }

    if (current < total - 2) {
        result.push({ kind: "ellipsis", key: "e2" });
    }

    result.push({ kind: "page", value: total, key: `p${total}` });
    return result;
}

async function loadItems() {
    controller?.abort();
    controller = new AbortController();
    isLoading.value = true;
    errorMessage.value = "";

    try {
        const response = await fetch("/data/items.json", {
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        items.value = await response.json();
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return;
        }

        errorMessage.value = "道具数据加载失败，请稍后重试。";
        items.value = [];
    } finally {
        isLoading.value = false;
    }
}

document.title = "道具 - 洛克王国工具箱";

onMounted(() => {
    void loadItems();
});

onBeforeUnmount(() => {
    controller?.abort();
});
</script>

<template>
    <section class="space-y-3">
        <Card
            class="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.16),transparent_18%),radial-gradient(circle_at_78%_18%,rgba(56,189,248,0.14),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] py-0 shadow-lg">
            <CardHeader class="gap-3 px-4 py-4">
                <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <CardTitle class="text-2xl tracking-tight text-white md:text-3xl">
                        道具图鉴
                    </CardTitle>

                    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div v-for="item in summaryItems" :key="item.label"
                            class="rounded-xl border border-white/10 bg-white/6 px-4 py-3 shadow-sm backdrop-blur-sm">
                            <p class="text-xs tracking-[0.2em] text-slate-500 uppercase">
                                {{ item.label }}
                            </p>
                            <p class="mt-2 text-2xl font-semibold text-white">
                                {{ item.value }}
                            </p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent class="space-y-4 px-4 pb-6">
                <Separator class="bg-white/10" />

                <div class="grid gap-3 xl:grid-cols-[2fr_1fr_1fr]">
                    <div class="relative">
                        <Search
                            class="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input v-model="searchQuery" type="search" placeholder="搜索道具名称、描述、编号或关联精灵"
                            class="h-10 rounded-2xl border-white/10 bg-black/25 pl-11 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:border-primary/60 focus-visible:ring-primary/20" />
                    </div>

                    <Select v-model="selectedCategory">
                        <SelectTrigger
                            class="h-10 w-full rounded-2xl border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20">
                            <SelectValue placeholder="全部分类" />
                        </SelectTrigger>
                        <SelectContent class="border-white/10 bg-slate-950/95 text-slate-100">
                            <SelectItem value="all">全部分类</SelectItem>
                            <SelectItem v-for="category in categoryOptions" :key="category" :value="category">
                                {{ category }}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select v-model="selectedQuality">
                        <SelectTrigger
                            class="h-10 w-full rounded-2xl border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20">
                            <SelectValue placeholder="全部品质" />
                        </SelectTrigger>
                        <SelectContent class="border-white/10 bg-slate-950/95 text-slate-100">
                            <SelectItem v-for="option in QUALITY_OPTIONS" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                    <div class="flex flex-wrap items-center gap-2">
                        <Badge variant="outline"
                            class="rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                            <SlidersHorizontal class="h-3.5 w-3.5 text-slate-400" />
                            {{ filteredItems.length }} 项结果
                        </Badge>
                        <Badge v-if="searchQuery" variant="outline"
                            class="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                            关键词 {{ searchQuery }}
                        </Badge>
                        <Badge v-if="selectedCategory !== 'all'" variant="outline"
                            class="rounded-full border-violet-400/20 bg-violet-400/10 px-3 py-1 text-violet-200">
                            {{ selectedCategory }}
                        </Badge>
                        <Badge v-if="selectedQuality !== 'all'" variant="outline"
                            class="rounded-full border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-200">
                            {{ QUALITY_OPTIONS.find((o) => o.value === selectedQuality)?.label }}
                        </Badge>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        <Select v-model="pageSizeModel">
                            <SelectTrigger
                                class="h-10 w-34.5 rounded-full border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20">
                                <SelectValue placeholder="每页显示" />
                            </SelectTrigger>
                            <SelectContent class="border-white/10 bg-slate-950/95 text-slate-100">
                                <SelectItem v-for="option in PAGE_SIZE_OPTIONS" :key="option" :value="String(option)">
                                    每页 {{ option }} 条
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Button v-if="hasActiveFilters" variant="outline"
                            class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                            @click="resetFilters">
                            <RotateCcw class="h-3.5 w-3.5" />
                            重置条件
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div v-if="isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            <Skeleton v-for="index in 6" :key="index"
                class="h-48 rounded-2xl border border-white/10 bg-white/6" />
        </div>

        <div v-else-if="errorMessage"
            class="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-10 text-center text-sm text-destructive">
            {{ errorMessage }}
        </div>

        <div v-else-if="filteredItems.length === 0"
            class="rounded-2xl border border-dashed border-white/12 bg-black/20 px-4 py-6 text-center text-sm text-slate-400">
            当前筛选条件下没有找到对应道具，请尝试放宽关键词或切换筛选项。
        </div>

        <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <div v-for="entry in paginatedItems" :key="entry.id" class="group" @click="toggleExpand(entry.id)">
                <Card
                    class="h-full cursor-pointer border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] py-0 shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-xl"
                    style="content-visibility: auto; contain-intrinsic-size: 200px;">
                    <CardContent class="p-4">
                        <div class="flex gap-3">
                            <div :class="[
                                'relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-sm',
                                getQualityStyle(entry.quality).border,
                                'bg-slate-900/80',
                            ]">
                                <img v-if="getIconSrc(entry)" :src="getIconSrc(entry)!" :alt="entry.name"
                                    loading="lazy" decoding="async"
                                    class="h-full w-full object-contain p-1.5"
                                    @error="onIconError(entry.id)" />
                                <span v-else :class="[
                                    'text-lg font-bold',
                                    getQualityStyle(entry.quality).text,
                                ]">
                                    {{ entry.name.slice(0, 1) }}
                                </span>
                                <div :class="[
                                    'absolute bottom-0 left-0 right-0 h-1',
                                    getQualityStyle(entry.quality).dot,
                                ]" />
                            </div>

                            <div class="min-w-0 flex-1">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="min-w-0 space-y-0.5">
                                        <p class="text-xs tracking-[0.22em] text-slate-500 uppercase">
                                            #{{ entry.id }}
                                        </p>
                                        <h3 class="truncate text-lg font-semibold tracking-tight text-white">
                                            {{ entry.name }}
                                        </h3>
                                    </div>

                                    <Badge :class="[
                                        'shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium',
                                        getQualityStyle(entry.quality).border,
                                        getQualityStyle(entry.quality).bg,
                                        getQualityStyle(entry.quality).text,
                                    ]">
                                        {{ entry.quality_label }}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                            {{ entry.description }}
                        </p>

                        <div class="mt-3 flex flex-wrap gap-2">
                            <Badge v-if="entry.category" variant="outline"
                                class="rounded-full border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                                {{ entry.category }}
                            </Badge>
                            <Badge v-if="entry.type_desc" variant="outline"
                                class="rounded-full border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-xs text-sky-200">
                                {{ entry.type_desc }}
                            </Badge>
                            <Badge v-if="entry.related_pets.length > 0" variant="outline"
                                class="rounded-full border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-200">
                                <Sparkles class="mr-1 h-3 w-3" />
                                关联 {{ entry.related_pets.length }} 只精灵
                            </Badge>
                        </div>

                        <div v-if="expandedItemId === entry.id" class="mt-4 space-y-3 border-t border-white/8 pt-4">
                            <div v-if="entry.flavor_text"
                                class="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5 text-xs italic leading-5 text-slate-400">
                                "{{ entry.flavor_text }}"
                            </div>

                            <div v-if="entry.acquire_ways.length > 0">
                                <p class="text-xs font-medium text-slate-500">获取方式</p>
                                <div class="mt-1.5 flex flex-wrap gap-1.5">
                                    <Badge v-for="(way, index) in entry.acquire_ways" :key="index" variant="outline"
                                        class="rounded-full border-white/8 bg-white/4 px-2.5 py-1 text-xs text-slate-300">
                                        {{ way }}
                                    </Badge>
                                </div>
                            </div>

                            <div v-if="entry.related_pets.length > 0">
                                <p class="text-xs font-medium text-slate-500">关联精灵（进化材料）</p>
                                <div class="mt-1.5 flex flex-wrap gap-1.5">
                                    <RouterLink v-for="pet in entry.related_pets" :key="pet.id" :to="`/pets/${pet.id}`"
                                        class="inline-flex" @click.stop>
                                        <Badge variant="outline"
                                            class="rounded-full border-emerald-400/15 bg-emerald-400/8 px-2.5 py-1 text-xs text-emerald-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/15">
                                            {{ pet.name }}
                                        </Badge>
                                    </RouterLink>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <div v-if="filteredItems.length > 0 && pageCount > 1"
            class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4 md:flex-row md:items-center md:justify-between">
            <p class="text-sm text-slate-300">
                当前第 {{ currentPage }} / {{ pageCount }} 页，显示 {{ currentRangeStart }}-{{ currentRangeEnd }}
                / {{ filteredItems.length }} 条结果。
            </p>

            <div class="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="icon"
                    class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                    :disabled="currentPage === 1" @click="setPage(1)">
                    <ChevronsLeft class="h-4 w-4" />
                </Button>

                <Button variant="outline" size="icon"
                    class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                    :disabled="currentPage === 1" @click="setPage(currentPage - 1)">
                    <ChevronLeft class="h-4 w-4" />
                </Button>

                <template v-for="item in pageItems" :key="item.key">
                    <Button v-if="item.kind === 'page'"
                        :variant="item.value === currentPage ? 'default' : 'outline'"
                        class="min-w-10 rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                        @click="setPage(item.value ?? 1)">
                        {{ item.value }}
                    </Button>
                    <span v-else class="px-1 text-slate-500">...</span>
                </template>

                <Button variant="outline" size="icon"
                    class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                    :disabled="currentPage === pageCount" @click="setPage(currentPage + 1)">
                    <ChevronRight class="h-4 w-4" />
                </Button>

                <Button variant="outline" size="icon"
                    class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                    :disabled="currentPage === pageCount" @click="setPage(pageCount)">
                    <ChevronsRight class="h-4 w-4" />
                </Button>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
