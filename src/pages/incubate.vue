<script setup lang="ts">
import {
    Clock3,
    Egg,
    RotateCcw,
    Ruler,
    Scale,
    Search,
    Sparkles,
} from "lucide-vue-next";
import type { LocationQuery, LocationQueryRaw } from "vue-router";
import FriendPortrait from "@/components/FriendPortrait.vue";
import type { IPets, IPetsBreedingVariant } from "@/lib/interface";

interface IIncubateVariantEntry {
    key: string;
    sourcePetId: number;
    sourcePetName: string;
    heightLow: number | null;
    heightHigh: number | null;
    weightLow: number | null;
    weightHigh: number | null;
    hatchData: number | null;
}

interface IIncubateChainEntry {
    rootPet: IPets;
    members: IPets[];
    variants: IIncubateVariantEntry[];
}

interface IIncubateMatchResult {
    rootPet: IPets;
    sourcePetName: string;
    bestVariant: IIncubateVariantEntry;
    matchedMetricCount: number;
    score: number;
    memberCount: number;
}

const INITIAL_VISIBLE_MATCH_COUNT = 12;
const LOAD_MORE_MATCH_COUNT = 12;

const pets = ref<IPets[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const heightInput = ref<string | number>("");
const weightInput = ref<string | number>("");
const visibleMatchCount = ref(INITIAL_VISIBLE_MATCH_COUNT);
const route = useRoute();
const router = useRouter();

let petsController: AbortController | null = null;

document.title = "猜蛋 - 洛克王国工具箱";

const heightValue = computed(() => parsePositiveNumber(heightInput.value));
const weightValueKg = computed(() => parsePositiveNumber(weightInput.value));
const weightValue = computed(() => {
    if (weightValueKg.value === null) {
        return null;
    }

    return Math.round(weightValueKg.value * 1000);
});

const hasAnyInput = computed(() => {
    return heightValue.value !== null || weightValue.value !== null;
});

const hasInvalidInput = computed(() => {
    return (
        (hasInputValue(heightInput.value) && heightValue.value === null) ||
        (hasInputValue(weightInput.value) && weightValueKg.value === null)
    );
});

const invalidInputMessage = computed(() => {
    if (!hasInvalidInput.value) {
        return "";
    }

    return "请输入大于 0 的数字；身高单位为 cm，体重单位为 kg。";
});

const chainEntries = computed(() => {
    if (!pets.value.length) {
        return [];
    }

    const petsById = new Map(pets.value.map((pet) => [pet.id, pet]));
    const rootIdCache = new Map<number, number>();
    const groups = new Map<
        number,
        IIncubateChainEntry & { variantKeys: Set<string> }
    >();

    const resolveRootId = (pet: IPets) => {
        const cached = rootIdCache.get(pet.id);

        if (cached) {
            return cached;
        }

        const visited: number[] = [];
        let current: IPets = pet;
        const seen = new Set<number>();

        while (current.evolves_from_id !== null) {
            if (seen.has(current.id)) {
                break;
            }

            seen.add(current.id);
            visited.push(current.id);

            const parent = petsById.get(current.evolves_from_id);

            if (!parent) {
                break;
            }

            current = parent;
        }

        rootIdCache.set(current.id, current.id);

        for (const visitedId of visited) {
            rootIdCache.set(visitedId, current.id);
        }

        return current.id;
    };

    for (const pet of pets.value) {
        const rootId = resolveRootId(pet);
        const rootPet = petsById.get(rootId) ?? pet;
        let entry = groups.get(rootId);

        if (!entry) {
            entry = {
                rootPet,
                members: [],
                variants: [],
                variantKeys: new Set<string>(),
            };
            groups.set(rootId, entry);
        }

        entry.members.push(pet);

        for (const variant of extractBreedingVariants(pet)) {
            const key = buildVariantKey(pet.id, variant);

            if (entry.variantKeys.has(key)) {
                continue;
            }

            entry.variantKeys.add(key);
            entry.variants.push({
                key,
                sourcePetId: pet.id,
                sourcePetName: pet.localized.zh.name,
                heightLow: variant.height_low ?? null,
                heightHigh: variant.height_high ?? null,
                weightLow: variant.weight_low ?? null,
                weightHigh: variant.weight_high ?? null,
                hatchData: variant.hatch_data ?? null,
            });
        }
    }

    return [...groups.values()]
        .filter((entry) => entry.variants.length > 0)
        .map(({ variantKeys: _variantKeys, ...entry }) => entry)
        .sort((left, right) => {
            return left.rootPet.localized.zh.name.localeCompare(
                right.rootPet.localized.zh.name,
                "zh-CN",
            );
        });
});

const matches = computed<IIncubateMatchResult[]>(() => {
    if (!hasAnyInput.value || hasInvalidInput.value) {
        return [];
    }

    return chainEntries.value
        .flatMap((entry) => {
            let bestMatch:
                | (IIncubateMatchResult & {
                      bestVariant: IIncubateVariantEntry;
                  })
                | null = null;

            for (const variant of entry.variants) {
                const evaluation = evaluateVariantMatch(variant);

                if (!evaluation) {
                    continue;
                }

                const candidate: IIncubateMatchResult = {
                    rootPet: entry.rootPet,
                    sourcePetName: variant.sourcePetName,
                    bestVariant: variant,
                    matchedMetricCount: evaluation.matchedMetricCount,
                    score: evaluation.score,
                    memberCount: entry.members.length,
                };

                if (
                    !bestMatch ||
                    candidate.score < bestMatch.score ||
                    (candidate.score === bestMatch.score &&
                        candidate.rootPet.localized.zh.name.localeCompare(
                            bestMatch.rootPet.localized.zh.name,
                            "zh-CN",
                        ) < 0)
                ) {
                    bestMatch = candidate;
                }
            }

            return bestMatch ? [bestMatch] : [];
        })
        .sort((left, right) => {
            if (left.score !== right.score) {
                return left.score - right.score;
            }

            if (left.matchedMetricCount !== right.matchedMetricCount) {
                return right.matchedMetricCount - left.matchedMetricCount;
            }

            return left.rootPet.localized.zh.name.localeCompare(
                right.rootPet.localized.zh.name,
                "zh-CN",
            );
        });
});

const topMatch = computed(() => {
    return matches.value[0] ?? null;
});

const visibleMatches = computed(() => {
    return matches.value.slice(0, visibleMatchCount.value);
});

const remainingMatchCount = computed(() => {
    return Math.max(matches.value.length - visibleMatches.value.length, 0);
});

const totalVariantCount = computed(() => {
    return chainEntries.value.reduce((total, entry) => {
        return total + entry.variants.length;
    }, 0);
});

const summaryCards = computed(() => {
    return [
        {
            label: "可反推进化链",
            value: String(chainEntries.value.length),
        },
        {
            label: "区间样本",
            value: String(totalVariantCount.value),
        },
        {
            label: "当前命中",
            value: String(matches.value.length),
        },
    ];
});

const activeInputSummary = computed(() => {
    return [
        {
            label: "身高",
            value:
                heightValue.value === null
                    ? "未填"
                    : `${formatNumber(heightValue.value)} cm`,
            icon: Ruler,
        },
        {
            label: "体重",
            value:
                weightValueKg.value === null
                    ? "未填"
                    : `${formatNumber(weightValueKg.value)} kg`,
            icon: Scale,
        },
    ];
});

const filterDescription = computed(() => {
    if (!hasAnyInput.value) {
        return "输入至少一项后开始反推，身高与体重同时输入会更准。";
    }

    if (heightValue.value !== null && weightValueKg.value !== null) {
        return "当前按身高 + 体重双维度同时命中进行筛选。";
    }

    return "当前仅按单维度筛选，候选会相对更宽。";
});

watch(
    () => route.query,
    (query) => {
        const nextState = parseRouteQuery(query);

        if (normalizeInputValue(heightInput.value) !== nextState.height) {
            heightInput.value = nextState.height;
        }

        if (normalizeInputValue(weightInput.value) !== nextState.weight) {
            weightInput.value = nextState.weight;
        }
    },
    { immediate: true },
);

watch(
    [heightInput, weightInput],
    ([nextHeight, nextWeight]) => {
        const nextQuery = buildRouteQuery({
            height: normalizeInputValue(nextHeight),
            weight: normalizeInputValue(nextWeight),
        });
        const currentQuery = buildRouteQuery(parseRouteQuery(route.query));

        if (serializeQuery(nextQuery) === serializeQuery(currentQuery)) {
            return;
        }

        void router.replace({ query: nextQuery });
    },
    { deep: false },
);

watch(
    matches,
    (nextMatches) => {
        visibleMatchCount.value = Math.min(
            INITIAL_VISIBLE_MATCH_COUNT,
            nextMatches.length,
        );
    },
    { immediate: true },
);

onMounted(() => {
    void getPets();
});

onBeforeUnmount(() => {
    petsController?.abort();
});

async function getPets() {
    petsController?.abort();
    petsController = new AbortController();
    isLoading.value = true;
    errorMessage.value = "";

    try {
        const response = await fetch("/data/Pets.json", {
            signal: petsController.signal,
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        pets.value = (await response.json()) as IPets[];
    } catch (error) {
        if (petsController.signal.aborted) {
            return;
        }

        const message = error instanceof Error ? error.message : "加载失败";
        errorMessage.value = message;
        pets.value = [];
    } finally {
        if (!petsController.signal.aborted) {
            isLoading.value = false;
        }
    }
}

function extractBreedingVariants(pet: IPets) {
    const breeding = pet.breeding;

    if (!breeding) {
        return [];
    }

    const variants = breeding.variants?.length ? breeding.variants : [breeding];

    return variants.filter((variant) => {
        return (
            variant.height_low !== null ||
            variant.height_high !== null ||
            variant.weight_low !== null ||
            variant.weight_high !== null
        );
    });
}

function buildVariantKey(petId: number, variant: IPetsBreedingVariant) {
    return [
        petId,
        variant.id ?? "na",
        variant.height_low ?? "na",
        variant.height_high ?? "na",
        variant.weight_low ?? "na",
        variant.weight_high ?? "na",
        variant.hatch_data ?? "na",
    ].join(":");
}

function evaluateVariantMatch(variant: IIncubateVariantEntry) {
    let score = 0;
    let matchedMetricCount = 0;

    if (heightValue.value !== null) {
        const heightMatch = evaluateMetric(
            heightValue.value,
            variant.heightLow,
            variant.heightHigh,
        );

        if (!heightMatch) {
            return null;
        }

        score += heightMatch;
        matchedMetricCount += 1;
    }

    if (weightValue.value !== null) {
        const weightMatch = evaluateMetric(
            weightValue.value,
            variant.weightLow,
            variant.weightHigh,
        );

        if (!weightMatch) {
            return null;
        }

        score += weightMatch;
        matchedMetricCount += 1;
    }

    if (matchedMetricCount === 0) {
        return null;
    }

    return {
        score,
        matchedMetricCount,
    };
}

function evaluateMetric(
    value: number,
    low: number | null,
    high: number | null,
) {
    if (low === null && high === null) {
        return null;
    }

    const min = Math.min(low ?? high ?? value, high ?? low ?? value);
    const max = Math.max(low ?? high ?? value, high ?? low ?? value);

    if (value < min || value > max) {
        return null;
    }

    const center = (min + max) / 2;
    const span = Math.max(max - min, 1);
    const centerPenalty = Math.abs(value - center) / Math.max(span / 2, 1);
    const spanPenalty = (span / Math.max(center, 1)) * 0.35;

    return centerPenalty + spanPenalty;
}

function parsePositiveNumber(rawValue: string | number | null | undefined) {
    const trimmedValue = normalizeInputValue(rawValue);

    if (!trimmedValue) {
        return null;
    }

    const parsed = Number(trimmedValue);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

function normalizeInputValue(rawValue: string | number | null | undefined) {
    if (typeof rawValue === "number") {
        return Number.isFinite(rawValue) ? String(rawValue).trim() : "";
    }

    if (typeof rawValue === "string") {
        return rawValue.trim();
    }

    return "";
}

function hasInputValue(rawValue: string | number | null | undefined) {
    return normalizeInputValue(rawValue).length > 0;
}

function getQueryValue(value: LocationQuery[string] | undefined) {
    return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseRouteQuery(query: LocationQuery) {
    return {
        height: getQueryValue(query.height).trim(),
        weight: getQueryValue(query.weight).trim(),
    };
}

function buildRouteQuery(state: { height: string; weight: string }) {
    const query: LocationQueryRaw = {};

    if (state.height) {
        query.height = state.height;
    }

    if (state.weight) {
        query.weight = state.weight;
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

function resetInputs() {
    heightInput.value = "";
    weightInput.value = "";
}

function loadMoreMatches() {
    visibleMatchCount.value = Math.min(
        visibleMatchCount.value + LOAD_MORE_MATCH_COUNT,
        matches.value.length,
    );
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
        if (low === high) {
            return `${formatNumber(low)}${unit}`;
        }

        return `${formatNumber(low)}-${formatNumber(high)}${unit}`;
    }

    return `${formatNumber(low ?? high ?? 0)}${unit}`;
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("zh-CN", {
        maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
}

function normalizeWeight(value: number | null) {
    if (value === null) {
        return null;
    }

    return value / 1000;
}

function getWeightRangeLabel(result: IIncubateMatchResult) {
    return formatRange(
        normalizeWeight(result.bestVariant.weightLow),
        normalizeWeight(result.bestVariant.weightHigh),
        "kg",
    );
}

function getHeightRangeLabel(result: IIncubateMatchResult) {
    return formatRange(
        result.bestVariant.heightLow,
        result.bestVariant.heightHigh,
        "cm",
    );
}

function getEggGroupSummary(pet: IPets) {
    const eggGroups = [...(pet.breeding_profile?.egg_groups ?? [])].sort(
        (left, right) => left - right,
    );

    if (!eggGroups.length) {
        return "暂无蛋组";
    }

    return eggGroups.map((groupId) => `蛋组 ${groupId}`).join(" / ");
}

function getTypeLabel(pet: IPets) {
    return pet.sub_type
        ? `${pet.main_type.localized.zh} / ${pet.sub_type.localized.zh}`
        : pet.main_type.localized.zh;
}

function getMatchSourceLabel(result: IIncubateMatchResult) {
    if (result.rootPet.localized.zh.name === result.sourcePetName) {
        return "区间直接命中最低阶段";
    }

    return `区间命中 ${result.sourcePetName}，结果回落到最低阶段`;
}
</script>

<template>
    <section class="space-y-6">
        <Card class="relative overflow-hidden border-white/10">
            <CardContent class="relative">
                <div
                    class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
                    <div class="max-w-3xl space-y-4">
                        <div class="space-y-3">
                            <h1
                                class="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                                孵蛋
                            </h1>
                        </div>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-3">
                        <div
                            v-for="item in summaryCards"
                            :key="item.label"
                            class="rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
                            <div
                                class="text-xs uppercase tracking-[0.24em] text-slate-400">
                                {{ item.label }}
                            </div>
                            <div class="mt-3 text-2xl font-semibold text-white">
                                {{ item.value }}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div class="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <Card
                class="border-white/10 bg-black/25 py-0 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.88)] xl:sticky xl:top-4 xl:self-start">
                <CardContent class="space-y-5 px-5 py-6">
                    <div class="space-y-2">
                        <div class="flex items-center gap-2 text-slate-100">
                            <Search class="h-4 w-4 text-amber-200" />
                            <h2 class="text-lg font-semibold">输入观察值</h2>
                        </div>
                    </div>

                    <div class="grid gap-4">
                        <label class="space-y-2">
                            <span
                                class="flex items-center gap-2 text-sm text-slate-200">
                                <Ruler class="h-4 w-4 text-sky-200" />
                                身高
                            </span>
                            <div class="relative">
                                <Input
                                    v-model="heightInput"
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="例如 23"
                                    class="border-white/10 bg-slate-950/70 pr-12 text-slate-100" />
                                <span
                                    class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">
                                    cm
                                </span>
                            </div>
                        </label>

                        <label class="space-y-2">
                            <span
                                class="flex items-center gap-2 text-sm text-slate-200">
                                <Scale class="h-4 w-4 text-emerald-200" />
                                体重
                            </span>
                            <div class="relative">
                                <Input
                                    v-model="weightInput"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="例如 2.35"
                                    class="border-white/10 bg-slate-950/70 pr-12 text-slate-100" />
                                <span
                                    class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">
                                    kg
                                </span>
                            </div>
                        </label>
                    </div>

                    <div
                        v-if="invalidInputMessage"
                        class="rounded-2xl border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm leading-6 text-red-100">
                        {{ invalidInputMessage }}
                    </div>

                    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        <div
                            v-for="item in activeInputSummary"
                            :key="item.label"
                            class="rounded-2xl border border-white/10 bg-white/6 p-4">
                            <div
                                class="flex items-center gap-2 text-xs tracking-[0.2em] text-slate-400 uppercase">
                                <component
                                    :is="item.icon"
                                    class="h-3.5 w-3.5" />
                                {{ item.label }}
                            </div>
                            <div class="mt-3 text-lg font-semibold text-white">
                                {{ item.value }}
                            </div>
                        </div>
                    </div>

                    <Separator class="bg-white/10" />

                    <Button
                        variant="outline"
                        class="w-full border-white/10 bg-white/6 text-slate-100 hover:bg-white/10"
                        @click="resetInputs">
                        <RotateCcw class="h-4 w-4" />
                        清空输入
                    </Button>
                </CardContent>
            </Card>

            <div class="space-y-6">
                <Card
                    v-if="isLoading"
                    class="border-white/10 bg-black/25 py-0 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.88)]">
                    <CardContent class="px-6 py-10 text-center text-slate-300">
                        正在加载孵化区间数据...
                    </CardContent>
                </Card>

                <Card
                    v-else-if="errorMessage"
                    class="border-red-400/20 bg-red-500/8 py-0 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.88)]">
                    <CardContent class="px-6 py-10 text-center text-red-100">
                        数据加载失败：{{ errorMessage }}
                    </CardContent>
                </Card>

                <Card
                    v-else-if="!hasAnyInput"
                    class="border-white/10 bg-black/25 py-0 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.88)]">
                    <CardContent class="px-6 py-12 text-center">
                        <div
                            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-100">
                            <Search class="h-6 w-6" />
                        </div>
                        <h2 class="mt-5 text-2xl font-semibold text-white">
                            先给我一组观察值
                        </h2>
                        <p
                            class="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
                            例如输入身高 23 cm、体重 2.35
                            kg，就能开始按孵化区间反推最低阶段精灵。
                        </p>
                    </CardContent>
                </Card>

                <Card
                    v-else-if="!matches.length"
                    class="border-white/10 bg-black/25 py-0 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.88)]">
                    <CardContent class="px-6 py-12 text-center">
                        <div
                            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-100">
                            <Sparkles class="h-6 w-6" />
                        </div>
                        <h2 class="mt-5 text-2xl font-semibold text-white">
                            没有命中的孵化区间
                        </h2>
                        <p
                            class="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
                            当前输入值没有命中公开数据里的身高或体重区间，可以尝试放宽其中一个维度，或检查单位是否为
                            cm / kg。
                        </p>
                    </CardContent>
                </Card>

                <template v-else>
                    <Card
                        v-if="topMatch"
                        class="overflow-hidden border-white/10">
                        <CardContent>
                            <div
                                class="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
                                <FriendPortrait
                                    :name="topMatch.rootPet.name"
                                    :alt="topMatch.rootPet.localized.zh.name"
                                    class="aspect-4/3 w-full rounded-[1.75rem] border-white/10"
                                    img-class="object-contain p-1" />

                                <div class="space-y-5">
                                    <div class="space-y-3">
                                        <div class="flex flex-wrap gap-2">
                                            <Badge
                                                class="bg-amber-300 text-slate-950">
                                                <Sparkles class="h-3.5 w-3.5" />
                                                最贴合结果
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                class="border-white/10 text-slate-200">
                                                {{
                                                    topMatch.matchedMetricCount ===
                                                    2
                                                        ? "双维度命中"
                                                        : "单维度命中"
                                                }}
                                            </Badge>
                                        </div>

                                        <div>
                                            <h2
                                                class="text-3xl font-semibold text-white md:text-4xl">
                                                {{
                                                    topMatch.rootPet.localized
                                                        .zh.name
                                                }}
                                            </h2>
                                            <p
                                                class="mt-2 text-sm leading-6 text-slate-300 md:text-base">
                                                {{
                                                    getMatchSourceLabel(
                                                        topMatch,
                                                    )
                                                }}
                                            </p>
                                        </div>

                                        <div class="flex flex-wrap gap-2">
                                            <Badge variant="secondary">
                                                {{
                                                    getTypeLabel(
                                                        topMatch.rootPet,
                                                    )
                                                }}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                class="border-white/10 text-slate-200">
                                                {{
                                                    getEggGroupSummary(
                                                        topMatch.rootPet,
                                                    )
                                                }}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                class="border-white/10 text-slate-200">
                                                进化链成员
                                                {{ topMatch.memberCount }} 个
                                            </Badge>
                                        </div>
                                    </div>

                                    <div
                                        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        <div
                                            class="rounded-2xl border border-white/10 bg-black/20 p-4">
                                            <div
                                                class="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                                                <Ruler class="h-3.5 w-3.5" />
                                                身高区间
                                            </div>
                                            <div
                                                class="mt-3 text-lg font-semibold text-white">
                                                {{
                                                    getHeightRangeLabel(
                                                        topMatch,
                                                    )
                                                }}
                                            </div>
                                        </div>

                                        <div
                                            class="rounded-2xl border border-white/10 bg-black/20 p-4">
                                            <div
                                                class="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                                                <Scale class="h-3.5 w-3.5" />
                                                体重区间
                                            </div>
                                            <div
                                                class="mt-3 text-lg font-semibold text-white">
                                                {{
                                                    getWeightRangeLabel(
                                                        topMatch,
                                                    )
                                                }}
                                            </div>
                                        </div>

                                        <div
                                            class="rounded-2xl border border-white/10 bg-black/20 p-4">
                                            <div
                                                class="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                                                <Clock3 class="h-3.5 w-3.5" />
                                                孵化时长
                                            </div>
                                            <div
                                                class="mt-3 text-lg font-semibold text-white">
                                                {{
                                                    formatDuration(
                                                        topMatch.bestVariant
                                                            .hatchData,
                                                    )
                                                }}
                                            </div>
                                        </div>

                                        <div
                                            class="rounded-2xl border border-white/10 bg-black/20 p-4">
                                            <div
                                                class="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                                                <Egg class="h-3.5 w-3.5" />
                                                命中来源
                                            </div>
                                            <div
                                                class="mt-3 text-lg font-semibold text-white">
                                                {{ topMatch.sourcePetName }}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex flex-wrap gap-3">
                                        <Button
                                            as-child
                                            class="bg-amber-300 text-slate-950 hover:bg-amber-200">
                                            <RouterLink
                                                :to="`/pets/${topMatch.rootPet.id}`">
                                                查看图鉴
                                            </RouterLink>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            class="border-white/10 bg-white/6 text-slate-100 hover:bg-white/10"
                                            @click="resetInputs">
                                            重新输入
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs default-value="result" class="w-full">
                        <TabsList class="grid w-full grid-cols-2 bg-black/25">
                            <TabsTrigger value="result">推荐候选</TabsTrigger>
                            <TabsTrigger value="rule">匹配规则</TabsTrigger>
                        </TabsList>

                        <TabsContent value="result" class="mt-4">
                            <div
                                class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <Card
                                    v-for="result in visibleMatches"
                                    :key="result.rootPet.id"
                                    class="border-white/10 bg-black/25 py-0 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.88)] transition-transform hover:-translate-y-1">
                                    <CardContent class="space-y-4 px-5 py-5">
                                        <div class="flex items-start gap-4">
                                            <FriendPortrait
                                                :name="result.rootPet.name"
                                                :alt="
                                                    result.rootPet.localized.zh
                                                        .name
                                                "
                                                class="h-20 w-20 shrink-0 rounded-3xl border-white/10"
                                                img-class="object-contain p-2" />

                                            <div
                                                class="min-w-0 flex-1 space-y-2">
                                                <div>
                                                    <h3
                                                        class="truncate text-xl font-semibold text-white">
                                                        {{
                                                            result.rootPet
                                                                .localized.zh
                                                                .name
                                                        }}
                                                    </h3>
                                                    <p
                                                        class="text-sm text-slate-400">
                                                        {{
                                                            getTypeLabel(
                                                                result.rootPet,
                                                            )
                                                        }}
                                                    </p>
                                                </div>

                                                <div
                                                    class="flex flex-wrap gap-2">
                                                    <Badge variant="secondary">
                                                        {{
                                                            result.matchedMetricCount ===
                                                            2
                                                                ? "双命中"
                                                                : "单命中"
                                                        }}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        class="border-white/10 text-slate-200">
                                                        {{
                                                            result.sourcePetName
                                                        }}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="grid gap-3 sm:grid-cols-2">
                                            <div
                                                class="rounded-2xl border border-white/10 bg-white/6 p-3">
                                                <div
                                                    class="text-xs uppercase tracking-[0.2em] text-slate-400">
                                                    身高
                                                </div>
                                                <div
                                                    class="mt-2 text-sm font-medium text-slate-100">
                                                    {{
                                                        getHeightRangeLabel(
                                                            result,
                                                        )
                                                    }}
                                                </div>
                                            </div>

                                            <div
                                                class="rounded-2xl border border-white/10 bg-white/6 p-3">
                                                <div
                                                    class="text-xs uppercase tracking-[0.2em] text-slate-400">
                                                    体重
                                                </div>
                                                <div
                                                    class="mt-2 text-sm font-medium text-slate-100">
                                                    {{
                                                        getWeightRangeLabel(
                                                            result,
                                                        )
                                                    }}
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            class="space-y-2 text-sm leading-6 text-slate-400">
                                            <p>
                                                {{
                                                    getMatchSourceLabel(result)
                                                }}
                                            </p>
                                            <p>
                                                孵化时长：{{
                                                    formatDuration(
                                                        result.bestVariant
                                                            .hatchData,
                                                    )
                                                }}
                                            </p>
                                        </div>

                                        <Button
                                            as-child
                                            variant="outline"
                                            class="w-full border-white/10 bg-white/6 text-slate-100 hover:bg-white/10">
                                            <RouterLink
                                                :to="`/pets/${result.rootPet.id}`">
                                                查看
                                                {{
                                                    result.rootPet.localized.zh
                                                        .name
                                                }}
                                            </RouterLink>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            <div
                                v-if="remainingMatchCount > 0"
                                class="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p class="text-sm text-slate-500">
                                    还有
                                    {{ remainingMatchCount }}
                                    个命中结果未展开，当前已展示
                                    {{ visibleMatches.length }}
                                    个候选。
                                </p>
                                <Button
                                    variant="outline"
                                    class="border-white/10 bg-white/6 text-slate-100 hover:bg-white/10"
                                    @click="loadMoreMatches">
                                    继续加载候选
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="rule" class="mt-4">
                            <Card
                                class="border-white/10 bg-black/25 py-0 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.88)]">
                                <CardContent class="space-y-5 px-6 py-6">
                                    <div class="space-y-2">
                                        <h3
                                            class="text-xl font-semibold text-white">
                                            当前页面如何反推
                                        </h3>
                                        <p
                                            class="text-sm leading-7 text-slate-400">
                                            数据来自公开精灵表中的 breeding 与
                                            variants
                                            区间信息，页面不会伪造额外范围。
                                        </p>
                                    </div>

                                    <div class="grid gap-3 md:grid-cols-3">
                                        <div
                                            class="rounded-2xl border border-white/10 bg-white/6 p-4">
                                            <div
                                                class="text-sm font-medium text-white">
                                                1. 严格命中区间
                                            </div>
                                            <p
                                                class="mt-2 text-sm leading-6 text-slate-400">
                                                输入值必须落在身高或体重区间内，不做模糊扩张。
                                            </p>
                                        </div>

                                        <div
                                            class="rounded-2xl border border-white/10 bg-white/6 p-4">
                                            <div
                                                class="text-sm font-medium text-white">
                                                2. 按整条进化链判断
                                            </div>
                                            <p
                                                class="mt-2 text-sm leading-6 text-slate-400">
                                                任一进化形态命中后，统一回落展示最低阶段精灵。
                                            </p>
                                        </div>

                                        <div
                                            class="rounded-2xl border border-white/10 bg-white/6 p-4">
                                            <div
                                                class="text-sm font-medium text-white">
                                                3. 按贴合度排序
                                            </div>
                                            <p
                                                class="mt-2 text-sm leading-6 text-slate-400">
                                                越接近区间中心、区间越收敛的候选，会排得更靠前。
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </template>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
