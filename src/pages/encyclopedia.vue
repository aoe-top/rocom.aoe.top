<script setup lang="ts">
import { Search, Sparkles, SlidersHorizontal } from "lucide-vue-next";
import FriendPortrait from "@/components/FriendPortrait.vue";
import type { IFriend } from "@/lib/interface";

const INITIAL_BATCH_SIZE = 24;
const LOAD_MORE_BATCH_SIZE = 24;

const friends = ref<IFriend[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const searchQuery = ref("");
const selectedType = ref("all");
const selectedAttackStyle = ref("all");
const selectedSpecial = ref("all");
const sortBy = ref("id");
const visibleCount = ref(INITIAL_BATCH_SIZE);
const loadAnchor = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;
let controller: AbortController | null = null;

const attackStyleLabels: Record<string, string> = {
    Both: "双修",
    Magic: "魔攻",
    Magical: "魔攻",
    Physical: "物攻",
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
        friends.value
            .map((friend) => friend.evolves_from_id)
            .filter((id): id is number => typeof id === "number"),
    );
});

const typeOptions = computed(() => {
    const typeMap = new Map<number, string>();

    for (const friend of friends.value) {
        typeMap.set(friend.main_type.id, friend.main_type.localized.zh);

        if (friend.sub_type) {
            typeMap.set(friend.sub_type.id, friend.sub_type.localized.zh);
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
        new Set(friends.value.map((friend) => friend.preferred_attack_style)),
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
            value: friends.value.length,
        },
        {
            label: "筛选结果",
            value: filteredFriends.value.length,
        },
        {
            label: "首领形态",
            value: friends.value.filter((friend) => friend.is_leader_form)
                .length,
        },
        {
            label: "属性系别",
            value: typeOptions.value.length,
        },
    ];
});

const filteredFriends = computed(() => {
    const keyword = searchQuery.value.trim().toLowerCase();
    const filtered = friends.value.filter((friend) => {
        const matchesKeyword =
            keyword.length === 0 ||
            [
                friend.localized.zh.name,
                friend.name,
                String(friend.id),
                friend.main_type.localized.zh,
                friend.sub_type?.localized.zh ?? "",
                friend.default_legacy_type.localized.zh,
            ].some((field) => field.toLowerCase().includes(keyword));

        const matchesType =
            selectedType.value === "all" ||
            friend.main_type.id === Number(selectedType.value) ||
            friend.sub_type?.id === Number(selectedType.value);

        const matchesAttackStyle =
            selectedAttackStyle.value === "all" ||
            friend.preferred_attack_style === selectedAttackStyle.value;

        const matchesSpecial =
            selectedSpecial.value === "all" ||
            (selectedSpecial.value === "leader" && friend.is_leader_form) ||
            (selectedSpecial.value === "leader-potential" &&
                friend.leader_potential) ||
            (selectedSpecial.value === "base" &&
                friend.evolves_from_id === null) ||
            (selectedSpecial.value === "evolved" &&
                friend.evolves_from_id !== null) ||
            (selectedSpecial.value === "can-evolve" &&
                evolvedFromIds.value.has(friend.id));

        return (
            matchesKeyword &&
            matchesType &&
            matchesAttackStyle &&
            matchesSpecial
        );
    });

    return filtered.sort((left, right) => {
        switch (sortBy.value) {
            case "power":
                return getTotalStats(right) - getTotalStats(left);
            case "speed":
                return right.base_spd - left.base_spd;
            case "name":
                return left.localized.zh.name.localeCompare(
                    right.localized.zh.name,
                    "zh-CN",
                );
            default:
                return left.id - right.id;
        }
    });
});

const visibleFriends = computed(() => {
    return filteredFriends.value.slice(0, visibleCount.value);
});

const hasMore = computed(() => {
    return visibleFriends.value.length < filteredFriends.value.length;
});

watch(
    filteredFriends,
    (current) => {
        visibleCount.value = Math.min(INITIAL_BATCH_SIZE, current.length);
    },
    { immediate: true },
);

watch(loadAnchor, (current, previous) => {
    if (!observer) {
        return;
    }

    if (previous) {
        observer.unobserve(previous);
    }

    if (current) {
        observer.observe(current);
    }
});

onMounted(() => {
    observer = new IntersectionObserver(
        (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                loadMoreFriends();
            }
        },
        {
            rootMargin: "320px 0px",
        },
    );

    if (loadAnchor.value) {
        observer.observe(loadAnchor.value);
    }

    void getFriends();
});

onBeforeUnmount(() => {
    observer?.disconnect();
    controller?.abort();
});

function getAttackStyleLabel(style: string) {
    return attackStyleLabels[style] ?? style;
}

function getTotalStats(friend: IFriend) {
    return (
        friend.base_hp +
        friend.base_phy_atk +
        friend.base_mag_atk +
        friend.base_phy_def +
        friend.base_mag_def +
        friend.base_spd
    );
}

function getPeakStat(friend: IFriend) {
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

function getEvolutionLabel(friend: IFriend) {
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

function loadMoreFriends() {
    if (visibleCount.value >= filteredFriends.value.length) {
        return;
    }

    visibleCount.value = Math.min(
        visibleCount.value + LOAD_MORE_BATCH_SIZE,
        filteredFriends.value.length,
    );
}

async function getFriends() {
    controller?.abort();
    controller = new AbortController();
    isLoading.value = true;
    errorMessage.value = "";

    try {
        const response = await fetch("/data/friend.json", {
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        friends.value = await response.json();
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return;
        }

        errorMessage.value = "图鉴数据加载失败，请稍后重试。";
        friends.value = [];
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <section class="space-y-6">
        <Card
            class="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_18%),radial-gradient(circle_at_78%_18%,rgba(56,189,248,0.14),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] py-0 shadow-[0_28px_110px_-48px_rgba(0,0,0,0.92)]">
            <CardHeader class="gap-6 px-6 py-6">
                <div
                    class="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <CardTitle
                        class="text-3xl tracking-tight text-white md:text-4xl">
                        图鉴
                    </CardTitle>

                    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div
                            v-for="item in summaryItems"
                            :key="item.label"
                            class="rounded-3xl border border-white/10 bg-white/6 px-4 py-3 shadow-sm backdrop-blur-sm">
                            <p
                                class="text-xs tracking-[0.2em] text-slate-500 uppercase">
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

                <div class="grid gap-3 xl:grid-cols-[2fr_repeat(4,1fr)]">
                    <div class="relative xl:col-span-2">
                        <Search
                            class="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                            v-model="searchQuery"
                            type="search"
                            placeholder="搜索名称、编号、主副属性或遗传系别"
                            class="h-12 rounded-2xl border-white/10 bg-black/25 pl-11 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:border-primary/60 focus-visible:ring-primary/20" />
                    </div>

                    <Select v-model="selectedType">
                        <SelectTrigger
                            class="h-12 w-full rounded-2xl border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20">
                            <SelectValue placeholder="全部属性" />
                        </SelectTrigger>
                        <SelectContent
                            class="border-white/10 bg-slate-950/95 text-slate-100">
                            <SelectItem value="all">全部属性</SelectItem>
                            <SelectItem
                                v-for="option in typeOptions"
                                :key="option.value"
                                :value="option.value">
                                {{ option.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select v-model="selectedAttackStyle">
                        <SelectTrigger
                            class="h-12 w-full rounded-2xl border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20">
                            <SelectValue placeholder="全部倾向" />
                        </SelectTrigger>
                        <SelectContent
                            class="border-white/10 bg-slate-950/95 text-slate-100">
                            <SelectItem value="all">全部倾向</SelectItem>
                            <SelectItem
                                v-for="option in attackStyleOptions"
                                :key="option.value"
                                :value="option.value">
                                {{ option.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select v-model="selectedSpecial">
                        <SelectTrigger
                            class="h-12 w-full rounded-2xl border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20">
                            <SelectValue placeholder="全部阶段" />
                        </SelectTrigger>
                        <SelectContent
                            class="border-white/10 bg-slate-950/95 text-slate-100">
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

                    <Select v-model="sortBy">
                        <SelectTrigger
                            class="h-12 w-full rounded-2xl border-white/10 bg-black/25 text-slate-100 focus-visible:border-primary/60 focus-visible:ring-primary/20">
                            <SelectValue placeholder="按编号排序" />
                        </SelectTrigger>
                        <SelectContent
                            class="border-white/10 bg-slate-950/95 text-slate-100">
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
                    class="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                    <div class="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            class="rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                            <SlidersHorizontal
                                class="h-3.5 w-3.5 text-slate-400" />
                            当前渲染 {{ visibleFriends.length }} /
                            {{ filteredFriends.length }}
                        </Badge>
                        <Badge
                            v-if="searchQuery"
                            variant="outline"
                            class="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                            关键词 {{ searchQuery }}
                        </Badge>
                    </div>

                    <Button
                        v-if="hasMore"
                        variant="outline"
                        class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                        @click="loadMoreFriends">
                        继续加载
                    </Button>
                </div>
            </CardContent>
        </Card>

        <div
            v-if="isLoading"
            class="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            <Skeleton
                v-for="index in 6"
                :key="index"
                class="h-64 rounded-4xl border border-white/10 bg-white/6" />
        </div>

        <div
            v-else-if="errorMessage"
            class="rounded-4xl border border-destructive/20 bg-destructive/8 px-6 py-10 text-center text-sm text-destructive">
            {{ errorMessage }}
        </div>

        <div
            v-else-if="filteredFriends.length === 0"
            class="rounded-4xl border border-dashed border-white/12 bg-black/20 px-6 py-12 text-center text-sm text-slate-400">
            当前筛选条件下没有找到对应精灵，请尝试放宽关键词或切换筛选项。
        </div>

        <div
            v-else
            class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <RouterLink
                v-for="friend in visibleFriends"
                :key="friend.id"
                :to="`/friend/${friend.id}`"
                class="group block">
                <Card
                    class="h-full border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] py-0 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)] transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-[0_35px_80px_-34px_rgba(0,0,0,0.92)]"
                    style="
                        content-visibility: auto;
                        contain-intrinsic-size: 320px;
                    ">
                    <CardContent class="p-5">
                        <div class="flex gap-4">
                            <FriendPortrait
                                :name="friend.name"
                                :alt="friend.localized.zh.name"
                                class="h-24 w-24 shrink-0 rounded-3xl"
                                img-class="object-contain p-2 transition duration-300 group-hover:scale-105" />

                            <div class="min-w-0 flex-1">
                                <div
                                    class="flex items-start justify-between gap-3">
                                    <div class="min-w-0 space-y-1">
                                        <p
                                            class="text-xs tracking-[0.22em] text-slate-500 uppercase">
                                            No.{{ friend.id }}
                                        </p>
                                        <h3
                                            class="truncate text-xl font-semibold tracking-tight text-white">
                                            {{ friend.localized.zh.name }}
                                        </h3>
                                        <p
                                            class="truncate text-sm text-slate-400">
                                            {{
                                                getAttackStyleLabel(
                                                    friend.preferred_attack_style,
                                                )
                                            }}
                                        </p>
                                    </div>

                                    <Badge
                                        v-if="friend.is_leader_form"
                                        class="rounded-full border-0 bg-amber-400/15 px-2.5 py-1 text-xs font-medium text-amber-200">
                                        首领
                                    </Badge>
                                </div>

                                <div class="mt-3 flex flex-wrap gap-2">
                                    <Badge
                                        class="rounded-full bg-white/10 text-slate-100">
                                        {{ friend.main_type.localized.zh }}
                                    </Badge>
                                    <Badge
                                        v-if="friend.sub_type"
                                        variant="secondary"
                                        class="rounded-full bg-slate-700/60 text-slate-100">
                                        {{ friend.sub_type.localized.zh }}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        class="rounded-full border-sky-400/20 bg-sky-400/10 text-sky-200">
                                        {{
                                            friend.default_legacy_type.localized
                                                .zh
                                        }}遗传
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Separator class="mt-4 bg-white/8" />

                        <div class="mt-4 grid grid-cols-3 gap-2 text-sm">
                            <div
                                class="rounded-3xl border border-white/10 bg-black/20 px-3 py-2.5">
                                <p class="text-xs text-slate-500">总和</p>
                                <p class="mt-1 font-semibold text-white">
                                    {{ getTotalStats(friend) }}
                                </p>
                            </div>

                            <div
                                class="rounded-3xl border border-white/10 bg-black/20 px-3 py-2.5">
                                <p class="text-xs text-slate-500">速度</p>
                                <p class="mt-1 font-semibold text-white">
                                    {{ friend.base_spd }}
                                </p>
                            </div>

                            <div
                                class="rounded-3xl border border-white/10 bg-black/20 px-3 py-2.5">
                                <p class="text-xs text-slate-500">
                                    {{ getPeakStat(friend).label }}
                                </p>
                                <p class="mt-1 font-semibold text-white">
                                    {{ getPeakStat(friend).value }}
                                </p>
                            </div>
                        </div>

                        <div
                            class="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                            <Badge
                                variant="outline"
                                class="rounded-full border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                                {{ getEvolutionLabel(friend) }}
                            </Badge>
                            <Badge
                                v-if="friend.leader_potential"
                                variant="outline"
                                class="rounded-full border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-amber-200">
                                可转首领
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </RouterLink>
        </div>

        <div ref="loadAnchor" class="h-8" />
    </section>
</template>

<style scoped></style>
