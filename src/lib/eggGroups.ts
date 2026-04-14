interface IRawEggGroupMeta {
    id: number;
    reason: string;
    primaryDescription: string;
    preferenceDescription: string;
}

export interface IEggGroupMeta {
    id: number;
    reason: string;
    label: string;
    description: string;
    preference: string;
}

const RAW_EGG_GROUP_META: Record<number, IRawEggGroupMeta> = {
    1: {
        id: 1,
        reason: "PEG_UNDISCOVERED",
        primaryDescription: "未发现：不能和任何精灵生蛋，多用于传说中的精灵",
        preferenceDescription: "喜欢的口味较为大众；不排斥任何天气",
    },
    2: {
        id: 2,
        reason: "PEG_MONSTER",
        primaryDescription: "怪兽：像怪兽一样，或者比较野性的动物",
        preferenceDescription: "喜欢的口味较为大众",
    },
    3: {
        id: 3,
        reason: "PEG_AMPHIBIAN",
        primaryDescription: "两栖：两栖动物和水边生活的多栖动物",
        preferenceDescription: "喜欢湿润，喜欢湿度高的天气",
    },
    4: {
        id: 4,
        reason: "PEG_INSECT",
        primaryDescription: "虫：看起来像虫子的精灵",
        preferenceDescription: "喜欢湿润与自然，排斥极端天气",
    },
    5: {
        id: 5,
        reason: "PEG_FLYING",
        primaryDescription: "飞行：会飞的精灵",
        preferenceDescription: "喜欢自然，排斥阻碍飞行的天气",
    },
    6: {
        id: 6,
        reason: "PEG_LAND",
        primaryDescription: "陆上：生活在陆地上的精灵",
        preferenceDescription: "喜欢自然，排斥极端天气",
    },
    7: {
        id: 7,
        reason: "PEG_FAIRY",
        primaryDescription: "妖精：可爱的小动物，以及神话中的精灵",
        preferenceDescription: "喜欢自然，排斥极端天气",
    },
    8: {
        id: 8,
        reason: "PEG_PLANT",
        primaryDescription: "植物：看起来像植物的精灵",
        preferenceDescription: "喜欢自然，喜欢湿度高的天气",
    },
    9: {
        id: 9,
        reason: "PEG_HUMAN_LIKE",
        primaryDescription: "人型：看起来像人的精灵",
        preferenceDescription: "啥都喜欢",
    },
    10: {
        id: 10,
        reason: "PEG_INVERTEBRATE",
        primaryDescription: "软体：看起来软软的精灵，圆形多为软体动物",
        preferenceDescription: "喜欢湿润，喜欢湿度高的天气",
    },
    11: {
        id: 11,
        reason: "PEG_MINERAL",
        primaryDescription: "矿物：身体由矿物组成的精灵",
        preferenceDescription: "喜欢岩石",
    },
    12: {
        id: 12,
        reason: "PEG_UNFORM",
        primaryDescription:
            "不定形：看起来没有固定形态的精灵，包括：水、火、灵魂、能量",
        preferenceDescription: "喜欢自然能量",
    },
    13: {
        id: 13,
        reason: "PEG_FISH",
        primaryDescription: "鱼：看起来像鱼的精灵",
        preferenceDescription: "喜欢湿润与大海；排斥沙暴与雪",
    },
    14: {
        id: 14,
        reason: "PEG_DRAGON",
        primaryDescription: "龙：看起来像龙的精灵",
        preferenceDescription: "喜欢的口味较为大众；不排斥任何天气",
    },
    15: {
        id: 15,
        reason: "PEG_MACHINE",
        primaryDescription: "机械：身体由机械组成的精灵",
        preferenceDescription: "喜欢口味极少，排斥绝大部分异常天气",
    },
};

function splitPrimaryDescription(primaryDescription: string) {
    const separatorIndex = primaryDescription.indexOf("：");

    if (separatorIndex === -1) {
        return {
            label: primaryDescription,
            description: "",
        };
    }

    return {
        label: primaryDescription.slice(0, separatorIndex),
        description: primaryDescription.slice(separatorIndex + 1),
    };
}

export function getEggGroupMeta(groupId: number): IEggGroupMeta | null {
    const rawMeta = RAW_EGG_GROUP_META[groupId];

    if (!rawMeta) {
        return null;
    }

    const { label, description } = splitPrimaryDescription(
        rawMeta.primaryDescription,
    );

    return {
        id: rawMeta.id,
        reason: rawMeta.reason,
        label,
        description,
        preference: rawMeta.preferenceDescription,
    };
}

export function formatEggGroup(groupId: number) {
    return getEggGroupMeta(groupId)?.label ?? `蛋组 ${groupId}`;
}

export function formatEggGroupSummary(
    groupIds: number[],
    emptyLabel = "暂无蛋组数据",
) {
    if (!groupIds.length) {
        return emptyLabel;
    }

    return groupIds.map((groupId) => formatEggGroup(groupId)).join(" / ");
}
