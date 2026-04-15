<script setup lang="ts">
import type { LocationQuery, LocationQueryRaw } from "vue-router";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Filter,
    RotateCcw,
    Search,
    Sparkles,
} from "lucide-vue-next";
import FriendPortrait from "@/components/FriendPortrait.vue";
import { Table as UiTable } from "@/components/ui/table";
import { formatEggGroup } from "@/lib/eggGroups";
import type { IPets } from "@/lib/interface";
import {
    PET_IMPLEMENTATION_OPTIONS,
    formatPetEggGroupSummary,
    getPetEggGroupIds,
    getPetImplementationLabel,
    isPetImplemented,
    matchesPetImplementationFilter,
    type PetImplementationFilter,
} from "@/lib/petImplementation";

type SortKey =
    | "id"
    | "name"
    | "eggGroup"
    | "type"
    | "attackStyle"
    | "totalStats"
    | "hp"
    | "phyAtk"
    | "magAtk"
    | "phyDef"
    | "magDef"
    | "speed";
type SortDirection = "asc" | "desc";

interface StatColumn {
    key:
        | "base_hp"
        | "base_phy_atk"
        | "base_mag_atk"
        | "base_phy_def"
        | "base_mag_def"
        | "base_spd";
    label: string;
    sortKey: SortKey;
}

interface TableState {
    keyword: string;
    type: string;
    eggGroup: string;
    style: string;
    special: string;
    implementation: PetImplementationFilter;
    sortKey: SortKey;
    sortDir: SortDirection;
    currentPage: number;
    pageSize: number;
}

interface PageItem {
    key: string;
    kind: "page" | "ellipsis";
    value?: number;
}

const DEFAULT_STATE: TableState = {
    keyword: "",
    type: "all",
    eggGroup: "all",
    style: "all",
    special: "all",
    implementation: "implemented",
    sortKey: "id",
    sortDir: "asc",
    currentPage: 1,
    pageSize: 20,
};

const PAGE_SIZE_OPTIONS = [20, 40, 80] as const;
const SORT_KEY_OPTIONS: SortKey[] = [
    "id",
    "name",
    "eggGroup",
    "type",
    "attackStyle",
    "totalStats",
    "hp",
    "phyAtk",
    "magAtk",
    "phyDef",
    "magDef",
    "speed",
];
const DEFAULT_SORT_DIRECTIONS: Record<SortKey, SortDirection> = {
    id: "asc",
    name: "asc",
    eggGroup: "asc",
    type: "asc",
    attackStyle: "asc",
    totalStats: "desc",
    hp: "desc",
    phyAtk: "desc",
    magAtk: "desc",
    phyDef: "desc",
    magDef: "desc",
    speed: "desc",
};

const statColumns: StatColumn[] = [
    { key: "base_hp", label: "生命", sortKey: "hp" },
    { key: "base_phy_atk", label: "物攻", sortKey: "phyAtk" },
    { key: "base_mag_atk", label: "魔攻", sortKey: "magAtk" },
    { key: "base_phy_def", label: "物防", sortKey: "phyDef" },
    { key: "base_mag_def", label: "魔防", sortKey: "magDef" },
    { key: "base_spd", label: "速度", sortKey: "speed" },
];

const attackStyleLabels: Record<string, string> = {
    Both: "双修",
    Magic: "魔攻",
    Magical: "魔攻",
    Physical: "物攻",
};

const sortLabels: Record<SortKey, string> = {
    id: "编号",
    name: "名称",
    eggGroup: "蛋组",
    type: "属性",
    attackStyle: "定位",
    totalStats: "总种族值",
    hp: "生命",
    phyAtk: "物攻",
    magAtk: "魔攻",
    phyDef: "物防",
    magDef: "魔防",
    speed: "速度",
};

const route = useRoute();
const router = useRouter();
const pets = ref<IPets[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const tableState = reactive<TableState>({ ...DEFAULT_STATE });

let controller: AbortController | null = null;

const collator = new Intl.Collator("zh-CN", {
    numeric: true,
    sensitivity: "base",
});

const evolvedFromIds = computed(() => {
    return new Set(
        pets.value
            .map((pet) => pet.evolves_from_id)
            .filter((id): id is number => typeof id === "number"),
    );
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

const eggGroupOptions = computed(() => {
    const eggGroupIds = new Set<number>();

    for (const pet of pets.value) {
        for (const groupId of getEggGroupIds(pet)) {
            eggGroupIds.add(groupId);
        }
    }

    return [...eggGroupIds]
        .sort((left, right) => left - right)
        .map((value) => ({
            label: formatEggGroup(value),
            value: String(value),
        }));
});

const attackStyleOptions = computed(() => {
    return Array.from(
        new Set(pets.value.map((pet) => pet.preferred_attack_style)),
    )
        .sort((left, right) =>
            collator.compare(
                getAttackStyleLabel(left),
                getAttackStyleLabel(right),
            ),
        )
        .map((value) => ({
            label: getAttackStyleLabel(value),
            value,
        }));
});

const specialOptions = [
    { label: "全部形态", value: "all" },
    { label: "首领形态", value: "leader" },
    { label: "有首领潜力", value: "leader-potential" },
    { label: "基础形态", value: "base" },
    { label: "已进化", value: "evolved" },
    { label: "可继续进化", value: "can-evolve" },
];

const keywordModel = computed({
    get: () => tableState.keyword,
    set: (value: string | number) => {
        applyStatePatch({
            keyword: String(value ?? ""),
            currentPage: 1,
        });
    },
});

const typeModel = computed({
    get: () => tableState.type,
    set: (value: string) => {
        applyStatePatch({
            type: value,
            currentPage: 1,
        });
    },
});

const eggGroupModel = computed({
    get: () => tableState.eggGroup,
    set: (value: string) => {
        applyStatePatch({
            eggGroup: value,
            currentPage: 1,
        });
    },
});

const styleModel = computed({
    get: () => tableState.style,
    set: (value: string) => {
        applyStatePatch({
            style: value,
            currentPage: 1,
        });
    },
});

const specialModel = computed({
    get: () => tableState.special,
    set: (value: string) => {
        applyStatePatch({
            special: value,
            currentPage: 1,
        });
    },
});

const implementationModel = computed({
    get: () => tableState.implementation,
    set: (value: PetImplementationFilter) => {
        applyStatePatch({
            implementation: value,
            currentPage: 1,
        });
    },
});

const pageSizeModel = computed({
    get: () => String(tableState.pageSize),
    set: (value: string) => {
        applyStatePatch({
            pageSize: parsePageSize(value),
            currentPage: 1,
        });
    },
});

const filteredPets = computed(() => {
    const keyword = tableState.keyword.trim().toLowerCase();

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
                formatEggGroupSummary(pet),
                getPetImplementationLabel(pet),
            ].some((field) => field.toLowerCase().includes(keyword));

        const matchesType =
            tableState.type === "all" ||
            pet.main_type.id === Number(tableState.type) ||
            pet.sub_type?.id === Number(tableState.type);

        const matchesEggGroup =
            tableState.eggGroup === "all" ||
            getEggGroupIds(pet).includes(Number(tableState.eggGroup));

        const matchesStyle =
            tableState.style === "all" ||
            pet.preferred_attack_style === tableState.style;

        const matchesSpecial =
            tableState.special === "all" ||
            (tableState.special === "leader" && pet.is_leader_form) ||
            (tableState.special === "leader-potential" &&
                pet.leader_potential) ||
            (tableState.special === "base" && pet.evolves_from_id === null) ||
            (tableState.special === "evolved" &&
                pet.evolves_from_id !== null) ||
            (tableState.special === "can-evolve" &&
                evolvedFromIds.value.has(pet.id));

        const matchesImplementation = matchesPetImplementationFilter(
            pet,
            tableState.implementation,
        );

        return (
            matchesKeyword &&
            matchesType &&
            matchesEggGroup &&
            matchesStyle &&
            matchesSpecial &&
            matchesImplementation
        );
    });
});

const sortedPets = computed(() => {
    const sorted = [...filteredPets.value];

    sorted.sort((left, right) => {
        let comparison = 0;

        switch (tableState.sortKey) {
            case "name":
                comparison = collator.compare(
                    left.localized.zh.name,
                    right.localized.zh.name,
                );
                break;
            case "eggGroup":
                comparison = collator.compare(
                    formatEggGroupSummary(left),
                    formatEggGroupSummary(right),
                );
                break;
            case "type":
                comparison = collator.compare(
                    getTypeLabel(left),
                    getTypeLabel(right),
                );
                break;
            case "attackStyle":
                comparison = collator.compare(
                    getAttackStyleLabel(left.preferred_attack_style),
                    getAttackStyleLabel(right.preferred_attack_style),
                );
                break;
            case "totalStats":
                comparison = getTotalStats(left) - getTotalStats(right);
                break;
            case "hp":
                comparison = left.base_hp - right.base_hp;
                break;
            case "phyAtk":
                comparison = left.base_phy_atk - right.base_phy_atk;
                break;
            case "magAtk":
                comparison = left.base_mag_atk - right.base_mag_atk;
                break;
            case "phyDef":
                comparison = left.base_phy_def - right.base_phy_def;
                break;
            case "magDef":
                comparison = left.base_mag_def - right.base_mag_def;
                break;
            case "speed":
                comparison = left.base_spd - right.base_spd;
                break;
            default:
                comparison = left.id - right.id;
                break;
        }

        if (comparison === 0) {
            comparison = left.id - right.id;
        }

        return tableState.sortDir === "asc" ? comparison : -comparison;
    });

    return sorted;
});

const pageCount = computed(() => {
    return Math.max(
        1,
        Math.ceil(sortedPets.value.length / tableState.pageSize),
    );
});

const paginatedPets = computed(() => {
    const start = (tableState.currentPage - 1) * tableState.pageSize;
    return sortedPets.value.slice(start, start + tableState.pageSize);
});

const currentRangeStart = computed(() => {
    if (!sortedPets.value.length) {
        return 0;
    }

    return (tableState.currentPage - 1) * tableState.pageSize + 1;
});

const currentRangeEnd = computed(() => {
    if (!sortedPets.value.length) {
        return 0;
    }

    return Math.min(
        tableState.currentPage * tableState.pageSize,
        sortedPets.value.length,
    );
});

const summaryItems = computed(() => {
    return [
        {
            label: "总收录",
            value: pets.value.length,
        },
        {
            label: "筛选结果",
            value: sortedPets.value.length,
        },
        {
            label: "当前页",
            value: `${tableState.currentPage}/${pageCount.value}`,
        },
        {
            label: "排序",
            value: `${sortLabels[tableState.sortKey]}${
                tableState.sortDir === "asc" ? "升序" : "降序"
            }`,
        },
    ];
});

const pageItems = computed<PageItem[]>(() => {
    const total = pageCount.value;
    const current = tableState.currentPage;

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

const hasActiveFilters = computed(() => {
    return (
        serializeQuery(buildRouteQuery(tableState)) !==
        serializeQuery(buildRouteQuery(DEFAULT_STATE))
    );
});

watch(
    () => route.query,
    (query) => {
        const nextState = parseRouteQuery(query);

        if (!isSameState(tableState, nextState)) {
            Object.assign(tableState, nextState);
        }
    },
    { immediate: true },
);

watch(
    tableState,
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
    pageCount,
    (count) => {
        if (tableState.currentPage > count) {
            tableState.currentPage = count;
        }

        if (tableState.currentPage < 1) {
            tableState.currentPage = 1;
        }
    },
    { immediate: true },
);

onMounted(() => {
    void getPets();
});

onBeforeUnmount(() => {
    controller?.abort();
});

function applyStatePatch(patch: Partial<TableState>) {
    Object.assign(tableState, patch);
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

function getPeakStat(pet: IPets) {
    return (
        [
            { label: "生命", value: pet.base_hp },
            { label: "物攻", value: pet.base_phy_atk },
            { label: "魔攻", value: pet.base_mag_atk },
            { label: "物防", value: pet.base_phy_def },
            { label: "魔防", value: pet.base_mag_def },
            { label: "速度", value: pet.base_spd },
        ].sort((left, right) => right.value - left.value)[0] ?? {
            label: "生命",
            value: 0,
        }
    );
}

function getTypeLabel(pet: IPets) {
    return pet.sub_type
        ? `${pet.main_type.localized.zh} / ${pet.sub_type.localized.zh}`
        : pet.main_type.localized.zh;
}

function getEggGroupIds(pet: IPets) {
    return getPetEggGroupIds(pet);
}

function formatEggGroupSummary(pet: IPets) {
    return formatPetEggGroupSummary(pet);
}

function getStatValue(pet: IPets, key: StatColumn["key"]) {
    return pet[key];
}

function getEvolutionLabel(pet: IPets) {
    if (pet.is_leader_form) {
        return "首领形态";
    }

    if (pet.evolves_from_id === null && evolvedFromIds.value.has(pet.id)) {
        return "可进化";
    }

    if (pet.evolves_from_id === null) {
        return "基础形态";
    }

    if (evolvedFromIds.value.has(pet.id)) {
        return "进化阶段";
    }

    return "最终阶段";
}

function toggleSort(key: SortKey) {
    if (tableState.sortKey === key) {
        tableState.sortDir = tableState.sortDir === "asc" ? "desc" : "asc";
    } else {
        tableState.sortKey = key;
        tableState.sortDir = DEFAULT_SORT_DIRECTIONS[key];
    }

    tableState.currentPage = 1;
}

function goToPage(page: number) {
    tableState.currentPage = Math.min(Math.max(page, 1), pageCount.value);
}

function resetFilters() {
    Object.assign(tableState, DEFAULT_STATE);
}

function getQueryValue(value: LocationQuery[string] | undefined) {
    return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parsePositiveInteger(value: string, fallback: number) {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }

    return parsed;
}

function parsePageSize(value: string) {
    const parsed = parsePositiveInteger(value, DEFAULT_STATE.pageSize);
    return PAGE_SIZE_OPTIONS.includes(
        parsed as (typeof PAGE_SIZE_OPTIONS)[number],
    )
        ? parsed
        : DEFAULT_STATE.pageSize;
}

function parseRouteQuery(query: LocationQuery): TableState {
    const sortKeyValue = getQueryValue(query.sort);
    const sortDirValue = getQueryValue(query.dir);

    return {
        keyword: getQueryValue(query.q).trim(),
        type: getQueryValue(query.type) || DEFAULT_STATE.type,
        eggGroup: getQueryValue(query.eggGroup) || DEFAULT_STATE.eggGroup,
        style: getQueryValue(query.style) || DEFAULT_STATE.style,
        special: getQueryValue(query.special) || DEFAULT_STATE.special,
        implementation:
            parseImplementationFilter(getQueryValue(query.implementation)) ||
            DEFAULT_STATE.implementation,
        sortKey: isSortKey(sortKeyValue) ? sortKeyValue : DEFAULT_STATE.sortKey,
        sortDir: isSortDirection(sortDirValue)
            ? sortDirValue
            : DEFAULT_STATE.sortDir,
        currentPage: parsePositiveInteger(
            getQueryValue(query.page),
            DEFAULT_STATE.currentPage,
        ),
        pageSize: parsePageSize(getQueryValue(query.pageSize)),
    };
}

function buildRouteQuery(state: TableState): LocationQueryRaw {
    const query: LocationQueryRaw = {};

    if (state.keyword.trim()) {
        query.q = state.keyword.trim();
    }

    if (state.type !== DEFAULT_STATE.type) {
        query.type = state.type;
    }

    if (state.eggGroup !== DEFAULT_STATE.eggGroup) {
        query.eggGroup = state.eggGroup;
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

    if (state.sortKey !== DEFAULT_STATE.sortKey) {
        query.sort = state.sortKey;
    }

    if (state.sortDir !== DEFAULT_STATE.sortDir) {
        query.dir = state.sortDir;
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

function isSortKey(value: string): value is SortKey {
    return SORT_KEY_OPTIONS.includes(value as SortKey);
}

function isSortDirection(value: string): value is SortDirection {
    return value === "asc" || value === "desc";
}

function parseImplementationFilter(value: string) {
    return PET_IMPLEMENTATION_OPTIONS.find((option) => option.value === value)
        ?.value;
}

function isSameState(current: TableState, next: TableState) {
    return JSON.stringify(current) === JSON.stringify(next);
}

async function getPets() {
    controller?.abort();
    controller = new AbortController();
    isLoading.value = true;
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

        errorMessage.value = "表格数据加载失败，请稍后重试。";
        pets.value = [];
    } finally {
        isLoading.value = false;
    }
}

document.title = "表格 - 洛克王国工具箱";
</script>

<template>
    <section class="space-y-4">
        <Card
            class="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_20%),radial-gradient(circle_at_80%_18%,rgba(251,191,36,0.14),transparent_24%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] py-0 shadow-[0_24px_90px_-42px_rgba(0,0,0,0.92)]"
        >
            <CardHeader class="gap-4 px-4 py-4 md:px-5">
                <div
                    class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between"
                >
                    <div class="space-y-2">
                        <div class="space-y-1">
                            <CardTitle
                                class="text-2xl tracking-tight text-white md:text-3xl"
                            >
                                表格
                            </CardTitle>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
                        <div
                            v-for="item in summaryItems"
                            :key="item.label"
                            class="rounded-2xl border border-white/10 bg-white/6 px-3 py-2"
                        >
                            <p
                                class="text-[11px] tracking-[0.16em] text-slate-500 uppercase"
                            >
                                {{ item.label }}
                            </p>
                            <p class="mt-1 text-sm font-semibold text-white">
                                {{ item.value }}
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    class="grid gap-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,0.82fr))_minmax(0,0.72fr)_auto]"
                >
                    <div class="relative">
                        <Search
                            class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500"
                        />
                        <Input
                            v-model="keywordModel"
                            class="h-9 rounded-xl border-white/10 bg-white/6 pl-9 text-sm text-slate-100 placeholder:text-slate-500"
                            placeholder="搜索名称、编号、属性"
                        />
                    </div>

                    <Select v-model="typeModel">
                        <SelectTrigger
                            class="h-9 rounded-xl border-white/10 bg-white/6 text-sm text-slate-100"
                        >
                            <SelectValue placeholder="全部属性" />
                        </SelectTrigger>
                        <SelectContent>
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

                    <Select v-model="eggGroupModel">
                        <SelectTrigger
                            class="h-9 rounded-xl border-white/10 bg-white/6 text-sm text-slate-100"
                        >
                            <SelectValue placeholder="全部蛋组" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部蛋组</SelectItem>
                            <SelectItem
                                v-for="option in eggGroupOptions"
                                :key="option.value"
                                :value="option.value"
                            >
                                <Badge variant="outline"
                                    >#{{ option.value }}</Badge
                                >
                                {{ option.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select v-model="styleModel">
                        <SelectTrigger
                            class="h-9 rounded-xl border-white/10 bg-white/6 text-sm text-slate-100"
                        >
                            <SelectValue placeholder="全部定位" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部定位</SelectItem>
                            <SelectItem
                                v-for="option in attackStyleOptions"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select v-model="specialModel">
                        <SelectTrigger
                            class="h-9 rounded-xl border-white/10 bg-white/6 text-sm text-slate-100"
                        >
                            <SelectValue placeholder="全部形态" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="option in specialOptions"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select v-model="implementationModel">
                        <SelectTrigger
                            class="h-9 rounded-xl border-white/10 bg-white/6 text-sm text-slate-100"
                        >
                            <SelectValue placeholder="是否实装" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="option in PET_IMPLEMENTATION_OPTIONS"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select v-model="pageSizeModel">
                        <SelectTrigger
                            class="h-9 rounded-xl border-white/10 bg-white/6 text-sm text-slate-100"
                        >
                            <SelectValue placeholder="每页条数" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="size in PAGE_SIZE_OPTIONS"
                                :key="size"
                                :value="String(size)"
                            >
                                每页 {{ size }} 条
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        class="h-9 rounded-xl border-white/10 bg-white/6 text-slate-100 hover:bg-white/10"
                        :disabled="!hasActiveFilters"
                        @click="resetFilters"
                    >
                        <RotateCcw class="h-4 w-4" />
                        重置
                    </Button>
                </div>
            </CardHeader>
        </Card>
        <Income />
        <div v-if="isLoading" class="space-y-2">
            <Skeleton
                v-for="index in 8"
                :key="index"
                class="h-14 rounded-2xl border border-white/10 bg-white/6"
            />
        </div>

        <div
            v-else-if="errorMessage"
            class="rounded-3xl border border-destructive/20 bg-destructive/8 px-4 py-8 text-center text-sm text-destructive"
        >
            {{ errorMessage }}
        </div>

        <Card v-else class="border-white/10 bg-black/20 shadow-sm">
            <CardHeader class="gap-3 pb-3">
                <div
                    class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                >
                    <div>
                        <CardTitle class="text-white">精灵表格</CardTitle>
                        <CardDescription class="text-slate-400">
                            当前显示第 {{ currentRangeStart }}-{{
                                currentRangeEnd
                            }}
                            条，共 {{ sortedPets.length }} 条结果。
                        </CardDescription>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            class="rounded-full border-white/10 bg-white/5 text-slate-300"
                        >
                            <Filter class="h-3.5 w-3.5" />
                            {{ hasActiveFilters ? "已启用筛选" : "全部数据" }}
                        </Badge>
                        <Badge
                            variant="outline"
                            class="rounded-full border-white/10 bg-white/5 text-slate-300"
                        >
                            {{ sortLabels[tableState.sortKey] }}
                            {{ tableState.sortDir === "asc" ? "升序" : "降序" }}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent class="space-y-0 p-0">
                <div
                    class="mx-4 overflow-hidden rounded-2xl border border-white/10"
                >
                    <UiTable class="min-w-345 text-xs md:text-sm">
                        <TableHeader class="bg-white/6">
                            <TableRow class="hover:bg-white/6">
                                <TableHead class="w-23">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="-mx-2 h-7 px-2 text-xs font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
                                        @click="toggleSort('id')"
                                    >
                                        编号
                                        <ArrowUp
                                            v-if="
                                                tableState.sortKey === 'id' &&
                                                tableState.sortDir === 'asc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowDown
                                            v-else-if="
                                                tableState.sortKey === 'id' &&
                                                tableState.sortDir === 'desc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowUpDown
                                            v-else
                                            class="h-3.5 w-3.5 opacity-70"
                                        />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="-mx-2 h-7 px-2 text-xs font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
                                        @click="toggleSort('name')"
                                    >
                                        精灵
                                        <ArrowUp
                                            v-if="
                                                tableState.sortKey === 'name' &&
                                                tableState.sortDir === 'asc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowDown
                                            v-else-if="
                                                tableState.sortKey === 'name' &&
                                                tableState.sortDir === 'desc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowUpDown
                                            v-else
                                            class="h-3.5 w-3.5 opacity-70"
                                        />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="-mx-2 h-7 px-2 text-xs font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
                                        @click="toggleSort('eggGroup')"
                                    >
                                        蛋组
                                        <ArrowUp
                                            v-if="
                                                tableState.sortKey ===
                                                    'eggGroup' &&
                                                tableState.sortDir === 'asc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowDown
                                            v-else-if="
                                                tableState.sortKey ===
                                                    'eggGroup' &&
                                                tableState.sortDir === 'desc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowUpDown
                                            v-else
                                            class="h-3.5 w-3.5 opacity-70"
                                        />
                                    </Button>
                                </TableHead>
                                <TableHead class="hidden lg:table-cell">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="-mx-2 h-7 px-2 text-xs font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
                                        @click="toggleSort('type')"
                                    >
                                        属性
                                        <ArrowUp
                                            v-if="
                                                tableState.sortKey === 'type' &&
                                                tableState.sortDir === 'asc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowDown
                                            v-else-if="
                                                tableState.sortKey === 'type' &&
                                                tableState.sortDir === 'desc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowUpDown
                                            v-else
                                            class="h-3.5 w-3.5 opacity-70"
                                        />
                                    </Button>
                                </TableHead>
                                <TableHead class="hidden md:table-cell">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="-mx-2 h-7 px-2 text-xs font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
                                        @click="toggleSort('attackStyle')"
                                    >
                                        定位
                                        <ArrowUp
                                            v-if="
                                                tableState.sortKey ===
                                                    'attackStyle' &&
                                                tableState.sortDir === 'asc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowDown
                                            v-else-if="
                                                tableState.sortKey ===
                                                    'attackStyle' &&
                                                tableState.sortDir === 'desc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowUpDown
                                            v-else
                                            class="h-3.5 w-3.5 opacity-70"
                                        />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="-mx-2 h-7 px-2 text-xs font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
                                        @click="toggleSort('totalStats')"
                                    >
                                        总值
                                        <ArrowUp
                                            v-if="
                                                tableState.sortKey ===
                                                    'totalStats' &&
                                                tableState.sortDir === 'asc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowDown
                                            v-else-if="
                                                tableState.sortKey ===
                                                    'totalStats' &&
                                                tableState.sortDir === 'desc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowUpDown
                                            v-else
                                            class="h-3.5 w-3.5 opacity-70"
                                        />
                                    </Button>
                                </TableHead>
                                <TableHead
                                    v-for="column in statColumns"
                                    :key="column.key"
                                    class="text-right"
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="-mx-2 h-7 px-2 text-xs font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
                                        @click="toggleSort(column.sortKey)"
                                    >
                                        {{ column.label }}
                                        <ArrowUp
                                            v-if="
                                                tableState.sortKey ===
                                                    column.sortKey &&
                                                tableState.sortDir === 'asc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowDown
                                            v-else-if="
                                                tableState.sortKey ===
                                                    column.sortKey &&
                                                tableState.sortDir === 'desc'
                                            "
                                            class="h-3.5 w-3.5"
                                        />
                                        <ArrowUpDown
                                            v-else
                                            class="h-3.5 w-3.5 opacity-70"
                                        />
                                    </Button>
                                </TableHead>
                                <TableHead class="w-24 text-right"
                                    >详情</TableHead
                                >
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            <TableRow
                                v-if="!paginatedPets.length"
                                class="hover:bg-transparent"
                            >
                                <TableCell
                                    colspan="13"
                                    class="px-4 py-12 text-center text-sm text-slate-400"
                                >
                                    没有匹配结果，调整筛选条件后再试。
                                </TableCell>
                            </TableRow>

                            <TableRow
                                v-for="pet in paginatedPets"
                                :key="pet.id"
                                class="border-white/8"
                            >
                                <TableCell class="font-medium text-slate-200">
                                    <div class="leading-tight">
                                        <div class="text-sm text-white">
                                            #{{ pet.id }}
                                        </div>
                                        <div
                                            class="mt-1 text-[11px] text-slate-500"
                                        >
                                            {{ pet.form || "默认" }}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div
                                        class="flex min-w-0 items-center gap-3"
                                    >
                                        <FriendPortrait
                                            :name="pet.name"
                                            :alt="pet.localized.zh.name"
                                            class="h-11 w-11 shrink-0 rounded-2xl"
                                            img-class="object-contain p-1.5"
                                        />

                                        <div class="min-w-0 space-y-1">
                                            <RouterLink
                                                :to="`/pets/${pet.id}`"
                                                class="block truncate text-sm font-semibold text-white transition-colors hover:text-sky-300"
                                            >
                                                {{ pet.localized.zh.name }}
                                            </RouterLink>
                                            <p
                                                class="truncate text-[11px] text-slate-500"
                                            >
                                                {{ pet.name }}
                                            </p>
                                            <Badge
                                                v-if="!isPetImplemented(pet)"
                                                variant="outline"
                                                class="rounded-full border-amber-300/20 bg-amber-300/10 px-1.5 py-0 text-[10px] text-amber-100"
                                            >
                                                未实装
                                            </Badge>
                                            <div
                                                class="flex flex-wrap gap-1.5 lg:hidden"
                                            >
                                                <Badge
                                                    class="rounded-full bg-white/10 px-1.5 py-0 text-[10px] text-slate-200"
                                                >
                                                    {{
                                                        pet.main_type.localized
                                                            .zh
                                                    }}
                                                </Badge>
                                                <Badge
                                                    v-if="pet.sub_type"
                                                    variant="secondary"
                                                    class="rounded-full bg-slate-700/70 px-1.5 py-0 text-[10px] text-slate-100"
                                                >
                                                    {{
                                                        pet.sub_type.localized
                                                            .zh
                                                    }}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div
                                        class="flex max-w-40 flex-wrap gap-1.5"
                                    >
                                        <Badge
                                            v-for="groupId in getEggGroupIds(
                                                pet,
                                            )"
                                            :key="`${pet.id}-${groupId}`"
                                            variant="outline"
                                            class="rounded-full border-white/10 bg-black/20 text-slate-300 cursor-pointer hover:bg-white/10"
                                            @click="
                                                tableState.eggGroup =
                                                    groupId.toString()
                                            "
                                        >
                                            #{{ groupId }}
                                            {{ formatEggGroup(groupId) }}
                                        </Badge>
                                        <span
                                            v-if="!getEggGroupIds(pet).length"
                                            class="inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[11px] text-amber-100"
                                        >
                                            未实装
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell class="hidden lg:table-cell">
                                    <div class="flex flex-wrap gap-1.5">
                                        <Badge
                                            class="rounded-full bg-white/10 text-slate-100 cursor-pointer hover:bg-white/10"
                                            @click="
                                                tableState.type =
                                                    pet.main_type.id.toString()
                                            "
                                        >
                                            {{ pet.main_type.localized.zh }}
                                        </Badge>
                                        <Badge
                                            v-if="pet.sub_type"
                                            variant="secondary"
                                            class="rounded-full bg-slate-700/70 text-slate-100 cursor-pointer hover:bg-white/10"
                                            @click="
                                                tableState.type =
                                                    pet.sub_type.id.toString()
                                            "
                                        >
                                            {{ pet.sub_type.localized.zh }}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            class="rounded-full border-white/10 bg-black/20 text-slate-300"
                                        >
                                            {{
                                                pet.default_legacy_type
                                                    .localized.zh
                                            }}遗传
                                        </Badge>
                                    </div>
                                </TableCell>

                                <TableCell class="hidden md:table-cell">
                                    <div class="space-y-1 leading-tight">
                                        <div
                                            class="text-sm font-medium text-slate-200"
                                        >
                                            {{
                                                getAttackStyleLabel(
                                                    pet.preferred_attack_style,
                                                )
                                            }}
                                        </div>
                                        <div class="flex flex-wrap gap-1.5">
                                            <Badge
                                                variant="outline"
                                                class="rounded-full border-white/10 bg-black/20 text-slate-300"
                                            >
                                                {{ getEvolutionLabel(pet) }}
                                            </Badge>
                                            <Badge
                                                v-if="pet.is_leader_form"
                                                class="rounded-full border-0 bg-amber-400/15 text-amber-200"
                                            >
                                                首领
                                            </Badge>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div class="space-y-1 leading-tight">
                                        <div
                                            class="text-sm font-semibold text-white"
                                        >
                                            {{ getTotalStats(pet) }}
                                        </div>
                                        <div class="text-[11px] text-slate-500">
                                            峰值 {{ getPeakStat(pet).label }}
                                            {{ getPeakStat(pet).value }}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell
                                    v-for="column in statColumns"
                                    :key="column.key"
                                    class="text-right text-sm font-medium text-slate-200"
                                >
                                    {{ getStatValue(pet, column.key) }}
                                </TableCell>

                                <TableCell class="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                                        as-child
                                    >
                                        <RouterLink :to="`/pets/${pet.id}`"
                                            >查看</RouterLink
                                        >
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </UiTable>
                </div>

                <div
                    class="flex flex-col gap-3 border-t border-white/10 px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                    <p class="text-xs text-slate-400">
                        第 {{ tableState.currentPage }} 页，共
                        {{ pageCount }} 页；显示 {{ currentRangeStart }}-{{
                            currentRangeEnd
                        }}
                        / {{ sortedPets.length }}。
                    </p>

                    <div class="flex flex-wrap items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="icon-sm"
                            class="rounded-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                            :disabled="tableState.currentPage === 1"
                            @click="goToPage(1)"
                        >
                            <ChevronsLeft class="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            class="rounded-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                            :disabled="tableState.currentPage === 1"
                            @click="goToPage(tableState.currentPage - 1)"
                        >
                            <ChevronLeft class="h-3.5 w-3.5" />
                        </Button>

                        <template v-for="item in pageItems" :key="item.key">
                            <span
                                v-if="item.kind === 'ellipsis'"
                                class="px-1 text-xs text-slate-500"
                            >
                                ...
                            </span>
                            <Button
                                v-else
                                variant="outline"
                                size="sm"
                                class="min-w-9 rounded-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                                :class="
                                    item.value === tableState.currentPage
                                        ? 'border-sky-400/40 bg-sky-400/12 text-sky-100'
                                        : ''
                                "
                                @click="goToPage(item.value || 1)"
                            >
                                {{ item.value }}
                            </Button>
                        </template>

                        <Button
                            variant="outline"
                            size="icon-sm"
                            class="rounded-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                            :disabled="tableState.currentPage === pageCount"
                            @click="goToPage(tableState.currentPage + 1)"
                        >
                            <ChevronRight class="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            class="rounded-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                            :disabled="tableState.currentPage === pageCount"
                            @click="goToPage(pageCount)"
                        >
                            <ChevronsRight class="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </section>
</template>

<style scoped></style>
