<script setup lang="ts">
import type { LocationQuery, LocationQueryRaw } from "vue-router";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    RotateCcw,
    Search,
    SlidersHorizontal,
} from "lucide-vue-next";
import FriendPortrait from "@/components/FriendPortrait.vue";
import type { IPets } from "@/lib/interface";
import {
    PET_IMPLEMENTATION_OPTIONS,
    getPetImplementationLabel,
    isPetImplemented,
    matchesPetImplementationFilter,
    type PetImplementationFilter,
} from "@/lib/petImplementation";

type SortKey = "id" | "power" | "speed" | "name";

interface EncyclopediaState {
    keyword: string;
    type: string;
    style: string;
    special: string;
    implementation: PetImplementationFilter;
    sort: SortKey;
    currentPage: number;
    pageSize: number;
}

interface PageItem {
    key: string;
    kind: "page" | "ellipsis";
    value?: number;
}

const PAGE_SIZE_OPTIONS = [24, 48, 72] as const;
const SORT_KEY_OPTIONS: SortKey[] = ["id", "power", "speed", "name"];
const DEFAULT_STATE: EncyclopediaState = {
    keyword: "",
    type: "all",
    style: "all",
    special: "all",
    implementation: "implemented",
    sort: "id",
    currentPage: 1,
    pageSize: 24,
};

const pets = ref<IPets[]>([]);
const isLoading = ref(false);
const hasLoadedPets = ref(false);
const errorMessage = ref("");
const route = useRoute();
const router = useRouter();
const encyclopediaState = reactive<EncyclopediaState>({ ...DEFAULT_STATE });

let controller: AbortController | null = null;

const attackStyleLabels: Record<string, string> = {
    Both: "双修",
    Magic: "魔攻",
    Magical: "魔攻",
    Physical: "物攻",
};

const sortLabels: Record<SortKey, string> = {
    id: "编号",
    power: "总种族值",
    speed: "速度",
    name: "名称",
};

const statLabels = {
    base_hp: "生命",
    base_mag_atk: "魔攻",
    base_mag_def: "魔防",
    base_phy_atk: "物攻",
    base_phy_def: "物防",
    base_spd: "速度",
} as const;

const evolvedFromIds = computed(() => {
    return new Set(
        pets.value
            .map((pet) => pet.evolves_from_id)
            .filter((id): id is number => typeof id === "number"),
    );
});

const searchQuery = computed({
    get: () => encyclopediaState.keyword,
    set: (value: string | number) => {
        applyStatePatch({
            keyword: String(value ?? ""),
            currentPage: 1,
        });
    },
});

const selectedType = computed({
    get: () => encyclopediaState.type,
    set: (value: string) => {
        applyStatePatch({
            type: value,
            currentPage: 1,
        });
    },
});

const selectedAttackStyle = computed({
    get: () => encyclopediaState.style,
    set: (value: string) => {
        applyStatePatch({
            style: value,
            currentPage: 1,
        });
    },
});

const selectedSpecial = computed({
    get: () => encyclopediaState.special,
    set: (value: string) => {
        applyStatePatch({
            special: value,
            currentPage: 1,
        });
    },
});

const selectedImplementation = computed({
    get: () => encyclopediaState.implementation,
    set: (value: PetImplementationFilter) => {
        applyStatePatch({
            implementation: value,
            currentPage: 1,
        });
    },
});

const sortBy = computed({
    get: () => encyclopediaState.sort,
    set: (value: SortKey) => {
        applyStatePatch({
            sort: value,
            currentPage: 1,
        });
    },
});

const pageSizeModel = computed({
    get: () => String(encyclopediaState.pageSize),
    set: (value: string) => {
        applyStatePatch({
            pageSize: parsePageSize(value),
            currentPage: 1,
        });
    },
});

const typeOptions = computed(() => {
    const typeMap = new Map<number, string>();

    for (const pet of pets.value) {
        typeMap.set(pet.main_type.id, pet.main_type.localized.zh);

        if (pet.sub_type) {
            typeMap.set(pet.sub_type.id, pet.sub_type.localized.zh);
        }
    }

    return Array.from(typeMap.entries())
        .sort((left, right) => left[0] - right[0])
        .map(([value, label]) => ({
            label,
            value: String(value),
        }));
});

const attackStyleOptions = computed(() => {
    return Array.from(
        new Set(pets.value.map((pet) => pet.preferred_attack_style)),
    )
        .sort()
        .map((value) => ({
            label: getAttackStyleLabel(value),
            value,
        }));
});

const summaryItems = computed(() => {
    return [
        {
            label: "收录精灵",
            value: pets.value.length,
        },
        {
            label: "筛选结果",
            value: filteredPets.value.length,
        },
        {
            label: "首领形态",
            value: pets.value.filter((pet) => pet.is_leader_form).length,
        },
        {
            label: "属性系别",
            value: typeOptions.value.length,
        },
    ];
});

const filteredPets = computed(() => {
    const keyword = encyclopediaState.keyword.trim().toLowerCase();

    return pets.value.filter((pet) => {
        const matchesKeyword =
            keyword.length === 0 ||
            [
                pet.localized.zh.name,
                pet.name,
                String(pet.id),
                pet.main_type.localized.zh,
                pet.sub_type?.localized.zh ?? "",
                pet.default_legacy_type.localized.zh,
                getPetImplementationLabel(pet),
            ].some((field) => field.toLowerCase().includes(keyword));

        const matchesType =
            encyclopediaState.type === "all" ||
            pet.main_type.id === Number(encyclopediaState.type) ||
            pet.sub_type?.id === Number(encyclopediaState.type);

        const matchesAttackStyle =
            encyclopediaState.style === "all" ||
            pet.preferred_attack_style === encyclopediaState.style;

        const matchesSpecial =
            encyclopediaState.special === "all" ||
            (encyclopediaState.special === "leader" && pet.is_leader_form) ||
            (encyclopediaState.special === "leader-potential" &&
                pet.leader_potential) ||
            (encyclopediaState.special === "base" &&
                pet.evolves_from_id === null) ||
            (encyclopediaState.special === "evolved" &&
                pet.evolves_from_id !== null) ||
            (encyclopediaState.special === "can-evolve" &&
                evolvedFromIds.value.has(pet.id));

        const matchesImplementation = matchesPetImplementationFilter(
            pet,
            encyclopediaState.implementation,
        );

        return (
            matchesKeyword &&
            matchesType &&
            matchesAttackStyle &&
            matchesSpecial &&
            matchesImplementation
        );
    });
});

const sortedPets = computed(() => {
    const sorted = [...filteredPets.value];

    sorted.sort((left, right) => {
        let comparison = 0;

        switch (encyclopediaState.sort) {
            case "power":
                comparison = getTotalStats(right) - getTotalStats(left);
                break;
            case "speed":
                comparison = right.base_spd - left.base_spd;
                break;
            case "name":
                comparison = left.localized.zh.name.localeCompare(
                    right.localized.zh.name,
                    "zh-CN",
                );
                break;
            default:
                comparison = left.id - right.id;
                break;
        }

        if (comparison === 0) {
            comparison = left.id - right.id;
        }

        return comparison;
    });

    return sorted;
});

const pageCount = computed(() => {
    if (!hasLoadedPets.value) {
        return Math.max(1, encyclopediaState.currentPage);
    }

    return Math.max(
        1,
        Math.ceil(sortedPets.value.length / encyclopediaState.pageSize),
    );
});

const paginatedPets = computed(() => {
    const start =
        (encyclopediaState.currentPage - 1) * encyclopediaState.pageSize;
    return sortedPets.value.slice(start, start + encyclopediaState.pageSize);
});

const currentRangeStart = computed(() => {
    if (!sortedPets.value.length) {
        return 0;
    }

    return (encyclopediaState.currentPage - 1) * encyclopediaState.pageSize + 1;
});

const currentRangeEnd = computed(() => {
    if (!sortedPets.value.length) {
        return 0;
    }

    return Math.min(
        encyclopediaState.currentPage * encyclopediaState.pageSize,
        sortedPets.value.length,
    );
});

const pageStatusText = computed(() => {
    if (!sortedPets.value.length) {
        return "当前无结果";
    }

    return `第 ${encyclopediaState.currentPage} / ${pageCount.value} 页 · ${currentRangeStart.value}-${currentRangeEnd.value} / ${sortedPets.value.length}`;
});

const hasActiveFilters = computed(() => {
    return (
        serializeQuery(buildRouteQuery(encyclopediaState)) !==
        serializeQuery(buildRouteQuery(DEFAULT_STATE))
    );
});

const pageItems = computed<PageItem[]>(() => {
    const total = pageCount.value;
    const current = encyclopediaState.currentPage;

    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => ({
            key: `page-${index + 1}`,
            kind: "page",
            value: index + 1,
        }));
    }

    const pages = new Set<number>([
        1,
        total,
        current - 1,
        current,
        current + 1,
    ]);

    if (current <= 3) {
        pages.add(2);
        pages.add(3);
        pages.add(4);
    }

    if (current >= total - 2) {
        pages.add(total - 1);
        pages.add(total - 2);
        pages.add(total - 3);
    }

    const orderedPages = [...pages]
        .filter((page) => page >= 1 && page <= total)
        .sort((left, right) => left - right);

    const items: PageItem[] = [];
    let previousPage = 0;

    for (const page of orderedPages) {
        if (previousPage !== 0 && page - previousPage > 1) {
            items.push({
                key: `ellipsis-${previousPage}-${page}`,
                kind: "ellipsis",
            });
        }

        items.push({
            key: `page-${page}`,
            kind: "page",
            value: page,
        });
        previousPage = page;
    }

    return items;
});

watch(
    () => route.query,
    (query) => {
        const nextState = parseRouteQuery(query);

        if (!isSameState(encyclopediaState, nextState)) {
            Object.assign(encyclopediaState, nextState);
        }
    },
    { immediate: true },
);

watch(
    encyclopediaState,
    (state) => {
        const nextQuery = buildRouteQuery(state);
        const currentQuery = buildRouteQuery(parseRouteQuery(route.query));

        if (serializeQuery(nextQuery) === serializeQuery(currentQuery)) {
            return;
        }

        void router.replace({ query: nextQuery });
    },
    { deep: true },
);

watch(
    [pageCount, hasLoadedPets],
    ([count, loaded]) => {
        if (!loaded) {
            return;
        }

        if (encyclopediaState.currentPage > count) {
            encyclopediaState.currentPage = count;
        }

        if (encyclopediaState.currentPage < 1) {
            encyclopediaState.currentPage = 1;
        }
    },
    { immediate: true },
);

onMounted(() => {
    void getFriends();
});

onBeforeUnmount(() => {
    controller?.abort();
});

function applyStatePatch(patch: Partial<EncyclopediaState>) {
    Object.assign(encyclopediaState, patch);
}

function getAttackStyleLabel(style: string) {
    return attackStyleLabels[style] ?? style;
}

function getTotalStats(pet: IPets) {
    return (
        pet.base_hp +
        pet.base_phy_atk +
        pet.base_mag_atk +
        pet.base_phy_def +
        pet.base_mag_def +
        pet.base_spd
    );
}

function getPeakStat(friend: IPets) {
    const statEntries = Object.entries(statLabels).map(([key, label]) => ({
        label,
        value: friend[key as keyof typeof statLabels],
    }));

    return (
        statEntries.sort((left, right) => right.value - left.value)[0] ?? {
            label: "生命",
            value: 0,
        }
    );
}

function getEvolutionLabel(friend: IPets) {
    if (friend.is_leader_form) {
        return "首领形态";
    }

    if (
        friend.evolves_from_id === null &&
        evolvedFromIds.value.has(friend.id)
    ) {
        return "可进化";
    }

    if (friend.evolves_from_id === null) {
        return "基础形态";
    }

    if (evolvedFromIds.value.has(friend.id)) {
        return "进化阶段";
    }

    return "最终阶段";
}

function setPage(page: number) {
    encyclopediaState.currentPage = Math.min(
        Math.max(page, 1),
        pageCount.value,
    );
}

function resetFilters() {
    Object.assign(encyclopediaState, DEFAULT_STATE);
}

function getQueryValue(value: LocationQuery[string] | undefined) {
    return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parsePositiveInteger(value: string, fallback: number) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePageSize(value: string) {
    const parsed = parsePositiveInteger(value, DEFAULT_STATE.pageSize);
    return PAGE_SIZE_OPTIONS.includes(
        parsed as (typeof PAGE_SIZE_OPTIONS)[number],
    )
        ? parsed
        : DEFAULT_STATE.pageSize;
}

function isSortKey(value: string): value is SortKey {
    return SORT_KEY_OPTIONS.includes(value as SortKey);
}

function parseRouteQuery(query: LocationQuery): EncyclopediaState {
    const sortValue = getQueryValue(query.sort);

    return {
        keyword: getQueryValue(query.q).trim(),
        type: getQueryValue(query.type) || DEFAULT_STATE.type,
        style: getQueryValue(query.style) || DEFAULT_STATE.style,
        special: getQueryValue(query.special) || DEFAULT_STATE.special,
        implementation:
            parseImplementationFilter(getQueryValue(query.implementation)) ||
            DEFAULT_STATE.implementation,
        sort: isSortKey(sortValue) ? sortValue : DEFAULT_STATE.sort,
        currentPage: parsePositiveInteger(
            getQueryValue(query.page),
            DEFAULT_STATE.currentPage,
        ),
        pageSize: parsePageSize(getQueryValue(query.pageSize)),
    };
}

function buildRouteQuery(state: EncyclopediaState): LocationQueryRaw {
    const query: LocationQueryRaw = {};

    if (state.keyword.trim()) {
        query.q = state.keyword.trim();
    }

    if (state.type !== DEFAULT_STATE.type) {
        query.type = state.type;
    }

    if (state.style !== DEFAULT_STATE.style) {
        query.style = state.style;
    }

    if (state.special !== DEFAULT_STATE.special) {
        query.special = state.special;
    }

    if (state.implementation !== DEFAULT_STATE.implementation) {
        query.implementation = state.implementation;
    }

    if (state.sort !== DEFAULT_STATE.sort) {
        query.sort = state.sort;
    }

    if (state.currentPage !== DEFAULT_STATE.currentPage) {
        query.page = String(state.currentPage);
    }

    if (state.pageSize !== DEFAULT_STATE.pageSize) {
        query.pageSize = String(state.pageSize);
    }

    return query;
}

function serializeQuery(query: LocationQueryRaw) {
    return JSON.stringify(
        Object.entries(query).sort(([leftKey], [rightKey]) =>
            leftKey.localeCompare(rightKey),
        ),
    );
}

function parseImplementationFilter(value: string) {
    return PET_IMPLEMENTATION_OPTIONS.find((option) => option.value === value)
        ?.value;
}

function isSameState(current: EncyclopediaState, next: EncyclopediaState) {
    return JSON.stringify(current) === JSON.stringify(next);
}

async function getFriends() {
    controller?.abort();
    controller = new AbortController();
    isLoading.value = true;
    hasLoadedPets.value = false;
    errorMessage.value = "";

    try {
        const response = await fetch("/data/Pets.json", {
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        pets.value = await response.json();
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return;
        }

        errorMessage.value = "图鉴数据加载失败，请稍后重试。";
        pets.value = [];
    } finally {
        isLoading.value = false;
        hasLoadedPets.value = true;
    }
}

document.title = "图鉴 - 洛克王国工具箱";
</script>

<template>
    <section class="space-y-6">
        <Card
            class="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_18%),radial-gradient(circle_at_78%_18%,rgba(56,189,248,0.14),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] py-0 shadow-[0_28px_110px_-48px_rgba(0,0,0,0.92)]"
        >
            <CardHeader class="gap-6 px-6 py-6">
                <div
                    class="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between"
                >
                    <CardTitle
                        class="text-3xl tracking-tight text-white md:text-4xl"
                    >
                        图鉴
                    </CardTitle>

                    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div
                            v-for="item in summaryItems"
                            :key="item.label"
                            class="rounded-3xl border border-white/10 bg-white/6 px-4 py-3 shadow-sm backdrop-blur-sm"
                        >
                            <p
                                class="text-xs tracking-[0.2em] text-slate-500 uppercase"
                            >
                                {{ item.label }}
                            </p>
                            <p class="mt-2 text-2xl font-semibold text-white">
                                {{ item.value }}
                            </p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent class="space-y-4 px-6 pb-6">
                <Separator class="bg-white/10" />

                <div class="grid gap-3 xl:grid-cols-[2fr_repeat(5,1fr)]">
                    <div class="relative xl:col-span-2">
                        <Search
                            class="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500"
                        />
                        <Input
                            v-model="searchQuery"
                            type="search"
                            placeholder="搜索名称、编号、主副属性或遗传系别"
                            class="h-12 rounded-2xl border-white/10 bg-black/25 pl-11 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                        />
                    </div>

                    <Select v-model="selectedType">
                        <SelectTrigger
                            class="h-12 w-full rounded-2xl border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                        >
                            <SelectValue placeholder="全部属性" />
                        </SelectTrigger>
                        <SelectContent
                            class="border-white/10 bg-slate-950/95 text-slate-100"
                        >
                            <SelectItem value="all">全部属性</SelectItem>
                            <SelectItem
                                v-for="option in typeOptions"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select v-model="selectedAttackStyle">
                        <SelectTrigger
                            class="h-12 w-full rounded-2xl border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                        >
                            <SelectValue placeholder="全部倾向" />
                        </SelectTrigger>
                        <SelectContent
                            class="border-white/10 bg-slate-950/95 text-slate-100"
                        >
                            <SelectItem value="all">全部倾向</SelectItem>
                            <SelectItem
                                v-for="option in attackStyleOptions"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select v-model="selectedSpecial">
                        <SelectTrigger
                            class="h-12 w-full rounded-2xl border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                        >
                            <SelectValue placeholder="全部阶段" />
                        </SelectTrigger>
                        <SelectContent
                            class="border-white/10 bg-slate-950/95 text-slate-100"
                        >
                            <SelectItem value="all">全部阶段</SelectItem>
                            <SelectItem value="leader">首领形态</SelectItem>
                            <SelectItem value="leader-potential"
                                >可转首领</SelectItem
                            >
                            <SelectItem value="base">基础形态</SelectItem>
                            <SelectItem value="evolved">已进化</SelectItem>
                            <SelectItem value="can-evolve"
                                >可继续进化</SelectItem
                            >
                        </SelectContent>
                    </Select>

                    <Select v-model="selectedImplementation">
                        <SelectTrigger
                            class="h-12 w-full rounded-2xl border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                        >
                            <SelectValue placeholder="是否实装" />
                        </SelectTrigger>
                        <SelectContent
                            class="border-white/10 bg-slate-950/95 text-slate-100"
                        >
                            <SelectItem
                                v-for="option in PET_IMPLEMENTATION_OPTIONS"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select v-model="sortBy">
                        <SelectTrigger
                            class="h-12 w-full rounded-2xl border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                        >
                            <SelectValue placeholder="按编号排序" />
                        </SelectTrigger>
                        <SelectContent
                            class="border-white/10 bg-slate-950/95 text-slate-100"
                        >
                            <SelectItem value="id">按编号排序</SelectItem>
                            <SelectItem value="power"
                                >按总种族值排序</SelectItem
                            >
                            <SelectItem value="speed">按速度排序</SelectItem>
                            <SelectItem value="name">按名称排序</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div
                    class="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300"
                >
                    <div class="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            class="rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200"
                        >
                            <SlidersHorizontal
                                class="h-3.5 w-3.5 text-slate-400"
                            />
                            {{ pageStatusText }}
                        </Badge>
                        <Badge
                            variant="outline"
                            class="rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200"
                        >
                            排序 {{ sortLabels[sortBy] }}
                        </Badge>
                        <Badge
                            v-if="searchQuery"
                            variant="outline"
                            class="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary"
                        >
                            关键词 {{ searchQuery }}
                        </Badge>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        <Select v-model="pageSizeModel">
                            <SelectTrigger
                                class="h-10 w-34.5 rounded-full border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                            >
                                <SelectValue placeholder="每页显示" />
                            </SelectTrigger>
                            <SelectContent
                                class="border-white/10 bg-slate-950/95 text-slate-100"
                            >
                                <SelectItem
                                    v-for="option in PAGE_SIZE_OPTIONS"
                                    :key="option"
                                    :value="String(option)"
                                >
                                    每页 {{ option }} 条
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            v-if="hasActiveFilters"
                            variant="outline"
                            class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                            @click="resetFilters"
                        >
                            <RotateCcw class="h-3.5 w-3.5" />
                            重置条件
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div
            v-if="isLoading"
            class="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"
        >
            <Skeleton
                v-for="index in 6"
                :key="index"
                class="h-64 rounded-4xl border border-white/10 bg-white/6"
            />
        </div>

        <div
            v-else-if="errorMessage"
            class="rounded-4xl border border-destructive/20 bg-destructive/8 px-6 py-10 text-center text-sm text-destructive"
        >
            {{ errorMessage }}
        </div>

        <div
            v-else-if="filteredPets.length === 0"
            class="rounded-4xl border border-dashed border-white/12 bg-black/20 px-6 py-12 text-center text-sm text-slate-400"
        >
            当前筛选条件下没有找到对应精灵，请尝试放宽关键词或切换筛选项。
        </div>

        <div
            v-else
            class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
            <RouterLink
                v-for="pet in paginatedPets"
                :key="pet.id"
                :to="`/pets/${pet.id}`"
                class="group block"
            >
                <Card
                    class="h-full border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] py-0 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)] transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-[0_35px_80px_-34px_rgba(0,0,0,0.92)]"
                    style="
                        content-visibility: auto;
                        contain-intrinsic-size: 320px;
                    "
                >
                    <CardContent class="p-5">
                        <div class="flex gap-4">
                            <FriendPortrait
                                :name="pet.name"
                                :alt="pet.localized.zh.name"
                                class="h-24 w-24 shrink-0 rounded-3xl"
                                img-class="object-contain p-2 transition duration-300 group-hover:scale-105"
                            />

                            <div class="min-w-0 flex-1">
                                <div
                                    class="flex items-start justify-between gap-3"
                                >
                                    <div class="min-w-0 space-y-1">
                                        <p
                                            class="text-xs tracking-[0.22em] text-slate-500 uppercase"
                                        >
                                            No.{{ pet.id }}
                                        </p>
                                        <h3
                                            class="truncate text-xl font-semibold tracking-tight text-white"
                                        >
                                            {{ pet.localized.zh.name }}
                                        </h3>
                                        <p
                                            class="truncate text-sm text-slate-400"
                                        >
                                            {{
                                                getAttackStyleLabel(
                                                    pet.preferred_attack_style,
                                                )
                                            }}
                                        </p>
                                    </div>

                                    <Badge
                                        v-if="pet.is_leader_form"
                                        class="rounded-full border-0 bg-amber-400/15 px-2.5 py-1 text-xs font-medium text-amber-200"
                                    >
                                        首领
                                    </Badge>
                                    <Badge
                                        v-if="!isPetImplemented(pet)"
                                        variant="outline"
                                        class="rounded-full border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-medium text-amber-100"
                                    >
                                        未实装
                                    </Badge>
                                </div>

                                <div class="mt-3 flex flex-wrap gap-2">
                                    <Badge
                                        class="rounded-full bg-white/10 text-slate-100"
                                    >
                                        {{ pet.main_type.localized.zh }}
                                    </Badge>
                                    <Badge
                                        v-if="pet.sub_type"
                                        variant="secondary"
                                        class="rounded-full bg-slate-700/60 text-slate-100"
                                    >
                                        {{ pet.sub_type.localized.zh }}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        class="rounded-full border-sky-400/20 bg-sky-400/10 text-sky-200"
                                    >
                                        {{
                                            pet.default_legacy_type.localized
                                                .zh
                                        }}遗传
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Separator class="mt-4 bg-white/8" />

                        <div class="mt-4 grid grid-cols-3 gap-2 text-sm">
                            <div
                                class="rounded-3xl border border-white/10 bg-black/20 px-3 py-2.5"
                            >
                                <p class="text-xs text-slate-500">总和</p>
                                <p class="mt-1 font-semibold text-white">
                                    {{ getTotalStats(pet) }}
                                </p>
                            </div>

                            <div
                                class="rounded-3xl border border-white/10 bg-black/20 px-3 py-2.5"
                            >
                                <p class="text-xs text-slate-500">速度</p>
                                <p class="mt-1 font-semibold text-white">
                                    {{ pet.base_spd }}
                                </p>
                            </div>

                            <div
                                class="rounded-3xl border border-white/10 bg-black/20 px-3 py-2.5"
                            >
                                <p class="text-xs text-slate-500">
                                    {{ getPeakStat(pet).label }}
                                </p>
                                <p class="mt-1 font-semibold text-white">
                                    {{ getPeakStat(pet).value }}
                                </p>
                            </div>
                        </div>

                        <div
                            class="mt-4 flex flex-wrap gap-2 text-xs text-slate-300"
                        >
                            <Badge
                                variant="outline"
                                class="rounded-full border-white/10 bg-white/5 px-2.5 py-1 text-slate-300"
                            >
                                {{ getEvolutionLabel(pet) }}
                            </Badge>
                            <Badge
                                v-if="pet.leader_potential"
                                variant="outline"
                                class="rounded-full border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-amber-200"
                            >
                                可转首领
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </RouterLink>
        </div>

        <div
            v-if="sortedPets.length > 0 && pageCount > 1"
            class="flex flex-col gap-3 rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4 md:flex-row md:items-center md:justify-between"
        >
            <p class="text-sm text-slate-300">
                当前第 {{ encyclopediaState.currentPage }} /
                {{ pageCount }} 页， 显示 {{ currentRangeStart }}-{{
                    currentRangeEnd
                }}
                / {{ sortedPets.length }} 条结果。
            </p>

            <div class="flex flex-wrap items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                    :disabled="encyclopediaState.currentPage === 1"
                    @click="setPage(1)"
                >
                    <ChevronsLeft class="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                    :disabled="encyclopediaState.currentPage === 1"
                    @click="setPage(encyclopediaState.currentPage - 1)"
                >
                    <ChevronLeft class="h-4 w-4" />
                </Button>

                <template v-for="item in pageItems" :key="item.key">
                    <Button
                        v-if="item.kind === 'page'"
                        :variant="
                            item.value === encyclopediaState.currentPage
                                ? 'default'
                                : 'outline'
                        "
                        class="min-w-10 rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                        @click="setPage(item.value ?? 1)"
                    >
                        {{ item.value }}
                    </Button>

                    <span v-else class="px-1 text-slate-500">...</span>
                </template>

                <Button
                    variant="outline"
                    size="icon"
                    class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                    :disabled="encyclopediaState.currentPage === pageCount"
                    @click="setPage(encyclopediaState.currentPage + 1)"
                >
                    <ChevronRight class="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                    :disabled="encyclopediaState.currentPage === pageCount"
                    @click="setPage(pageCount)"
                >
                    <ChevronsRight class="h-4 w-4" />
                </Button>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
