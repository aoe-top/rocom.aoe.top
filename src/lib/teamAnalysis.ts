import type {
    IMonsterTypeDetail,
    IPersonality,
    IPets,
    IPetsMove,
    IPetsType,
} from "@/lib/interface";

export type StatKey =
    | "base_hp"
    | "base_phy_atk"
    | "base_mag_atk"
    | "base_phy_def"
    | "base_mag_def"
    | "base_spd";

export type TeamRole = "辅助" | "拦截" | "倾泻" | "联攻" | "联防" | "中转";

export interface ISpeedReferenceEntry {
    pet_id: number;
    pet_name: string;
    speed: number;
    main_type_label: string;
    sub_type_label: string | null;
    preferred_attack_style: string;
}

export interface IThreatSlotResult {
    slot_pet_id: number;
    slot_pet_name: string;
    best_attack_type_name: string;
    best_attack_type_label: string;
    net: number;
    relation: "weak" | "neutral" | "resist";
    multiplier: number;
}

export interface IThreatEntry {
    pet_id: number;
    pet_name: string;
    main_type_label: string;
    sub_type_label: string | null;
    attack_type_labels: string[];
    weak_count: number;
    neutral_count: number;
    resist_count: number;
    has_safe_switch: boolean;
    pierce_risk: boolean;
    score: number;
    slot_results: IThreatSlotResult[];
}

export interface IDamageEstimateInput {
    attacker: IPets;
    defender: IPets;
    move: IPetsMove;
    attackerPersonality: IPersonality | null;
    defenderPersonality: IPersonality | null;
    typeMap: Map<number, IMonsterTypeDetail>;
    level: number;
    hitCount: number;
    flatPowerBonus: number;
    damageBonusPct: number;
    damageReductionPct: number;
    stabMultiplier: number;
    formulaParam: number;
    levelMagnitude: number;
    levelOffset: number;
    minimumDamage: number;
}

export interface IDamageEstimateResult {
    attack_stat_label: string;
    attack_value: number;
    defense_stat_label: string;
    defense_value: number;
    hp_value: number;
    stab_applied: boolean;
    stab_multiplier: number;
    type_multiplier: number;
    type_relation_label: string;
    estimated_damage_per_hit: number;
    estimated_total_damage: number;
    estimated_hp_percent: number;
    estimated_hits_to_ko: number | null;
}

const STAT_LABELS: Record<StatKey, string> = {
    base_hp: "生命",
    base_phy_atk: "物攻",
    base_mag_atk: "魔攻",
    base_phy_def: "物防",
    base_mag_def: "魔防",
    base_spd: "速度",
};

const PERSONALITY_MOD_KEYS: Record<StatKey, keyof IPersonality> = {
    base_hp: "hp_mod_pct",
    base_phy_atk: "phy_atk_mod_pct",
    base_mag_atk: "mag_atk_mod_pct",
    base_phy_def: "phy_def_mod_pct",
    base_mag_def: "mag_def_mod_pct",
    base_spd: "spd_mod_pct",
};

export const TEAM_ROLE_OPTIONS: TeamRole[] = [
    "辅助",
    "拦截",
    "倾泻",
    "联攻",
    "联防",
    "中转",
];

export function getPersonalityStatDeltaSummary(
    personality: IPersonality | null,
) {
    if (!personality) {
        return "无修正";
    }

    const raised: string[] = [];
    const lowered: string[] = [];

    for (const [statKey, modifierKey] of Object.entries(PERSONALITY_MOD_KEYS)) {
        const modifier = Number(personality[modifierKey]);

        if (!modifier) {
            continue;
        }

        const label = STAT_LABELS[statKey as StatKey];
        const text = `${label}${modifier > 0 ? "+" : ""}${Math.round(
            modifier * 100,
        )}%`;

        if (modifier > 0) {
            raised.push(text);
        } else {
            lowered.push(text);
        }
    }

    if (!raised.length && !lowered.length) {
        return "无修正";
    }

    return [raised.join(" / "), lowered.join(" / ")]
        .filter(Boolean)
        .join(" | ");
}

export function calculateAdjustedStat(
    pet: Pick<IPets, StatKey>,
    personality: IPersonality | null,
    statKey: StatKey,
) {
    const modifier = personality
        ? Number(personality[PERSONALITY_MOD_KEYS[statKey]])
        : 0;

    return Math.round(pet[statKey] * (1 + modifier));
}

export function calculateAdjustedSpeed(
    pet: Pick<IPets, "base_spd">,
    personality: IPersonality | null,
    flatBonus = 0,
    percentBonus = 0,
) {
    const baseSpeed = Math.round(
        pet.base_spd * (1 + Number(personality?.spd_mod_pct ?? 0)),
    );
    const speedWithFlatBonus = baseSpeed + flatBonus;
    return Math.round(speedWithFlatBonus * (1 + percentBonus / 100));
}

export function getPetTypes(pet: IPets) {
    return [pet.main_type, pet.sub_type].filter(
        (type): type is NonNullable<IPets["sub_type"]> | IPets["main_type"] =>
            Boolean(type),
    );
}

export function getTypeRelationNet(
    pet: IPets,
    attackTypeName: string,
    typeMap: Map<number, IMonsterTypeDetail>,
) {
    return getPetTypes(pet).reduce((score, type) => {
        const detail = typeMap.get(type.id);

        if (!detail) {
            return score;
        }

        if (detail.vulnerable_to.includes(attackTypeName)) {
            return score + 1;
        }

        if (detail.resistant_to.includes(attackTypeName)) {
            return score - 1;
        }

        return score;
    }, 0);
}

export function getRelationLabel(net: number) {
    if (net > 0) {
        return "weak" as const;
    }

    if (net < 0) {
        return "resist" as const;
    }

    return "neutral" as const;
}

export function getTypeMultiplier(net: number) {
    return Number((2 ** net).toFixed(2));
}

export function buildSpeedReferenceEntries(pets: IPets[], speedModifier = 0) {
    return pets
        .map((pet) => ({
            pet_id: pet.id,
            pet_name: pet.localized.zh.name,
            speed: Math.round(pet.base_spd * (1 + speedModifier)),
            main_type_label: pet.main_type.localized.zh,
            sub_type_label: pet.sub_type?.localized.zh ?? null,
            preferred_attack_style: pet.preferred_attack_style,
        }))
        .sort((left, right) => {
            return right.speed - left.speed || left.pet_id - right.pet_id;
        });
}

export function buildThreatEntries(
    environmentPets: IPets[],
    teamPets: IPets[],
    typeMap: Map<number, IMonsterTypeDetail>,
) {
    return environmentPets
        .map((pet) => buildThreatEntry(pet, teamPets, typeMap))
        .filter((entry): entry is IThreatEntry => entry !== null)
        .sort((left, right) => {
            return right.score - left.score || left.pet_id - right.pet_id;
        });
}

function buildThreatEntry(
    attacker: IPets,
    teamPets: IPets[],
    typeMap: Map<number, IMonsterTypeDetail>,
) {
    if (!teamPets.length) {
        return null;
    }

    const attackTypes = getPetTypes(attacker);

    if (!attackTypes.length) {
        return null;
    }

    const slotResults = teamPets
        .map((pet) => {
            const bestMatch = attackTypes
                .map((type) => {
                    const net = getTypeRelationNet(pet, type.name, typeMap);
                    return {
                        slot_pet_id: pet.id,
                        slot_pet_name: pet.localized.zh.name,
                        best_attack_type_name: type.name,
                        best_attack_type_label: type.localized.zh,
                        net,
                        relation: getRelationLabel(net),
                        multiplier: getTypeMultiplier(net),
                    } satisfies IThreatSlotResult;
                })
                .sort((left, right) => right.net - left.net)[0];

            return bestMatch;
        })
        .filter((item): item is IThreatSlotResult => item !== undefined);

    if (!slotResults.length) {
        return null;
    }

    const weakCount = slotResults.filter(
        (item) => item.relation === "weak",
    ).length;
    const neutralCount = slotResults.filter(
        (item) => item.relation === "neutral",
    ).length;
    const resistCount = slotResults.filter(
        (item) => item.relation === "resist",
    ).length;
    const hasSafeSwitch = resistCount > 0;
    const pierceRisk =
        !hasSafeSwitch && (weakCount >= 2 || neutralCount === teamPets.length);
    const score =
        weakCount * 8 +
        neutralCount * 3 -
        resistCount * 6 +
        attacker.base_spd * 0.04 +
        getTotalStats(attacker) * 0.02 +
        (pierceRisk ? 18 : 0);

    return {
        pet_id: attacker.id,
        pet_name: attacker.localized.zh.name,
        main_type_label: attacker.main_type.localized.zh,
        sub_type_label: attacker.sub_type?.localized.zh ?? null,
        attack_type_labels: attackTypes.map((type) => type.localized.zh),
        weak_count: weakCount,
        neutral_count: neutralCount,
        resist_count: resistCount,
        has_safe_switch: hasSafeSwitch,
        pierce_risk: pierceRisk,
        score,
        slot_results: slotResults,
    } satisfies IThreatEntry;
}

export function calculateDamageEstimate(
    input: IDamageEstimateInput,
): IDamageEstimateResult | null {
    if (
        input.move.move_category !== "Physical Attack" &&
        input.move.move_category !== "Magic Attack"
    ) {
        return null;
    }

    if (typeof input.move.power !== "number" || input.move.power <= 0) {
        return null;
    }

    const attackStatKey =
        input.move.move_category === "Physical Attack"
            ? "base_phy_atk"
            : "base_mag_atk";
    const defenseStatKey =
        input.move.move_category === "Physical Attack"
            ? "base_phy_def"
            : "base_mag_def";
    const attackValue = calculateAdjustedStat(
        input.attacker,
        input.attackerPersonality,
        attackStatKey,
    );
    const defenseValue = Math.max(
        1,
        calculateAdjustedStat(
            input.defender,
            input.defenderPersonality,
            defenseStatKey,
        ),
    );
    const hpValue = Math.max(
        1,
        calculateAdjustedStat(
            input.defender,
            input.defenderPersonality,
            "base_hp",
        ),
    );
    const stabApplied = getPetTypes(input.attacker).some(
        (type) => type.id === input.move.move_type.id,
    );
    const stabMultiplier = stabApplied ? input.stabMultiplier : 1;
    const typeNet = getTypeRelationNet(
        input.defender,
        input.move.move_type.name,
        input.typeMap,
    );
    const typeMultiplier = getTypeMultiplier(typeNet);
    const levelFactor = input.level / input.levelMagnitude + input.levelOffset;
    const effectivePower = Math.max(0, input.move.power + input.flatPowerBonus);
    const modifier =
        stabMultiplier *
        typeMultiplier *
        (1 + input.damageBonusPct / 100) *
        Math.max(0, 1 - input.damageReductionPct / 100);
    const estimatedDamagePerHit = Math.max(
        input.minimumDamage,
        Math.round(
            ((levelFactor * effectivePower * attackValue) /
                (defenseValue * input.formulaParam)) *
                modifier,
        ),
    );
    const estimatedTotalDamage = estimatedDamagePerHit * input.hitCount;
    const estimatedHpPercent = Number(
        ((estimatedTotalDamage / hpValue) * 100).toFixed(1),
    );

    return {
        attack_stat_label: STAT_LABELS[attackStatKey],
        attack_value: attackValue,
        defense_stat_label: STAT_LABELS[defenseStatKey],
        defense_value: defenseValue,
        hp_value: hpValue,
        stab_applied: stabApplied,
        stab_multiplier: stabMultiplier,
        type_multiplier: typeMultiplier,
        type_relation_label: getTypeRelationText(typeNet),
        estimated_damage_per_hit: estimatedDamagePerHit,
        estimated_total_damage: estimatedTotalDamage,
        estimated_hp_percent: estimatedHpPercent,
        estimated_hits_to_ko:
            estimatedTotalDamage > 0
                ? Math.ceil(hpValue / estimatedTotalDamage)
                : null,
    };
}

function getTypeRelationText(net: number) {
    if (net > 0) {
        return `克制 x${getTypeMultiplier(net)}`;
    }

    if (net < 0) {
        return `抵抗 x${getTypeMultiplier(net)}`;
    }

    return "等倍 x1";
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
