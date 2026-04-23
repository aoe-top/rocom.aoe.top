<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { GraphChart, type GraphSeriesOption } from "echarts/charts";
import {
    TooltipComponent,
    type TooltipComponentOption,
} from "echarts/components";
import { init, use, type ComposeOption, type ECharts } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import type { IMonsterTypeDetail } from "@/lib/interface";

use([TooltipComponent, GraphChart, CanvasRenderer]);

type ChartOption = ComposeOption<GraphSeriesOption | TooltipComponentOption>;
type RelationKind =
    | "attackAdvantage"
    | "attackResisted"
    | "defenseWeakness"
    | "defenseResistance";

interface ITypeDictionaryRow {
    id: number;
    type_name?: string;
    short_name?: string;
    evo_banding_color?: string;
    rolecard_favorite_pets_colour?: string;
}

interface ITypeDictionaryResponse {
    RocoDataRows?: Record<string, ITypeDictionaryRow>;
}

interface ITypeEntry extends IMonsterTypeDetail {
    label: string;
    shortLabel: string;
    color: string;
    accentColor: string;
}

interface ITypePairRelation {
    attackAdvantage: boolean;
    attackResisted: boolean;
    defenseWeakness: boolean;
    defenseResistance: boolean;
}

interface IRelationBuckets {
    attackAdvantage: ITypeEntry[];
    attackResisted: ITypeEntry[];
    defenseWeakness: ITypeEntry[];
    defenseResistance: ITypeEntry[];
    neutral: ITypeEntry[];
}

interface IChartViewport {
    width: number;
    height: number;
}

interface IChartNode {
    id: string;
    name: string;
    x: number;
    y: number;
    symbolSize: number;
    z: number;
    tooltipTitle: string;
    tooltipBody: string;
    itemStyle: {
        color: string;
        borderColor: string;
        borderWidth: number;
        shadowBlur: number;
        shadowColor: string;
    };
    label: {
        show: boolean;
        position: "inside";
        formatter: string;
        fontSize: number;
        fontWeight: number;
        color: string;
        lineHeight: number;
    };
}

interface IChartLink {
    source: string;
    target: string;
    value: number;
    relationTitle: string;
    relationBody: string;
    lineStyle: {
        color: string;
        width: number;
        opacity: number;
        curveness: number;
        type: "solid" | "dashed";
    };
    emphasis: {
        lineStyle: {
            width: number;
            opacity: number;
        };
    };
}

interface IChartScene {
    nodes: IChartNode[];
    links: IChartLink[];
}

const DEFAULT_TYPE_NAME = "Grass";

const FALLBACK_TYPE_COLORS: Record<string, string> = {
    Normal: "#6ca3b8",
    Grass: "#4fad67",
    Fire: "#d24308",
    Water: "#5c9ae2",
    Light: "#f1c232",
    Ground: "#8f6d2e",
    Ice: "#5c9dbb",
    Dragon: "#db3a42",
    Electric: "#dab500",
    Poison: "#ad53b8",
    Bug: "#96bc18",
    Fighting: "#f68522",
    Flying: "#3cb6ab",
    Cute: "#f46b91",
    Ghost: "#893ccc",
    Dark: "#c4395c",
    Mechanical: "#26a682",
    Illusion: "#9399e0",
    Leader: "#64748b",
};

const RELATION_META: Record<
    RelationKind,
    {
        title: string;
        description: string;
        multiplier: string;
        edgeColor: string;
        edgeType: "solid" | "dashed";
    }
> = {
    attackAdvantage: {
        title: "进攻克制",
        description: "当前属性主动出招时，对目标属性造成 2 倍伤害。",
        multiplier: "伤害 x2",
        edgeColor: "#16a34a",
        edgeType: "solid",
    },
    attackResisted: {
        title: "被抵抗",
        description: "当前属性主动出招时，对目标属性只造成 0.5 倍伤害。",
        multiplier: "伤害 x0.5",
        edgeColor: "#d97706",
        edgeType: "dashed",
    },
    defenseWeakness: {
        title: "被克制",
        description: "对方用该属性进攻当前属性时，会造成 2 倍伤害。",
        multiplier: "受伤 x2",
        edgeColor: "#dc2626",
        edgeType: "solid",
    },
    defenseResistance: {
        title: "抵抗克制",
        description: "对方用该属性进攻当前属性时，只会造成 0.5 倍伤害。",
        multiplier: "受伤 x0.5",
        edgeColor: "#0ea5e9",
        edgeType: "dashed",
    },
};

const relationLegendKinds = Object.keys(RELATION_META) as RelationKind[];

const supportsHover = useMediaQuery("(hover: hover) and (pointer: fine)");
const isLoading = ref(false);
const errorMessage = ref("");
const typeEntries = ref<ITypeEntry[]>([]);
const lockedTypeId = ref<number | null>(null);
const hoveredTypeId = ref<number | null>(null);
const chartRef = ref<HTMLDivElement | null>(null);
const chartViewport = ref<IChartViewport>({
    width: 0,
    height: 0,
});

let controller: AbortController | null = null;
let chartInstance: ECharts | null = null;
let chartResizeObserver: ResizeObserver | null = null;
let observedChartElement: HTMLDivElement | null = null;

const typeEntriesById = computed(() => {
    return new Map(typeEntries.value.map((type) => [type.id, type]));
});

const currentTypeId = computed(() => {
    if (hoveredTypeId.value !== null) {
        return hoveredTypeId.value;
    }

    if (lockedTypeId.value !== null) {
        return lockedTypeId.value;
    }

    return getDefaultTypeId(typeEntries.value);
});

const currentType = computed(() => {
    const typeId = currentTypeId.value;

    if (typeId === null) {
        return null;
    }

    return typeEntriesById.value.get(typeId) ?? null;
});

const pairRelationLookup = computed(() => {
    return buildPairRelationLookup(currentType.value, typeEntries.value);
});

const relationBuckets = computed(() => {
    return buildRelationBuckets(typeEntries.value, pairRelationLookup.value);
});

const relationSections = computed(() => {
    return [
        {
            key: "attackAdvantage",
            title: "攻击时克制",
            description: "你用这个属性进攻时，能稳定压制这些属性。",
            tone: RELATION_META.attackAdvantage.edgeColor,
            items: relationBuckets.value.attackAdvantage,
        },
        {
            key: "attackResisted",
            title: "攻击时受阻",
            description: "你用这个属性进攻时，会被这些属性天然吃掉伤害。",
            tone: RELATION_META.attackResisted.edgeColor,
            items: relationBuckets.value.attackResisted,
        },
        {
            key: "defenseWeakness",
            title: "防守时怕谁",
            description: "这些属性来打你时，伤害会明显放大。",
            tone: RELATION_META.defenseWeakness.edgeColor,
            items: relationBuckets.value.defenseWeakness,
        },
        {
            key: "defenseResistance",
            title: "防守时抗谁",
            description: "这些属性来打你时，伤害会被压低。",
            tone: RELATION_META.defenseResistance.edgeColor,
            items: relationBuckets.value.defenseResistance,
        },
    ];
});

const currentTypeSummary = computed(() => {
    if (!currentType.value) {
        return "";
    }

    return `${currentType.value.label}作为单属性时，进攻上可压制 ${relationBuckets.value.attackAdvantage.length} 系、会被 ${relationBuckets.value.attackResisted.length} 系抗住；防守上惧怕 ${relationBuckets.value.defenseWeakness.length} 系、抗性覆盖 ${relationBuckets.value.defenseResistance.length} 系。`;
});

const neutralTypes = computed(() => relationBuckets.value.neutral);

const chartScene = computed(() => {
    return buildChartScene(
        currentType.value,
        typeEntries.value,
        pairRelationLookup.value,
        chartViewport.value,
    );
});

async function loadTypeData() {
    controller?.abort();
    controller = new AbortController();
    isLoading.value = true;
    errorMessage.value = "";

    try {
        const [typeData, dictionaryData] = await Promise.all([
            fetchJSON<IMonsterTypeDetail[]>(
                "/data/types.json",
                controller.signal,
            ),
            fetchJSON<ITypeDictionaryResponse>(
                "/data/BinData/TYPE_DICTIONARY.json",
                controller.signal,
            ),
        ]);

        typeEntries.value = buildTypeEntries(typeData, dictionaryData);
        lockedTypeId.value = resolveNextLockedTypeId(
            lockedTypeId.value,
            typeEntries.value,
        );
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return;
        }

        errorMessage.value = "属性数据加载失败，请稍后重试。";
        typeEntries.value = [];
        lockedTypeId.value = null;
    } finally {
        isLoading.value = false;
    }
}

async function fetchJSON<T>(url: string, signal: AbortSignal) {
    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}`);
    }

    return (await response.json()) as T;
}

function getDefaultTypeId(types: ITypeEntry[]) {
    return types.find((type) => type.name === DEFAULT_TYPE_NAME)?.id ??
        types[0]?.id ??
        null;
}

function resolveNextLockedTypeId(
    previousTypeId: number | null,
    types: ITypeEntry[],
) {
    if (
        previousTypeId !== null &&
        types.some((type) => type.id === previousTypeId)
    ) {
        return previousTypeId;
    }

    return getDefaultTypeId(types);
}

function buildTypeEntries(
    types: IMonsterTypeDetail[],
    dictionary: ITypeDictionaryResponse,
) {
    const dictionaryRows = Object.values(dictionary.RocoDataRows ?? {});
    const dictionaryLookup = new Map<string, ITypeDictionaryRow>();

    for (const row of dictionaryRows) {
        for (const candidate of [row.short_name, row.type_name]
            .map((label) => normalizeDictionaryLabel(label))
            .filter(Boolean)) {
            if (!dictionaryLookup.has(candidate)) {
                dictionaryLookup.set(candidate, row);
            }
        }
    }

    return [...types]
        .sort((left, right) => left.id - right.id)
        .map((type) => {
            const dictionaryRow = dictionaryLookup.get(type.localized.zh);
            const fallbackColor = FALLBACK_TYPE_COLORS[type.name] ?? "#64748b";
            const accentColor =
                normalizeHexColor(
                    dictionaryRow?.rolecard_favorite_pets_colour,
                ) ?? fallbackColor;
            const color =
                normalizeHexColor(dictionaryRow?.evo_banding_color) ??
                accentColor;

            return {
                ...type,
                label: `${type.localized.zh}系`,
                shortLabel: type.localized.zh,
                color,
                accentColor,
            } satisfies ITypeEntry;
        });
}

function normalizeDictionaryLabel(value?: string) {
    if (!value) {
        return "";
    }

    return value
        .replace(/（.*?）/g, "")
        .replace(/\(.*?\)/g, "")
        .replace(/系别/g, "")
        .replace(/系/g, "")
        .trim();
}

function normalizeHexColor(value?: string) {
    if (!value) {
        return null;
    }

    const normalized = value.trim();

    if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(normalized)) {
        return normalized;
    }

    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4})$/.test(normalized)) {
        const digits = normalized.slice(1).split("");
        return `#${digits.map((digit) => `${digit}${digit}`).join("")}`;
    }

    return null;
}

function extractRgbChannels(color: string) {
    const normalized = normalizeHexColor(color);

    if (!normalized) {
        return null;
    }

    const digits = normalized.slice(1);
    const hasAlpha = digits.length === 8;

    return {
        red: Number.parseInt(digits.slice(0, 2), 16),
        green: Number.parseInt(digits.slice(2, 4), 16),
        blue: Number.parseInt(digits.slice(4, 6), 16),
        alpha: hasAlpha
            ? Number.parseInt(digits.slice(6, 8), 16) / 255
            : 1,
    };
}

function toRgba(color: string, alpha = 1) {
    const channels = extractRgbChannels(color);

    if (!channels) {
        return `rgba(100, 116, 139, ${alpha})`;
    }

    return `rgba(${channels.red}, ${channels.green}, ${channels.blue}, ${Math.max(
        0,
        Math.min(1, channels.alpha * alpha),
    )})`;
}

function getReadableTextColor(color: string) {
    const channels = extractRgbChannels(color);

    if (!channels) {
        return "#0f172a";
    }

    const luminance =
        (0.299 * channels.red + 0.587 * channels.green + 0.114 * channels.blue) /
        255;

    return luminance > 0.68 ? "#0f172a" : "#f8fafc";
}

function buildPairRelationLookup(
    activeType: ITypeEntry | null,
    types: ITypeEntry[],
) {
    const relationMap = new Map<number, ITypePairRelation>();

    if (!activeType) {
        return relationMap;
    }

    for (const type of types) {
        if (type.id === activeType.id) {
            continue;
        }

        relationMap.set(type.id, {
            attackAdvantage: type.vulnerable_to.includes(activeType.name),
            attackResisted: type.resistant_to.includes(activeType.name),
            defenseWeakness: activeType.vulnerable_to.includes(type.name),
            defenseResistance: activeType.resistant_to.includes(type.name),
        });
    }

    return relationMap;
}

function buildRelationBuckets(
    types: ITypeEntry[],
    relationLookup: Map<number, ITypePairRelation>,
): IRelationBuckets {
    const buckets: IRelationBuckets = {
        attackAdvantage: [],
        attackResisted: [],
        defenseWeakness: [],
        defenseResistance: [],
        neutral: [],
    };

    for (const type of types) {
        const relation = relationLookup.get(type.id);

        if (!relation) {
            continue;
        }

        let hasMarkedRelation = false;

        if (relation.attackAdvantage) {
            buckets.attackAdvantage.push(type);
            hasMarkedRelation = true;
        }

        if (relation.attackResisted) {
            buckets.attackResisted.push(type);
            hasMarkedRelation = true;
        }

        if (relation.defenseWeakness) {
            buckets.defenseWeakness.push(type);
            hasMarkedRelation = true;
        }

        if (relation.defenseResistance) {
            buckets.defenseResistance.push(type);
            hasMarkedRelation = true;
        }

        if (!hasMarkedRelation) {
            buckets.neutral.push(type);
        }
    }

    return buckets;
}

function buildChartScene(
    activeType: ITypeEntry | null,
    types: ITypeEntry[],
    relationLookup: Map<number, ITypePairRelation>,
    viewport: IChartViewport,
): IChartScene {
    if (!activeType) {
        return {
            nodes: [],
            links: [],
        };
    }

    const width = Math.max(viewport.width, 640);
    const height = Math.max(viewport.height, 640);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(210, Math.min(width, height) * 0.34);

    const otherTypes = [...types]
        .filter((type) => type.id !== activeType.id)
        .sort((left, right) => {
            const leftRelation = relationLookup.get(left.id);
            const rightRelation = relationLookup.get(right.id);
            return (
                buildRelationPriority(leftRelation).localeCompare(
                    buildRelationPriority(rightRelation),
                ) || left.id - right.id
            );
        });

    const nodes: IChartNode[] = [
        buildChartNode(
            activeType,
            centerX,
            centerY,
            78,
            true,
            `${activeType.label}<br/>${currentTypeSummary.value}`,
        ),
    ];
    const links: IChartLink[] = [];

    otherTypes.forEach((type, index) => {
        const angle =
            -Math.PI / 2 + (index / Math.max(1, otherTypes.length)) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const relation = relationLookup.get(type.id) ?? {
            attackAdvantage: false,
            attackResisted: false,
            defenseWeakness: false,
            defenseResistance: false,
        };

        nodes.push(
            buildChartNode(
                type,
                x,
                y,
                54,
                false,
                buildPairSummary(activeType, type, relation),
            ),
        );

        const hasOutgoing = relation.attackAdvantage || relation.attackResisted;
        const hasIncoming = relation.defenseWeakness || relation.defenseResistance;

        if (relation.attackAdvantage) {
            links.push(
                buildChartLink(
                    activeType,
                    type,
                    "attackAdvantage",
                    hasIncoming ? 0.18 : 0.06,
                ),
            );
        }

        if (relation.attackResisted) {
            links.push(
                buildChartLink(
                    activeType,
                    type,
                    "attackResisted",
                    hasIncoming ? 0.18 : 0.06,
                ),
            );
        }

        if (relation.defenseWeakness) {
            links.push(
                buildChartLink(
                    type,
                    activeType,
                    "defenseWeakness",
                    hasOutgoing ? -0.18 : -0.06,
                ),
            );
        }

        if (relation.defenseResistance) {
            links.push(
                buildChartLink(
                    type,
                    activeType,
                    "defenseResistance",
                    hasOutgoing ? -0.18 : -0.06,
                ),
            );
        }
    });

    return {
        nodes,
        links,
    };
}

function buildRelationPriority(relation?: ITypePairRelation) {
    if (!relation) {
        return "9999";
    }

    return [
        relation.attackAdvantage ? "0" : "1",
        relation.attackResisted ? "0" : "1",
        relation.defenseWeakness ? "0" : "1",
        relation.defenseResistance ? "0" : "1",
    ].join("");
}

function buildPairSummary(
    activeType: ITypeEntry,
    targetType: ITypeEntry,
    relation: ITypePairRelation,
) {
    const attackSummary = relation.attackAdvantage
        ? `${activeType.label}打${targetType.label}：克制 x2`
        : relation.attackResisted
            ? `${activeType.label}打${targetType.label}：受阻 x0.5`
            : `${activeType.label}打${targetType.label}：中性 x1`;

    const defenseSummary = relation.defenseWeakness
        ? `${targetType.label}打${activeType.label}：克制 x2`
        : relation.defenseResistance
            ? `${targetType.label}打${activeType.label}：受阻 x0.5`
            : `${targetType.label}打${activeType.label}：中性 x1`;

    return `${attackSummary}<br/>${defenseSummary}`;
}

function buildChartNode(
    type: ITypeEntry,
    x: number,
    y: number,
    symbolSize: number,
    isActive: boolean,
    tooltipBody: string,
): IChartNode {
    return {
        id: String(type.id),
        name: type.shortLabel,
        x,
        y,
        symbolSize,
        z: isActive ? 4 : 2,
        tooltipTitle: isActive ? `${type.label} · 当前聚焦` : type.label,
        tooltipBody,
        itemStyle: {
            color: toRgba(type.color, isActive ? 0.96 : 0.9),
            borderColor: type.accentColor,
            borderWidth: isActive ? 4 : 2,
            shadowBlur: isActive ? 26 : 14,
            shadowColor: toRgba(type.color, isActive ? 0.36 : 0.2),
        },
        label: {
            show: true,
            position: "inside",
            formatter: type.shortLabel,
            fontSize: type.shortLabel.length > 1 ? 12 : 13,
            fontWeight: isActive ? 700 : 600,
            color: getReadableTextColor(type.color),
            lineHeight: 15,
        },
    };
}

function buildChartLink(
    source: ITypeEntry,
    target: ITypeEntry,
    kind: RelationKind,
    curveness: number,
): IChartLink {
    const relationMeta = RELATION_META[kind];
    const directionBody =
        kind === "attackAdvantage" || kind === "attackResisted"
            ? `${source.label}进攻${target.label}：${relationMeta.multiplier}`
            : `${source.label}进攻${target.label}：${relationMeta.multiplier}`;

    return {
        source: String(source.id),
        target: String(target.id),
        value: 1,
        relationTitle: relationMeta.title,
        relationBody: `${directionBody}<br/>${relationMeta.description}`,
        lineStyle: {
            color: relationMeta.edgeColor,
            width: 3.5,
            opacity: 0.92,
            curveness,
            type: relationMeta.edgeType,
        },
        emphasis: {
            lineStyle: {
                width: 5,
                opacity: 1,
            },
        },
    };
}

function ensureChart() {
    if (!chartRef.value) {
        return null;
    }

    if (!chartInstance) {
        chartInstance = init(chartRef.value);
    }

    return chartInstance;
}

function renderChart() {
    const chart = ensureChart();

    if (!chart) {
        return;
    }

    if (!currentType.value || !chartScene.value.nodes.length) {
        chart.clear();
        return;
    }

    const option: ChartOption = {
        animationDurationUpdate: 360,
        tooltip: {
            trigger: "item",
            confine: true,
            extraCssText:
                "border-radius:18px;padding:0;box-shadow:0 18px 50px rgba(15,23,42,0.14);overflow:hidden;",
            backgroundColor: "rgba(255, 255, 255, 0.97)",
            borderColor: "rgba(148, 163, 184, 0.18)",
            borderWidth: 1,
            textStyle: {
                color: "#0f172a",
                fontFamily: "inherit",
            },
            formatter: (params: any) => {
                if (params.dataType === "edge") {
                    return formatTooltip(
                        params.data.relationTitle,
                        params.data.relationBody,
                    );
                }

                return formatTooltip(
                    params.data.tooltipTitle,
                    params.data.tooltipBody,
                );
            },
        },
        series: [
            {
                type: "graph",
                layout: "none",
                data: chartScene.value.nodes as NonNullable<
                    GraphSeriesOption["data"]
                >,
                links: chartScene.value.links as NonNullable<
                    GraphSeriesOption["links"]
                >,
                edgeSymbol: ["none", "arrow"],
                edgeSymbolSize: 10,
                roam: false,
                draggable: false,
                emphasis: {
                    focus: "adjacency",
                    scale: true,
                },
                label: {
                    show: true,
                },
                lineStyle: {
                    opacity: 0.82,
                },
            },
        ],
    };

    chart.setOption(option, true);
    chart.resize();
}

function formatTooltip(title: string, body: string) {
    return `
		<div style="padding:16px 18px;max-width:260px;">
			<div style="font-size:13px;font-weight:700;letter-spacing:0.02em;color:#0f172a;">${title}</div>
			<div style="margin-top:8px;font-size:12px;line-height:1.65;color:#475569;">${body}</div>
		</div>
	`;
}

function syncChartViewport() {
    if (!chartRef.value) {
        chartViewport.value = {
            width: 0,
            height: 0,
        };
        return;
    }

    chartViewport.value = {
        width: chartRef.value.clientWidth,
        height: chartRef.value.clientHeight,
    };
}

function selectType(typeId: number) {
    lockedTypeId.value = typeId;

    if (!supportsHover.value) {
        hoveredTypeId.value = null;
    }
}

function previewType(typeId: number) {
    if (!supportsHover.value) {
        return;
    }

    hoveredTypeId.value = typeId;
}

function clearPreview() {
    if (!supportsHover.value) {
        return;
    }

    hoveredTypeId.value = null;
}

function resetSelection() {
    lockedTypeId.value = getDefaultTypeId(typeEntries.value);
    hoveredTypeId.value = null;
}

function getBadgeStyle(type: ITypeEntry, isActive: boolean) {
    const textColor = isActive ? getReadableTextColor(type.color) : "#0f172a";

    return {
        color: textColor,
        borderColor: toRgba(type.color, isActive ? 0.92 : 0.22),
        background: isActive
            ? toRgba(type.color, 1)
            : toRgba(type.color, 0.3),
        boxShadow: isActive
            ? `0 18px 40px ${toRgba(type.color, 0.24)}`
            : "0 10px 24px rgba(148, 163, 184, 0.08)",
    };
}

function getChipStyle(type: ITypeEntry) {
    return {
        color: "#0f172a",
        borderColor: toRgba(type.color, 0.22),
        background: `linear-gradient(135deg, ${toRgba(type.color, 0.16)} 0%, rgba(255,255,255,0.96) 100%)`,
    };
}

function getPanelStyle(color: string) {
    return {
        borderColor: toRgba(color, 0.2),
        background: `linear-gradient(160deg, ${toRgba(color, 0.12)} 0%, rgba(255,255,255,0.94) 68%)`,
    };
}

function getLegendStyle(color: string) {
    return {
        borderColor: toRgba(color, 0.16),
        backgroundColor: toRgba(color, 0.08),
    };
}

function getLegendLineStyle(kind: RelationKind) {
    return {
        borderTop: `${RELATION_META[kind].edgeType === "dashed" ? "3px dashed" : "3px solid"} ${RELATION_META[kind].edgeColor}`,
    };
}

function getCountChipStyle(color: string) {
    return {
        color: "#0f172a",
        borderColor: toRgba(color, 0.2),
        background: toRgba(color, 0.14),
    };
}

watch(
    () => chartRef.value,
    (element, previousElement) => {
        if (chartResizeObserver && previousElement) {
            chartResizeObserver.unobserve(previousElement);
        }

        observedChartElement = element;

        if (!element) {
            return;
        }

        if (!chartResizeObserver) {
            chartResizeObserver = new ResizeObserver(() => {
                syncChartViewport();
            });
        }

        chartResizeObserver.observe(element);
        syncChartViewport();
    },
    {
        flush: "post",
    },
);

watch(
    () => [
        currentTypeId.value,
        chartViewport.value.width,
        chartViewport.value.height,
        typeEntries.value.length,
    ],
    async () => {
        await nextTick();
        renderChart();
    },
    {
        flush: "post",
    },
);

onMounted(() => {
    void loadTypeData();
});

onBeforeUnmount(() => {
    controller?.abort();

    if (chartResizeObserver && observedChartElement) {
        chartResizeObserver.unobserve(observedChartElement);
    }

    chartResizeObserver?.disconnect();
    chartInstance?.dispose();
    chartInstance = null;
});
</script>

<template>
    <section class="flex flex-col gap-6">

        <section v-if="isLoading"
            class="rounded-[30px] border border-slate-200/70 bg-white/85 p-10 text-center shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <p class="text-base font-semibold text-slate-700">正在读取属性数据...</p>
            <p class="mt-3 text-sm text-slate-500">类型表和颜色映射加载完成后，会自动绘制关系图。</p>
        </section>

        <section v-else-if="errorMessage"
            class="rounded-[30px] border border-rose-200 bg-rose-50/80 p-10 text-center shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <p class="text-base font-semibold text-rose-700">{{ errorMessage }}</p>
            <p class="mt-3 text-sm text-rose-600">你可以重新加载一次，通常是本地数据或网络瞬时失败。</p>
            <button type="button"
                class="mt-5 inline-flex items-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
                @click="loadTypeData">
                重新加载
            </button>
        </section>
        <Card v-else-if="currentType">
            <CardHeader>
                <h1 class=" text-2xl ">属性关系</h1>
                <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    {{
                        supportsHover
                            ? "把鼠标停在下方属性字徽上，就能即时查看该属性与其他各系的单属性克制关系。"
                            : "点击下方属性字徽，就能查看该属性与其他各系的单属性克制关系。"
                    }}
                </p>
                <div v-if="currentType" class="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span class="inline-flex items-center rounded-full border px-4 py-2 font-semibold"
                        :style="getBadgeStyle(currentType, true)">
                        当前选择 · {{ currentType.label }}
                    </span>
                    <span class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                        克制 {{ relationBuckets.attackAdvantage.length }} 项
                    </span>
                    <span class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                        被克制 {{ relationBuckets.defenseWeakness.length }} 项
                    </span>
                </div>
                <div class="mt-5 flex flex-wrap gap-3">
                    <div v-for="type in typeEntries" :key="type.id"
                        class="type-badge cursor-pointer flex  flex-col items-center rounded-[10px]  p-3 text-left"
                        :style="getBadgeStyle(type, currentTypeId === type.id)" @mouseenter="previewType(type.id)"
                        @mouseleave="clearPreview" @focus="previewType(type.id)" @blur="clearPreview"
                        @click="selectType(type.id)">
                        <span class="text-lg font-black leading-none">
                            {{ type.shortLabel }}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div class="mt-2 text-sm leading-6 text-slate-600">
                    中心节点始终是 {{ currentType.label }}，其余节点按属性编号环绕排列，方便同时看清进攻与防守两种关系。
                </div>
                <div class=" flex flex-col md:flex-row ">
                    <div ref="chartRef" class="mt-5 h-130 w-full overflow-hidden rounded-[28px] " />
                    <div class="mt-5 grid gap-3 sm:grid-cols-2">
                        <div v-for="kind in relationLegendKinds" :key="kind" class="rounded-[20px] border px-4 py-3"
                            :style="getLegendStyle(RELATION_META[kind].edgeColor)">
                            <div class="flex items-center justify-between gap-3 text-sm font-semibold ">
                                <span class="inline-flex items-center gap-3">
                                    <span class="w-8" :style="getLegendLineStyle(kind)" />
                                    {{ RELATION_META[kind].title }}
                                </span>
                                <span>{{ RELATION_META[kind].multiplier }}</span>
                            </div>
                            <p class="mt-2 text-xs leading-6 text-slate-500">
                                {{ RELATION_META[kind].description }}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </section>
</template>

<style scoped>
.type-badge,
.relation-card {
    transition:
        transform 180ms ease,
        box-shadow 180ms ease,
        border-color 180ms ease,
        background 220ms ease;
}

.type-badge:hover,
.type-badge:focus-visible,
.relation-card:hover {
    transform: translateY(-2px);
}
</style>