<script setup lang="ts">
import { GraphChart, type GraphSeriesOption } from "echarts/charts";
import {
    TooltipComponent,
    type TooltipComponentOption,
} from "echarts/components";
import { init, use, type ComposeOption, type ECharts } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { RotateCcw, Search, X } from "lucide-vue-next";
import type { IPets } from "@/lib/interface";

use([TooltipComponent, GraphChart, CanvasRenderer]);

type ChartOption = ComposeOption<GraphSeriesOption | TooltipComponentOption>;
type Vector2 = [number, number];
type LabelPosition = "left" | "right" | "top" | "bottom";

interface IEggGroupEntry {
    id: number;
    label: string;
    color: string;
    petCount: number;
}

interface IChartPetNode {
    id: number;
    name: string;
    localizedName: string;
    form: string;
    eggGroups: number[];
    value: Vector2;
    symbol: string;
    symbolSize: number;
    labelPosition: LabelPosition;
}

interface IChartGroupNode {
    id: number;
    label: string;
    color: string;
    petCount: number;
    value: Vector2;
    symbolSize: number;
    labelPosition: LabelPosition;
}

interface IChartLink {
    id: string;
    source: string;
    target: string;
    petId: number;
    groupId: number;
    color: string;
}

interface IChartScene {
    petNodes: IChartPetNode[];
    groupNodes: IChartGroupNode[];
    links: IChartLink[];
}

interface IViewportSize {
    width: number;
    height: number;
}

interface IChartLayoutMetrics {
    compact: boolean;
    edgePadding: number;
    groupRingRadius: number;
    petBaseSpread: number;
    petClusterGap: number;
    groupNodeMinSize: number;
    groupNodeMaxSize: number;
    groupNodeGrowth: number;
    petSingleSize: number;
    petMultiSize: number;
    groupLabelFontSize: number;
    petLabelFontSize: number;
    groupLabelDistance: number;
    activePetBoost: number;
    singleGroupInset: number;
    multiGroupInset: number;
    multiGroupScale: number;
}

const GROUP_COLOR_PALETTE = [
    "#f59e0b",
    "#38bdf8",
    "#34d399",
    "#f97316",
    "#a78bfa",
    "#fb7185",
    "#2dd4bf",
    "#facc15",
    "#60a5fa",
    "#4ade80",
    "#f472b6",
    "#22c55e",
    "#c084fc",
    "#14b8a6",
    "#f43f5e",
    "#eab308",
];

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const DEFAULT_GROUP_RING_RADIUS = 360;
const DEFAULT_PET_BASE_SPREAD = 36;
const DEFAULT_PET_CLUSTER_GAP = 22;

const chartRef = ref<HTMLDivElement | null>(null);
const chartViewport = ref<IViewportSize>({
    width: 0,
    height: 0,
});
const windowViewport = ref<IViewportSize>({
    width: 0,
    height: 0,
});
const pets = ref<IPets[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const petSearchQuery = ref("");
const focusedEggGroupIds = ref<number[]>([]);
const activePetId = ref<number | null>(null);
const activeGroupId = ref<number | null>(null);

let petsController: AbortController | null = null;
let chartInstance: ECharts | null = null;
let chartResizeObserver: ResizeObserver | null = null;
let observedChartElement: HTMLDivElement | null = null;
let observedVisualViewport: VisualViewport | null = null;

const eligiblePets = computed(() => {
    return [...pets.value]
        .filter((pet) => {
            return (pet.breeding_profile?.egg_groups.length ?? 0) > 0;
        })
        .sort((left, right) => {
            return left.localized.zh.name.localeCompare(
                right.localized.zh.name,
                "zh-CN",
            );
        });
});

const eligiblePetsById = computed(() => {
    return new Map(eligiblePets.value.map((pet) => [pet.id, pet]));
});

const normalizedPetSearchQuery = computed(() => {
    return normalizeSearchKeyword(petSearchQuery.value);
});

const searchedPets = computed(() => {
    const keyword = normalizedPetSearchQuery.value;

    if (!keyword) {
        return eligiblePets.value;
    }

    return eligiblePets.value.filter((pet) => {
        return matchesPetSearch(pet, keyword);
    });
});

const hasSearchQuery = computed(
    () => normalizedPetSearchQuery.value.length > 0,
);

const searchMatchCount = computed(() => searchedPets.value.length);

const searchTargetPet = computed(() => {
    const keyword = normalizedPetSearchQuery.value;

    if (!keyword || !searchedPets.value.length) {
        return null;
    }

    if (searchedPets.value.length === 1) {
        return searchedPets.value[0] ?? null;
    }

    return (
        searchedPets.value.find((pet) => isExactPetSearchMatch(pet, keyword)) ??
        null
    );
});

const chartSourcePets = computed(() => {
    if (searchTargetPet.value) {
        return eligiblePets.value;
    }

    return searchedPets.value;
});

const effectiveFocusedEggGroupIds = computed(() => {
    if (searchTargetPet.value) {
        return [...(searchTargetPet.value.breeding_profile?.egg_groups ?? [])];
    }

    if (hasSearchQuery.value) {
        return [];
    }

    return focusedEggGroupIds.value;
});

const effectiveActivePetId = computed(() => {
    if (searchTargetPet.value) {
        return searchTargetPet.value.id;
    }

    if (hasSearchQuery.value) {
        return null;
    }

    return activePetId.value;
});

const effectiveActiveGroupId = computed(() => {
    if (hasSearchQuery.value) {
        return null;
    }

    return activeGroupId.value;
});

const eggGroupIds = computed(() => {
    const idSet = new Set<number>();

    chartSourcePets.value.forEach((pet) => {
        (pet.breeding_profile?.egg_groups ?? []).forEach((groupId) => {
            idSet.add(groupId);
        });
    });

    return [...idSet].sort((left, right) => left - right);
});

const eggGroupColorMap = computed(() => {
    return new Map(
        eggGroupIds.value.map((groupId, index) => {
            const color =
                GROUP_COLOR_PALETTE[index % GROUP_COLOR_PALETTE.length] ??
                "#94a3b8";

            return [groupId, color] as const;
        }),
    );
});

const eggGroupEntries = computed<IEggGroupEntry[]>(() => {
    return eggGroupIds.value.map((groupId) => {
        const petCount = chartSourcePets.value.filter((pet) => {
            return pet.breeding_profile?.egg_groups.includes(groupId) ?? false;
        }).length;

        return {
            id: groupId,
            label: formatEggGroup(groupId),
            color: eggGroupColorMap.value.get(groupId) ?? "#94a3b8",
            petCount,
        };
    });
});

const focusedEggGroupLabel = computed(() => {
    if (!effectiveFocusedEggGroupIds.value.length) {
        return "全蛋组视图";
    }

    return effectiveFocusedEggGroupIds.value
        .map((groupId) => formatEggGroup(groupId))
        .join(" / ");
});

const hasFocus = computed(() => {
    return effectiveFocusedEggGroupIds.value.length > 0 || hasSearchQuery.value;
});

const chartHeight = computed(() => {
    const width =
        chartViewport.value.width || windowViewport.value.width || 1200;
    const viewportHeight = windowViewport.value.height || 900;

    if (width < 640) {
        return Math.round(clamp(viewportHeight * 0.62, 420, 560));
    }

    if (width < 1024) {
        return Math.round(clamp(viewportHeight * 0.7, 520, 760));
    }

    return Math.round(clamp(viewportHeight * 0.78, 620, 960));
});

const chartCanvasStyle = computed(() => {
    return {
        height: `${chartHeight.value}px`,
        minHeight: `${chartHeight.value}px`,
    };
});

const chartLayout = computed<IChartLayoutMetrics>(() => {
    const width = Math.max(
        chartViewport.value.width || windowViewport.value.width || 960,
        280,
    );
    const height = Math.max(
        chartViewport.value.height || chartHeight.value,
        320,
    );
    const compact = width < 768;
    const edgePadding = compact ? 14 : width < 1100 ? 18 : 24;
    const availableRadius = Math.min(
        (width - edgePadding * 2) / 2,
        (height - edgePadding * 2) / 2,
    );
    const groupRingRadius = clamp(
        availableRadius - (compact ? 34 : 52),
        compact ? 110 : 170,
        compact ? 220 : 420,
    );
    const densityScale = clamp(
        groupRingRadius / DEFAULT_GROUP_RING_RADIUS,
        0.56,
        1.18,
    );

    return {
        compact,
        edgePadding,
        groupRingRadius,
        petBaseSpread: clamp(
            DEFAULT_PET_BASE_SPREAD * densityScale,
            compact ? 18 : 24,
            42,
        ),
        petClusterGap: clamp(
            DEFAULT_PET_CLUSTER_GAP * densityScale,
            compact ? 12 : 16,
            26,
        ),
        groupNodeMinSize: Math.round(
            clamp((compact ? 18 : 24) * densityScale, compact ? 16 : 20, 28),
        ),
        groupNodeMaxSize: Math.round(
            clamp((compact ? 46 : 58) * densityScale, compact ? 34 : 44, 58),
        ),
        groupNodeGrowth: compact ? 0.3 : 0.42,
        petSingleSize: Math.round(clamp(28 * densityScale, 20, 28)),
        petMultiSize: Math.round(clamp(34 * densityScale, 24, 34)),
        groupLabelFontSize: compact ? 11 : 12,
        petLabelFontSize: compact ? 12 : 13,
        groupLabelDistance: compact ? 10 : 14,
        activePetBoost: compact ? 3 : 4,
        singleGroupInset: Math.round(
            clamp(118 * densityScale, compact ? 74 : 96, 118),
        ),
        multiGroupInset: Math.round(clamp(18 * densityScale, 12, 20)),
        multiGroupScale: compact ? 0.78 : 0.74,
    };
});

const baseChartScene = computed<IChartScene>(() => {
    return buildChartScene(
        chartSourcePets.value,
        eggGroupEntries.value,
        eggGroupColorMap.value,
        chartLayout.value,
    );
});

const chartScene = computed<IChartScene>(() => {
    return filterSceneByFocus(
        baseChartScene.value,
        effectiveFocusedEggGroupIds.value,
    );
});

const visiblePetCount = computed(() => chartScene.value.petNodes.length);

const visibleGroupCount = computed(() => chartScene.value.groupNodes.length);

const searchSummaryLabel = computed(() => {
    if (!hasSearchQuery.value) {
        return "支持按中文名、原名或形态名称实时筛选星图。";
    }

    if (searchTargetPet.value) {
        return `已定位到 ${searchTargetPet.value.localized.zh.name}. `;
    }

    return `搜索命中 ${searchMatchCount.value} / ${eligiblePets.value.length} 只精灵`;
});

const legendSelectionValue = computed({
    get() {
        if (effectiveActivePetId.value !== null) {
            return "all";
        }

        if (effectiveFocusedEggGroupIds.value.length === 1) {
            return String(effectiveFocusedEggGroupIds.value[0]);
        }

        return "all";
    },
    set(value: string) {
        if (value === "all") {
            clearFocus();
            return;
        }

        focusGroup(Number(value));
    },
});

document.title = "星图 - 洛克王国工具箱";

onMounted(() => {
    updateWindowViewport();
    initChart();
    void nextTick().then(() => {
        updateChartViewport();
    });
    void getPets();
});

onBeforeUnmount(() => {
    petsController?.abort();
    cleanupChart();
});

watch(
    [chartScene, effectiveActivePetId, effectiveActiveGroupId],
    async () => {
        await nextTick();
        renderChart();
    },
    { flush: "post" },
);

async function getPets() {
    petsController?.abort();

    const controller = new AbortController();
    petsController = controller;
    isLoading.value = true;
    errorMessage.value = "";

    try {
        const response = await fetch("/data/Pets.json", {
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`请求失败：${response.status}`);
        }

        const result = (await response.json()) as IPets[];

        if (controller.signal.aborted) {
            return;
        }

        pets.value = result;
    } catch (error) {
        if (controller.signal.aborted) {
            return;
        }

        console.error(error);
        errorMessage.value = "蛋组数据加载失败，请稍后刷新重试。";
        pets.value = [];
    } finally {
        if (petsController === controller) {
            petsController = null;
        }

        if (!controller.signal.aborted) {
            isLoading.value = false;
        }
    }
}

function initChart() {
    if (!chartRef.value || chartInstance) {
        return;
    }

    updateWindowViewport();
    updateChartViewport();

    chartInstance = init(chartRef.value, undefined, {
        useDirtyRect: true,
    });
    chartInstance.on("click", handleChartClick);
    chartInstance.getZr().on("click", handleBlankClick);

    if (typeof ResizeObserver !== "undefined") {
        chartResizeObserver = new ResizeObserver(() => {
            updateChartViewport();
        });
        chartResizeObserver.observe(chartRef.value);
    }

    if (typeof window !== "undefined") {
        window.addEventListener("resize", handleWindowResize);
        observedVisualViewport = window.visualViewport;
        observedVisualViewport?.addEventListener("resize", handleWindowResize);
    }

    observedChartElement = chartRef.value;
}

function cleanupChart() {
    if (chartInstance) {
        chartInstance.off("click", handleChartClick);
        chartInstance.getZr().off("click", handleBlankClick);
        chartInstance.dispose();
        chartInstance = null;
    }

    if (chartResizeObserver) {
        chartResizeObserver.disconnect();
    }

    if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleWindowResize);
    }

    observedVisualViewport?.removeEventListener("resize", handleWindowResize);

    chartResizeObserver = null;
    observedChartElement = null;
    observedVisualViewport = null;
}

function renderChart() {
    if (!chartRef.value) {
        return;
    }

    if (!chartInstance) {
        initChart();
    }

    if (!chartInstance) {
        return;
    }

    try {
        chartInstance.setOption(buildChartOption(), {
            replaceMerge: ["series"],
            lazyUpdate: true,
        } as never);
        chartInstance.resize();
    } catch (error) {
        console.error("渲染蛋组关系图失败", error);
        errorMessage.value = "蛋组关系图渲染失败，请稍后刷新重试。";
    }
}

function buildChartOption(): ChartOption {
    const scene = chartScene.value;
    const layout = chartLayout.value;
    const nodes = [
        ...scene.groupNodes.map((node) => {
            const isActive = effectiveActiveGroupId.value === node.id;

            return {
                id: getGroupNodeId(node.id),
                nodeType: "group",
                groupId: node.id,
                name: node.label,
                value: node.petCount,
                x: node.value[0],
                y: node.value[1],
                category: 0,
                symbol: "circle",
                symbolSize: node.symbolSize,
                draggable: false,
                itemStyle: {
                    color: node.color,
                    opacity: 0.95,
                    borderColor: "rgba(255,255,255,0.82)",
                    borderWidth: isActive ? 3 : 1.5,
                    shadowBlur: isActive ? 24 : 14,
                    shadowColor: withAlpha(node.color, isActive ? 0.56 : 0.32),
                },
                label: {
                    show: true,
                    position: node.labelPosition,
                    formatter: `${node.label}\n${node.petCount} 只`,
                    color: "#e2e8f0",
                    fontSize: isActive
                        ? layout.groupLabelFontSize + 2
                        : layout.groupLabelFontSize,
                    lineHeight: layout.compact ? 16 : 18,
                    distance: layout.groupLabelDistance,
                    backgroundColor: isActive
                        ? "rgba(15,23,42,0.92)"
                        : "rgba(15,23,42,0.74)",
                    borderColor: withAlpha(node.color, 0.36),
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: layout.compact ? [5, 8] : [6, 10],
                },
            };
        }),
        ...scene.petNodes.map((node) => {
            const isActive = effectiveActivePetId.value === node.id;

            return {
                id: getPetNodeId(node.id),
                nodeType: "pet",
                petId: node.id,
                name: node.localizedName,
                form: node.form,
                eggGroups: node.eggGroups,
                x: node.value[0],
                y: node.value[1],
                category: 1,
                symbol: node.symbol,
                symbolSize: isActive
                    ? node.symbolSize + layout.activePetBoost
                    : node.symbolSize,
                draggable: false,
                itemStyle: {
                    opacity: 1,
                    shadowBlur: isActive ? 20 : 10,
                    shadowColor: isActive
                        ? "rgba(248,250,252,0.28)"
                        : "transparent",
                },
                label: {
                    show: isActive,
                    position: node.labelPosition,
                    formatter: formatPetDisplayName({
                        localizedName: node.localizedName,
                        form: node.form,
                    }),
                    color: "#ffffff",
                    fontSize: layout.petLabelFontSize,
                    lineHeight: layout.compact ? 16 : 18,
                    distance: layout.compact ? 8 : 10,
                    backgroundColor: "rgba(8,11,23,0.82)",
                    borderColor: "rgba(255,255,255,0.12)",
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: layout.compact ? [5, 8] : [6, 10],
                },
                emphasis: {
                    label: {
                        show: true,
                    },
                },
            };
        }),
    ];

    const links = scene.links.map((link) => {
        const isActiveLink =
            effectiveActivePetId.value === link.petId ||
            effectiveActiveGroupId.value === link.groupId;

        return {
            id: link.id,
            source: link.source,
            target: link.target,
            lineStyle: {
                color: link.color,
                opacity: isActiveLink ? 0.56 : 0.2,
                width: isActiveLink
                    ? layout.compact
                        ? 1.8
                        : 2.2
                    : layout.compact
                      ? 0.95
                      : 1.15,
                curveness: 0.08,
            },
        };
    });

    return {
        backgroundColor: "transparent",
        tooltip: {
            trigger: "item",
            borderWidth: 0,
            backgroundColor: "rgba(7,10,19,0.95)",
            textStyle: {
                color: "#e2e8f0",
                fontSize: 12,
            },
            extraCssText:
                "box-shadow:0 24px 80px -40px rgba(0,0,0,0.95); border:1px solid rgba(255,255,255,0.08); border-radius:18px; backdrop-filter: blur(14px);",
            formatter: (params: unknown) => {
                return formatTooltip(params);
            },
        },
        animationDurationUpdate: 260,
        animationEasingUpdate: "cubicOut",
        series: [
            {
                id: "egg-group-graph",
                type: "graph",
                layout: "none",
                roam: true,
                draggable: false,
                left: layout.edgePadding,
                top: layout.edgePadding,
                right: layout.edgePadding,
                bottom: layout.edgePadding,
                data: nodes,
                links,
                edgeSymbol: ["none", "none"],
                edgeLabel: {
                    show: false,
                },
                lineStyle: {
                    opacity: 0.18,
                    width: 1.15,
                    color: "#64748b",
                },
                emphasis: {
                    focus: "adjacency",
                    scale: true,
                    lineStyle: {
                        width: 2.4,
                        opacity: 0.55,
                    },
                },
                scaleLimit: {
                    min: layout.compact ? 0.5 : 0.55,
                    max: layout.compact ? 3 : 2.4,
                },
                animation: true,
            },
        ],
    };
}

function buildChartScene(
    sourcePets: IPets[],
    groups: IEggGroupEntry[],
    colorMap: Map<number, string>,
    layout: IChartLayoutMetrics,
): IChartScene {
    if (!groups.length || !sourcePets.length) {
        return {
            petNodes: [],
            groupNodes: [],
            links: [],
        };
    }

    const groupPositions = new Map<number, Vector2>();

    groups.forEach((group, index) => {
        groupPositions.set(
            group.id,
            getCirclePoint(index, groups.length, layout.groupRingRadius),
        );
    });

    const groupNodes: IChartGroupNode[] = groups.map((group) => {
        const value = groupPositions.get(group.id) ?? [0, 0];

        return {
            id: group.id,
            label: group.label,
            color: group.color,
            petCount: group.petCount,
            value,
            symbolSize: Math.min(
                layout.groupNodeMaxSize,
                layout.groupNodeMinSize +
                    group.petCount * layout.groupNodeGrowth,
            ),
            labelPosition: getInwardLabelPosition(value),
        };
    });

    const clusterCounters = new Map<string, number>();
    const petNodes: IChartPetNode[] = sourcePets.map((pet, index) => {
        const eggGroups = [...(pet.breeding_profile?.egg_groups ?? [])].sort(
            (left, right) => left - right,
        );
        const anchorVectors = eggGroups
            .map((groupId) => groupPositions.get(groupId))
            .filter((point): point is Vector2 => point !== undefined);
        const clusterKey = eggGroups.join("-");
        const clusterIndex = clusterCounters.get(clusterKey) ?? 0;
        clusterCounters.set(clusterKey, clusterIndex + 1);

        const centroid = averageVectors(anchorVectors);
        const centroidMagnitude = vectorMagnitude(centroid);
        const angularSeed =
            index * GOLDEN_ANGLE * 0.72 + pet.id * 0.17 + clusterIndex * 0.93;
        const direction =
            centroidMagnitude > 0.001
                ? normalizeVector(centroid)
                : ([Math.cos(angularSeed), Math.sin(angularSeed)] as Vector2);
        const tangent = perpendicularVector(direction);
        const baseRadius =
            eggGroups.length === 1
                ? Math.max(
                      layout.compact ? 82 : 128,
                      layout.groupRingRadius -
                          layout.singleGroupInset -
                          (clusterIndex % 5) * layout.petClusterGap,
                  )
                : Math.max(
                      layout.compact ? 72 : 92,
                      centroidMagnitude * layout.multiGroupScale -
                          layout.multiGroupInset -
                          (eggGroups.length - 1) * 10,
                  );
        const radialJitter =
            Math.cos(angularSeed * 1.17) * (14 + (pet.id % 7) * 3);
        const tangentSpread =
            Math.sin(angularSeed) *
            (layout.petBaseSpread +
                (clusterIndex % 6) * 11 +
                (eggGroups.length - 1) * 12);
        const point = addVectors(
            scaleVector(direction, baseRadius + radialJitter),
            scaleVector(tangent, tangentSpread),
        );

        return {
            id: pet.id,
            name: pet.name,
            localizedName: pet.localized.zh.name,
            form: pet.form,
            eggGroups,
            value: point,
            symbol: buildPetSymbol(eggGroups, colorMap),
            symbolSize:
                eggGroups.length > 1
                    ? layout.petMultiSize
                    : layout.petSingleSize,
            labelPosition: getInwardLabelPosition(point),
        };
    });

    const links: IChartLink[] = petNodes.flatMap((pet) => {
        return pet.eggGroups.map((groupId) => {
            return {
                id: `${pet.id}-${groupId}`,
                source: getGroupNodeId(groupId),
                target: getPetNodeId(pet.id),
                petId: pet.id,
                groupId,
                color: colorMap.get(groupId) ?? "#94a3b8",
            } satisfies IChartLink;
        });
    });

    return {
        petNodes,
        groupNodes,
        links,
    };
}

function buildPetSymbol(eggGroups: number[], colorMap: Map<number, string>) {
    const colors = eggGroups.map((groupId) => {
        return colorMap.get(groupId) ?? "#94a3b8";
    });
    const primaryColor = colors[0] ?? "#94a3b8";
    const ringMarkup = buildRingMarkup(colors);
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="26" fill="#0f172a" fill-opacity="0.88" />
            ${ringMarkup}
            <circle cx="48" cy="48" r="18" fill="${escapeXml(primaryColor)}" />
            <circle cx="48" cy="48" r="8" fill="#f8fafc" fill-opacity="0.92" />
        </svg>
    `;

    return `image://data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildRingMarkup(colors: string[]) {
    if (!colors.length) {
        return "";
    }

    if (colors.length === 1) {
        const firstColor = colors[0] ?? "#94a3b8";

        return `<circle cx="48" cy="48" r="30" fill="none" stroke="${escapeXml(firstColor)}" stroke-width="8" stroke-linecap="round" />`;
    }

    const angleStep = 360 / colors.length;
    const gap = Math.min(12, angleStep * 0.2);

    return colors
        .map((color, index) => {
            const startAngle = -90 + index * angleStep + gap / 2;
            const endAngle = -90 + (index + 1) * angleStep - gap / 2;

            return `<path d="${describeArc(48, 48, 30, startAngle, endAngle)}" fill="none" stroke="${escapeXml(color)}" stroke-width="8" stroke-linecap="round" />`;
        })
        .join("");
}

function describeArc(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
) {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M",
        start.x.toFixed(3),
        start.y.toFixed(3),
        "A",
        radius,
        radius,
        0,
        largeArcFlag,
        0,
        end.x.toFixed(3),
        end.y.toFixed(3),
    ].join(" ");
}

function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number,
) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
}

function updateWindowViewport() {
    if (typeof window === "undefined") {
        return;
    }

    const viewport = window.visualViewport;
    const nextWidth = Math.round(viewport?.width ?? window.innerWidth ?? 0);
    const nextHeight = Math.round(viewport?.height ?? window.innerHeight ?? 0);

    if (
        windowViewport.value.width === nextWidth &&
        windowViewport.value.height === nextHeight
    ) {
        return;
    }

    windowViewport.value = {
        width: nextWidth,
        height: nextHeight,
    };
}

function updateChartViewport() {
    if (!chartRef.value) {
        return false;
    }

    const bounds = chartRef.value.getBoundingClientRect();
    const nextWidth = Math.round(bounds.width);
    const nextHeight = Math.round(bounds.height);

    if (
        chartViewport.value.width === nextWidth &&
        chartViewport.value.height === nextHeight
    ) {
        return false;
    }

    chartViewport.value = {
        width: nextWidth,
        height: nextHeight,
    };

    return true;
}

function handleWindowResize() {
    updateWindowViewport();
    updateChartViewport();
}

function handleChartClick(params: unknown) {
    const payload = params as {
        componentType?: string;
        dataType?: string;
        data?: {
            nodeType?: "pet" | "group";
            petId?: number;
            groupId?: number;
        };
    };

    if (payload.componentType !== "series" || payload.dataType !== "node") {
        return;
    }

    if (payload.data?.nodeType === "pet" && payload.data.petId) {
        focusPet(payload.data.petId);
        return;
    }

    if (payload.data?.nodeType === "group" && payload.data.groupId) {
        focusGroup(payload.data.groupId);
    }
}

function handleBlankClick(event: unknown) {
    const payload = event as { target?: unknown };

    if (!payload.target) {
        clearFocus();
    }
}

function focusPet(petId: number) {
    if (hasSearchQuery.value && petId !== searchTargetPet.value?.id) {
        clearSearchQuery();
    }

    const pet = eligiblePetsById.value.get(petId);

    if (!pet) {
        return;
    }

    focusedEggGroupIds.value = [...(pet.breeding_profile?.egg_groups ?? [])];
    activePetId.value = pet.id;
    activeGroupId.value = null;
}

function focusGroup(groupId: number) {
    if (hasSearchQuery.value) {
        clearSearchQuery();
    }

    focusedEggGroupIds.value = [groupId];
    activeGroupId.value = groupId;
    activePetId.value = null;
}

function clearFocus() {
    if (hasSearchQuery.value) {
        clearSearchQuery();
    }

    focusedEggGroupIds.value = [];
    activePetId.value = null;
    activeGroupId.value = null;
}

function clearSearchQuery() {
    petSearchQuery.value = "";
}

function formatTooltip(params: unknown) {
    const payload = params as {
        dataType?: string;
        data?: {
            nodeType?: "pet" | "group";
            petId?: number;
            groupId?: number;
        };
    };

    if (payload.dataType !== "node") {
        return "";
    }

    if (payload.data?.nodeType === "pet" && payload.data.petId) {
        const pet = eligiblePetsById.value.get(payload.data.petId);

        if (!pet) {
            return "";
        }

        const eggGroups = pet.breeding_profile?.egg_groups ?? [];
        const formLabel = formatPetForm(pet.form);

        return `
			<div style="min-width: 220px; padding: 4px 2px;">
				<div style="font-size: 15px; font-weight: 600; color: #ffffff;">${escapeHtml(pet.localized.zh.name)}</div>
				<div style="margin-top: 6px; color: #94a3b8; line-height: 1.6;">${escapeHtml(formLabel || "默认形态")}</div>
                <img src="/assets/webp/friends/JL_${pet.name}.webp" style="width: 48px; height: 48px; border-radius: 50%; margin-bottom: 6px;" />
				<div style="margin-top: 10px; color: #e2e8f0; line-height: 1.7;">蛋组：${escapeHtml(formatEggGroupSummary(eggGroups))}</div>
				<div style="margin-top: 4px; color: #94a3b8; line-height: 1.7;">性别比：${formatGenderSummary(pet)}</div>
			</div>
		`;
    }

    if (payload.data?.nodeType === "group" && payload.data.groupId) {
        const group = eggGroupEntries.value.find((item) => {
            return item.id === payload.data?.groupId;
        });

        if (!group) {
            return "";
        }

        return `
			<div style="min-width: 190px; padding: 4px 2px;">
				<div style="font-size: 15px; font-weight: 600; color: #ffffff;">${escapeHtml(group.label)}</div>
				<div style="margin-top: 8px; color: #e2e8f0; line-height: 1.7;">成员数量：${group.petCount} 只</div>
				<div style="margin-top: 4px; color: #94a3b8; line-height: 1.7;">点击星核可只查看这一蛋组的关系。</div>
			</div>
		`;
    }

    return "";
}

function formatGenderSummary(pet: IPets) {
    const maleRate = pet.breeding_profile?.male_rate;
    const femaleRate = pet.breeding_profile?.female_rate;

    if (maleRate == null || femaleRate == null) {
        return "暂无数据";
    }

    return `${maleRate}% 雄性 / ${femaleRate}% 雌性`;
}

function formatEggGroup(groupId: number) {
    return `蛋组 ${groupId}`;
}

function formatEggGroupSummary(eggGroups: number[]) {
    if (!eggGroups.length) {
        return "暂无蛋组数据";
    }

    return eggGroups.map((groupId) => formatEggGroup(groupId)).join(" / ");
}

function formatPetDisplayName(pet: { localizedName: string; form: string }) {
    const formLabel = formatPetForm(pet.form);

    if (!formLabel) {
        return pet.localizedName;
    }

    return `${pet.localizedName}\n${formLabel}`;
}

function formatPetForm(form: string) {
    if (!form || form.toLowerCase() === "default") {
        return "";
    }

    return form;
}

function hasEggGroupOverlap(left: number[], right: number[]) {
    const rightSet = new Set(right);
    return left.some((groupId) => rightSet.has(groupId));
}

function isNodeVisible(eggGroups: number[], focusedGroupSet: Set<number>) {
    if (!focusedGroupSet.size) {
        return true;
    }

    return eggGroups.some((groupId) => focusedGroupSet.has(groupId));
}

function filterSceneByFocus(scene: IChartScene, focusedGroupIds: number[]) {
    if (!focusedGroupIds.length) {
        return scene;
    }

    const focusedGroupSet = new Set(focusedGroupIds);
    const petNodes = scene.petNodes.filter((node) => {
        return isNodeVisible(node.eggGroups, focusedGroupSet);
    });
    const visiblePetIds = new Set(petNodes.map((node) => node.id));
    const groupNodes = scene.groupNodes.filter((node) => {
        return focusedGroupSet.has(node.id);
    });
    const links = scene.links.filter((link) => {
        return (
            visiblePetIds.has(link.petId) && focusedGroupSet.has(link.groupId)
        );
    });

    return {
        petNodes,
        groupNodes,
        links,
    };
}

function getCirclePoint(index: number, total: number, radius: number): Vector2 {
    if (total <= 1) {
        return [0, -radius];
    }

    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;

    return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function averageVectors(vectors: Vector2[]) {
    if (!vectors.length) {
        return [0, 0] as Vector2;
    }

    const total = vectors.reduce<Vector2>(
        (result, vector) => {
            return addVectors(result, vector);
        },
        [0, 0],
    );

    return scaleVector(total, 1 / vectors.length);
}

function addVectors(...vectors: Vector2[]) {
    return vectors.reduce<Vector2>(
        (result, vector) => {
            return [result[0] + vector[0], result[1] + vector[1]];
        },
        [0, 0],
    );
}

function scaleVector(vector: Vector2, factor: number): Vector2 {
    return [vector[0] * factor, vector[1] * factor];
}

function vectorMagnitude(vector: Vector2) {
    return Math.hypot(vector[0], vector[1]);
}

function normalizeVector(vector: Vector2): Vector2 {
    const magnitude = vectorMagnitude(vector);

    if (!magnitude) {
        return [0, -1];
    }

    return [vector[0] / magnitude, vector[1] / magnitude];
}

function perpendicularVector(vector: Vector2): Vector2 {
    return [-vector[1], vector[0]];
}

function getGroupNodeId(groupId: number) {
    return `group-${groupId}`;
}

function getPetNodeId(petId: number) {
    return `pet-${petId}`;
}

function matchesPetSearch(pet: IPets, keyword: string) {
    return [pet.localized.zh.name, pet.name, formatPetForm(pet.form)]
        .map((value) => normalizeSearchKeyword(value))
        .some((value) => value.includes(keyword));
}

function isExactPetSearchMatch(pet: IPets, keyword: string) {
    return [pet.localized.zh.name, pet.name, formatPetForm(pet.form)]
        .map((value) => normalizeSearchKeyword(value))
        .some((value) => value === keyword);
}

function normalizeSearchKeyword(value: string) {
    return value.trim().toLocaleLowerCase("zh-CN").replace(/\s+/g, "");
}

function getInwardLabelPosition(vector: Vector2): LabelPosition {
    const [x, y] = vector;

    if (Math.abs(x) >= Math.abs(y)) {
        return x >= 0 ? "left" : "right";
    }

    return y >= 0 ? "top" : "bottom";
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function withAlpha(hexColor: string, alpha: number) {
    const normalized = hexColor.replace("#", "");
    const value =
        normalized.length === 3
            ? normalized
                  .split("")
                  .map((char) => char + char)
                  .join("")
            : normalized;

    const red = Number.parseInt(value.slice(0, 2), 16);
    const green = Number.parseInt(value.slice(2, 4), 16);
    const blue = Number.parseInt(value.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function escapeXml(value: string) {
    return escapeHtml(value);
}
</script>

<template>
    <section class="space-y-6">
        <Card
            class="overflow-hidden border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.94),rgba(10,14,28,0.98))] py-0 shadow-[0_24px_90px_-50px_rgba(0,0,0,0.88)]">
            <CardHeader class="gap-4 px-4 py-5 sm:px-6 sm:py-6">
                <div
                    class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div class="space-y-2">
                        <p
                            class="text-xs tracking-[0.18em] text-slate-500 uppercase">
                            蛋组星图
                        </p>
                        <CardTitle class="text-3xl tracking-tight text-white">
                            {{ focusedEggGroupLabel }}
                        </CardTitle>
                        <CardDescription class="max-w-3xl text-slate-400">
                            当前显示 {{ visiblePetCount }} 只精灵、{{
                                visibleGroupCount
                            }}
                            个蛋组。现在改为 2D
                            关系图，可拖动画布和平滑缩放；点击节点仍会直接筛选相关关系。
                        </CardDescription>
                    </div>

                    <div
                        class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                        <label
                            class="flex min-w-0 flex-1 flex-col gap-2 text-sm text-slate-300 sm:min-w-72">
                            <span
                                class="text-xs tracking-[0.16em] text-slate-500 uppercase"
                                >精灵搜索</span
                            >
                            <div class="relative">
                                <Search
                                    class="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <input
                                    v-model="petSearchQuery"
                                    type="search"
                                    inputmode="search"
                                    autocomplete="off"
                                    spellcheck="false"
                                    placeholder="输入中文名、原名或形态"
                                    class="h-11 w-full rounded-2xl border border-white/10 bg-black/20 pr-11 pl-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/40 focus:bg-black/30" />
                                <button
                                    v-if="petSearchQuery"
                                    type="button"
                                    class="absolute top-1/2 right-3 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/8 hover:text-white"
                                    aria-label="清空搜索"
                                    @click="clearSearchQuery">
                                    <X class="h-4 w-4" />
                                </button>
                            </div>
                        </label>

                        <label
                            class="flex min-w-0 flex-col gap-2 text-sm text-slate-300 sm:min-w-55">
                            <span
                                class="text-xs tracking-[0.16em] text-slate-500 uppercase"
                                >蛋组筛选</span
                            >
                            <select
                                v-model="legendSelectionValue"
                                class="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-sky-300/40 focus:bg-black/30 sm:min-w-55">
                                <option
                                    value="all"
                                    class="bg-slate-950 text-white">
                                    全部蛋组
                                </option>
                                <option
                                    v-for="group in eggGroupEntries"
                                    :key="group.id"
                                    :value="String(group.id)"
                                    class="bg-slate-950 text-white">
                                    {{ group.label }} · {{ group.petCount }}
                                </option>
                            </select>
                        </label>

                        <Button
                            variant="outline"
                            class="w-full rounded-full border-white/10 bg-white/6 text-slate-100 hover:bg-white/10 disabled:opacity-40 sm:w-auto"
                            :disabled="!hasFocus"
                            @click="clearFocus">
                            <RotateCcw class="h-4 w-4" />
                            恢复全图
                        </Button>
                    </div>
                </div>

                <div
                    class="flex flex-col gap-2 rounded-3xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                    <p class="leading-6 text-slate-300">
                        {{ searchSummaryLabel }}
                    </p>
                    <p
                        v-if="hasSearchQuery"
                        class="text-xs tracking-[0.14em] text-slate-500 uppercase">
                        {{
                            searchTargetPet
                                ? "当前图谱已自动定位到目标精灵"
                                : "当前图谱仅显示搜索结果及相关蛋组"
                        }}
                    </p>
                </div>
            </CardHeader>

            <CardContent class="space-y-5 px-4 pb-5 sm:px-6 sm:pb-6">
                <div
                    v-if="errorMessage"
                    class="rounded-4xl border border-rose-400/20 bg-rose-500/10 px-5 py-6 text-sm leading-7 text-rose-100">
                    {{ errorMessage }}
                </div>

                <div
                    v-else-if="isLoading && !eligiblePets.length"
                    class="rounded-4xl border border-white/10 bg-white/4 px-5 py-10 text-center text-sm leading-7 text-slate-400">
                    正在加载精灵与蛋组数据...
                </div>

                <div
                    v-else-if="!eligiblePets.length"
                    class="rounded-4xl border border-dashed border-white/10 bg-white/4 px-5 py-10 text-center text-sm leading-7 text-slate-400">
                    暂无可用蛋组数据。
                </div>

                <div
                    v-else-if="hasSearchQuery && !searchedPets.length"
                    class="rounded-4xl border border-dashed border-white/10 bg-white/4 px-5 py-10 text-center text-sm leading-7 text-slate-400">
                    <p>没有找到匹配的精灵名称。</p>
                    <Button
                        variant="outline"
                        class="mt-4 rounded-full border-white/10 bg-white/6 text-slate-100 hover:bg-white/10"
                        @click="clearSearchQuery">
                        清空搜索
                    </Button>
                </div>

                <div v-else class="space-y-5">
                    <div
                        class="rounded-[1.9rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.08),transparent_24%),linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-2 sm:p-3 md:p-4">
                        <div
                            class="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.10),transparent_24%),rgba(2,6,23,0.88)]">
                            <div
                                ref="chartRef"
                                class="w-full"
                                :style="chartCanvasStyle" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </section>
</template>

<style scoped></style>
