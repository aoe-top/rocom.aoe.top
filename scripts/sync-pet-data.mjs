import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFilePath), "..");
const publicDataDir = path.join(rootDir, "public", "data");
const binDataDir = path.join(publicDataDir, "BinData");
const tablesDir = path.join(publicDataDir, "tables");
const petsIndexPath = path.join(publicDataDir, "Pets.json");
const petsDetailDir = path.join(publicDataDir, "pets");
const typesPath = path.join(publicDataDir, "types.json");

const UNKNOWN_TYPE_ID = 20;
const CANONICAL_PETBASE_ID_RANGE = {
    min: 3000,
    maxExclusive: 4000,
};

const RAW_TYPE_TO_NORMALIZED_ID = new Map([
    [2, 1],
    [3, 2],
    [4, 3],
    [5, 4],
    [6, 5],
    [7, 6],
    [8, 6],
    [9, 7],
    [10, 8],
    [11, 9],
    [12, 10],
    [13, 11],
    [14, 12],
    [15, 13],
    [16, 14],
    [17, 15],
    [18, 16],
    [19, 17],
    [20, 18],
]);

const LEGACY_SKILL_TYPE_FIELDS = [
    ["blood_skill_COMMON", 1],
    ["blood_skill_GRASS", 2],
    ["blood_skill_FIRE", 3],
    ["blood_skill_WATER", 4],
    ["blood_skill_LIGHT", 5],
    ["blood_skill_STONE", 6],
    ["blood_skill_ICE", 7],
    ["blood_skill_DRAGON", 8],
    ["blood_skill_ELECTRIC", 9],
    ["blood_skill_TOXIC", 10],
    ["blood_skill_INSECT", 11],
    ["blood_skill_FIGHT", 12],
    ["blood_skill_WING", 13],
    ["blood_skill_MOE", 14],
    ["blood_skill_GHOST", 15],
    ["blood_skill_DEMON", 16],
    ["blood_skill_MECHANIC", 17],
    ["blood_skill_PHANTOM", 18],
];

const UNKNOWN_TYPE = {
    id: UNKNOWN_TYPE_ID,
    name: "Unknown",
    localized: {
        zh: "未知",
    },
};

async function main() {
    const [typeRows, petBaseTable, handbookTable, evolutionTable, levelSkillTable, skillTable, classisTable, petEggTable, petRandomEggTable, petNameMapTable] =
        await Promise.all([
            readJson(typesPath),
            readTable("PETBASE_CONF.json"),
            readTable("PET_HANDBOOK.json"),
            readTable("PET_EVOLUTION_CONF.json"),
            readTable("LEVEL_SKILL_CONF.json"),
            readTable("SKILL_CONF.json"),
            readTable("PET_CLASSIS_CONF.json"),
            readTable("PET_EGG_CONF.json"),
            readTable("PET_RANDOM_EGG_CONF.json"),
            readTable("PET_NAME_MAP_CONF.json"),
        ]);

    const typesById = new Map(
        typeRows.map((row) => [
            row.id,
            {
                id: row.id,
                name: row.name,
                localized: {
                    zh: row.localized?.zh ?? UNKNOWN_TYPE.localized.zh,
                },
            },
        ]),
    );
    const petBaseRows = getRows(petBaseTable)
        .filter((row) => typeof row?.id === "number")
        .sort((left, right) => left.id - right.id);
    const handbookRows = getRows(handbookTable);
    const evolutionById = indexBy(getRows(evolutionTable));
    const levelSkillById = indexBy(getRows(levelSkillTable));
    const skillById = indexBy(getRows(skillTable));
    const classisByPetClassis = new Map(
        getRows(classisTable)
            .filter((row) => typeof row?.pet_classis === "number")
            .map((row) => [row.pet_classis, row]),
    );
    const petEggRows = getRows(petEggTable);
    const petRandomEggRows = getRows(petRandomEggTable);
    const petNameMapById = indexBy(getRows(petNameMapTable));
    const handbookByPetBaseId = buildHandbookByPetBaseId(handbookRows);
    const handbookById = indexBy(handbookRows);

    const contexts = petBaseRows.map((petBase) => {
        const handbookRow = pickHandbookRow(
            petBase,
            handbookByPetBaseId.get(petBase.id) ?? [],
            handbookById,
        );
        const speciesGroupIds = uniqueNumbers(
            flattenHandbookPetBaseIds(handbookRow).length
                ? flattenHandbookPetBaseIds(handbookRow)
                : [petBase.id],
        );
        const evolutionRow = pickEvolutionRow(
            petBase,
            speciesGroupIds,
            evolutionById,
        );
        const portraitKey =
            extractPortraitKey(petBase.JL_res) ??
            extractPortraitKey(petBase.JL_small_res) ??
            normalizeFallbackName(petNameMapById.get(petBase.id)?.name) ??
            String(petBase.id);

        return {
            id: petBase.id,
            petBase,
            handbookRow,
            speciesGroupIds,
            groupKey: String(
                handbookRow?.id ?? petBase.pictorial_book_id ?? petBase.id,
            ),
            portraitKey,
            displayName: cleanText(petBase.name) ?? String(petBase.id),
            evolutionRow,
            classisRow:
                typeof petBase.pet_classis_id === "number"
                    ? classisByPetClassis.get(petBase.pet_classis_id) ?? null
                    : null,
            typePair: buildTypePair(petBase.unit_type, typesById),
        };
    });

    const contextById = new Map(contexts.map((context) => [context.id, context]));
    const contextsByGroup = groupBy(contexts, (context) => context.groupKey);
    const leaderFlagById = new Map(
        contexts.map((context) => [
            context.id,
            isLeaderForm(context.petBase, context.portraitKey),
        ]),
    );
    const groupHasLeaderForm = new Map(
        Array.from(contextsByGroup.entries()).map(([groupKey, groupContexts]) => [
            groupKey,
            groupContexts.some((context) => leaderFlagById.get(context.id)),
        ]),
    );

    const details = contexts.map((context) => {
        const evolutionTree = buildEvolutionTree(
            context,
            contextById,
            contextsByGroup,
            leaderFlagById,
            typesById,
        );
        const evolvesFromId = findEvolvesFromId(evolutionTree, context.id);
        const movePool = buildMovePool(
            levelSkillById.get(context.petBase.level_skill_conf_id),
            skillById,
            typesById,
        );
        const moveStones = buildMoveStones(
            levelSkillById.get(context.petBase.level_skill_conf_id),
            skillById,
            typesById,
        );
        const legacyMoves = buildLegacyMoves(
            context,
            levelSkillById.get(context.petBase.level_skill_conf_id),
            skillById,
        );
        const leaderForm = leaderFlagById.get(context.id) ?? false;
        const breeding = buildBreedingInfo(
            context,
            petEggRows,
            petRandomEggRows,
        );
        const implemented = isImplementedContext(
            context,
            movePool,
            moveStones,
            legacyMoves,
        );

        return {
            id: context.id,
            name: context.portraitKey,
            form: extractForm(context),
            main_type: context.typePair.mainType,
            sub_type: context.typePair.subType,
            default_legacy_type: context.typePair.mainType,
            leader_potential:
                !leaderForm && (groupHasLeaderForm.get(context.groupKey) ?? false),
            is_leader_form: leaderForm,
            preferred_attack_style: resolveAttackStyle(context.petBase),
            localized: {
                zh: {
                    name: context.displayName,
                },
            },
            implemented,
            base_hp: normalizeStat(context.petBase.hp_max_race),
            base_phy_atk: normalizeStat(context.petBase.phy_attack_race),
            base_mag_atk: normalizeStat(context.petBase.spe_attack_race),
            base_phy_def: normalizeStat(context.petBase.phy_defence_race),
            base_mag_def: normalizeStat(context.petBase.spe_defence_race),
            base_spd: normalizeStat(context.petBase.speed_race),
            evolves_from_id: evolvesFromId,
            species: buildSpecies(context, contextById),
            trait: buildTrait(context.petBase, skillById),
            move_pool: movePool,
            move_stones: moveStones,
            legacy_moves: legacyMoves,
            evolution_tree: evolutionTree,
            world_profile: buildWorldProfile(context),
            breeding,
            breeding_profile: buildBreedingProfile(context.petBase),
        };
    });

    const indexEntries = details.map((detail) => ({
        id: detail.id,
        name: detail.name,
        form: detail.form,
        main_type: detail.main_type,
        sub_type: detail.sub_type,
        default_legacy_type: detail.default_legacy_type,
        leader_potential: detail.leader_potential,
        is_leader_form: detail.is_leader_form,
        preferred_attack_style: detail.preferred_attack_style,
        localized: detail.localized,
        implemented: detail.implemented,
        base_hp: detail.base_hp,
        base_phy_atk: detail.base_phy_atk,
        base_mag_atk: detail.base_mag_atk,
        base_phy_def: detail.base_phy_def,
        base_mag_def: detail.base_mag_def,
        base_spd: detail.base_spd,
        evolves_from_id: detail.evolves_from_id,
        breeding: detail.breeding,
        breeding_profile: detail.breeding_profile,
    }));

    await syncMirroredTables();
    await fs.mkdir(petsDetailDir, { recursive: true });
    await cleanGeneratedPetDetails();
    await writeJson(petsIndexPath, indexEntries);
    await Promise.all(
        details.map((detail) => {
            return writeJson(
                path.join(petsDetailDir, `${detail.id}.json`),
                detail,
            );
        }),
    );

    console.log(
        `Generated ${indexEntries.length} pet index entries and ${details.length} pet detail files from BinData.`,
    );
}

async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function readTable(fileName) {
    return readJson(path.join(binDataDir, fileName));
}

function getRows(tablePayload) {
    return Object.values(tablePayload?.RocoDataRows ?? {});
}

function indexBy(rows, key = "id") {
    const map = new Map();

    for (const row of rows) {
        const value = row?.[key];

        if (value !== null && value !== undefined) {
            map.set(value, row);
        }
    }

    return map;
}

function groupBy(items, getKey) {
    const groups = new Map();

    for (const item of items) {
        const key = getKey(item);
        const bucket = groups.get(key) ?? [];
        bucket.push(item);
        groups.set(key, bucket);
    }

    return groups;
}

function normalizeArray(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (value === null || value === undefined) {
        return [];
    }

    return [value];
}

function uniqueNumbers(values) {
    return [...new Set(values.filter((value) => Number.isFinite(value)))].sort(
        (left, right) => left - right,
    );
}

function cleanText(value) {
    if (typeof value !== "string") {
        return null;
    }

    const cleaned = value
        .replace(/<[^>]*>/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/\s+/g, " ")
        .trim();

    return cleaned || null;
}

function normalizeFallbackName(value) {
    if (typeof value !== "string") {
        return null;
    }

    const normalized = value.replace(/[^A-Za-z0-9_]/g, "").toLowerCase();
    return normalized || null;
}

function extractPortraitKey(resourcePath) {
    if (typeof resourcePath !== "string") {
        return null;
    }

    const match = resourcePath.match(/(JL_[^./']+)\.(?:JL_[^']+)'/u);

    if (!match) {
        return null;
    }

    return match[1].replace(/^JL_/, "");
}

function flattenHandbookPetBaseIds(handbookRow) {
    const ids = [];

    for (const item of normalizeArray(handbookRow?.include_petbase_id)) {
        for (const petBaseId of normalizeArray(item?.petbase_id)) {
            if (Number.isFinite(petBaseId)) {
                ids.push(petBaseId);
            }
        }
    }

    return uniqueNumbers(ids);
}

function buildHandbookByPetBaseId(handbookRows) {
    const map = new Map();

    for (const row of handbookRows) {
        for (const petBaseId of flattenHandbookPetBaseIds(row)) {
            const bucket = map.get(petBaseId) ?? [];
            bucket.push(row);
            map.set(petBaseId, bucket);
        }
    }

    return map;
}

function pickHandbookRow(petBase, candidates, handbookById) {
    if (candidates.length === 1) {
        return candidates[0];
    }

    if (candidates.length > 1) {
        const exactMatch = candidates.find((candidate) => {
            return cleanText(candidate.name) === cleanText(petBase.name);
        });

        return exactMatch ?? candidates[0];
    }

    if (typeof petBase.pictorial_book_id === "number") {
        return handbookById.get(petBase.pictorial_book_id) ?? null;
    }

    return null;
}

function pickEvolutionRow(petBase, speciesGroupIds, evolutionById) {
    for (const evolutionId of normalizeArray(petBase.pet_evolution_id)) {
        const row = evolutionById.get(evolutionId);

        if (row) {
            return row;
        }
    }

    const speciesGroupIdSet = new Set(speciesGroupIds);

    for (const row of evolutionById.values()) {
        const chainIds = normalizeArray(row?.evolution_chain)
            .map((item) => item?.petbase_id)
            .filter((value) => Number.isFinite(value));

        if (chainIds.includes(petBase.id)) {
            return row;
        }

        if (chainIds.some((chainId) => speciesGroupIdSet.has(chainId))) {
            return row;
        }
    }

    return null;
}

function buildTypePair(rawTypes, typesById) {
    const normalizedTypeIds = [];

    for (const rawType of uniqueNumbers(normalizeArray(rawTypes))) {
        const normalizedId = RAW_TYPE_TO_NORMALIZED_ID.get(rawType) ?? UNKNOWN_TYPE_ID;

        if (!normalizedTypeIds.includes(normalizedId)) {
            normalizedTypeIds.push(normalizedId);
        }
    }

    const mainType = cloneType(typesById.get(normalizedTypeIds[0]) ?? UNKNOWN_TYPE);
    const subType = normalizedTypeIds[1]
        ? cloneType(typesById.get(normalizedTypeIds[1]) ?? UNKNOWN_TYPE)
        : null;

    return {
        mainType,
        subType,
    };
}

function cloneType(type) {
    return {
        id: type.id,
        name: type.name,
        localized: {
            zh: type.localized.zh,
        },
    };
}

function isLeaderForm(petBase, portraitKey) {
    return Boolean(petBase?.is_boss) || /(?:_shouling|_boss)$/u.test(portraitKey);
}

function extractForm(context) {
    const handbookName = cleanText(context.handbookRow?.name);
    const displayName = context.displayName;
    const wrapped = displayName.match(/[（(]([^）)]+)[）)]/u);

    if (wrapped?.[1]) {
        return wrapped[1].trim();
    }

    if (!handbookName || handbookName === displayName) {
        return "default";
    }

    if (displayName.endsWith(handbookName)) {
        const prefix = displayName.slice(0, displayName.length - handbookName.length).trim();

        if (prefix) {
            return prefix;
        }
    }

    if (displayName.startsWith(handbookName)) {
        const suffix = displayName.slice(handbookName.length).trim();

        if (suffix) {
            return suffix;
        }
    }

    return displayName;
}

function normalizeStat(value) {
    return typeof value === "number" ? value : 0;
}

function resolveAttackStyle(petBase) {
    const physicalAttack = normalizeStat(petBase.phy_attack_race);
    const magicalAttack = normalizeStat(petBase.spe_attack_race);
    const delta = physicalAttack - magicalAttack;

    if (Math.abs(delta) <= 10) {
        return "Both";
    }

    return delta > 0 ? "Physical" : "Magic";
}

function isCanonicalCollectiblePetBaseId(id) {
    return (
        typeof id === "number" &&
        id >= CANONICAL_PETBASE_ID_RANGE.min &&
        id < CANONICAL_PETBASE_ID_RANGE.maxExclusive
    );
}

function hasBattleContent(movePool, moveStones, legacyMoves) {
    return movePool.length > 0 || moveStones.length > 0 || legacyMoves.length > 0;
}

function hasHandbookPresentationAssets(petBase) {
    return (
        typeof petBase?.handbook_standpaint_bg === "string" ||
        typeof petBase?.handbook_unknown_bg === "string"
    );
}

function hasCanonicalHandbookPresentation(context) {
    return (
        isCanonicalCollectiblePetBaseId(context.id) &&
        typeof context.petBase?.pictorial_book_id === "number" &&
        hasHandbookPresentationAssets(context.petBase)
    );
}

function hasCanonicalBreedingSignals(context) {
    return (
        isCanonicalCollectiblePetBaseId(context.id) &&
        uniqueNumbers(normalizeArray(context.petBase?.egg_group)).length > 0
    );
}

function isImplementedContext(context, movePool, moveStones, legacyMoves) {
    // BinData does not expose one stable `is_released` flag. The most reliable
    // rule is a split by content type:
    // - canonical collectible pets: battle-ready and backed by either
    //   completeness, handbook mapping, handbook presentation assets, or egg-group
    //   breeding signals;
    // - released leader/boss forms: boss entries with a base-species pictorial
    //   link and handbook presentation assets.
    const canonicalCollectibleImplemented =
        isCanonicalCollectiblePetBaseId(context.id) &&
        hasBattleContent(movePool, moveStones, legacyMoves) &&
        (context.petBase?.completeness === 1 ||
            context.handbookRow !== null ||
            hasCanonicalHandbookPresentation(context) ||
            hasCanonicalBreedingSignals(context));

    const releasedBossFormImplemented =
        context.petBase?.is_boss === 1 &&
        typeof context.petBase?.pictorial_book_id === "number" &&
        hasHandbookPresentationAssets(context.petBase);

    return canonicalCollectibleImplemented || releasedBossFormImplemented;
}

function buildSpecies(context, contextById) {
    const speciesPetId =
        context.speciesGroupIds.find((petId) => contextById.has(petId)) ?? context.id;
    const speciesContext = contextById.get(speciesPetId) ?? context;

    return {
        id:
            context.handbookRow?.id ??
            context.petBase.pictorial_book_id ??
            context.id,
        name: speciesContext.portraitKey,
        localized: {
            zh: cleanText(context.handbookRow?.name) ?? speciesContext.displayName,
        },
    };
}

function buildTrait(petBase, skillById) {
    const skillId =
        petBase.pet_feature ?? petBase.pet_glass_feature ?? petBase.pet_chaos_feature;
    const skill = skillById.get(skillId);

    if (!skill) {
        return null;
    }

    const name = cleanText(skill.name) ?? `特性 ${skillId}`;
    const description = cleanText(skill.desc) ?? "";

    return {
        id: skill.id,
        name,
        description,
        localized: {
            zh: {
                name,
                description,
            },
        },
    };
}

function buildMovePool(levelSkillRow, skillById, typesById) {
    const entries = normalizeArray(levelSkillRow?.level)
        .filter((entry) => Number.isFinite(entry?.param))
        .sort((left, right) => {
            return (
                normalizeStat(left.level_point) - normalizeStat(right.level_point) ||
                left.param - right.param
            );
        });
    const seenSkillIds = new Set();
    const moves = [];

    for (const entry of entries) {
        if (seenSkillIds.has(entry.param)) {
            continue;
        }

        const move = buildMove(skillById.get(entry.param), typesById, entry.param);

        if (!move) {
            continue;
        }

        seenSkillIds.add(entry.param);
        moves.push(move);
    }

    return moves;
}

function buildMoveStones(levelSkillRow, skillById, typesById) {
    const seenSkillIds = new Set();
    const moves = [];

    for (const entry of normalizeArray(levelSkillRow?.machine_skill_group)) {
        const skillId = entry?.machine_skill_id;

        if (!Number.isFinite(skillId) || seenSkillIds.has(skillId)) {
            continue;
        }

        const move = buildMove(skillById.get(skillId), typesById, skillId, {
            fallbackName: cleanText(entry.machine_skill_name) ?? null,
        });

        if (!move) {
            continue;
        }

        seenSkillIds.add(skillId);
        moves.push(move);
    }

    return moves;
}

function buildLegacyMoves(context, levelSkillRow, skillById) {
    const entries = [];

    for (const [fieldName, typeId] of LEGACY_SKILL_TYPE_FIELDS) {
        const skillId = levelSkillRow?.[fieldName];

        if (!Number.isFinite(skillId) || !skillById.get(skillId)) {
            continue;
        }

        entries.push({
            monster_id: context.id,
            type_id: typeId,
            move_id: skillId,
        });
    }

    return entries;
}

function buildMove(skill, typesById, fallbackSkillId, options = {}) {
    const skillId = skill?.id ?? fallbackSkillId;

    if (!Number.isFinite(skillId)) {
        return null;
    }

    const name =
        cleanText(skill?.name) ?? options.fallbackName ?? `技能 ${skillId}`;
    const description = cleanText(skill?.desc) ?? "";
    const moveType = buildMoveType(skill?.skill_dam_type, typesById);

    return {
        id: skillId,
        name,
        move_type: moveType,
        localized: {
            zh: {
                name,
                description,
            },
        },
        move_category: resolveMoveCategory(skill),
        energy_cost: firstNumericValue(skill?.energy_cost) ?? 0,
        power: resolveMovePower(skill),
        description,
    };
}

function buildMoveType(rawTypeId, typesById) {
    const normalizedId = RAW_TYPE_TO_NORMALIZED_ID.get(rawTypeId) ?? UNKNOWN_TYPE_ID;
    return cloneType(typesById.get(normalizedId) ?? UNKNOWN_TYPE);
}

function resolveMoveCategory(skill) {
    if (skill?.Skill_Type === 3) {
        return "Defense";
    }

    if (skill?.Skill_Type === 2) {
        return "Status";
    }

    if (skill?.damage_type === 3) {
        return "Magic Attack";
    }

    if (skill?.damage_type === 2) {
        return "Physical Attack";
    }

    return "Status";
}

function resolveMovePower(skill) {
    const power = firstNumericValue(skill?.dam_para);
    return typeof power === "number" && power > 0 ? power : null;
}

function firstNumericValue(value) {
    if (Array.isArray(value)) {
        return value.find((entry) => typeof entry === "number") ?? null;
    }

    return typeof value === "number" ? value : null;
}

function buildWorldProfile(context) {
    const refreshHint = cleanText(context.petBase.pet_track_fail_desc);

    return {
        type_desc: cleanText(context.handbookRow?.type_desc),
        description_habitat: cleanText(context.handbookRow?.description_habitat),
        introduction: cleanText(context.petBase.description),
        refresh_locations: refreshHint ? [refreshHint] : [],
        movement_type: cleanText(context.petBase.move_type),
        classis_id:
            typeof context.petBase.pet_classis_id === "number"
                ? context.petBase.pet_classis_id
                : null,
        classis_name: cleanText(context.classisRow?.name),
        handbook_area_ids: uniqueNumbers(
            normalizeArray(context.handbookRow?.belong_area_handbook),
        ),
    };
}

function buildBreedingProfile(petBase) {
    const eggGroups = uniqueNumbers(normalizeArray(petBase.egg_group));
    const proportionMale =
        typeof petBase.proportion_male === "number"
            ? petBase.proportion_male
            : null;
    const maleRate = normalizeGenderRate(proportionMale);

    return {
        pet_base_id: typeof petBase.id === "number" ? petBase.id : null,
        egg_groups: eggGroups,
        proportion_male: proportionMale,
        male_rate: maleRate,
        female_rate: maleRate === null ? null : Math.max(0, 100 - maleRate),
    };
}

function normalizeGenderRate(proportionMale) {
    if (typeof proportionMale !== "number") {
        return null;
    }

    if (proportionMale >= 0 && proportionMale <= 10) {
        return Math.round(proportionMale * 10);
    }

    if (proportionMale >= 0 && proportionMale <= 100) {
        return Math.round(proportionMale);
    }

    return null;
}

function buildBreedingInfo(context, petEggRows, petRandomEggRows) {
    const eggVariants = collectEggVariants(
        context,
        petEggRows,
        petRandomEggRows,
    );

    if (!eggVariants.length) {
        return null;
    }

    return {
        ...eggVariants[0],
        variants: eggVariants,
    };
}

function collectEggVariants(context, petEggRows, petRandomEggRows) {
    const primaryVariants = collectEggVariantsFromSource(
        context,
        petEggRows,
    );

    if (primaryVariants.length) {
        return primaryVariants;
    }

    return collectEggVariantsFromSource(context, petRandomEggRows);
}

function collectEggVariantsFromSource(context, rows) {
    const prefix = String(context.id);
    const seenVariantIds = new Set();
    const variants = [];

    for (const row of rows) {
        if (!isEggVariantForPet(row, prefix, context.displayName, context.handbookRow?.name)) {
            continue;
        }

        const variant = buildEggVariant(row);

        if (!variant || seenVariantIds.has(variant.id ?? variant.pet_id)) {
            continue;
        }

        seenVariantIds.add(variant.id ?? variant.pet_id);
        variants.push(variant);
    }

    return variants.sort((left, right) => {
        return (left.id ?? left.pet_id ?? 0) - (right.id ?? right.pet_id ?? 0);
    });
}

function isEggVariantForPet(row, petBaseIdPrefix, displayName, handbookName) {
    const idValues = [row?.id, row?.pet_id, row?.model_id]
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value));

    if (idValues.some((value) => value.startsWith(petBaseIdPrefix))) {
        return true;
    }

    const rowName = cleanText(row?.name);
    const names = [cleanText(displayName), cleanText(handbookName)].filter(Boolean);

    return rowName !== null && names.includes(rowName);
}

function buildEggVariant(row) {
    if (!row || (row.id === undefined && row.pet_id === undefined)) {
        return null;
    }

    return {
        id: typeof row.id === "number" ? row.id : null,
        pet_id: typeof row.pet_id === "number" ? row.pet_id : null,
        name: cleanText(row.name),
        model_id: typeof row.model_id === "number" ? row.model_id : null,
        hatch_data: typeof row.hatch_data === "number" ? row.hatch_data : null,
        weight_low: typeof row.weight_low === "number" ? row.weight_low : null,
        weight_high: typeof row.weight_high === "number" ? row.weight_high : null,
        height_low: typeof row.height_low === "number" ? row.height_low : null,
        height_high: typeof row.height_high === "number" ? row.height_high : null,
        precious_egg_type:
            typeof row.precious_egg_type === "number" ? row.precious_egg_type : null,
        egg_base_glass_prob_array: Array.isArray(row.egg_base_glass_prob_array)
            ? row.egg_base_glass_prob_array
            : null,
        egg_add_glass_prob_array: Array.isArray(row.egg_add_glass_prob_array)
            ? row.egg_add_glass_prob_array
            : null,
        is_contact_add_glass_prob:
            typeof row.is_contact_add_glass_prob === "boolean"
                ? row.is_contact_add_glass_prob
                : null,
        is_contact_add_shining_prob:
            typeof row.is_contact_add_shining_prob === "boolean"
                ? row.is_contact_add_shining_prob
                : null,
    };
}

function buildEvolutionTree(
    context,
    contextById,
    contextsByGroup,
    leaderFlagById,
    typesById,
) {
    const stages = [];
    const seenIds = new Set();
    const stageBuckets = new Map();

    for (const node of normalizeArray(context.evolutionRow?.evolution_chain)) {
        const petBaseId = node?.petbase_id;
        const stageNumber = typeof node?.stage === "number" ? node.stage : 1;

        if (!Number.isFinite(petBaseId) || !contextById.has(petBaseId)) {
            continue;
        }

        const bucket = stageBuckets.get(stageNumber) ?? [];

        if (!bucket.includes(petBaseId)) {
            bucket.push(petBaseId);
            seenIds.add(petBaseId);
        }

        stageBuckets.set(stageNumber, bucket);
    }

    const orderedStageNumbers = [...stageBuckets.keys()].sort((left, right) => {
        return left - right;
    });

    orderedStageNumbers.forEach((stageNumber, depth) => {
        const petBaseIds = stageBuckets.get(stageNumber) ?? [];
        stages.push({
            depth,
            monsters: petBaseIds
                .map((petBaseId) => {
                    return buildEvolutionNode(
                        contextById.get(petBaseId),
                        leaderFlagById,
                        typesById,
                    );
                })
                .filter(Boolean),
        });
    });

    const groupContexts = contextsByGroup.get(context.groupKey) ?? [context];
    const extraBaseIds = groupContexts
        .filter((item) => !seenIds.has(item.id) && !(leaderFlagById.get(item.id) ?? false))
        .map((item) => item.id);
    const extraLeaderIds = groupContexts
        .filter((item) => !seenIds.has(item.id) && (leaderFlagById.get(item.id) ?? false))
        .map((item) => item.id);

    if (!stages.length) {
        const initialIds = extraBaseIds.length ? extraBaseIds : [context.id];
        stages.push({
            depth: 0,
            monsters: initialIds
                .map((petBaseId) => {
                    return buildEvolutionNode(
                        contextById.get(petBaseId),
                        leaderFlagById,
                        typesById,
                    );
                })
                .filter(Boolean),
        });
        initialIds.forEach((id) => seenIds.add(id));
    } else if (extraBaseIds.length) {
        stages[0].monsters.push(
            ...extraBaseIds
                .map((petBaseId) => {
                    return buildEvolutionNode(
                        contextById.get(petBaseId),
                        leaderFlagById,
                        typesById,
                    );
                })
                .filter(Boolean),
        );
        extraBaseIds.forEach((id) => seenIds.add(id));
    }

    if (
        !seenIds.has(context.id) &&
        !(leaderFlagById.get(context.id) ?? false) &&
        stages[0]
    ) {
        stages[0].monsters.push(
            buildEvolutionNode(context, leaderFlagById, typesById),
        );
        seenIds.add(context.id);
    }

    if (!extraLeaderIds.length && (leaderFlagById.get(context.id) ?? false) && !seenIds.has(context.id)) {
        extraLeaderIds.push(context.id);
    }

    if (extraLeaderIds.length) {
        stages.push({
            depth: stages.length,
            is_leader_stage: true,
            monsters: extraLeaderIds
                .map((petBaseId) => {
                    return buildEvolutionNode(
                        contextById.get(petBaseId),
                        leaderFlagById,
                        typesById,
                    );
                })
                .filter(Boolean),
        });
        extraLeaderIds.forEach((id) => seenIds.add(id));
    }

    const normalizedStages = stages
        .map((stage) => ({
            ...stage,
            monsters: dedupeEvolutionNodes(stage.monsters).sort((left, right) => {
                return left.id - right.id;
            }),
        }))
        .filter((stage) => stage.monsters.length > 0)
        .map((stage, depth) => ({
            ...stage,
            depth,
            is_leader_stage:
                stage.is_leader_stage ||
                stage.monsters.some((monster) => monster.is_leader_form),
        }));

    const allMonsterIds = normalizedStages.flatMap((stage) => {
        return stage.monsters.map((monster) => monster.id);
    });

    return {
        stages: normalizedStages,
        max_depth: normalizedStages.length ? normalizedStages.length - 1 : 0,
        total_unique_monsters: new Set(allMonsterIds).size,
        species_id:
            context.handbookRow?.id ??
            context.petBase.pictorial_book_id ??
            context.id,
        current_monster_id: context.id,
    };
}

function buildEvolutionNode(context, leaderFlagById, typesById) {
    if (!context) {
        return null;
    }

    return {
        id: context.id,
        name: context.portraitKey,
        form: extractForm(context),
        localized: {
            zh: {
                name: context.displayName,
            },
        },
        is_leader_form: leaderFlagById.get(context.id) ?? false,
        main_type: cloneType(context.typePair.mainType ?? UNKNOWN_TYPE),
        sub_type: context.typePair.subType
            ? cloneType(context.typePair.subType)
            : null,
    };
}

function dedupeEvolutionNodes(nodes) {
    const seenIds = new Set();

    return nodes.filter((node) => {
        if (!node || seenIds.has(node.id)) {
            return false;
        }

        seenIds.add(node.id);
        return true;
    });
}

function findEvolvesFromId(evolutionTree, currentPetId) {
    const stageIndex = evolutionTree.stages.findIndex((stage) => {
        return stage.monsters.some((monster) => monster.id === currentPetId);
    });

    if (stageIndex <= 0) {
        return null;
    }

    return evolutionTree.stages[stageIndex - 1]?.monsters[0]?.id ?? null;
}

async function syncMirroredTables() {
    await fs.mkdir(tablesDir, { recursive: true });

    let existingFiles = [];

    try {
        existingFiles = await fs.readdir(tablesDir);
    } catch {
        existingFiles = [];
    }

    await Promise.all(
        existingFiles
            .filter((fileName) => fileName.endsWith(".json"))
            .map(async (fileName) => {
                const sourcePath = path.join(binDataDir, fileName);

                try {
                    const content = await fs.readFile(sourcePath, "utf8");
                    await fs.writeFile(path.join(tablesDir, fileName), content, "utf8");
                } catch {
                    // Ignore table mirrors that do not have a BinData source.
                }
            }),
    );
}

async function cleanGeneratedPetDetails() {
    let fileNames = [];

    try {
        fileNames = await fs.readdir(petsDetailDir);
    } catch {
        fileNames = [];
    }

    await Promise.all(
        fileNames
            .filter((fileName) => fileName.endsWith(".json"))
            .map((fileName) => fs.unlink(path.join(petsDetailDir, fileName))),
    );
}

async function writeJson(filePath, value) {
    await fs.writeFile(
        filePath,
        `${JSON.stringify(value, null, 4)}\n`,
        "utf8",
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});