<script setup lang="ts">
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import FriendPortrait from "@/components/FriendPortrait.vue";
import type {
    IPets,
    IPetsDetail,
    IFriendMove,
    IMonsterTypeDetail,
} from "@/lib/interface";
import {
    Crown,
    FlaskConical,
    RotateCcw,
    Share2,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Swords,
    Trash2,
    WandSparkles,
    Zap,
} from "lucide-vue-next";

type PanelTab = "friends" | "build";
type StatKey =
    | "base_hp"
    | "base_phy_atk"
    | "base_mag_atk"
    | "base_phy_def"
    | "base_mag_def"
    | "base_spd";

interface IPersonality {
    id: number;
    name: string;
    hp_mod_pct: number;
    phy_atk_mod_pct: number;
    mag_atk_mod_pct: number;
    phy_def_mod_pct: number;
    mag_def_mod_pct: number;
    spd_mod_pct: number;
    localized: {
        zh: string;
    };
}

interface IMagicItem {
    id: number;
    name: string;
    localized: {
        zh: {
            name: string;
            description: string;
        };
    };
}

interface ITeamSlot {
    slotId: number;
    friendId: number | null;
    personalityId: number | null;
    legacyTypeId: number | null;
    moveIds: number[];
}

interface ITeamState {
    name: string;
    magicItemId: number | null;
    slots: ITeamSlot[];
}

interface ITeamEntry {
    slot: ITeamSlot;
    friend: IPets;
    detail: IPetsDetail | null;
    personality: IPersonality | null;
    selectedMoves: IFriendMove[];
    effectiveStats: Record<StatKey, number>;
}

interface IMoveOption {
    move: IFriendMove;
    sourceKey: string;
    sourceLabel: string;
    recommended: boolean;
}

const TEAM_SLOT_COUNT = 6;
const MAX_MOVES_PER_SLOT = 4;
const STORAGE_KEY = "rocom.team-builder.v1";
const DEFAULT_TEAM_NAME = "未命名配队";

const route = useRoute();
const router = useRouter();

const friends = ref<IPets[]>([]);
const personalities = ref<IPersonality[]>([]);
const magicItems = ref<IMagicItem[]>([]);
const typeDetails = ref<IMonsterTypeDetail[]>([]);
const friendDetails = ref<Record<number, IPetsDetail>>({});
const moveMap = ref<Record<number, IFriendMove>>({});
const teamState = ref<ITeamState>(createDefaultTeamState());
const activeSlotId = ref(1);
const activePanelTab = ref<PanelTab>("friends");
const selectedTypeFilter = ref("all");
const selectedAttackStyleFilter = ref("all");
const selectedSpecialFilter = ref("all");
const autoBossId = ref<number | null>(null);
const autoThemeTypeId = ref<number | null>(null);
const autoPreferenceTypeId = ref<number | null>(null);
const autoPreferenceAttackStyle = ref("all");
const isLoading = ref(false);
const errorMessage = ref("");
const shareDialogOpen = ref(false);
const shareFeedback = ref("");
const isHydrated = ref(false);
const currentPageUrl = ref("");
const loadingSlotIds = ref<number[]>([]);
const draggedFriendId = ref<number | null>(null);
const draggedSlotId = ref<number | null>(null);
const dragOverSlotId = ref<number | null>(null);

const pendingDetailRequests = new Map<number, Promise<IPetsDetail | null>>();

const attackStyleLabels: Record<string, string> = {
    Both: "双修",
    Magic: "魔攻",
    Magical: "魔攻",
    Physical: "物攻",
};

const moveCategoryLabels: Record<string, string> = {
    Defense: "防御",
    "Magic Attack": "魔法输出",
    "Physical Attack": "物理输出",
    Status: "状态",
};

const statLabels: Record<StatKey, string> = {
    base_hp: "生命",
    base_mag_atk: "魔攻",
    base_mag_def: "魔防",
    base_phy_atk: "物攻",
    base_phy_def: "物防",
    base_spd: "速度",
};

const personalityModKeyMap: Record<StatKey, keyof IPersonality> = {
    base_hp: "hp_mod_pct",
    base_mag_atk: "mag_atk_mod_pct",
    base_mag_def: "mag_def_mod_pct",
    base_phy_atk: "phy_atk_mod_pct",
    base_phy_def: "phy_def_mod_pct",
    base_spd: "spd_mod_pct",
};

const typeToneMap: Record<string, string> = {
    Bug: "border-lime-400/30 bg-lime-400/12 text-lime-100",
    Cute: "border-pink-400/30 bg-pink-400/12 text-pink-100",
    Dark: "border-slate-400/30 bg-slate-400/12 text-slate-100",
    Dragon: "border-violet-400/30 bg-violet-400/12 text-violet-100",
    Electric: "border-yellow-400/30 bg-yellow-400/12 text-yellow-100",
    Fighting: "border-red-400/30 bg-red-400/12 text-red-100",
    Fire: "border-orange-400/30 bg-orange-400/12 text-orange-100",
    Flying: "border-sky-400/30 bg-sky-400/12 text-sky-100",
    Ghost: "border-indigo-400/30 bg-indigo-400/12 text-indigo-100",
    Grass: "border-emerald-400/30 bg-emerald-400/12 text-emerald-100",
    Ground: "border-amber-500/30 bg-amber-500/12 text-amber-100",
    Ice: "border-cyan-300/30 bg-cyan-300/12 text-cyan-50",
    Illusion: "border-fuchsia-400/30 bg-fuchsia-400/12 text-fuchsia-100",
    Leader: "border-amber-300/35 bg-amber-300/14 text-amber-50",
    Light: "border-amber-300/30 bg-amber-300/12 text-amber-50",
    Mechanical: "border-zinc-300/30 bg-zinc-300/12 text-zinc-100",
    Normal: "border-stone-300/30 bg-stone-300/12 text-stone-100",
    Poison: "border-purple-400/30 bg-purple-400/12 text-purple-100",
    Water: "border-blue-400/30 bg-blue-400/12 text-blue-100",
};

const friendMap = computed(() => {
    return new Map(friends.value.map((friend) => [friend.id, friend]));
});

const personalityMap = computed(() => {
    return new Map(personalities.value.map((item) => [item.id, item]));
});

const magicItemMap = computed(() => {
    return new Map(magicItems.value.map((item) => [item.id, item]));
});

const typeMap = computed(() => {
    return new Map(typeDetails.value.map((type) => [type.id, type]));
});

const typeNameMap = computed(() => {
    return new Map(
        typeDetails.value.map((type) => [type.name, type.localized.zh]),
    );
});

const selectedFriendUsageMap = computed(() => {
    const usage = new Map<number, number[]>();

    for (const slot of teamState.value.slots) {
        if (!slot.friendId) {
            continue;
        }

        usage.set(slot.friendId, [
            ...(usage.get(slot.friendId) ?? []),
            slot.slotId,
        ]);
    }

    return usage;
});

const typeOptions = computed(() => {
    const typeSet = new Map<number, string>();

    for (const friend of friends.value) {
        typeSet.set(friend.main_type.id, friend.main_type.localized.zh);

        if (friend.sub_type) {
            typeSet.set(friend.sub_type.id, friend.sub_type.localized.zh);
        }
    }

    return Array.from(typeSet.entries())
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

const autoAttackStyleOptions = computed(() => {
    return [
        {
            label: "任意输出",
            value: "all",
        },
        ...attackStyleOptions.value,
    ];
});

const bossOptions = computed(() => {
    return friends.value
        .filter((friend) => friend.is_leader_form)
        .sort((left, right) => left.id - right.id);
});

const selectedAutoBoss = computed(() => {
    return autoBossId.value
        ? (friendMap.value.get(autoBossId.value) ?? null)
        : null;
});

const selectedAutoBossWeaknesses = computed(() => {
    if (!selectedAutoBoss.value) {
        return [] as string[];
    }

    return Array.from(
        new Set(getTypeRelationLabels(selectedAutoBoss.value, "vulnerable_to")),
    );
});

const activeSlot = computed<ITeamSlot>(() => {
    return (
        teamState.value.slots.find(
            (slot) => slot.slotId === activeSlotId.value,
        ) ??
        teamState.value.slots[0] ??
        createEmptySlot(1)
    );
});

const activeFriend = computed(() => {
    return activeSlot.value.friendId
        ? (friendMap.value.get(activeSlot.value.friendId) ?? null)
        : null;
});

const activeFriendDetail = computed(() => {
    return activeSlot.value.friendId
        ? (friendDetails.value[activeSlot.value.friendId] ?? null)
        : null;
});

const activeLegacyOptions = computed(() => {
    return getLegacyTypeOptions(activeSlot.value);
});

const activeSelectedMoves = computed(() => {
    return getSelectedMoves(activeSlot.value);
});

const activeMoveGroups = computed(() => {
    const slot = activeSlot.value;
    const detail = activeFriendDetail.value;

    if (!slot.friendId || !detail) {
        return [] as Array<{ heading: string; options: IMoveOption[] }>;
    }

    const recommendedIds = new Set(getRecommendedMoveIds(slot));
    const groups = new Map<string, IMoveOption[]>();

    for (const option of getMoveOptions(slot)) {
        const entry: IMoveOption = {
            ...option,
            recommended: recommendedIds.has(option.move.id),
        };

        groups.set(option.sourceKey, [
            ...(groups.get(option.sourceKey) ?? []),
            entry,
        ]);
    }

    return Array.from(groups.entries()).map(([heading, options]) => ({
        heading,
        options,
    }));
});

const filteredCandidates = computed(() => {
    return [...friends.value]
        .filter((friend) => {
            const matchesType =
                selectedTypeFilter.value === "all" ||
                friend.main_type.id === Number(selectedTypeFilter.value) ||
                friend.sub_type?.id === Number(selectedTypeFilter.value);

            const matchesAttackStyle =
                selectedAttackStyleFilter.value === "all" ||
                friend.preferred_attack_style ===
                    selectedAttackStyleFilter.value;

            const matchesSpecial =
                selectedSpecialFilter.value === "all" ||
                (selectedSpecialFilter.value === "leader" &&
                    friend.is_leader_form) ||
                (selectedSpecialFilter.value === "leader-potential" &&
                    friend.leader_potential) ||
                (selectedSpecialFilter.value === "base" &&
                    friend.evolves_from_id === null) ||
                (selectedSpecialFilter.value === "evolved" &&
                    friend.evolves_from_id !== null);

            return matchesType && matchesAttackStyle && matchesSpecial;
        })
        .sort((left, right) => {
            const leftUsed =
                selectedFriendUsageMap.value.get(left.id)?.length ?? 0;
            const rightUsed =
                selectedFriendUsageMap.value.get(right.id)?.length ?? 0;

            if (leftUsed !== rightUsed) {
                return leftUsed - rightUsed;
            }

            return left.id - right.id;
        });
});

const teamEntries = computed<ITeamEntry[]>(() => {
    return teamState.value.slots
        .map((slot) => {
            if (!slot.friendId) {
                return null;
            }

            const friend = friendMap.value.get(slot.friendId);

            if (!friend) {
                return null;
            }

            const personality = slot.personalityId
                ? (personalityMap.value.get(slot.personalityId) ?? null)
                : null;

            return {
                slot,
                friend,
                detail: friendDetails.value[friend.id] ?? null,
                personality,
                selectedMoves: getSelectedMoves(slot),
                effectiveStats: buildEffectiveStats(friend, personality),
            } satisfies ITeamEntry;
        })
        .filter((entry): entry is ITeamEntry => entry !== null);
});

const filledSlotCount = computed(() => teamEntries.value.length);

const selectedMagicItem = computed(() => {
    return teamState.value.magicItemId
        ? (magicItemMap.value.get(teamState.value.magicItemId) ?? null)
        : null;
});

const teamSummaryItems = computed(() => {
    const avgSpeed =
        teamEntries.value.length === 0
            ? 0
            : Math.round(
                  teamEntries.value.reduce(
                      (sum, entry) => sum + entry.effectiveStats.base_spd,
                      0,
                  ) / teamEntries.value.length,
              );

    const leaderCount = teamEntries.value.filter(
        (entry) => entry.friend.is_leader_form,
    ).length;

    const coverageCount = new Set(
        teamEntries.value.flatMap((entry) =>
            entry.selectedMoves.length > 0
                ? entry.selectedMoves.map((move) => move.move_type.localized.zh)
                : getFriendTypes(entry.friend).map((type) => type.localized.zh),
        ),
    ).size;

    return [
        {
            label: "已选槽位",
            value: `${filledSlotCount.value}/${TEAM_SLOT_COUNT}`,
        },
        {
            label: "平均速度",
            value: avgSpeed,
        },
        {
            label: "首领形态",
            value: leaderCount,
        },
        {
            label: "攻击覆盖",
            value: coverageCount,
        },
    ];
});

const attackProfile = computed(() => {
    const profile = {
        both: 0,
        magic: 0,
        physical: 0,
    };

    for (const entry of teamEntries.value) {
        const style = entry.friend.preferred_attack_style;

        if (style === "Physical") {
            profile.physical += 1;
            continue;
        }

        if (style === "Magic" || style === "Magical") {
            profile.magic += 1;
            continue;
        }

        profile.both += 1;
    }

    return profile;
});

const attackCoverage = computed(() => {
    const coverage = new Map<number, string>();

    for (const entry of teamEntries.value) {
        const moves = entry.selectedMoves;

        if (moves.length === 0) {
            for (const type of getFriendTypes(entry.friend)) {
                coverage.set(type.id, type.localized.zh);
            }

            continue;
        }

        for (const move of moves) {
            coverage.set(move.move_type.id, move.move_type.localized.zh);
        }
    }

    return Array.from(coverage.entries())
        .map(([id, label]) => ({ id, label }))
        .sort((left, right) => left.id - right.id);
});

const defenseSummary = computed(() => {
    const attackTypes = typeDetails.value.filter((type) => type.id !== 19);

    const summary = attackTypes.map((attackType) => {
        let weak = 0;
        let resist = 0;

        for (const entry of teamEntries.value) {
            const net = getFriendDefenseNet(entry.friend, attackType.name);

            if (net > 0) {
                weak += 1;
            }

            if (net < 0) {
                resist += 1;
            }
        }

        return {
            attackTypeId: attackType.id,
            label: attackType.localized.zh,
            resist,
            weak,
        };
    });

    return {
        resistances: summary
            .filter((item) => item.resist > 0)
            .sort(
                (left, right) =>
                    right.resist - left.resist ||
                    left.attackTypeId - right.attackTypeId,
            )
            .slice(0, 5),
        weaknesses: summary
            .filter((item) => item.weak > 0)
            .sort(
                (left, right) =>
                    right.weak - left.weak ||
                    left.attackTypeId - right.attackTypeId,
            )
            .slice(0, 5),
    };
});

const analysisHighlights = computed(() => {
    const highlights: string[] = [];

    if (filledSlotCount.value < TEAM_SLOT_COUNT) {
        highlights.push(
            `还有 ${TEAM_SLOT_COUNT - filledSlotCount.value} 个槽位待补充。`,
        );
    }

    if (!teamEntries.value.some((entry) => entry.friend.is_leader_form)) {
        highlights.push("当前阵容没有首领形态，爆发上限可能偏保守。");
    }

    if (attackCoverage.value.length < 5 && filledSlotCount.value >= 3) {
        highlights.push("攻击覆盖偏窄，建议补更多系别的技能或副属性。");
    }

    const topWeakness = defenseSummary.value.weaknesses[0];

    if (topWeakness && topWeakness.weak >= 3) {
        highlights.push(
            `全队对 ${topWeakness.label} 系承压较大，最好补一到两只抗性位。`,
        );
    }

    if (highlights.length === 0) {
        highlights.push("当前阵容结构比较均衡，可以继续微调技能覆盖与血脉。");
    }

    return highlights;
});

const shareLink = computed(() => {
    if (!currentPageUrl.value) {
        return "";
    }

    return `${currentPageUrl.value}?team=${encodeTeamState(teamState.value)}`;
});

watch(
    teamState,
    (state) => {
        if (!isHydrated.value || typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(serializeTeamState(state)),
        );
    },
    { deep: true },
);

watch(activeSlotId, () => {
    shareFeedback.value = "";
});

onMounted(async () => {
    currentPageUrl.value = `${window.location.origin}${route.path}`;
    await loadBootstrapData();
});

function createDefaultTeamState(): ITeamState {
    return {
        name: DEFAULT_TEAM_NAME,
        magicItemId: null,
        slots: Array.from({ length: TEAM_SLOT_COUNT }, (_, index) =>
            createEmptySlot(index + 1),
        ),
    };
}

function createEmptySlot(slotId: number): ITeamSlot {
    return {
        slotId,
        friendId: null,
        personalityId: null,
        legacyTypeId: null,
        moveIds: [],
    };
}

function serializeTeamState(state: ITeamState) {
    return {
        name: state.name,
        magicItemId: state.magicItemId,
        slots: state.slots.map((slot) => ({
            friendId: slot.friendId,
            legacyTypeId: slot.legacyTypeId,
            moveIds: slot.moveIds,
            personalityId: slot.personalityId,
        })),
    };
}

function normalizeTeamState(input: unknown): ITeamState {
    const fallback = createDefaultTeamState();

    if (!input || typeof input !== "object") {
        return fallback;
    }

    const maybeState = input as {
        magicItemId?: unknown;
        name?: unknown;
        slots?: unknown[];
    };

    return {
        name:
            typeof maybeState.name === "string" &&
            maybeState.name.trim().length > 0
                ? maybeState.name.trim().slice(0, 32)
                : fallback.name,
        magicItemId: toNullableNumber(maybeState.magicItemId),
        slots: Array.from({ length: TEAM_SLOT_COUNT }, (_, index) => {
            const maybeSlot = Array.isArray(maybeState.slots)
                ? maybeState.slots[index]
                : null;

            return normalizeTeamSlot(maybeSlot, index + 1);
        }),
    };
}

function normalizeTeamSlot(input: unknown, slotId: number): ITeamSlot {
    if (!input || typeof input !== "object") {
        return createEmptySlot(slotId);
    }

    const maybeSlot = input as {
        friendId?: unknown;
        legacyTypeId?: unknown;
        moveIds?: unknown;
        personalityId?: unknown;
    };

    return {
        slotId,
        friendId: toNullableNumber(maybeSlot.friendId),
        personalityId: toNullableNumber(maybeSlot.personalityId),
        legacyTypeId: toNullableNumber(maybeSlot.legacyTypeId),
        moveIds: Array.isArray(maybeSlot.moveIds)
            ? maybeSlot.moveIds
                  .map((value) => toNullableNumber(value))
                  .filter((value): value is number => value !== null)
                  .filter((value, index, list) => list.indexOf(value) === index)
                  .slice(0, MAX_MOVES_PER_SLOT)
            : [],
    };
}

function toNullableNumber(value: unknown) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

async function loadBootstrapData() {
    isLoading.value = true;
    errorMessage.value = "";

    try {
        const [friendData, personalityData, magicItemData, typeData, moveData] =
            await Promise.all([
                fetchJSON<IPets[]>("/data/Pets.json"),
                fetchJSON<IPersonality[]>("/data/personalities.json"),
                fetchJSON<IMagicItem[]>("/data/magic_items.json"),
                fetchJSON<IMonsterTypeDetail[]>("/data/types.json"),
                fetchJSON<IFriendMove[]>("/data/moves.json"),
            ]);

        friends.value = friendData;
        personalities.value = personalityData;
        magicItems.value = magicItemData;
        typeDetails.value = typeData;
        moveMap.value = Object.fromEntries(
            moveData.map((move) => [move.id, move]),
        );

        const initialState = await resolveInitialTeamState();
        teamState.value = initialState;
        isHydrated.value = true;
    } catch (error) {
        errorMessage.value = "配队数据加载失败，请稍后重试。";
        teamState.value = createDefaultTeamState();
    } finally {
        isLoading.value = false;
    }
}

async function resolveInitialTeamState() {
    const routeTeam =
        typeof route.query.team === "string" ? route.query.team : "";

    if (routeTeam) {
        const decoded = decodeTeamState(routeTeam);

        if (decoded) {
            return await hydrateTeamState(decoded);
        }
    }

    if (typeof window !== "undefined") {
        const cached = window.localStorage.getItem(STORAGE_KEY);

        if (cached) {
            try {
                return await hydrateTeamState(JSON.parse(cached));
            } catch {
                window.localStorage.removeItem(STORAGE_KEY);
            }
        }
    }

    return createDefaultTeamState();
}

async function hydrateTeamState(input: unknown) {
    const normalized = normalizeTeamState(input);
    const friendIds = normalized.slots
        .map((slot) => slot.friendId)
        .filter((value): value is number => value !== null);

    await Promise.all(
        friendIds.map((friendId) => ensureFriendDetail(friendId)),
    );

    return {
        ...normalized,
        magicItemId: magicItemMap.value.has(normalized.magicItemId ?? -1)
            ? normalized.magicItemId
            : null,
        slots: normalized.slots.map((slot) => finalizeSlot(slot)),
    } satisfies ITeamState;
}

function finalizeSlot(slot: ITeamSlot) {
    if (!slot.friendId) {
        return createEmptySlot(slot.slotId);
    }

    const friend = friendMap.value.get(slot.friendId);
    const detail = friendDetails.value[slot.friendId];

    if (!friend || !detail) {
        return createEmptySlot(slot.slotId);
    }

    const personalityId = personalityMap.value.has(slot.personalityId ?? -1)
        ? slot.personalityId
        : getDefaultPersonalityId(friend);

    const legacyOptions = getLegacyTypeOptions(slot, detail);
    const validLegacyId = legacyOptions.some(
        (item) => item.id === slot.legacyTypeId,
    )
        ? slot.legacyTypeId
        : friend.default_legacy_type.id;

    const validMoveIds = slot.moveIds.filter((moveId, index, list) => {
        return (
            list.indexOf(moveId) === index &&
            getMoveOptions(
                { ...slot, legacyTypeId: validLegacyId },
                detail,
            ).some((option) => option.move.id === moveId)
        );
    });

    return {
        ...slot,
        legacyTypeId: validLegacyId,
        moveIds:
            validMoveIds.length > 0
                ? validMoveIds.slice(0, MAX_MOVES_PER_SLOT)
                : getRecommendedMoveIds(
                      {
                          ...slot,
                          legacyTypeId: validLegacyId,
                          personalityId,
                      },
                      detail,
                  ),
        personalityId,
    } satisfies ITeamSlot;
}

async function ensureFriendDetail(friendId: number) {
    if (friendDetails.value[friendId]) {
        return friendDetails.value[friendId];
    }

    const pending = pendingDetailRequests.get(friendId);

    if (pending) {
        return await pending;
    }

    const request = (async () => {
        try {
            const detail = await fetchJSON<IPetsDetail>(
                `/data/pets/${friendId}.json`,
            );
            friendDetails.value = {
                ...friendDetails.value,
                [friendId]: detail,
            };
            return detail;
        } catch {
            return null;
        } finally {
            pendingDetailRequests.delete(friendId);
        }
    })();

    pendingDetailRequests.set(friendId, request);
    return await request;
}

async function fetchJSON<T>(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
    }

    return (await response.json()) as T;
}

function getAttackStyleLabel(style: string) {
    return attackStyleLabels[style] ?? style;
}

function getTotalStats(friend: IPets) {
    return (
        friend.base_hp +
        friend.base_phy_atk +
        friend.base_mag_atk +
        friend.base_phy_def +
        friend.base_mag_def +
        friend.base_spd
    );
}

function getTypeTone(typeName: string) {
    return typeToneMap[typeName] ?? "border-white/12 bg-white/8 text-slate-100";
}

function getFriendTypes(friend: IPets) {
    return [friend.main_type, friend.sub_type].filter(
        (
            type,
        ): type is
            | NonNullable<typeof friend.sub_type>
            | typeof friend.main_type => Boolean(type),
    );
}

function buildEffectiveStats(friend: IPets, personality: IPersonality | null) {
    return Object.keys(statLabels).reduce(
        (result, key) => {
            const statKey = key as StatKey;
            const modifier = personality
                ? Number(personality[personalityModKeyMap[statKey]])
                : 0;

            return {
                ...result,
                [statKey]: Math.round(friend[statKey] * (1 + modifier)),
            };
        },
        {} as Record<StatKey, number>,
    );
}

function getPeakStatLabel(entry: ITeamEntry) {
    return (
        Object.entries(entry.effectiveStats)
            .map(([key, value]) => ({
                key: key as StatKey,
                label: statLabels[key as StatKey],
                value,
            }))
            .sort((left, right) => right.value - left.value)[0] ?? {
            key: "base_hp" as StatKey,
            label: "生命",
            value: 0,
        }
    );
}

function getFriendDefenseNet(friend: IPets, attackTypeName: string) {
    return getFriendTypes(friend).reduce((score, type) => {
        const typeDetail = typeMap.value.get(type.id);

        if (!typeDetail) {
            return score;
        }

        if (typeDetail.vulnerable_to.includes(attackTypeName)) {
            return score + 1;
        }

        if (typeDetail.resistant_to.includes(attackTypeName)) {
            return score - 1;
        }

        return score;
    }, 0);
}

function getTypeRelationLabels(
    friend: IPets,
    relation: "vulnerable_to" | "resistant_to",
) {
    const labels = new Set<string>();

    for (const type of getFriendTypes(friend)) {
        const typeDetail = typeMap.value.get(type.id);

        if (!typeDetail) {
            continue;
        }

        for (const typeName of typeDetail[relation]) {
            labels.add(typeNameMap.value.get(typeName) ?? typeName);
        }
    }

    return Array.from(labels);
}

function getFriendTypeNameSet(friend: IPets) {
    return new Set(
        [
            friend.main_type.name,
            friend.sub_type?.name,
            friend.default_legacy_type.name,
        ].filter((value): value is string => Boolean(value)),
    );
}

function getDefaultPersonalityId(friend: IPets) {
    if (friend.preferred_attack_style === "Physical") {
        return 6;
    }

    if (
        friend.preferred_attack_style === "Magic" ||
        friend.preferred_attack_style === "Magical"
    ) {
        return 11;
    }

    return 1;
}

function getLegacyTypeOptions(
    slot: ITeamSlot,
    detail = activeFriendDetail.value,
) {
    if (!slot.friendId || !detail) {
        return [] as Array<{ id: number; label: string }>;
    }

    const friend = friendMap.value.get(slot.friendId);

    if (!friend) {
        return [];
    }

    const legacyIds = new Set<number>([
        friend.default_legacy_type.id,
        ...detail.legacy_moves.map((item) => item.type_id),
    ]);

    return Array.from(legacyIds)
        .map((typeId) => {
            const type = typeMap.value.get(typeId);

            return {
                id: typeId,
                label: type?.localized.zh ?? `血脉 ${typeId}`,
            };
        })
        .sort((left, right) => left.id - right.id);
}

function getLegacyMove(slot: ITeamSlot, detail = activeFriendDetail.value) {
    if (!slot.friendId || !detail || !slot.legacyTypeId) {
        return null;
    }

    const legacyMoveEntry = detail.legacy_moves.find(
        (item) => item.type_id === slot.legacyTypeId,
    );

    if (!legacyMoveEntry) {
        return null;
    }

    return moveMap.value[legacyMoveEntry.move_id] ?? null;
}

function getMoveOptions(slot: ITeamSlot, detail = activeFriendDetail.value) {
    if (!slot.friendId || !detail) {
        return [] as IMoveOption[];
    }

    const friend = friendMap.value.get(slot.friendId);

    if (!friend) {
        return [];
    }

    const optionMap = new Map<number, IMoveOption>();

    for (const move of detail.move_pool) {
        optionMap.set(move.id, {
            move,
            recommended: false,
            sourceKey: "技能池",
            sourceLabel: "技能池",
        });
    }

    for (const move of detail.move_stones) {
        optionMap.set(move.id, {
            move,
            recommended: false,
            sourceKey: "技能石",
            sourceLabel: "技能石",
        });
    }

    const legacyMove = getLegacyMove(slot, detail);

    if (legacyMove) {
        optionMap.set(legacyMove.id, {
            move: legacyMove,
            recommended: false,
            sourceKey: "遗传技能",
            sourceLabel: `遗传 · ${typeMap.value.get(slot.legacyTypeId ?? -1)?.localized.zh ?? "血脉"}`,
        });
    }

    return Array.from(optionMap.values()).sort((left, right) => {
        return (
            getMoveRank(right.move, friend) - getMoveRank(left.move, friend) ||
            right.move.energy_cost - left.move.energy_cost ||
            left.move.id - right.move.id
        );
    });
}

function getMoveRank(move: IFriendMove, friend: IPets) {
    let score = typeof move.power === "number" ? move.power : 18;

    if (
        move.move_type.id === friend.main_type.id ||
        move.move_type.id === friend.sub_type?.id
    ) {
        score += 48;
    }

    if (move.move_type.id === friend.default_legacy_type.id) {
        score += 18;
    }

    if (
        friend.preferred_attack_style === "Physical" &&
        move.move_category === "Physical Attack"
    ) {
        score += 26;
    }

    if (
        (friend.preferred_attack_style === "Magic" ||
            friend.preferred_attack_style === "Magical") &&
        move.move_category === "Magic Attack"
    ) {
        score += 26;
    }

    if (
        friend.preferred_attack_style === "Both" &&
        (move.move_category === "Physical Attack" ||
            move.move_category === "Magic Attack")
    ) {
        score += 14;
    }

    if (move.move_category === "Status") {
        score += 6;
    }

    if (move.move_category === "Defense") {
        score += 3;
    }

    return score;
}

function getRecommendedMoveIds(
    slot: ITeamSlot,
    detail = activeFriendDetail.value,
) {
    return getMoveOptions(slot, detail)
        .slice(0, MAX_MOVES_PER_SLOT)
        .map((option) => option.move.id);
}

function getSelectedMoves(slot: ITeamSlot) {
    const detail = slot.friendId
        ? (friendDetails.value[slot.friendId] ?? null)
        : null;
    const options = getMoveOptions(slot, detail);
    const optionMap = new Map(
        options.map((option) => [option.move.id, option.move]),
    );

    return slot.moveIds
        .map((moveId) => optionMap.get(moveId) ?? null)
        .filter((move): move is IFriendMove => move !== null);
}

function getPersonalitySummary(slot: ITeamSlot) {
    return slot.personalityId
        ? (personalityMap.value.get(slot.personalityId)?.localized.zh ?? "待选")
        : "待选";
}

function getLegacySummary(slot: ITeamSlot) {
    return slot.legacyTypeId
        ? (typeMap.value.get(slot.legacyTypeId)?.localized.zh ?? "待选")
        : "待选";
}

function getSlotFriend(slot: ITeamSlot) {
    return slot.friendId ? (friendMap.value.get(slot.friendId) ?? null) : null;
}

function getSlotEntry(slot: ITeamSlot) {
    return (
        teamEntries.value.find((entry) => entry.slot.slotId === slot.slotId) ??
        null
    );
}

function isSlotLoading(slotId: number) {
    return loadingSlotIds.value.includes(slotId);
}

function getMoveCategoryLabel(category: string) {
    return moveCategoryLabels[category] ?? category;
}

function getSelectValue(value: number | null) {
    return value === null ? "none" : String(value);
}

function selectSlot(slotId: number) {
    activeSlotId.value = slotId;
    activePanelTab.value = "friends";
    shareFeedback.value = "";
}

function markSlotLoading(slotId: number, nextState: boolean) {
    loadingSlotIds.value = nextState
        ? Array.from(new Set([...loadingSlotIds.value, slotId]))
        : loadingSlotIds.value.filter((id) => id !== slotId);
}

function patchSlot(slotId: number, updater: (slot: ITeamSlot) => ITeamSlot) {
    teamState.value = {
        ...teamState.value,
        slots: teamState.value.slots.map((slot) =>
            slot.slotId === slotId ? updater(slot) : slot,
        ),
    };
}

async function assignFriendToActiveSlot(friendId: number) {
    await assignFriendToSlot(activeSlot.value.slotId, friendId);
}

async function assignFriendToSlot(
    slotId: number,
    friendId: number,
    nextPanel: PanelTab = "build",
) {
    const targetSlotId = slotId;
    markSlotLoading(targetSlotId, true);
    shareFeedback.value = "";

    const detail = await ensureFriendDetail(friendId);
    const friend = friendMap.value.get(friendId);

    markSlotLoading(targetSlotId, false);

    if (!detail || !friend) {
        shareFeedback.value = "精灵详情加载失败，请重试。";
        return;
    }

    const draftSlot: ITeamSlot = {
        slotId: targetSlotId,
        friendId,
        personalityId: getDefaultPersonalityId(friend),
        legacyTypeId: friend.default_legacy_type.id,
        moveIds: [],
    };

    patchSlot(targetSlotId, () => ({
        ...draftSlot,
        moveIds: getRecommendedMoveIds(draftSlot, detail),
    }));
    activeSlotId.value = targetSlotId;
    activePanelTab.value = nextPanel;
}

function clearSlot(slotId: number) {
    patchSlot(slotId, () => createEmptySlot(slotId));
}

function updateSlotPersonality(slotId: number, value: unknown) {
    const nextValue = normalizeSelectValue(value);

    patchSlot(slotId, (slot) => ({
        ...slot,
        personalityId:
            nextValue === null || nextValue === "none"
                ? null
                : Number(nextValue),
    }));
}

function updateSlotLegacyType(slotId: number, value: unknown) {
    const nextValue = normalizeSelectValue(value);

    patchSlot(slotId, (slot) => {
        const legacyTypeId =
            nextValue === null || nextValue === "none"
                ? null
                : Number(nextValue);
        const nextSlot = {
            ...slot,
            legacyTypeId,
        };

        return finalizeSlot(nextSlot);
    });
}

function toggleMoveSelection(moveId: number) {
    patchSlot(activeSlot.value.slotId, (slot) => {
        if (slot.moveIds.includes(moveId)) {
            return {
                ...slot,
                moveIds: slot.moveIds.filter((id) => id !== moveId),
            };
        }

        if (slot.moveIds.length >= MAX_MOVES_PER_SLOT) {
            shareFeedback.value = "技能最多选择 4 个。";
            return slot;
        }

        shareFeedback.value = "";

        return {
            ...slot,
            moveIds: [...slot.moveIds, moveId],
        };
    });
}

function applyRecommendedMoves(slotId: number) {
    patchSlot(slotId, (slot) => ({
        ...slot,
        moveIds: getRecommendedMoveIds(slot),
    }));
}

async function fillTeamWithFriendIds(
    friendIds: number[],
    options?: {
        magicItemId?: number | null;
        teamName?: string;
    },
) {
    const uniqueIds = friendIds.filter(
        (friendId, index, list) => list.indexOf(friendId) === index,
    );

    if (uniqueIds.length === 0) {
        shareFeedback.value = "没有可用于自动配队的精灵。";
        return;
    }

    await Promise.all(
        uniqueIds.map((friendId) => ensureFriendDetail(friendId)),
    );

    const slots = Array.from({ length: TEAM_SLOT_COUNT }, (_, index) => {
        const friendId = uniqueIds[index] ?? null;

        if (friendId === null) {
            return createEmptySlot(index + 1);
        }

        const friend = friendMap.value.get(friendId);

        if (!friend) {
            return createEmptySlot(index + 1);
        }

        return finalizeSlot({
            slotId: index + 1,
            friendId,
            personalityId: getDefaultPersonalityId(friend),
            legacyTypeId: friend.default_legacy_type.id,
            moveIds: [],
        });
    });

    teamState.value = {
        ...teamState.value,
        name: options?.teamName ?? teamState.value.name,
        magicItemId:
            options?.magicItemId === undefined
                ? teamState.value.magicItemId
                : options.magicItemId,
        slots,
    };
    activeSlotId.value = 1;
    activePanelTab.value = "build";
}

function rankFriends(
    scoreFn: (friend: IPets) => number,
    friendsPool = friends.value,
) {
    return [...friendsPool].sort((left, right) => {
        return scoreFn(right) - scoreFn(left) || left.id - right.id;
    });
}

function takeUniqueFriendIds(...groups: IPets[][]) {
    const result: number[] = [];

    for (const group of groups) {
        for (const friend of group) {
            if (result.includes(friend.id)) {
                continue;
            }

            result.push(friend.id);

            if (result.length >= TEAM_SLOT_COUNT) {
                return result;
            }
        }
    }

    return result;
}

function getBossCounterScore(candidate: IPets, boss: IPets) {
    const bossAttackTypes = getFriendTypes(boss).map((type) => type.name);
    const bossWeakTypeNames = new Set<string>();

    for (const type of getFriendTypes(boss)) {
        const detail = typeMap.value.get(type.id);

        if (!detail) {
            continue;
        }

        for (const attackType of detail.vulnerable_to) {
            bossWeakTypeNames.add(attackType);
        }
    }

    const candidateTypeNames = getFriendTypeNameSet(candidate);
    const defenseScore = bossAttackTypes.reduce((score, typeName) => {
        return score - getFriendDefenseNet(candidate, typeName) * 90;
    }, 0);

    const offenseScore = Array.from(candidateTypeNames).reduce(
        (score, typeName) => {
            return score + (bossWeakTypeNames.has(typeName) ? 55 : 0);
        },
        0,
    );

    return (
        defenseScore +
        offenseScore +
        candidate.base_spd * 1.1 +
        getTotalStats(candidate) * 0.08 +
        (candidate.is_leader_form ? 8 : 0)
    );
}

function getThemeScore(candidate: IPets, typeId: number) {
    return (
        (candidate.main_type.id === typeId ? 160 : 0) +
        (candidate.sub_type?.id === typeId ? 100 : 0) +
        (candidate.default_legacy_type.id === typeId ? 60 : 0) +
        candidate.base_spd * 0.9 +
        getTotalStats(candidate) * 0.08 +
        (candidate.is_leader_form ? 10 : 0)
    );
}

function getPreferenceScore(
    candidate: IPets,
    desiredTypeId: number | null,
    desiredAttackStyle: string,
) {
    const typeScore =
        desiredTypeId === null ? 0 : getThemeScore(candidate, desiredTypeId);
    const styleScore =
        desiredAttackStyle === "all"
            ? 0
            : candidate.preferred_attack_style === desiredAttackStyle
              ? 120
              : candidate.preferred_attack_style === "Both"
                ? 45
                : -15;

    return (
        typeScore +
        styleScore +
        candidate.base_spd +
        getTotalStats(candidate) * 0.06
    );
}

async function generateBossAutoTeam() {
    if (autoBossId.value === null) {
        shareFeedback.value = "先选择一个目标首领。";
        return;
    }

    const boss = friendMap.value.get(autoBossId.value);

    if (!boss) {
        shareFeedback.value = "目标首领不存在。";
        return;
    }

    const ranked = rankFriends(
        (friend) => getBossCounterScore(friend, boss),
        friends.value.filter((friend) => friend.id !== boss.id),
    );

    const friendIds = takeUniqueFriendIds(ranked);
    await fillTeamWithFriendIds(friendIds, {
        teamName: `${boss.localized.zh.name} 对策队`,
    });
    shareFeedback.value = `已生成针对 ${boss.localized.zh.name} 的自动配队。`;
}

async function generateTypeAutoTeam() {
    if (autoThemeTypeId.value === null) {
        shareFeedback.value = "先选择一个属性。";
        return;
    }

    const primaryMatches = rankFriends(
        (friend) => getThemeScore(friend, autoThemeTypeId.value ?? -1),
        friends.value.filter(
            (friend) =>
                friend.main_type.id === autoThemeTypeId.value ||
                friend.sub_type?.id === autoThemeTypeId.value ||
                friend.default_legacy_type.id === autoThemeTypeId.value,
        ),
    );
    const fallback = rankFriends((friend) =>
        getThemeScore(friend, autoThemeTypeId.value ?? -1),
    );
    const friendIds = takeUniqueFriendIds(primaryMatches, fallback);
    const typeLabel =
        typeMap.value.get(autoThemeTypeId.value)?.localized.zh ?? "主题";

    await fillTeamWithFriendIds(friendIds, {
        teamName: `${typeLabel} 属性队`,
    });
    shareFeedback.value = `已生成 ${typeLabel} 属性自动配队。`;
}

async function generateRandomAutoTeam() {
    const pool = [...friends.value];

    for (let index = pool.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        const current = pool[index];
        const random = pool[randomIndex];

        if (!current || !random) {
            continue;
        }

        pool[index] = random;
        pool[randomIndex] = current;
    }

    await fillTeamWithFriendIds(
        pool.slice(0, TEAM_SLOT_COUNT).map((friend) => friend.id),
        {
            teamName: "随机配队",
        },
    );
    shareFeedback.value = "已生成随机配队。";
}

async function generatePreferenceAutoTeam() {
    if (
        autoPreferenceTypeId.value === null &&
        autoPreferenceAttackStyle.value === "all"
    ) {
        shareFeedback.value = "至少设置一个属性或输出偏好。";
        return;
    }

    const preferredMatches = rankFriends(
        (friend) =>
            getPreferenceScore(
                friend,
                autoPreferenceTypeId.value,
                autoPreferenceAttackStyle.value,
            ),
        friends.value.filter((friend) => {
            const matchesType =
                autoPreferenceTypeId.value === null ||
                friend.main_type.id === autoPreferenceTypeId.value ||
                friend.sub_type?.id === autoPreferenceTypeId.value ||
                friend.default_legacy_type.id === autoPreferenceTypeId.value;
            const matchesStyle =
                autoPreferenceAttackStyle.value === "all" ||
                friend.preferred_attack_style ===
                    autoPreferenceAttackStyle.value ||
                (autoPreferenceAttackStyle.value !== "Physical" &&
                    autoPreferenceAttackStyle.value !== "Magic" &&
                    autoPreferenceAttackStyle.value !== "Magical" &&
                    friend.preferred_attack_style === "Both");

            return matchesType && matchesStyle;
        }),
    );
    const fallback = rankFriends((friend) =>
        getPreferenceScore(
            friend,
            autoPreferenceTypeId.value,
            autoPreferenceAttackStyle.value,
        ),
    );
    const friendIds = takeUniqueFriendIds(preferredMatches, fallback);
    const typeLabel =
        autoPreferenceTypeId.value === null
            ? "任意属性"
            : (typeMap.value.get(autoPreferenceTypeId.value)?.localized.zh ??
              "主题");
    const styleLabel =
        autoPreferenceAttackStyle.value === "all"
            ? "任意输出"
            : getAttackStyleLabel(autoPreferenceAttackStyle.value);

    await fillTeamWithFriendIds(friendIds, {
        teamName: `${typeLabel} · ${styleLabel}`,
    });
    shareFeedback.value = `已按 ${typeLabel} / ${styleLabel} 生成自动配队。`;
}

function startFriendDrag(friendId: number) {
    draggedFriendId.value = friendId;
    draggedSlotId.value = null;
}

function startSlotDrag(slotId: number) {
    draggedSlotId.value = slotId;
    draggedFriendId.value = null;
}

function clearDragState() {
    draggedFriendId.value = null;
    draggedSlotId.value = null;
    dragOverSlotId.value = null;
}

function setDragOverSlot(slotId: number | null) {
    dragOverSlotId.value = slotId;
}

function clearDragOverSlot(slotId: number) {
    if (dragOverSlotId.value === slotId) {
        dragOverSlotId.value = null;
    }
}

function swapSlots(sourceSlotId: number, targetSlotId: number) {
    if (sourceSlotId === targetSlotId) {
        return;
    }

    const sourceSlot =
        teamState.value.slots.find((slot) => slot.slotId === sourceSlotId) ??
        createEmptySlot(sourceSlotId);
    const targetSlot =
        teamState.value.slots.find((slot) => slot.slotId === targetSlotId) ??
        createEmptySlot(targetSlotId);

    teamState.value = {
        ...teamState.value,
        slots: teamState.value.slots.map((slot) => {
            if (slot.slotId === sourceSlotId) {
                return {
                    ...targetSlot,
                    slotId: sourceSlotId,
                };
            }

            if (slot.slotId === targetSlotId) {
                return {
                    ...sourceSlot,
                    slotId: targetSlotId,
                };
            }

            return slot;
        }),
    };
}

async function handleSlotDrop(slotId: number) {
    if (draggedFriendId.value !== null) {
        await assignFriendToSlot(slotId, draggedFriendId.value);
        clearDragState();
        return;
    }

    if (draggedSlotId.value !== null) {
        swapSlots(draggedSlotId.value, slotId);
        activeSlotId.value = slotId;
        activePanelTab.value = "build";
        clearDragState();
        return;
    }

    clearDragState();
}

function isSlotDragTarget(slotId: number) {
    return dragOverSlotId.value === slotId;
}

function updateMagicItem(value: unknown) {
    const nextValue = normalizeSelectValue(value);

    teamState.value = {
        ...teamState.value,
        magicItemId:
            nextValue === null || nextValue === "none"
                ? null
                : Number(nextValue),
    };
}

function resetFilters() {
    selectedTypeFilter.value = "all";
    selectedAttackStyleFilter.value = "all";
    selectedSpecialFilter.value = "all";
}

async function resetTeam() {
    teamState.value = createDefaultTeamState();
    activeSlotId.value = 1;
    activePanelTab.value = "friends";
    shareFeedback.value = "";
    resetFilters();

    if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
    }

    if (route.query.team) {
        await router.replace({ path: route.path, query: {} });
    }
}

async function copyShareLink() {
    if (!shareLink.value) {
        return;
    }

    await navigator.clipboard.writeText(shareLink.value);
    shareFeedback.value = "分享链接已复制。";
}

function encodeTeamState(state: ITeamState) {
    const json = JSON.stringify(serializeTeamState(state));
    const bytes = new TextEncoder().encode(json);
    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);
}

function decodeTeamState(payload: string) {
    try {
        const binary = atob(payload);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        const json = new TextDecoder().decode(bytes);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

function normalizeSelectValue(value: unknown) {
    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "bigint"
    ) {
        return value;
    }

    return null;
}

function getSlotChecklist(slot: ITeamSlot) {
    return [
        {
            done: Boolean(slot.friendId),
            label: slot.friendId ? "已选择精灵" : "选择一只精灵",
        },
        {
            done: Boolean(slot.personalityId),
            label: slot.personalityId
                ? `性格 · ${getPersonalitySummary(slot)}`
                : "设置性格",
        },
        {
            done: Boolean(slot.legacyTypeId),
            label: slot.legacyTypeId
                ? `血脉 · ${getLegacySummary(slot)}`
                : "选择血脉",
        },
        {
            done: slot.moveIds.length === MAX_MOVES_PER_SLOT,
            label:
                slot.moveIds.length > 0
                    ? `技能 · ${slot.moveIds.length}/${MAX_MOVES_PER_SLOT}`
                    : "选择 4 个技能",
        },
    ];
}
</script>

<template>
    <section class="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_380px]">
        <div class="space-y-4">
            <Card
                class="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_18%),radial-gradient(circle_at_86%_12%,rgba(56,189,248,0.12),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] py-0 shadow-[0_24px_100px_-56px_rgba(0,0,0,0.92)]">
                <CardHeader class="gap-6 px-5 py-5 md:px-6">
                    <div
                        class="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
                        <div class="space-y-4">
                            <div class="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    class="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-slate-100">
                                    <Sparkles
                                        class="h-3.5 w-3.5 text-primary" />
                                    Team Builder
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    class="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-emerald-100">
                                    {{ filledSlotCount }}/{{ TEAM_SLOT_COUNT }}
                                    槽已占用
                                </Badge>
                            </div>

                            <div class="space-y-2">
                                <CardTitle
                                    class="text-3xl tracking-tight text-white md:text-4xl">
                                    配队
                                </CardTitle>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
                            <div
                                v-for="item in teamSummaryItems"
                                :key="item.label"
                                class="rounded-2xl border border-white/10 bg-black/18 px-3 py-3 backdrop-blur-sm">
                                <p
                                    class="text-[11px] tracking-[0.22em] text-slate-500 uppercase">
                                    {{ item.label }}
                                </p>
                                <p
                                    class="mt-1.5 text-xl font-semibold text-white">
                                    {{ item.value }}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div
                v-if="errorMessage"
                class="rounded-3xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {{ errorMessage }}
            </div>

            <div class="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                <button
                    v-for="slot in teamState.slots"
                    :key="slot.slotId"
                    type="button"
                    :class="[
                        'group rounded-[1.6rem] border p-4 text-left transition-all duration-200',
                        activeSlotId === slot.slotId
                            ? 'border-primary/50 bg-white/8 shadow-[0_0_0_1px_rgba(251,191,36,0.22),0_22px_60px_-44px_rgba(251,191,36,0.55)]'
                            : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/6',
                        isSlotDragTarget(slot.slotId)
                            ? 'border-sky-300/55 bg-sky-300/10'
                            : '',
                    ]"
                    :draggable="Boolean(slot.friendId)"
                    @click="selectSlot(slot.slotId)"
                    @dragstart="startSlotDrag(slot.slotId)"
                    @dragend="clearDragState"
                    @dragenter.prevent="setDragOverSlot(slot.slotId)"
                    @dragover.prevent="setDragOverSlot(slot.slotId)"
                    @dragleave="clearDragOverSlot(slot.slotId)"
                    @drop.prevent="handleSlotDrop(slot.slotId)">
                    <div class="flex items-start gap-3">
                        <div class="relative shrink-0">
                            <FriendPortrait
                                :name="getSlotFriend(slot)?.name"
                                :alt="
                                    getSlotFriend(slot)?.localized.zh.name ??
                                    `槽位 ${slot.slotId}`
                                "
                                class="h-20 w-20 rounded-[1.2rem] border-white/10"
                                img-class="object-cover object-top" />
                            <div
                                class="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/90 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                                {{ slot.slotId }}
                            </div>
                        </div>

                        <div class="min-w-0 flex-1 space-y-3">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0 space-y-1">
                                    <p
                                        class="text-[11px] tracking-[0.22em] text-slate-500 uppercase">
                                        槽位 {{ slot.slotId }}
                                    </p>
                                    <h3
                                        class="truncate text-lg font-semibold text-white">
                                        {{
                                            getSlotFriend(slot)?.localized.zh
                                                .name ?? "未选择"
                                        }}
                                    </h3>
                                </div>

                                <Button
                                    v-if="slot.friendId"
                                    variant="ghost"
                                    size="icon-sm"
                                    class="rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
                                    @click.stop="clearSlot(slot.slotId)">
                                    <Trash2 class="h-4 w-4" />
                                </Button>
                            </div>

                            <div v-if="getSlotFriend(slot)" class="space-y-3">
                                <div class="flex flex-wrap gap-1.5">
                                    <span
                                        v-for="type in getFriendTypes(
                                            getSlotFriend(slot)!,
                                        )"
                                        :key="`${slot.slotId}-${type.id}`"
                                        :class="[
                                            'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                                            getTypeTone(type.name),
                                        ]">
                                        {{ type.localized.zh }}
                                    </span>
                                    <span
                                        class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                                        {{
                                            getAttackStyleLabel(
                                                getSlotFriend(slot)!
                                                    .preferred_attack_style,
                                            )
                                        }}
                                    </span>
                                    <span
                                        v-if="
                                            getSlotFriend(slot)?.is_leader_form
                                        "
                                        class="inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/12 px-2 py-0.5 text-xs text-amber-50">
                                        <Crown class="mr-1 h-3 w-3" />
                                        首领
                                    </span>
                                </div>

                                <div
                                    class="grid grid-cols-2 gap-2 text-xs text-slate-300">
                                    <div
                                        class="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
                                        <p class="text-[11px] text-slate-500">
                                            性格
                                        </p>
                                        <p class="mt-1 truncate text-slate-100">
                                            {{ getPersonalitySummary(slot) }}
                                        </p>
                                    </div>
                                    <div
                                        class="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
                                        <p class="text-[11px] text-slate-500">
                                            血脉
                                        </p>
                                        <p class="mt-1 truncate text-slate-100">
                                            {{ getLegacySummary(slot) }}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    class="grid grid-cols-2 gap-2 text-xs text-slate-300">
                                    <div
                                        class="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
                                        <p class="text-[11px] text-slate-500">
                                            技能
                                        </p>
                                        <p class="mt-1 text-slate-100">
                                            {{ slot.moveIds.length }}/{{
                                                MAX_MOVES_PER_SLOT
                                            }}
                                        </p>
                                    </div>
                                    <div
                                        class="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
                                        <p class="text-[11px] text-slate-500">
                                            峰值属性
                                        </p>
                                        <p class="mt-1 text-slate-100">
                                            {{
                                                getSlotEntry(slot)
                                                    ? getPeakStatLabel(
                                                          getSlotEntry(slot)!,
                                                      ).label
                                                    : "--"
                                            }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="space-y-2">
                                <div
                                    v-for="item in getSlotChecklist(slot)"
                                    :key="item.label"
                                    class="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-slate-300">
                                    <span
                                        :class="[
                                            'inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px]',
                                            item.done
                                                ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100'
                                                : 'border-white/10 bg-black/20 text-slate-500',
                                        ]">
                                        {{ item.done ? "✓" : "•" }}
                                    </span>
                                    <span>{{ item.label }}</span>
                                </div>
                            </div>

                            <div
                                v-if="isSlotLoading(slot.slotId)"
                                class="flex items-center gap-2 text-xs text-slate-400">
                                <Sparkles class="h-3.5 w-3.5 animate-spin" />
                                正在载入精灵详情…
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            <div
                class="grid gap-4 2xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <Card class="border-white/10 bg-black/22 shadow-sm">
                    <CardHeader class="pb-4">
                        <CardTitle class="flex items-center gap-2 text-white">
                            <WandSparkles class="h-4 w-4 text-primary" />
                            队伍设置
                        </CardTitle>
                        <CardDescription class="text-slate-400">
                            队伍名、血脉魔法和分享都集中在这里。
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-4">
                        <div class="grid gap-3 md:grid-cols-2">
                            <div class="space-y-2">
                                <p
                                    class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                                    队伍名称
                                </p>
                                <Input
                                    v-model="teamState.name"
                                    maxlength="32"
                                    placeholder="输入队伍名称"
                                    class="h-11 rounded-2xl border-white/10 bg-black/25 text-slate-100 placeholder:text-slate-500" />
                            </div>

                            <div class="space-y-2">
                                <p
                                    class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                                    血脉魔法
                                </p>
                                <Select
                                    :model-value="
                                        getSelectValue(teamState.magicItemId)
                                    "
                                    @update:model-value="updateMagicItem">
                                    <SelectTrigger
                                        class="h-11 rounded-2xl border-white/10 bg-black/25 text-slate-100">
                                        <SelectValue
                                            placeholder="选择血脉魔法" />
                                    </SelectTrigger>
                                    <SelectContent
                                        class="border-white/10 bg-slate-950/95 text-slate-100">
                                        <SelectItem value="none"
                                            >暂不选择</SelectItem
                                        >
                                        <SelectItem
                                            v-for="item in magicItems"
                                            :key="item.id"
                                            :value="String(item.id)">
                                            {{ item.localized.zh.name }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div
                            v-if="selectedMagicItem"
                            class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                            <p class="font-medium text-white">
                                {{ selectedMagicItem.localized.zh.name }}
                            </p>
                            <p class="mt-1 leading-6 text-slate-400">
                                {{ selectedMagicItem.localized.zh.description }}
                            </p>
                        </div>

                        <div
                            class="rounded-3xl border border-white/10 bg-white/4 p-4">
                            <div class="flex items-center gap-2 text-white">
                                <FlaskConical class="h-4 w-4 text-primary" />
                                <p class="text-sm font-medium">自动配队</p>
                            </div>

                            <div class="mt-3 space-y-3">
                                <div
                                    class="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
                                    <Select
                                        :model-value="
                                            getSelectValue(autoBossId)
                                        "
                                        @update:model-value="
                                            (value) =>
                                                (autoBossId =
                                                    normalizeSelectValue(
                                                        value,
                                                    ) === null ||
                                                    normalizeSelectValue(
                                                        value,
                                                    ) === 'none'
                                                        ? null
                                                        : Number(
                                                              normalizeSelectValue(
                                                                  value,
                                                              ),
                                                          ))
                                        ">
                                        <SelectTrigger
                                            class="h-10 rounded-2xl border-white/10 bg-black/25 text-slate-100">
                                            <SelectValue
                                                placeholder="选择目标首领" />
                                        </SelectTrigger>
                                        <SelectContent
                                            class="border-white/10 bg-slate-950/95 text-slate-100">
                                            <SelectItem value="none"
                                                >选择目标首领</SelectItem
                                            >
                                            <SelectItem
                                                v-for="boss in bossOptions"
                                                :key="boss.id"
                                                :value="String(boss.id)">
                                                {{ boss.localized.zh.name }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                                        @click="generateBossAutoTeam">
                                        <Zap class="h-4 w-4" />
                                        按首领生成
                                    </Button>
                                </div>

                                <div
                                    v-if="selectedAutoBossWeaknesses.length > 0"
                                    class="flex flex-wrap gap-1.5 text-xs text-slate-300">
                                    <span class="text-slate-500">弱点参考</span>
                                    <span
                                        v-for="label in selectedAutoBossWeaknesses"
                                        :key="label"
                                        class="rounded-full border border-white/10 bg-black/20 px-2 py-0.5">
                                        {{ label }}
                                    </span>
                                </div>

                                <div
                                    class="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
                                    <Select
                                        :model-value="
                                            getSelectValue(autoThemeTypeId)
                                        "
                                        @update:model-value="
                                            (value) =>
                                                (autoThemeTypeId =
                                                    normalizeSelectValue(
                                                        value,
                                                    ) === null ||
                                                    normalizeSelectValue(
                                                        value,
                                                    ) === 'none'
                                                        ? null
                                                        : Number(
                                                              normalizeSelectValue(
                                                                  value,
                                                              ),
                                                          ))
                                        ">
                                        <SelectTrigger
                                            class="h-10 rounded-2xl border-white/10 bg-black/25 text-slate-100">
                                            <SelectValue
                                                placeholder="按属性组队" />
                                        </SelectTrigger>
                                        <SelectContent
                                            class="border-white/10 bg-slate-950/95 text-slate-100">
                                            <SelectItem value="none"
                                                >选择属性主题</SelectItem
                                            >
                                            <SelectItem
                                                v-for="option in typeOptions"
                                                :key="option.value"
                                                :value="option.value">
                                                {{ option.label }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                                        @click="generateTypeAutoTeam">
                                        <WandSparkles class="h-4 w-4" />
                                        按属性生成
                                    </Button>
                                </div>

                                <div
                                    class="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                                    <Select
                                        :model-value="
                                            getSelectValue(autoPreferenceTypeId)
                                        "
                                        @update:model-value="
                                            (value) =>
                                                (autoPreferenceTypeId =
                                                    normalizeSelectValue(
                                                        value,
                                                    ) === null ||
                                                    normalizeSelectValue(
                                                        value,
                                                    ) === 'none'
                                                        ? null
                                                        : Number(
                                                              normalizeSelectValue(
                                                                  value,
                                                              ),
                                                          ))
                                        ">
                                        <SelectTrigger
                                            class="h-10 rounded-2xl border-white/10 bg-black/25 text-slate-100">
                                            <SelectValue
                                                placeholder="偏好属性" />
                                        </SelectTrigger>
                                        <SelectContent
                                            class="border-white/10 bg-slate-950/95 text-slate-100">
                                            <SelectItem value="none"
                                                >不限属性</SelectItem
                                            >
                                            <SelectItem
                                                v-for="option in typeOptions"
                                                :key="option.value"
                                                :value="option.value">
                                                {{ option.label }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select v-model="autoPreferenceAttackStyle">
                                        <SelectTrigger
                                            class="h-10 rounded-2xl border-white/10 bg-black/25 text-slate-100">
                                            <SelectValue
                                                placeholder="输出偏好" />
                                        </SelectTrigger>
                                        <SelectContent
                                            class="border-white/10 bg-slate-950/95 text-slate-100">
                                            <SelectItem
                                                v-for="option in autoAttackStyleOptions"
                                                :key="option.value"
                                                :value="option.value">
                                                {{ option.label }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                                        @click="generatePreferenceAutoTeam">
                                        <FlaskConical class="h-4 w-4" />
                                        按偏好生成
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    class="w-full rounded-2xl border border-dashed border-white/10 bg-black/20 text-slate-200 hover:bg-white/8 hover:text-white"
                                    @click="generateRandomAutoTeam">
                                    <Sparkles class="h-4 w-4" />
                                    随机配队
                                </Button>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                                @click="shareDialogOpen = true">
                                <Share2 class="h-4 w-4" />
                                分享
                            </Button>
                            <Button
                                variant="ghost"
                                class="rounded-full text-slate-300 hover:bg-white/8 hover:text-white"
                                @click="resetTeam">
                                <RotateCcw class="h-4 w-4" />
                                重置整队
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card class="border-white/10 bg-black/22 shadow-sm">
                    <CardHeader class="pb-4">
                        <CardTitle class="flex items-center gap-2 text-white">
                            <Swords class="h-4 w-4 text-primary" />
                            阵容分析
                        </CardTitle>
                        <CardDescription class="text-slate-400">
                            根据当前已选配置快速看队伍结构和缺口。
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-4">
                        <div class="grid gap-3 sm:grid-cols-3">
                            <div
                                class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <p
                                    class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                                    攻向分布
                                </p>
                                <p class="mt-2 text-sm text-slate-100">
                                    物攻 {{ attackProfile.physical }} · 魔攻
                                    {{ attackProfile.magic }} · 双修
                                    {{ attackProfile.both }}
                                </p>
                            </div>
                            <div
                                class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <p
                                    class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                                    攻击覆盖
                                </p>
                                <div class="mt-2 flex flex-wrap gap-1.5">
                                    <span
                                        v-for="type in attackCoverage.slice(
                                            0,
                                            8,
                                        )"
                                        :key="type.id"
                                        class="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-xs text-slate-200">
                                        {{ type.label }}
                                    </span>
                                    <span
                                        v-if="attackCoverage.length === 0"
                                        class="text-sm text-slate-500">
                                        暂无覆盖数据
                                    </span>
                                </div>
                            </div>
                            <div
                                class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <p
                                    class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                                    防守侧重点
                                </p>
                                <p class="mt-2 text-sm text-slate-100">
                                    抗性
                                    {{
                                        defenseSummary.resistances[0]?.label ??
                                        "--"
                                    }}
                                    / 压力
                                    {{
                                        defenseSummary.weaknesses[0]?.label ??
                                        "--"
                                    }}
                                </p>
                            </div>
                        </div>

                        <div class="grid gap-4 lg:grid-cols-2">
                            <div class="space-y-3">
                                <div
                                    class="flex items-center gap-2 text-sm font-medium text-white">
                                    <ShieldCheck
                                        class="h-4 w-4 text-emerald-300" />
                                    抗性较多
                                </div>
                                <div
                                    class="flex min-h-16 flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-white/4 p-3">
                                    <span
                                        v-for="item in defenseSummary.resistances"
                                        :key="item.label"
                                        class="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-100">
                                        {{ item.label }} × {{ item.resist }}
                                    </span>
                                    <span
                                        v-if="
                                            defenseSummary.resistances
                                                .length === 0
                                        "
                                        class="text-sm text-slate-500">
                                        选中阵容后显示
                                    </span>
                                </div>
                            </div>

                            <div class="space-y-3">
                                <div
                                    class="flex items-center gap-2 text-sm font-medium text-white">
                                    <ShieldAlert
                                        class="h-4 w-4 text-rose-300" />
                                    易被压制
                                </div>
                                <div
                                    class="flex min-h-16 flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-white/4 p-3">
                                    <span
                                        v-for="item in defenseSummary.weaknesses"
                                        :key="item.label"
                                        class="rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-0.5 text-xs text-rose-100">
                                        {{ item.label }} × {{ item.weak }}
                                    </span>
                                    <span
                                        v-if="
                                            defenseSummary.weaknesses.length ===
                                            0
                                        "
                                        class="text-sm text-slate-500">
                                        选中阵容后显示
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div
                            class="space-y-2 rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-slate-300">
                            <p class="font-medium text-white">构筑提示</p>
                            <p
                                v-for="item in analysisHighlights"
                                :key="item"
                                class="leading-6">
                                {{ item }}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <Card
            class="sticky top-4 h-fit border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] shadow-[0_26px_70px_-50px_rgba(0,0,0,0.95)]">
            <CardHeader class="gap-4 pb-4">
                <div class="space-y-1">
                    <CardTitle class="text-white">
                        面板 · 槽位 {{ activeSlot.slotId }}
                    </CardTitle>
                    <CardDescription class="text-slate-400">
                        {{
                            activeFriend?.localized.zh.name ??
                            "先从候选列表选择一只精灵"
                        }}
                    </CardDescription>
                </div>

                <Tabs v-model="activePanelTab" class="gap-3">
                    <TabsList
                        class="grid h-10 w-full grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1">
                        <TabsTrigger
                            value="friends"
                            class="rounded-full text-xs"
                            >选择精灵</TabsTrigger
                        >
                        <TabsTrigger value="build" class="rounded-full text-xs"
                            >构筑配置</TabsTrigger
                        >
                    </TabsList>

                    <TabsContent value="friends" class="mt-0 space-y-4">
                        <div class="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                            <Select v-model="selectedTypeFilter">
                                <SelectTrigger
                                    class="h-10 rounded-2xl border-white/10 bg-black/25 text-slate-100">
                                    <SelectValue placeholder="全部属性" />
                                </SelectTrigger>
                                <SelectContent
                                    class="border-white/10 bg-slate-950/95 text-slate-100">
                                    <SelectItem value="all"
                                        >全部属性</SelectItem
                                    >
                                    <SelectItem
                                        v-for="option in typeOptions"
                                        :key="option.value"
                                        :value="option.value">
                                        {{ option.label }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select v-model="selectedAttackStyleFilter">
                                <SelectTrigger
                                    class="h-10 rounded-2xl border-white/10 bg-black/25 text-slate-100">
                                    <SelectValue placeholder="输出倾向" />
                                </SelectTrigger>
                                <SelectContent
                                    class="border-white/10 bg-slate-950/95 text-slate-100">
                                    <SelectItem value="all"
                                        >全部定位</SelectItem
                                    >
                                    <SelectItem
                                        v-for="option in attackStyleOptions"
                                        :key="option.value"
                                        :value="option.value">
                                        {{ option.label }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select v-model="selectedSpecialFilter">
                                <SelectTrigger
                                    class="h-10 rounded-2xl border-white/10 bg-black/25 text-slate-100">
                                    <SelectValue placeholder="特殊筛选" />
                                </SelectTrigger>
                                <SelectContent
                                    class="border-white/10 bg-slate-950/95 text-slate-100">
                                    <SelectItem value="all"
                                        >全部形态</SelectItem
                                    >
                                    <SelectItem value="leader"
                                        >首领形态</SelectItem
                                    >
                                    <SelectItem value="leader-potential"
                                        >可成首领</SelectItem
                                    >
                                    <SelectItem value="base"
                                        >基础形态</SelectItem
                                    >
                                    <SelectItem value="evolved"
                                        >进化形态</SelectItem
                                    >
                                </SelectContent>
                            </Select>
                        </div>

                        <Command
                            :filter-function="undefined"
                            class="rounded-3xl border border-white/10 bg-black/22">
                            <CommandInput
                                placeholder="搜索名称、编号、属性或定位"
                                class="text-slate-100 placeholder:text-slate-500" />
                            <CommandList class="max-h-[60vh] px-1 pb-1">
                                <CommandEmpty
                                    class="px-3 py-6 text-sm text-slate-500">
                                    没有符合条件的精灵。
                                </CommandEmpty>
                                <CommandGroup heading="候选精灵">
                                    <CommandItem
                                        v-for="friend in filteredCandidates"
                                        :key="friend.id"
                                        :value="String(friend.id)"
                                        class="rounded-2xl px-3 py-3 text-slate-100"
                                        draggable="true"
                                        @dragstart="startFriendDrag(friend.id)"
                                        @dragend="clearDragState"
                                        @select="
                                            assignFriendToActiveSlot(friend.id)
                                        ">
                                        <FriendPortrait
                                            :name="friend.name"
                                            :alt="friend.localized.zh.name"
                                            class="h-12 w-12 rounded-xl border-white/10"
                                            img-class="object-cover object-top" />
                                        <div class="min-w-0 flex-1 space-y-1">
                                            <div
                                                class="flex items-center justify-between gap-3">
                                                <div class="min-w-0">
                                                    <p
                                                        class="truncate font-medium text-white">
                                                        {{
                                                            friend.localized.zh
                                                                .name
                                                        }}
                                                    </p>
                                                    <p
                                                        class="text-xs text-slate-500">
                                                        #{{ friend.id }} ·
                                                        {{
                                                            getAttackStyleLabel(
                                                                friend.preferred_attack_style,
                                                            )
                                                        }}
                                                    </p>
                                                </div>
                                                <span
                                                    v-if="
                                                        selectedFriendUsageMap.get(
                                                            friend.id,
                                                        )?.length
                                                    "
                                                    class="rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[11px] text-slate-300">
                                                    已在
                                                    {{
                                                        selectedFriendUsageMap
                                                            .get(friend.id)
                                                            ?.join(" / ")
                                                    }}
                                                    槽
                                                </span>
                                            </div>

                                            <div class="flex flex-wrap gap-1.5">
                                                <span
                                                    v-for="type in getFriendTypes(
                                                        friend,
                                                    )"
                                                    :key="`${friend.id}-${type.id}`"
                                                    :class="[
                                                        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]',
                                                        getTypeTone(type.name),
                                                    ]">
                                                    {{ type.localized.zh }}
                                                </span>
                                            </div>
                                        </div>
                                    </CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </TabsContent>

                    <TabsContent value="build" class="mt-0 space-y-4">
                        <div
                            v-if="!activeFriend"
                            class="rounded-3xl border border-white/10 bg-white/4 px-4 py-8 text-center text-sm text-slate-400">
                            先为当前槽位选择精灵，再继续设置性格、血脉和技能。
                        </div>

                        <template v-else>
                            <div
                                class="rounded-[1.6rem] border border-white/10 bg-white/4 p-4">
                                <div class="flex items-start gap-3">
                                    <FriendPortrait
                                        :name="activeFriend.name"
                                        :alt="activeFriend.localized.zh.name"
                                        class="h-18 w-18 rounded-[1.1rem] border-white/10"
                                        img-class="object-cover object-top" />

                                    <div class="min-w-0 flex-1 space-y-2">
                                        <div
                                            class="flex items-start justify-between gap-3">
                                            <div>
                                                <p
                                                    class="text-lg font-semibold text-white">
                                                    {{
                                                        activeFriend.localized
                                                            .zh.name
                                                    }}
                                                </p>
                                                <p
                                                    class="text-xs text-slate-500">
                                                    #{{ activeFriend.id }} ·
                                                    {{
                                                        getAttackStyleLabel(
                                                            activeFriend.preferred_attack_style,
                                                        )
                                                    }}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                class="rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
                                                @click="
                                                    clearSlot(activeSlot.slotId)
                                                ">
                                                <Trash2 class="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div class="flex flex-wrap gap-1.5">
                                            <span
                                                v-for="type in getFriendTypes(
                                                    activeFriend,
                                                )"
                                                :key="type.id"
                                                :class="[
                                                    'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                                                    getTypeTone(type.name),
                                                ]">
                                                {{ type.localized.zh }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="grid gap-3 sm:grid-cols-2">
                                <div class="space-y-2">
                                    <p
                                        class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                                        性格
                                    </p>
                                    <Select
                                        :model-value="
                                            getSelectValue(
                                                activeSlot.personalityId,
                                            )
                                        "
                                        @update:model-value="
                                            (value) =>
                                                updateSlotPersonality(
                                                    activeSlot.slotId,
                                                    value,
                                                )
                                        ">
                                        <SelectTrigger
                                            class="h-11 rounded-2xl border-white/10 bg-black/25 text-slate-100">
                                            <SelectValue
                                                placeholder="选择性格" />
                                        </SelectTrigger>
                                        <SelectContent
                                            class="border-white/10 bg-slate-950/95 text-slate-100">
                                            <SelectItem
                                                v-for="item in personalities"
                                                :key="item.id"
                                                :value="String(item.id)">
                                                {{ item.localized.zh }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div class="space-y-2">
                                    <p
                                        class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                                        血脉
                                    </p>
                                    <Select
                                        :model-value="
                                            getSelectValue(
                                                activeSlot.legacyTypeId,
                                            )
                                        "
                                        @update:model-value="
                                            (value) =>
                                                updateSlotLegacyType(
                                                    activeSlot.slotId,
                                                    value,
                                                )
                                        ">
                                        <SelectTrigger
                                            class="h-11 rounded-2xl border-white/10 bg-black/25 text-slate-100">
                                            <SelectValue
                                                placeholder="选择血脉" />
                                        </SelectTrigger>
                                        <SelectContent
                                            class="border-white/10 bg-slate-950/95 text-slate-100">
                                            <SelectItem
                                                v-for="item in activeLegacyOptions"
                                                :key="item.id"
                                                :value="String(item.id)">
                                                {{ item.label }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div
                                class="rounded-3xl border border-white/10 bg-black/22 p-4">
                                <div
                                    class="flex items-center justify-between gap-3">
                                    <div>
                                        <p
                                            class="text-sm font-medium text-white">
                                            技能选择
                                        </p>
                                        <p class="text-xs text-slate-500">
                                            最多选择
                                            {{ MAX_MOVES_PER_SLOT }}
                                            个技能，支持技能池、技能石和当前血脉遗传技。
                                        </p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        class="rounded-full text-xs text-slate-300 hover:bg-white/8 hover:text-white"
                                        @click="
                                            applyRecommendedMoves(
                                                activeSlot.slotId,
                                            )
                                        ">
                                        推荐 4 技能
                                    </Button>
                                </div>

                                <div class="mt-3 flex flex-wrap gap-1.5">
                                    <span
                                        v-for="move in activeSelectedMoves"
                                        :key="move.id"
                                        class="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/12 px-2.5 py-1 text-xs text-primary-foreground">
                                        {{ move.localized.zh.name }}
                                    </span>
                                    <span
                                        v-if="activeSelectedMoves.length === 0"
                                        class="text-sm text-slate-500">
                                        还没有选择技能
                                    </span>
                                </div>

                                <div class="mt-4 space-y-4">
                                    <div
                                        v-for="group in activeMoveGroups"
                                        :key="group.heading"
                                        class="space-y-2">
                                        <p
                                            class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                                            {{ group.heading }}
                                        </p>
                                        <div class="space-y-2">
                                            <button
                                                v-for="option in group.options"
                                                :key="option.move.id"
                                                type="button"
                                                :class="[
                                                    'w-full rounded-2xl border px-3 py-3 text-left transition-colors',
                                                    activeSlot.moveIds.includes(
                                                        option.move.id,
                                                    )
                                                        ? 'border-primary/35 bg-primary/10'
                                                        : 'border-white/10 bg-white/4 hover:bg-white/8',
                                                ]"
                                                @click="
                                                    toggleMoveSelection(
                                                        option.move.id,
                                                    )
                                                ">
                                                <div
                                                    class="flex items-start justify-between gap-3">
                                                    <div
                                                        class="min-w-0 space-y-1">
                                                        <div
                                                            class="flex flex-wrap items-center gap-1.5">
                                                            <span
                                                                class="font-medium text-white">
                                                                {{
                                                                    option.move
                                                                        .localized
                                                                        .zh.name
                                                                }}
                                                            </span>
                                                            <span
                                                                :class="[
                                                                    'rounded-full border px-2 py-0.5 text-[11px]',
                                                                    getTypeTone(
                                                                        option
                                                                            .move
                                                                            .move_type
                                                                            .name,
                                                                    ),
                                                                ]">
                                                                {{
                                                                    option.move
                                                                        .move_type
                                                                        .localized
                                                                        .zh
                                                                }}
                                                            </span>
                                                            <span
                                                                class="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-slate-300">
                                                                {{
                                                                    getMoveCategoryLabel(
                                                                        option
                                                                            .move
                                                                            .move_category,
                                                                    )
                                                                }}
                                                            </span>
                                                            <span
                                                                v-if="
                                                                    option.recommended
                                                                "
                                                                class="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[11px] text-amber-50">
                                                                推荐
                                                            </span>
                                                        </div>
                                                        <p
                                                            class="text-xs leading-5 text-slate-400">
                                                            {{
                                                                option.move
                                                                    .localized
                                                                    .zh
                                                                    .description
                                                            }}
                                                        </p>
                                                    </div>
                                                    <div
                                                        class="shrink-0 text-right">
                                                        <p
                                                            class="text-xs text-slate-500">
                                                            能耗
                                                        </p>
                                                        <p
                                                            class="text-sm font-medium text-white">
                                                            {{
                                                                option.move
                                                                    .energy_cost
                                                            }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="grid gap-3 sm:grid-cols-3">
                                <div
                                    class="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                                    <p
                                        class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                                        速度
                                    </p>
                                    <p
                                        class="mt-2 text-base font-semibold text-white">
                                        {{
                                            getSlotEntry(activeSlot)
                                                ?.effectiveStats.base_spd ??
                                            activeFriend.base_spd
                                        }}
                                    </p>
                                </div>
                                <div
                                    class="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                                    <p
                                        class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                                        峰值属性
                                    </p>
                                    <p
                                        class="mt-2 text-base font-semibold text-white">
                                        {{
                                            getSlotEntry(activeSlot)
                                                ? getPeakStatLabel(
                                                      getSlotEntry(activeSlot)!,
                                                  ).label
                                                : "--"
                                        }}
                                    </p>
                                </div>
                                <div
                                    class="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                                    <p
                                        class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                                        血脉魔法
                                    </p>
                                    <p
                                        class="mt-2 text-base font-semibold text-white">
                                        {{
                                            selectedMagicItem?.localized.zh
                                                .name ?? "未设置"
                                        }}
                                    </p>
                                </div>
                            </div>
                        </template>
                    </TabsContent>
                </Tabs>
            </CardHeader>

            <CardContent class="pt-0">
                <div
                    v-if="isLoading"
                    class="rounded-3xl border border-white/10 bg-white/4 px-4 py-6 text-sm text-slate-400">
                    正在载入配队数据…
                </div>

                <div
                    v-else-if="shareFeedback"
                    class="rounded-3xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-primary-foreground">
                    {{ shareFeedback }}
                </div>
            </CardContent>
        </Card>

        <Dialog v-model:open="shareDialogOpen">
            <DialogContent
                class="border-white/10 bg-slate-950 text-slate-100 sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle class="text-white">分享配队</DialogTitle>
                    <DialogDescription class="text-slate-400">
                        当前页面状态会编码进链接，其他人打开后可直接看到这套构筑。
                    </DialogDescription>
                </DialogHeader>

                <div class="space-y-3">
                    <div class="space-y-2">
                        <p
                            class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                            分享链接
                        </p>
                        <Input
                            :model-value="shareLink"
                            readonly
                            class="h-11 rounded-2xl border-white/10 bg-black/25 text-slate-100" />
                    </div>

                    <div
                        class="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-slate-300">
                        <p class="font-medium text-white">
                            {{ teamState.name || DEFAULT_TEAM_NAME }}
                        </p>
                        <p class="mt-1 text-slate-400">
                            已配置 {{ filledSlotCount }}/{{ TEAM_SLOT_COUNT }}
                            槽 · 血脉魔法
                            {{
                                selectedMagicItem?.localized.zh.name ?? "未设置"
                            }}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        class="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                        @click="copyShareLink">
                        <Share2 class="h-4 w-4" />
                        复制链接
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </section>
</template>

<style scoped></style>
