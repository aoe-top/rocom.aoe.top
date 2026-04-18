<script setup lang="ts">
import { RadarChart, type RadarSeriesOption } from "echarts/charts";
import {
    RadarComponent,
    TooltipComponent,
    type RadarComponentOption,
    type TooltipComponentOption,
} from "echarts/components";
import { init, use, type ComposeOption, type ECharts } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    Check,
    Crown,
    Egg,
    ListTodo,
    MapPin,
    Ruler,
    Sparkles,
    WandSparkles,
} from "lucide-vue-next";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import FriendPortrait from "@/components/FriendPortrait.vue";
import type {
    IPets,
    IPetsDetail,
    IPetsMove,
    IMonsterTypeDetail,
} from "@/lib/interface";
import {
    formatPetEggGroupSummary,
    isPetImplemented,
} from "@/lib/petImplementation";

use([RadarChart, RadarComponent, TooltipComponent, CanvasRenderer]);

type StatRadarOption = ComposeOption<
    RadarComponentOption | RadarSeriesOption | TooltipComponentOption
>;

interface IPetHandbookTopic {
    topic_Id: number;
    topic_type: number;
    topic_desc: string;
    topic_cnt: number;
    topic_reward: number;
    topic_data_1?: number[];
}

interface IPetHandbookRow {
    id?: number;
    name?: string;
    pet_topic?: IPetHandbookTopic[];
}

interface IPetHandbookResponse {
    RocoDataRows?: Record<string, IPetHandbookRow>;
}

type PetTopicCompletionMap = Record<number, string>;

let petHandbookTopicMapPromise: Promise<
    Record<string, IPetHandbookTopic[]>
> | null = null;

const route = useRoute();

const routeId = computed(() => {
    const params = route.params as { id?: string | string[] };
    return params.id ?? "";
});

const friend = ref<IPetsDetail | null>(null);
const isLoading = ref(false);
const errorMessage = ref("");
const petTopics = ref<IPetHandbookTopic[]>([]);
const isPetTopicLoading = ref(false);
const petTopicErrorMessage = ref("");
const petTopicCompletionMap = ref<PetTopicCompletionMap>({});
const petTopicLookupKey = ref("");
const petTopicDialogOpen = ref(false);
const typeNameMap = ref<Record<number, string>>({});
const implementedPetIds = ref<Set<number>>(new Set());
const moveDictionary = ref<Record<number, IPetsMove>>({});
const radarChartRef = ref<HTMLDivElement | null>(null);

let controller: AbortController | null = null;
let petTopicRequestKey = 0;
let statChart: ECharts | null = null;
let statChartResizeObserver: ResizeObserver | null = null;
let statChartObservedElement: HTMLDivElement | null = null;

const PET_TOPIC_COOKIE_PREFIX = "rocom_pet_topics";
const PET_TOPIC_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
const STAT_CHART_SPLIT_NUMBER = 4;
const STAT_CHART_STEP = 40;

const attackStyleLabels: Record<string, string> = {
    Both: "双修",
    Magic: "魔攻",
    Magical: "魔攻",
    Physical: "物攻",
};

const categoryLabels: Record<string, string> = {
    Defense: "防御",
    "Magic Attack": "魔法输出",
    "Physical Attack": "物理输出",
    Status: "状态",
};

const statRows = computed(() => {
    if (!friend.value) {
        return [];
    }

    return [
        {
            key: "base_hp",
            label: "生命",
            value: friend.value.base_hp,
        },
        {
            key: "base_phy_atk",
            label: "物攻",
            value: friend.value.base_phy_atk,
        },
        {
            key: "base_mag_atk",
            label: "魔攻",
            value: friend.value.base_mag_atk,
        },
        {
            key: "base_phy_def",
            label: "物防",
            value: friend.value.base_phy_def,
        },
        {
            key: "base_mag_def",
            label: "魔防",
            value: friend.value.base_mag_def,
        },
        {
            key: "base_spd",
            label: "速度",
            value: friend.value.base_spd,
        },
    ];
});

const statMax = computed(() => {
    return Math.max(120, ...statRows.value.map((stat) => stat.value));
});

const statChartMax = computed(() => {
    return Math.max(
        120,
        Math.ceil(statMax.value / STAT_CHART_STEP) * STAT_CHART_STEP,
    );
});

const statChartIndicators = computed(() => {
    return statRows.value.map((stat) => ({
        name: stat.label,
        max: statChartMax.value,
    }));
});

const statChartValues = computed(() => {
    return statRows.value.map((stat) => stat.value);
});

const totalStats = computed(() => {
    return statRows.value.reduce((sum, stat) => sum + stat.value, 0);
});

const highestStat = computed(() => {
    return (
        [...statRows.value].sort(
            (left, right) => right.value - left.value,
        )[0] ?? {
            key: "base_hp",
            label: "生命",
            value: 0,
        }
    );
});

const moveCoverageTypes = computed(() => {
    if (!friend.value) {
        return [];
    }

    const coverage = new Map<number, string>();

    for (const move of [
        ...friend.value.move_pool,
        ...friend.value.move_stones,
    ]) {
        coverage.set(move.move_type.id, move.move_type.localized.zh);
    }

    return Array.from(coverage.entries()).map(([id, label]) => ({
        id,
        label,
    }));
});

const moveSummary = computed(() => {
    if (!friend.value) {
        return [];
    }

    const categoryCount = new Map<string, number>();

    for (const move of [
        ...friend.value.move_pool,
        ...friend.value.move_stones,
    ]) {
        categoryCount.set(
            move.move_category,
            (categoryCount.get(move.move_category) ?? 0) + 1,
        );
    }

    return Array.from(categoryCount.entries())
        .map(([category, count]) => ({
            category,
            count,
            label: categoryLabels[category] ?? category,
        }))
        .sort((left, right) => right.count - left.count);
});

const strongestMoves = computed(() => {
    if (!friend.value) {
        return [];
    }

    return [...friend.value.move_pool, ...friend.value.move_stones]
        .filter((move) => typeof move.power === "number")
        .sort((left, right) => (right.power ?? 0) - (left.power ?? 0))
        .slice(0, 5);
});

const legacyTypeEntries = computed(() => {
    if (!friend.value) {
        return [];
    }

    return friend.value.legacy_moves
        .map((item) => ({
            ...item,
            label: typeNameMap.value[item.type_id] ?? `系别 ${item.type_id}`,
            move: moveDictionary.value[item.move_id] ?? null,
        }))
        .sort((left, right) => left.type_id - right.type_id);
});

const evolutionStages = computed(() => {
    return friend.value?.evolution_tree.stages ?? [];
});

const worldProfile = computed(() => {
    return friend.value?.world_profile ?? null;
});

const breedingInfo = computed(() => {
    return friend.value?.breeding ?? null;
});

const eggGroupSummaryLabel = computed(() => {
    if (!friend.value) {
        return "暂无数据";
    }

    return formatPetEggGroupSummary(friend.value);
});

const completedPetTopicCount = computed(() => {
    return petTopics.value.filter((topic) => {
        return Boolean(petTopicCompletionMap.value[topic.topic_Id]);
    }).length;
});

const petTopicCompletionRate = computed(() => {
    if (!petTopics.value.length) {
        return 0;
    }

    return Math.round(
        (completedPetTopicCount.value / petTopics.value.length) * 100,
    );
});

const petTopicLastRecordedLabel = computed(() => {
    const recordedAt = Object.values(petTopicCompletionMap.value)
        .map((value) => new Date(value).getTime())
        .filter((value) => !Number.isNaN(value));

    if (!recordedAt.length) {
        return "尚未记录";
    }

    return formatRecordDate(new Date(Math.max(...recordedAt)).toISOString());
});

const refreshLocations = computed(() => {
    return worldProfile.value?.refresh_locations ?? [];
});

const worldTypeLabel = computed(() => {
    return (
        worldProfile.value?.type_desc ??
        worldProfile.value?.classis_name ??
        "暂无类型数据"
    );
});

const introductionText = computed(() => {
    return worldProfile.value?.introduction ?? "暂无图鉴介绍。";
});

const habitatSummary = computed(() => {
    if (worldProfile.value?.description_habitat) {
        return worldProfile.value.description_habitat;
    }

    if (refreshLocations.value.length) {
        return `常见于${refreshLocations.value.join("、")}`;
    }

    return "暂无栖息地信息。";
});

const hatchDurationLabel = computed(() => {
    return formatDuration(breedingInfo.value?.hatch_data ?? null);
});

const heightRangeLabel = computed(() => {
    return formatRange(
        breedingInfo.value?.height_low ?? null,
        breedingInfo.value?.height_high ?? null,
        "cm",
    );
});

const weightRangeLabel = computed(() => {
    return formatRange(
        normalizeWeight(breedingInfo.value?.weight_low),
        normalizeWeight(breedingInfo.value?.weight_high),
        "kg",
    );
});

watch(
    routeId,
    (id) => {
        void getFriendDetail(id);
    },
    { immediate: true },
);

watch([statChartIndicators, statChartValues], async () => {
    await nextTick();
    renderStatChart();
});

watch(
    radarChartRef,
    async (element) => {
        if (!element) {
            disposeStatChart();
            return;
        }

        bindStatChartObserver(element);
        await nextTick();
        renderStatChart();
    },
    { flush: "post" },
);

onBeforeUnmount(() => {
    controller?.abort();
    disposeStatChart();
});

function getAttackStyleLabel(style: string) {
    return attackStyleLabels[style] ?? style;
}

function isEvolutionMonsterImplemented(monsterId: number) {
    return implementedPetIds.value.has(monsterId);
}

function getCategoryLabel(category: string) {
    return categoryLabels[category] ?? category;
}

function getEnergyLabel(move: IPetsMove) {
    return `${move.energy_cost} 能量`;
}

function getPowerLabel(move: IPetsMove) {
    return move.power === null ? "-" : String(move.power);
}

function formatDuration(seconds: number | null) {
    if (seconds === null || seconds <= 0) {
        return "暂无数据";
    }

    if (seconds % 86400 === 0) {
        return `${seconds / 86400} 天`;
    }

    const hours = seconds / 3600;

    if (Number.isInteger(hours)) {
        return `${hours} 小时`;
    }

    return `${hours.toFixed(1)} 小时`;
}

function formatRange(low: number | null, high: number | null, unit: string) {
    if (low === null && high === null) {
        return "暂无数据";
    }

    if (low !== null && high !== null) {
        return low === high ? `${low}${unit}` : `${low}-${high}${unit}`;
    }

    return `${low ?? high}${unit}`;
}

function normalizeWeight(value: number | null | undefined) {
    if (value === null || value === undefined) {
        return null;
    }

    return value / 1000;
}

function parsePetId(idParam: string | string[]) {
    const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

    return Number.isFinite(id) ? id : null;
}

function formatRecordDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "尚未记录";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function normalizePetTopicLookupKey(value: string | null | undefined) {
    if (!value) {
        return "";
    }

    return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function getPetTopicLookupKeys(pet: IPetsDetail) {
    return Array.from(
        new Set(
            [pet.localized.zh.name, pet.species.localized.zh, pet.name]
                .map((value) => normalizePetTopicLookupKey(value))
                .filter(Boolean),
        ),
    );
}

function getPetTopicCookieName(lookupKey: string) {
    return `${PET_TOPIC_COOKIE_PREFIX}_${lookupKey}`;
}

function readCookie(name: string) {
    if (typeof document === "undefined") {
        return null;
    }

    const encodedName = encodeURIComponent(name);
    const entry = document.cookie
        .split("; ")
        .find((item) => item.startsWith(`${encodedName}=`));

    if (!entry) {
        return null;
    }

    return decodeURIComponent(entry.slice(encodedName.length + 1));
}

function writeCookie(name: string, value: string) {
    if (typeof document === "undefined") {
        return;
    }

    document.cookie = [
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
        "path=/",
        `max-age=${PET_TOPIC_COOKIE_MAX_AGE}`,
        "SameSite=Lax",
    ].join("; ");
}

function normalizePetTopicCompletionMap(
    value: unknown,
    topics: IPetHandbookTopic[],
) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    const topicIds = new Set(topics.map((topic) => topic.topic_Id));
    const entries = Object.entries(value as Record<string, unknown>).filter(
        ([topicId, recordedAt]) => {
            return (
                topicIds.has(Number(topicId)) &&
                typeof recordedAt === "string" &&
                !Number.isNaN(new Date(recordedAt).getTime())
            );
        },
    );

    return Object.fromEntries(
        entries.map(([topicId, recordedAt]) => [Number(topicId), recordedAt]),
    ) as PetTopicCompletionMap;
}

function readPetTopicCompletionMap(
    lookupKeys: string[],
    topics: IPetHandbookTopic[],
) {
    for (const lookupKey of lookupKeys) {
        const rawValue = readCookie(getPetTopicCookieName(lookupKey));

        if (!rawValue) {
            continue;
        }

        try {
            return normalizePetTopicCompletionMap(JSON.parse(rawValue), topics);
        } catch {
            continue;
        }
    }

    return {};
}

function persistPetTopicCompletionMap() {
    if (!petTopicLookupKey.value) {
        return;
    }

    const payload = petTopics.value.reduce<PetTopicCompletionMap>(
        (record, topic) => {
            const recordedAt = petTopicCompletionMap.value[topic.topic_Id];

            if (recordedAt) {
                record[topic.topic_Id] = recordedAt;
            }

            return record;
        },
        {},
    );

    writeCookie(
        getPetTopicCookieName(petTopicLookupKey.value),
        JSON.stringify(payload),
    );
}

function isPetTopicCompleted(topicId: number) {
    return Boolean(petTopicCompletionMap.value[topicId]);
}

function getPetTopicRecordedLabel(topicId: number) {
    const recordedAt = petTopicCompletionMap.value[topicId];

    return recordedAt ? formatRecordDate(recordedAt) : "";
}

function handlePetTopicChange(topicId: number, event: Event) {
    if (!petTopicLookupKey.value) {
        return;
    }

    const isCompleted = (event.target as HTMLInputElement).checked;
    const nextState = { ...petTopicCompletionMap.value };

    if (isCompleted) {
        nextState[topicId] = new Date().toISOString();
    } else {
        delete nextState[topicId];
    }

    petTopicCompletionMap.value = nextState;
    persistPetTopicCompletionMap();
}

async function ensurePetHandbookTopicMap() {
    if (!petHandbookTopicMapPromise) {
        petHandbookTopicMapPromise = fetch("/data/tables/PET_HANDBOOK.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`请求失败: ${response.status}`);
                }

                return response.json() as Promise<IPetHandbookResponse>;
            })
            .then((data) => {
                const topicMap: Record<string, IPetHandbookTopic[]> = {};

                for (const row of Object.values(data.RocoDataRows ?? {})) {
                    const lookupKey = normalizePetTopicLookupKey(row.name);

                    if (!lookupKey) {
                        continue;
                    }

                    topicMap[lookupKey] = Array.isArray(row.pet_topic)
                        ? row.pet_topic
                        : [];
                }

                return topicMap;
            })
            .catch((error) => {
                petHandbookTopicMapPromise = null;
                throw error;
            });
    }

    return petHandbookTopicMapPromise;
}

function resetPetTopics() {
    petTopicRequestKey += 1;
    petTopics.value = [];
    petTopicCompletionMap.value = {};
    petTopicLookupKey.value = "";
    petTopicDialogOpen.value = false;
    petTopicErrorMessage.value = "";
    isPetTopicLoading.value = false;
}

async function getPetTopics(pet: IPetsDetail, legacyPetId: number) {
    const requestKey = ++petTopicRequestKey;
    isPetTopicLoading.value = true;
    petTopicErrorMessage.value = "";

    try {
        const topicMap = await ensurePetHandbookTopicMap();
        const lookupKeys = getPetTopicLookupKeys(pet);

        if (requestKey !== petTopicRequestKey) {
            return;
        }

        const matchedLookupKey =
            lookupKeys.find((lookupKey) => lookupKey in topicMap) ?? "";

        petTopicLookupKey.value = matchedLookupKey;
        petTopics.value = matchedLookupKey
            ? (topicMap[matchedLookupKey] ?? [])
            : [];
        petTopicCompletionMap.value = readPetTopicCompletionMap(
            matchedLookupKey
                ? [matchedLookupKey, String(legacyPetId)]
                : [String(legacyPetId)],
            petTopics.value,
        );
    } catch {
        if (requestKey !== petTopicRequestKey) {
            return;
        }

        resetPetTopics();
        petTopicErrorMessage.value = "图鉴任务加载失败，请稍后重试。";
    } finally {
        if (requestKey === petTopicRequestKey) {
            isPetTopicLoading.value = false;
        }
    }
}

function bindStatChartObserver(element: HTMLDivElement) {
    if (typeof ResizeObserver === "undefined") {
        return;
    }

    if (!statChartResizeObserver) {
        statChartResizeObserver = new ResizeObserver(() => {
            statChart?.resize();
        });
    }

    if (statChartObservedElement === element) {
        return;
    }

    statChartResizeObserver.disconnect();
    statChartResizeObserver.observe(element);
    statChartObservedElement = element;
}

function disposeStatChart() {
    statChartResizeObserver?.disconnect();
    statChartObservedElement = null;
    statChart?.dispose();
    statChart = null;
}

function ensureStatChart() {
    const chartElement = radarChartRef.value;

    if (!chartElement) {
        return null;
    }

    if (statChart && statChart.getDom() !== chartElement) {
        statChart.dispose();
        statChart = null;
    }

    if (!statChart) {
        statChart = init(chartElement, undefined, {
            renderer: "canvas",
        });
    }

    return statChart;
}

function getStatChartOption(): StatRadarOption {
    return {
        animationDuration: 280,
        tooltip: {
            trigger: "item",
            backgroundColor: "rgba(2, 6, 23, 0.96)",
            borderColor: "rgba(148, 163, 184, 0.16)",
            textStyle: {
                color: "#e2e8f0",
                fontSize: 12,
            },
            formatter: () => {
                return statRows.value
                    .map((stat) => `${stat.label}: ${stat.value}`)
                    .join("<br />");
            },
        },
        radar: {
            center: ["50%", "52%"],
            radius: "64%",
            shape: "polygon",
            splitNumber: STAT_CHART_SPLIT_NUMBER,
            indicator: statChartIndicators.value,
            axisName: {
                color: "#cbd5e1",
                fontSize: 11,
                formatter(name?: string) {
                    if (!name) {
                        return "";
                    }

                    const stat = statRows.value.find(
                        (item) => item.label === name,
                    );

                    if (!stat) {
                        return name;
                    }

                    return `{label|${name}}\n{value|${stat.value}}`;
                },
                rich: {
                    label: {
                        color: "#e2e8f0",
                        fontSize: 11,
                        fontWeight: 600,
                        lineHeight: 14,
                    },
                    value: {
                        color: "#64748b",
                        fontSize: 10,
                        fontWeight: 500,
                        lineHeight: 12,
                    },
                },
            },
            splitArea: {
                areaStyle: {
                    color: [
                        "rgba(15, 23, 42, 0.18)",
                        "rgba(15, 23, 42, 0.28)",
                        "rgba(15, 23, 42, 0.38)",
                        "rgba(15, 23, 42, 0.5)",
                    ],
                },
            },
            splitLine: {
                lineStyle: {
                    color: "rgba(148, 163, 184, 0.18)",
                },
            },
            axisLine: {
                lineStyle: {
                    color: "rgba(148, 163, 184, 0.16)",
                },
            },
        },
        series: [
            {
                type: "radar",
                symbol: "circle",
                symbolSize: 6,
                emphasis: {
                    lineStyle: {
                        width: 2,
                    },
                },
                itemStyle: {
                    color: "#fbbf24",
                    borderColor: "rgba(255,255,255,0.86)",
                    borderWidth: 1,
                },
                lineStyle: {
                    color: "#fbbf24",
                    width: 2,
                },
                areaStyle: {
                    color: "rgba(251, 191, 36, 0.18)",
                },
                data: [
                    {
                        value: statChartValues.value,
                    },
                ],
            },
        ],
    };
}

function renderStatChart() {
    if (!statRows.value.length) {
        statChart?.clear();
        return;
    }

    const chart = ensureStatChart();

    if (!chart) {
        return;
    }

    chart.setOption(getStatChartOption(), true);
    chart.resize();
}

async function ensureTypeMap(signal: AbortSignal) {
    if (Object.keys(typeNameMap.value).length > 0) {
        return;
    }

    const response = await fetch("/data/types.json", { signal });

    if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
    }

    const types = (await response.json()) as IMonsterTypeDetail[];
    typeNameMap.value = Object.fromEntries(
        types.map((type) => [type.id, type.localized.zh]),
    );
}

async function ensureImplementedPetIds(signal: AbortSignal) {
    if (implementedPetIds.value.size > 0) {
        return;
    }

    const response = await fetch("/data/Pets.json", { signal });

    if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
    }

    const pets = (await response.json()) as IPets[];
    implementedPetIds.value = new Set(
        pets.filter((pet) => isPetImplemented(pet)).map((pet) => pet.id),
    );
}

async function ensureMoveDictionary(signal: AbortSignal) {
    if (Object.keys(moveDictionary.value).length > 0) {
        return;
    }

    const response = await fetch("/data/moves.json", { signal });

    if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
    }

    const moves = (await response.json()) as IPetsMove[];
    moveDictionary.value = Object.fromEntries(
        moves.map((move) => [move.id, move]),
    );
}

async function getFriendDetail(idParam: string | string[]) {
    const id = parsePetId(idParam);

    if (id === null) {
        errorMessage.value = "精灵编号无效。";
        friend.value = null;
        resetPetTopics();
        return;
    }

    controller?.abort();
    controller = new AbortController();
    isLoading.value = true;
    errorMessage.value = "";

    try {
        await Promise.all([
            ensureTypeMap(controller.signal),
            ensureImplementedPetIds(controller.signal),
            ensureMoveDictionary(controller.signal),
        ]);

        const response = await fetch(`/data/pets/${id}.json`, {
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        const nextFriend = (await response.json()) as IPetsDetail;
        friend.value = nextFriend;
        void getPetTopics(nextFriend, id);
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return;
        }

        errorMessage.value = "精灵详情加载失败，请稍后重试。";
        friend.value = null;
        resetPetTopics();
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <section class="space-y-4">
        <div v-if="isLoading" class="grid gap-4 xl:grid-cols-[260px_1fr]">
            <div class="space-y-4">
                <Skeleton
                    class="aspect-square rounded-3xl border border-white/10 bg-white/6"
                />
                <Skeleton
                    class="min-h-64 rounded-3xl border border-white/10 bg-white/6"
                />
            </div>
            <Skeleton
                class="min-h-72 rounded-3xl border border-white/10 bg-white/6"
            />
        </div>

        <div
            v-else-if="errorMessage"
            class="rounded-3xl border border-destructive/20 bg-destructive/8 px-4 py-8 text-center text-sm text-destructive"
        >
            {{ errorMessage }}
        </div>

        <template v-else-if="friend">
            <Card
                class="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] py-0 shadow-[0_20px_60px_-36px_rgba(0,0,0,0.85)]"
            >
                <div class="grid gap-4 p-4 xl:grid-cols-[260px_1fr]">
                    <div class="space-y-4">
                        <FriendPortrait
                            :name="friend.name"
                            :alt="friend.localized.zh.name"
                            class="aspect-square w-full rounded-3xl"
                            img-class="object-contain p-4"
                            eager
                        />

                        <div
                            class="rounded-3xl border border-white/10 bg-black/20 p-4"
                        >
                            <p
                                class="flex items-center gap-2 text-[11px] tracking-[0.18em] text-slate-500 uppercase"
                            >
                                <ListTodo class="h-3.5 w-3.5 text-amber-300" />
                                图鉴任务
                            </p>

                            <div
                                v-if="isPetTopicLoading"
                                class="mt-3 space-y-2.5"
                            >
                                <Skeleton
                                    class="h-20 rounded-2xl border border-white/10 bg-white/6"
                                />
                                <Skeleton
                                    class="h-16 rounded-2xl border border-white/10 bg-white/6"
                                />
                                <Skeleton
                                    class="h-16 rounded-2xl border border-white/10 bg-white/6"
                                />
                            </div>

                            <div
                                v-else-if="petTopicErrorMessage"
                                class="mt-3 rounded-2xl border border-destructive/20 bg-destructive/8 px-3 py-4 text-sm text-destructive"
                            >
                                {{ petTopicErrorMessage }}
                            </div>

                            <template v-else-if="petTopics.length">
                                <div
                                    class="mt-3 rounded-2xl border border-white/10 bg-white/6 p-3"
                                >
                                    <div
                                        class="flex items-end justify-between gap-3"
                                    >
                                        <div>
                                            <p
                                                class="text-[11px] tracking-[0.14em] text-slate-500 uppercase"
                                            >
                                                完成进度
                                            </p>
                                            <p
                                                class="mt-1 text-lg font-semibold text-white"
                                            >
                                                {{ completedPetTopicCount }}/{{
                                                    petTopics.length
                                                }}
                                            </p>
                                        </div>
                                        <p
                                            class="text-2xl font-semibold text-emerald-200"
                                        >
                                            {{ petTopicCompletionRate }}%
                                        </p>
                                    </div>

                                    <div
                                        class="mt-3 h-2 overflow-hidden rounded-full bg-white/8"
                                    >
                                        <div
                                            class="h-full rounded-full bg-[linear-gradient(90deg,rgba(74,222,128,0.65),rgba(16,185,129,0.95))] transition-[width] duration-300"
                                            :style="{
                                                width: `${petTopicCompletionRate}%`,
                                            }"
                                        />
                                    </div>

                                    <p
                                        class="mt-2 text-xs leading-5 text-slate-500"
                                    >
                                        最近记录：{{
                                            petTopicLastRecordedLabel
                                        }}
                                    </p>
                                </div>

                                <p
                                    class="mt-3 text-sm leading-6 text-slate-300 text-center"
                                >
                                    共
                                    {{ petTopics.length }}
                                    项任务.
                                </p>

                                <Button
                                    variant="outline"
                                    class="mt-3 w-full rounded-2xl border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                                    @click="petTopicDialogOpen = true"
                                >
                                    <ListTodo class="h-4 w-4" />
                                    查看图鉴任务
                                </Button>

                                <p
                                    class="mt-3 text-xs leading-5 text-slate-500 text-center"
                                >
                                    任务完成状态不会同步到其他设备!
                                </p>
                            </template>

                            <p
                                v-else
                                class="mt-3 text-sm leading-6 text-slate-400"
                            >
                                暂无图鉴任务。
                            </p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div
                            class="flex flex-wrap items-start justify-between gap-3"
                        >
                            <div class="space-y-2.5">
                                <div class="flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        class="rounded-full border-white/10 bg-white/5 px-2.5 py-0.5 text-slate-300"
                                    >
                                        No.{{ friend.id }}
                                    </Badge>
                                    <Badge
                                        class="rounded-full bg-white/10 text-slate-100"
                                    >
                                        {{ friend.main_type.localized.zh }}
                                    </Badge>
                                    <Badge
                                        v-if="friend.sub_type"
                                        variant="secondary"
                                        class="rounded-full bg-slate-700/60 text-slate-100"
                                    >
                                        {{ friend.sub_type.localized.zh }}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        class="rounded-full border-sky-400/20 bg-sky-400/10 text-sky-200"
                                    >
                                        {{
                                            friend.default_legacy_type.localized
                                                .zh
                                        }}遗传
                                    </Badge>
                                    <Badge
                                        v-if="friend.is_leader_form"
                                        class="rounded-full border-0 bg-amber-400/15 text-amber-200"
                                    >
                                        首领形态
                                    </Badge>
                                    <Badge
                                        v-if="!isPetImplemented(friend)"
                                        variant="outline"
                                        class="rounded-full border-amber-300/20 bg-amber-300/10 text-amber-100"
                                    >
                                        未实装
                                    </Badge>
                                    <Badge
                                        v-if="worldProfile?.classis_name"
                                        variant="outline"
                                        class="rounded-full border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                                    >
                                        {{ worldProfile.classis_name }}
                                    </Badge>
                                </div>

                                <div class="space-y-1.5">
                                    <h1
                                        class="text-3xl font-semibold tracking-tight text-white md:text-4xl"
                                    >
                                        {{ friend.localized.zh.name }}
                                    </h1>
                                    <p class="text-sm text-slate-300">
                                        {{ friend.species.localized.zh }} ·
                                        {{
                                            getAttackStyleLabel(
                                                friend.preferred_attack_style,
                                            )
                                        }}
                                        <span v-if="worldProfile?.type_desc">
                                            · {{ worldProfile.type_desc }}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                                as-child
                            >
                                <RouterLink to="/encyclopedia"
                                    >返回图鉴</RouterLink
                                >
                            </Button>
                        </div>

                        <Separator class="bg-white/10" />

                        <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                            <div
                                class="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5"
                            >
                                <p
                                    class="text-[11px] tracking-[0.18em] text-slate-500 uppercase"
                                >
                                    总种族值
                                </p>
                                <p
                                    class="mt-1.5 text-xl font-semibold text-white"
                                >
                                    {{ totalStats }}
                                </p>
                            </div>

                            <div
                                class="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5"
                            >
                                <p
                                    class="text-[11px] tracking-[0.18em] text-slate-500 uppercase"
                                >
                                    最高单项
                                </p>
                                <p
                                    class="mt-1.5 text-xl font-semibold text-white"
                                >
                                    {{ highestStat.label }}
                                    {{ highestStat.value }}
                                </p>
                            </div>

                            <div
                                class="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5"
                            >
                                <p
                                    class="text-[11px] tracking-[0.18em] text-slate-500 uppercase"
                                >
                                    自有技能
                                </p>
                                <p
                                    class="mt-1.5 text-xl font-semibold text-white"
                                >
                                    {{ friend.move_pool.length }}
                                </p>
                            </div>

                            <div
                                class="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5"
                            >
                                <p
                                    class="text-[11px] tracking-[0.18em] text-slate-500 uppercase"
                                >
                                    覆盖属性
                                </p>
                                <p
                                    class="mt-1.5 text-xl font-semibold text-white"
                                >
                                    {{ moveCoverageTypes.length }}
                                </p>
                            </div>
                        </div>

                        <div class="grid gap-3 xl:grid-cols-[1.08fr_0.92fr]">
                            <div
                                class="rounded-3xl border border-white/10 bg-black/20 p-4"
                            >
                                <p
                                    class="flex items-center gap-2 text-[11px] tracking-[0.18em] text-slate-500 uppercase"
                                >
                                    <BookOpen
                                        class="h-3.5 w-3.5 text-sky-300"
                                    />
                                    图鉴档案
                                </p>
                                <div class="mt-3 flex flex-wrap gap-2">
                                    <Badge
                                        class="rounded-full bg-white/10 text-slate-100"
                                    >
                                        {{ worldTypeLabel }}
                                    </Badge>
                                    <Badge
                                        v-if="worldProfile?.classis_name"
                                        variant="outline"
                                        class="rounded-full border-white/10 bg-black/20 text-slate-300"
                                    >
                                        {{ worldProfile.classis_name }}
                                    </Badge>
                                    <Badge
                                        v-if="worldProfile?.movement_type"
                                        variant="outline"
                                        class="rounded-full border-white/10 bg-black/20 text-slate-300"
                                    >
                                        {{ worldProfile.movement_type }}
                                    </Badge>
                                </div>
                                <p
                                    class="mt-3 text-sm leading-6 text-slate-300"
                                >
                                    {{ introductionText }}
                                </p>
                                <p
                                    class="mt-3 text-xs leading-6 text-slate-400"
                                >
                                    {{ habitatSummary }}
                                </p>
                            </div>

                            <div
                                class="rounded-3xl border border-white/10 bg-black/20 p-4"
                            >
                                <p
                                    class="flex items-center gap-2 text-[11px] tracking-[0.18em] text-slate-500 uppercase"
                                >
                                    <MapPin
                                        class="h-3.5 w-3.5 text-emerald-300"
                                    />
                                    刷新与培育
                                </p>
                                <div class="mt-3 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        class="rounded-full border-white/10 bg-black/20 text-slate-300"
                                    >
                                        蛋组 {{ eggGroupSummaryLabel }}
                                    </Badge>
                                    <Badge
                                        v-if="!isPetImplemented(friend)"
                                        variant="outline"
                                        class="rounded-full border-amber-300/20 bg-amber-300/10 text-amber-100"
                                    >
                                        未实装
                                    </Badge>
                                    <Badge
                                        v-if="!refreshLocations.length"
                                        variant="outline"
                                        class="rounded-full border-white/10 bg-black/20 text-slate-400"
                                    >
                                        暂无刷新位置数据
                                    </Badge>
                                </div>

                                <div class="mt-4 grid gap-2 sm:grid-cols-3">
                                    <div
                                        class="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5"
                                    >
                                        <p
                                            class="flex items-center gap-1.5 text-[11px] tracking-[0.14em] text-slate-500 uppercase"
                                        >
                                            <Egg
                                                class="h-3.5 w-3.5 text-amber-300"
                                            />
                                            孵化时长
                                        </p>
                                        <p
                                            class="mt-1.5 text-sm font-semibold text-white"
                                        >
                                            {{ hatchDurationLabel }}
                                        </p>
                                    </div>
                                    <div
                                        class="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5"
                                    >
                                        <p
                                            class="flex items-center gap-1.5 text-[11px] tracking-[0.14em] text-slate-500 uppercase"
                                        >
                                            <Ruler
                                                class="h-3.5 w-3.5 text-sky-300"
                                            />
                                            身高范围
                                        </p>
                                        <p
                                            class="mt-1.5 text-sm font-semibold text-white"
                                        >
                                            {{ heightRangeLabel }}
                                        </p>
                                    </div>
                                    <div
                                        class="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5"
                                    >
                                        <p
                                            class="text-[11px] tracking-[0.14em] text-slate-500 uppercase"
                                        >
                                            体重范围
                                        </p>
                                        <p
                                            class="mt-1.5 text-sm font-semibold text-white"
                                        >
                                            {{ weightRangeLabel }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
                            <div
                                class="rounded-3xl border border-white/10 bg-black/20 p-4"
                            >
                                <p
                                    class="text-[11px] tracking-[0.18em] text-slate-500 uppercase"
                                >
                                    特性
                                </p>
                                <h2
                                    class="mt-2 text-lg font-semibold tracking-tight text-white"
                                >
                                    {{
                                        friend.trait?.localized.zh.name ??
                                        "暂无特性数据"
                                    }}
                                </h2>
                                <p
                                    class="mt-2 text-sm leading-6 text-slate-300"
                                >
                                    {{
                                        friend.trait?.localized.zh
                                            .description ??
                                        "当前接口没有返回特性说明。"
                                    }}
                                </p>
                            </div>

                            <div
                                class="rounded-3xl border border-white/10 bg-black/20 p-4"
                            >
                                <p
                                    class="flex items-center gap-2 text-[11px] tracking-[0.18em] text-slate-500 uppercase"
                                >
                                    <BarChart3
                                        class="h-3.5 w-3.5 text-primary"
                                    />
                                    技能摘要
                                </p>
                                <div class="mt-3 flex flex-wrap gap-2">
                                    <Badge
                                        v-for="item in moveSummary"
                                        :key="item.category"
                                        variant="outline"
                                        class="rounded-full border-white/10 bg-white/5 text-slate-200"
                                    >
                                        {{ item.label }} {{ item.count }}
                                    </Badge>
                                </div>
                                <p
                                    class="mt-3 text-sm leading-6 text-slate-300"
                                >
                                    最高属性为
                                    {{ highestStat.label }}，当前技能覆盖
                                    {{ moveCoverageTypes.length }} 个系别。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Tabs default-value="overview" class="space-y-3">
                <TabsList
                    class="h-auto w-full flex-wrap justify-start rounded-2xl bg-white/6 p-1"
                >
                    <TabsTrigger
                        value="overview"
                        class="rounded-xl px-3 py-1.5"
                    >
                        概览
                    </TabsTrigger>
                    <TabsTrigger value="moves" class="rounded-xl px-3 py-1.5">
                        自有技能
                    </TabsTrigger>
                    <TabsTrigger value="stones" class="rounded-xl px-3 py-1.5">
                        学习技能
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" class="space-y-4">
                    <Card class="border-white/10 bg-black/20 shadow-sm">
                        <CardHeader class="pb-3">
                            <CardTitle class="text-white">进化链</CardTitle>
                            <CardDescription class="text-slate-400">
                                按阶段横向展示，点击节点可跳转到对应详情页。
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div class="overflow-x-auto pb-1">
                                <div class="flex min-w-max items-center gap-3">
                                    <template
                                        v-for="(
                                            stage, stageIndex
                                        ) in evolutionStages"
                                        :key="stage.depth"
                                    >
                                        <div
                                            class="min-w-48 rounded-3xl border border-white/10 bg-white/6 p-3"
                                        >
                                            <div
                                                class="mb-3 flex items-center justify-between gap-2"
                                            >
                                                <p
                                                    class="text-sm font-medium text-white"
                                                >
                                                    第
                                                    {{ stage.depth + 1 }} 阶段
                                                </p>
                                                <Badge
                                                    v-if="stage.is_leader_stage"
                                                    class="rounded-full border-0 bg-amber-400/15 text-amber-200"
                                                >
                                                    <Crown
                                                        class="h-3.5 w-3.5"
                                                    />
                                                    首领
                                                </Badge>
                                            </div>

                                            <div class="grid gap-2.5">
                                                <RouterLink
                                                    v-for="monster in stage.monsters"
                                                    :key="monster.id"
                                                    :to="`/pets/${monster.id}`"
                                                    :class="[
                                                        monster.id === friend.id
                                                            ? 'border-primary/40 bg-primary/10 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]'
                                                            : 'border-white/10 bg-black/25 hover:border-sky-400/30 hover:bg-white/8',
                                                        !isEvolutionMonsterImplemented(
                                                            monster.id,
                                                        )
                                                            ? 'opacity-60'
                                                            : '',
                                                    ]"
                                                    class="group block rounded-2xl border p-2.5 transition-colors"
                                                >
                                                    <div
                                                        class="flex items-center gap-2.5"
                                                    >
                                                        <FriendPortrait
                                                            :name="monster.name"
                                                            :alt="
                                                                monster
                                                                    .localized
                                                                    .zh.name
                                                            "
                                                            class="h-16 w-16 shrink-0 rounded-2xl"
                                                            img-class="object-contain p-2"
                                                        />

                                                        <div
                                                            class="min-w-0 flex-1"
                                                        >
                                                            <div
                                                                class="flex flex-wrap items-center gap-2"
                                                            >
                                                                <p
                                                                    class="text-[11px] tracking-[0.14em] text-slate-500 uppercase"
                                                                >
                                                                    No.{{
                                                                        monster.id
                                                                    }}
                                                                </p>
                                                                <Badge
                                                                    v-if="
                                                                        monster.id ===
                                                                        friend.id
                                                                    "
                                                                    variant="outline"
                                                                    class="rounded-full border-primary/30 bg-primary/10 text-primary"
                                                                >
                                                                    当前
                                                                </Badge>
                                                            </div>
                                                            <p
                                                                class="mt-1 truncate text-sm font-semibold text-white"
                                                            >
                                                                {{
                                                                    monster
                                                                        .localized
                                                                        .zh.name
                                                                }}
                                                            </p>
                                                            <p
                                                                class="mt-1 truncate text-xs text-slate-400"
                                                            >
                                                                {{
                                                                    monster
                                                                        .main_type
                                                                        .localized
                                                                        .zh
                                                                }}
                                                                <span
                                                                    v-if="
                                                                        monster.sub_type
                                                                    "
                                                                >
                                                                    /
                                                                    {{
                                                                        monster
                                                                            .sub_type
                                                                            .localized
                                                                            .zh
                                                                    }}
                                                                </span>
                                                            </p>

                                                            <div
                                                                v-if="monster.evolution_conditions.length"
                                                                class="mt-2 space-y-1"
                                                            >
                                                                <p
                                                                    class="text-[10px] tracking-[0.14em] text-slate-500 uppercase"
                                                                >
                                                                    进化条件
                                                                </p>
                                                                <p
                                                                    v-for="condition in monster.evolution_conditions"
                                                                    :key="condition"
                                                                    class="text-xs leading-5 text-slate-300"
                                                                >
                                                                    {{ condition }}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </RouterLink>
                                            </div>
                                        </div>

                                        <div
                                            v-if="
                                                stageIndex <
                                                evolutionStages.length - 1
                                            "
                                            class="flex items-center justify-center px-1 text-slate-500"
                                        >
                                            <ArrowRight class="h-4 w-4" />
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div class="grid gap-4 2xl:grid-cols-[1.08fr_0.92fr]">
                        <Card class="border-white/10 bg-black/20 shadow-sm">
                            <CardHeader class="pb-3">
                                <CardTitle class="text-white"
                                    >基础面板</CardTitle
                                >
                                <CardDescription class="text-slate-400">
                                    使用 ECharts 雷达图展示六维属性。
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="space-y-4">
                                <div
                                    class="stat-radar-panel relative rounded-3xl border border-white/10 bg-slate-950/70 p-3"
                                >
                                    <div
                                        ref="radarChartRef"
                                        class="stat-radar-chart h-72 w-full md:h-80"
                                    />
                                    <div
                                        class="pointer-events-none absolute inset-0 flex items-center justify-center"
                                    >
                                        <div
                                            class="rounded-2xl border border-white/10 bg-slate-950/82 px-4 py-3 text-center shadow-[0_12px_32px_-18px_rgba(0,0,0,0.85)]"
                                        >
                                            <p
                                                class="text-[10px] tracking-[0.2em] text-slate-500 uppercase"
                                            >
                                                Total
                                            </p>
                                            <p
                                                class="mt-1 text-2xl font-semibold text-white"
                                            >
                                                {{ totalStats }}
                                            </p>
                                            <p
                                                class="mt-1 text-[11px] text-slate-400"
                                            >
                                                {{ highestStat.label }}领先
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
                                >
                                    <div
                                        v-for="stat in statRows"
                                        :key="stat.key"
                                        class="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5"
                                    >
                                        <div
                                            class="flex items-center justify-between gap-2"
                                        >
                                            <span
                                                class="text-sm text-slate-300"
                                                >{{ stat.label }}</span
                                            >
                                            <span
                                                class="text-sm font-semibold text-white"
                                                >{{ stat.value }}</span
                                            >
                                        </div>
                                        <div
                                            class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8"
                                        >
                                            <div
                                                class="h-full rounded-full bg-sky-500"
                                                :style="{
                                                    width: `${(stat.value / statChartMax) * 100}%`,
                                                }"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card class="border-white/10 bg-black/20 shadow-sm">
                            <CardHeader class="pb-3">
                                <CardTitle
                                    class="flex items-center gap-2 text-white"
                                >
                                    <Sparkles class="h-4 w-4 text-primary" />
                                    战斗概况
                                </CardTitle>
                                <CardDescription class="text-slate-400">
                                    倾向、覆盖与遗传技能的快速摘要。
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="space-y-4">
                                <div class="grid gap-2 sm:grid-cols-2">
                                    <div
                                        class="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5"
                                    >
                                        <p class="text-xs text-slate-500">
                                            攻击倾向
                                        </p>
                                        <p
                                            class="mt-1.5 text-sm font-semibold text-white"
                                        >
                                            {{
                                                getAttackStyleLabel(
                                                    friend.preferred_attack_style,
                                                )
                                            }}
                                        </p>
                                    </div>
                                    <div
                                        class="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5"
                                    >
                                        <p class="text-xs text-slate-500">
                                            遗传技能
                                        </p>
                                        <p
                                            class="mt-1.5 text-sm font-semibold text-white"
                                        >
                                            {{ friend.legacy_moves.length }} 项
                                        </p>
                                    </div>
                                </div>

                                <Separator class="bg-white/10" />

                                <div class="space-y-2.5">
                                    <p class="text-sm font-medium text-white">
                                        技能覆盖属性
                                    </p>
                                    <div class="flex flex-wrap gap-2">
                                        <Badge
                                            v-for="type in moveCoverageTypes"
                                            :key="type.id"
                                            variant="outline"
                                            class="rounded-full border-sky-400/20 bg-sky-400/10 text-sky-200"
                                        >
                                            {{ type.label }}
                                        </Badge>
                                    </div>
                                </div>

                                <div class="space-y-2.5">
                                    <p class="text-sm font-medium text-white">
                                        高威力技能
                                    </p>
                                    <div class="space-y-2">
                                        <div
                                            v-for="move in strongestMoves"
                                            :key="move.id"
                                            class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm"
                                        >
                                            <div class="min-w-0">
                                                <p
                                                    class="truncate font-medium text-white"
                                                >
                                                    {{ move.localized.zh.name }}
                                                </p>
                                                <p
                                                    class="truncate text-xs text-slate-400"
                                                >
                                                    {{
                                                        move.move_type.localized
                                                            .zh
                                                    }}
                                                    ·
                                                    {{
                                                        getCategoryLabel(
                                                            move.move_category,
                                                        )
                                                    }}
                                                </p>
                                            </div>
                                            <span
                                                class="shrink-0 font-semibold text-white"
                                            >
                                                {{ move.power }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div class="grid gap-4 xl:grid-cols-[1fr_1fr]">
                        <Card class="border-white/10 bg-black/20 shadow-sm">
                            <CardHeader class="pb-3">
                                <CardTitle
                                    class="flex items-center gap-2 text-white"
                                >
                                    <WandSparkles
                                        class="h-4 w-4 text-sky-300"
                                    />
                                    遗传技能索引
                                </CardTitle>
                                <CardDescription class="text-slate-400">
                                    展示当前精灵可继承的全部血脉技能。
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div class="grid gap-2 md:grid-cols-2">
                                    <div
                                        v-for="item in legacyTypeEntries"
                                        :key="`${item.type_id}-${item.move_id}`"
                                        class="rounded-2xl border border-white/10 bg-white/6 px-3 py-3"
                                    >
                                        <div
                                            class="flex flex-wrap items-center gap-2"
                                        >
                                            <Badge
                                                variant="outline"
                                                class="rounded-full border-sky-400/20 bg-sky-400/10 text-sky-200"
                                            >
                                                {{ item.label }}血脉
                                            </Badge>
                                            <Badge
                                                v-if="item.move"
                                                variant="outline"
                                                class="rounded-full border-white/10 bg-black/20 text-slate-300"
                                            >
                                                {{
                                                    getCategoryLabel(
                                                        item.move.move_category,
                                                    )
                                                }}
                                            </Badge>
                                        </div>

                                        <div class="mt-2 space-y-1.5">
                                            <p
                                                class="text-sm font-semibold text-white"
                                            >
                                                {{
                                                    item.move?.localized.zh
                                                        .name ??
                                                    `技能 #${item.move_id}`
                                                }}
                                            </p>
                                            <p
                                                class="text-xs leading-5 text-slate-400"
                                            >
                                                {{
                                                    item.move?.localized.zh
                                                        .description ??
                                                    "当前索引暂未解析到技能说明。"
                                                }}
                                            </p>
                                        </div>

                                        <div
                                            class="mt-3 flex flex-wrap gap-2 text-xs text-slate-300"
                                        >
                                            <span
                                                class="rounded-full border border-white/10 bg-black/20 px-2 py-0.5"
                                            >
                                                #{{ item.move_id }}
                                            </span>
                                            <span
                                                v-if="item.move"
                                                class="rounded-full border border-white/10 bg-black/20 px-2 py-0.5"
                                            >
                                                能耗 {{ item.move.energy_cost }}
                                            </span>
                                            <span
                                                v-if="item.move && item.move.power !== null"
                                                class="rounded-full border border-white/10 bg-black/20 px-2 py-0.5"
                                            >
                                                威力 {{ item.move.power }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="moves">
                    <Card class="border-white/10 bg-black/20 shadow-sm">
                        <CardHeader class="pb-3">
                            <CardTitle class="text-white">自有技能</CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-2.5">
                            <div
                                class="hidden grid-cols-[minmax(0,2.1fr)_minmax(0,1.15fr)_96px_76px] gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] tracking-[0.14em] text-slate-500 uppercase md:grid"
                            >
                                <span>技能</span>
                                <span>类型与分类</span>
                                <span>能耗</span>
                                <span>威力</span>
                            </div>

                            <article
                                v-for="move in friend.move_pool"
                                :key="move.id"
                                class="rounded-2xl border border-white/10 bg-white/6 px-3 py-3 transition-colors hover:border-white/15 hover:bg-white/8"
                            >
                                <div
                                    class="grid gap-3 md:grid-cols-[minmax(0,2.1fr)_minmax(0,1.15fr)_96px_76px] md:items-start"
                                >
                                    <div class="min-w-0">
                                        <div
                                            class="flex flex-wrap items-center gap-2"
                                        >
                                            <h3
                                                class="truncate text-sm font-semibold text-white"
                                            >
                                                {{ move.localized.zh.name }}
                                            </h3>
                                            <Badge
                                                variant="outline"
                                                class="rounded-full border-white/10 bg-black/20 text-slate-400"
                                            >
                                                #{{ move.id }}
                                            </Badge>
                                        </div>
                                        <p
                                            class="mt-1 text-[11px] text-slate-500"
                                        >
                                            {{ move.name }}
                                        </p>
                                        <p
                                            class="mt-2 text-sm leading-6 text-slate-300"
                                        >
                                            {{ move.localized.zh.description }}
                                        </p>
                                    </div>

                                    <div class="flex flex-wrap gap-2 md:pt-0.5">
                                        <Badge
                                            class="rounded-full bg-white/10 text-slate-100"
                                        >
                                            {{ move.move_type.localized.zh }}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            class="rounded-full border-white/10 bg-black/20 text-slate-300"
                                        >
                                            {{
                                                getCategoryLabel(
                                                    move.move_category,
                                                )
                                            }}
                                        </Badge>
                                    </div>

                                    <div
                                        class="text-sm font-medium text-slate-200 md:pt-0.5"
                                    >
                                        {{ getEnergyLabel(move) }}
                                    </div>

                                    <div
                                        class="text-sm font-semibold text-white md:pt-0.5"
                                    >
                                        {{ getPowerLabel(move) }}
                                    </div>
                                </div>
                            </article>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="stones">
                    <Card class="border-white/10 bg-black/20 shadow-sm">
                        <CardHeader class="pb-3">
                            <CardTitle class="text-white">学习技能</CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-2.5">
                            <div
                                class="hidden grid-cols-[minmax(0,2.1fr)_minmax(0,1.15fr)_96px_76px] gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] tracking-[0.14em] text-slate-500 uppercase md:grid"
                            >
                                <span>技能</span>
                                <span>类型与分类</span>
                                <span>能耗</span>
                                <span>威力</span>
                            </div>

                            <article
                                v-for="move in friend.move_stones"
                                :key="move.id"
                                class="rounded-2xl border border-white/10 bg-white/6 px-3 py-3 transition-colors hover:border-white/15 hover:bg-white/8"
                            >
                                <div
                                    class="grid gap-3 md:grid-cols-[minmax(0,2.1fr)_minmax(0,1.15fr)_96px_76px] md:items-start"
                                >
                                    <div class="min-w-0">
                                        <div
                                            class="flex flex-wrap items-center gap-2"
                                        >
                                            <h3
                                                class="truncate text-sm font-semibold text-white"
                                            >
                                                {{ move.localized.zh.name }}
                                            </h3>
                                            <Badge
                                                variant="outline"
                                                class="rounded-full border-white/10 bg-black/20 text-slate-400"
                                            >
                                                #{{ move.id }}
                                            </Badge>
                                        </div>
                                        <p
                                            class="mt-1 text-[11px] text-slate-500"
                                        >
                                            {{ move.name }}
                                        </p>
                                        <p
                                            class="mt-2 text-sm leading-6 text-slate-300"
                                        >
                                            {{ move.localized.zh.description }}
                                        </p>
                                    </div>

                                    <div class="flex flex-wrap gap-2 md:pt-0.5">
                                        <Badge
                                            class="rounded-full bg-white/10 text-slate-100"
                                        >
                                            {{ move.move_type.localized.zh }}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            class="rounded-full border-white/10 bg-black/20 text-slate-300"
                                        >
                                            {{
                                                getCategoryLabel(
                                                    move.move_category,
                                                )
                                            }}
                                        </Badge>
                                    </div>

                                    <div
                                        class="text-sm font-medium text-slate-200 md:pt-0.5"
                                    >
                                        {{ getEnergyLabel(move) }}
                                    </div>

                                    <div
                                        class="text-sm font-semibold text-white md:pt-0.5"
                                    >
                                        {{ getPowerLabel(move) }}
                                    </div>
                                </div>
                            </article>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog v-model:open="petTopicDialogOpen">
                <DialogContent
                    class="border-white/10 bg-slate-950 text-slate-100 sm:max-w-2xl"
                >
                    <DialogHeader>
                        <DialogTitle class="text-white">
                            {{ friend.localized.zh.name }} 图鉴任务
                        </DialogTitle>
                        <DialogDescription class="text-slate-400">
                            在这里记录当前精灵的图鉴任务完成状态。任务完成状态不会同步到其他设备。
                        </DialogDescription>
                    </DialogHeader>

                    <div v-if="isPetTopicLoading" class="space-y-2.5">
                        <Skeleton
                            class="h-20 rounded-2xl border border-white/10 bg-white/6"
                        />
                        <Skeleton
                            class="h-16 rounded-2xl border border-white/10 bg-white/6"
                        />
                        <Skeleton
                            class="h-16 rounded-2xl border border-white/10 bg-white/6"
                        />
                    </div>

                    <div
                        v-else-if="petTopicErrorMessage"
                        class="rounded-2xl border border-destructive/20 bg-destructive/8 px-3 py-4 text-sm text-destructive"
                    >
                        {{ petTopicErrorMessage }}
                    </div>

                    <template v-else-if="petTopics.length">
                        <div
                            class="rounded-2xl border border-white/10 bg-white/6 p-3"
                        >
                            <div class="flex items-end justify-between gap-3">
                                <div>
                                    <p
                                        class="text-[11px] tracking-[0.14em] text-slate-500 uppercase"
                                    >
                                        完成进度
                                    </p>
                                    <p
                                        class="mt-1 text-lg font-semibold text-white"
                                    >
                                        {{ completedPetTopicCount }}/{{
                                            petTopics.length
                                        }}
                                    </p>
                                </div>
                                <p
                                    class="text-2xl font-semibold text-emerald-200"
                                >
                                    {{ petTopicCompletionRate }}%
                                </p>
                            </div>

                            <div
                                class="mt-3 h-2 overflow-hidden rounded-full bg-white/8"
                            >
                                <div
                                    class="h-full rounded-full bg-[linear-gradient(90deg,rgba(74,222,128,0.65),rgba(16,185,129,0.95))] transition-[width] duration-300"
                                    :style="{
                                        width: `${petTopicCompletionRate}%`,
                                    }"
                                />
                            </div>

                            <p class="mt-2 text-xs leading-5 text-slate-500">
                                最近记录：{{ petTopicLastRecordedLabel }}
                            </p>
                        </div>

                        <div
                            class="max-h-[60vh] space-y-3 overflow-y-auto pr-1"
                        >
                            <label
                                v-for="topic in petTopics"
                                :key="topic.topic_Id"
                                class="group flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 transition-colors"
                                :class="
                                    isPetTopicCompleted(topic.topic_Id)
                                        ? 'border-emerald-400/25 bg-emerald-400/8'
                                        : 'border-white/10 bg-white/5 hover:border-white/15 hover:bg-white/8'
                                "
                            >
                                <input
                                    class="sr-only"
                                    type="checkbox"
                                    :checked="
                                        isPetTopicCompleted(topic.topic_Id)
                                    "
                                    @change="
                                        handlePetTopicChange(
                                            topic.topic_Id,
                                            $event,
                                        )
                                    "
                                />

                                <span
                                    class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors"
                                    :class="
                                        isPetTopicCompleted(topic.topic_Id)
                                            ? 'border-emerald-400/50 bg-emerald-400/20 text-emerald-200'
                                            : 'border-white/10 bg-black/20 text-transparent group-hover:text-slate-500'
                                    "
                                >
                                    <Check class="h-3.5 w-3.5" />
                                </span>

                                <span class="min-w-0 flex-1">
                                    <span
                                        class="block text-sm leading-6"
                                        :class="
                                            isPetTopicCompleted(topic.topic_Id)
                                                ? 'text-slate-200 line-through decoration-slate-500/70'
                                                : 'text-slate-100'
                                        "
                                    >
                                        {{ topic.topic_desc }}
                                    </span>
                                    <span
                                        class="mt-1 block text-[11px] text-slate-500"
                                    >
                                        任务 {{ topic.topic_Id }}
                                        <span
                                            v-if="
                                                getPetTopicRecordedLabel(
                                                    topic.topic_Id,
                                                )
                                            "
                                        >
                                            · 已记录
                                            {{
                                                getPetTopicRecordedLabel(
                                                    topic.topic_Id,
                                                )
                                            }}
                                        </span>
                                    </span>
                                </span>
                            </label>
                        </div>

                        <p class="text-xs leading-5 text-slate-500">
                            任务完成状态不会同步到其他设备!
                        </p>
                    </template>

                    <p v-else class="text-sm leading-6 text-slate-400">
                        暂无图鉴任务。
                    </p>
                </DialogContent>
            </Dialog>
        </template>
    </section>
</template>

<style scoped>
.stat-radar-panel {
    background:
        radial-gradient(
            circle at center,
            rgba(14, 165, 233, 0.1),
            transparent 42%
        ),
        linear-gradient(180deg, rgba(15, 23, 42, 0.86), rgba(2, 6, 23, 0.94));
}

.stat-radar-chart :deep(canvas) {
    outline: none;
}
</style>
