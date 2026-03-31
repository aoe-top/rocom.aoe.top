import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFilePath), "..");
const publicDataDir = path.join(rootDir, "public", "data");

const petsListPath = path.join(publicDataDir, "Pets.json");
const breedingPath = path.join(publicDataDir, "breeding.json");
const petsDetailDir = path.join(publicDataDir, "pets");
const handbookPath = path.join(publicDataDir, "tables", "PET_HANDBOOK.json");
const petBasePath = path.join(publicDataDir, "tables", "PETBASE_CONF.json");
const petClassisPath = path.join(
    publicDataDir,
    "tables",
    "PET_CLASSIS_CONF.json",
);

const variantMarkerPattern = /（[^）]+）|\([^)]*\)/u;

async function main() {
    const [pets, breedingSource, handbook, petBase, petClassis] = await Promise.all(
        [
            readJson(petsListPath),
            readJson(breedingPath),
            readJson(handbookPath),
            readJson(petBasePath),
            readJson(petClassisPath),
        ],
    );

    const breedingEntries = Array.isArray(breedingSource?.pet_egg_conf)
        ? breedingSource.pet_egg_conf.filter((entry) => {
              return entry && typeof entry === "object" && typeof entry.id === "number";
          })
        : [];

    const handbookByName = new Map();

    for (const entry of handbook) {
        const normalizedName = normalizeName(entry?.name);

        if (!normalizedName) {
            continue;
        }

        const existingEntries = handbookByName.get(normalizedName) ?? [];
        existingEntries.push(entry);
        handbookByName.set(normalizedName, existingEntries);
    }

    const petBaseByPictorialId = new Map();
    const petBaseByName = new Map();

    for (const entry of petBase) {
        if (typeof entry?.pictorial_book_id !== "number") {
            const normalizedName = normalizeName(entry?.name);

            if (normalizedName) {
                const existingByName = petBaseByName.get(normalizedName) ?? [];
                existingByName.push(entry);
                petBaseByName.set(normalizedName, existingByName);
            }

            continue;
        }

        const existingEntries = petBaseByPictorialId.get(entry.pictorial_book_id) ?? [];
        existingEntries.push(entry);
        petBaseByPictorialId.set(entry.pictorial_book_id, existingEntries);

        const normalizedName = normalizeName(entry?.name);

        if (!normalizedName) {
            continue;
        }

        const existingByName = petBaseByName.get(normalizedName) ?? [];
        existingByName.push(entry);
        petBaseByName.set(normalizedName, existingByName);
    }

    const classisById = new Map(
        petClassis
            .filter((entry) => typeof entry?.pet_classis === "number")
            .map((entry) => [entry.pet_classis, entry]),
    );

    const enrichedPets = pets.map((pet) => {
        const handbookEntry = pickHandbookEntry(
            handbookByName.get(normalizeName(pet?.localized?.zh?.name)) ?? [],
            pet,
        );
        const petBaseEntry = pickPetBaseEntry(
            petBaseByName.get(normalizeName(pet?.localized?.zh?.name)) ?? [],
            handbookEntry,
            pet,
            petBaseByPictorialId.get(handbookEntry?.id) ?? [],
        );
        const classisEntry =
            petBaseEntry && typeof petBaseEntry.pet_classis_id === "number"
                ? classisById.get(petBaseEntry.pet_classis_id) ?? null
                : null;
        const breedingCandidates = pickBreedingCandidates(
            breedingEntries,
            pet,
            handbookEntry,
            petBaseEntry,
        );
        const breedingEntry = breedingCandidates[0] ?? null;

        return {
            ...pet,
            world_profile: buildWorldProfile(handbookEntry, petBaseEntry, classisEntry),
            breeding: buildBreedingInfo(breedingEntry, petBaseEntry, breedingCandidates),
        };
    });

    await writeJson(petsListPath, enrichedPets);

    let updatedDetails = 0;

    for (const pet of enrichedPets) {
        const detailPath = path.join(petsDetailDir, `${pet.id}.json`);

        try {
            const detail = await readJson(detailPath);
            await writeJson(detailPath, {
                ...detail,
                world_profile: pet.world_profile,
                breeding: pet.breeding,
            });
            updatedDetails += 1;
        } catch (error) {
            if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
                continue;
            }

            throw error;
        }
    }

    console.log(
        `Synced ${enrichedPets.length} pets and ${updatedDetails} pet detail files with world_profile and breeding data.`,
    );
}

function pickHandbookEntry(candidates, pet) {
    if (Array.isArray(candidates) && candidates.length > 0) {
        return [...candidates].sort((left, right) => {
            return compareHandbookEntries(left, right, pet);
        })[0];
    }

    return null;
}

function pickPetBaseEntry(candidates, handbookEntry, pet, fallbackCandidates = []) {
    const mergedCandidates = mergeCandidates(candidates, fallbackCandidates);

    if (mergedCandidates.length === 0) {
        return null;
    }

    const displayNames = uniqueStrings([
        handbookEntry?.name,
        pet?.localized?.zh?.name,
        pet?.name,
    ]);

    return [...mergedCandidates].sort((left, right) => {
        return comparePetBaseEntries(left, right, displayNames, pet, handbookEntry);
    })[0];
}

function pickBreedingCandidates(entries, pet, handbookEntry, petBaseEntry) {
    if (!Array.isArray(entries) || entries.length === 0) {
        return [];
    }

    const displayNames = uniqueStrings([
        pet?.localized?.zh?.name,
        petBaseEntry?.name,
        handbookEntry?.name,
    ]);
    const petBaseIdPrefix =
        typeof petBaseEntry?.id === "number" ? String(petBaseEntry.id) : null;

    return entries
        .filter((entry) => {
            const hasNameMatch = displayNames.includes(entry.name);
            const hasIdPrefix =
                petBaseIdPrefix !== null && String(entry.id).startsWith(petBaseIdPrefix);

            return hasNameMatch || hasIdPrefix;
        })
        .sort((left, right) => {
            return (
                scoreBreedingEntry(right, displayNames, petBaseIdPrefix) -
                    scoreBreedingEntry(left, displayNames, petBaseIdPrefix) ||
                left.id - right.id
            );
        });
}

function scoreBreedingEntry(entry, displayNames, petBaseIdPrefix) {
    let score = 0;

    if (displayNames.includes(entry?.name)) {
        score += 4;
    }

    if (typeof entry?.name === "string" && !variantMarkerPattern.test(entry.name)) {
        score += 3;
    }

    if (petBaseIdPrefix !== null && String(entry?.id).startsWith(petBaseIdPrefix)) {
        score += 2;
    }

    if (typeof entry?.hatch_data === "number") {
        score += 1;
    }

    return score;
}

function buildWorldProfile(handbookEntry, petBaseEntry, classisEntry) {
    const profile = {
        type_desc: toStringOrNull(handbookEntry?.type_desc),
        description_habitat: toStringOrNull(handbookEntry?.description_habitat),
        introduction: toStringOrNull(petBaseEntry?.description),
        refresh_locations: splitLocations(petBaseEntry?.habit_1),
        movement_type: toStringOrNull(petBaseEntry?.move_type),
        classis_id: toNumberOrNull(petBaseEntry?.pet_classis_id),
        classis_name: toStringOrNull(classisEntry?.name),
        handbook_area_ids: Array.isArray(handbookEntry?.belong_area_handbook)
            ? handbookEntry.belong_area_handbook.filter((item) => typeof item === "number")
            : [],
    };

    return hasWorldProfileValue(profile) ? profile : null;
}

function buildBreedingInfo(breedingEntry, petBaseEntry, variants) {
    const normalizedVariants = Array.isArray(variants)
        ? variants.map((entry) => normalizeBreedingEntry(entry))
        : [];

    if (!breedingEntry && normalizedVariants.length === 0) {
        return null;
    }

    const normalizedEntry = breedingEntry
        ? normalizeBreedingEntry(breedingEntry)
        : createEmptyBreedingEntry();
    const breeding = {
        ...normalizedEntry,
        weight_low: normalizedEntry.weight_low ?? toNumberOrNull(petBaseEntry?.weight_low),
        weight_high: normalizedEntry.weight_high ?? toNumberOrNull(petBaseEntry?.weight_high),
        height_low: normalizedEntry.height_low ?? toNumberOrNull(petBaseEntry?.height_low),
        height_high: normalizedEntry.height_high ?? toNumberOrNull(petBaseEntry?.height_high),
        variants: normalizedVariants,
    };

    return hasBreedingValue(breeding) ? breeding : null;
}

function normalizeBreedingEntry(entry) {
    return {
        id: toNumberOrNull(entry?.id),
        pet_id: toNumberOrNull(entry?.pet_id),
        name: toStringOrNull(entry?.name),
        model_id: toNumberOrNull(entry?.model_id),
        hatch_data: toNumberOrNull(entry?.hatch_data),
        weight_low: toNumberOrNull(entry?.weight_low),
        weight_high: toNumberOrNull(entry?.weight_high),
        height_low: toNumberOrNull(entry?.height_low),
        height_high: toNumberOrNull(entry?.height_high),
        precious_egg_type: toNumberOrNull(entry?.precious_egg_type),
        egg_base_glass_prob_array: toNumberArrayOrNull(entry?.egg_base_glass_prob_array),
        egg_add_glass_prob_array: toNumberArrayOrNull(entry?.egg_add_glass_prob_array),
        is_contact_add_glass_prob: toBooleanOrNull(entry?.is_contact_add_glass_prob),
        is_contact_add_shining_prob: toBooleanOrNull(entry?.is_contact_add_shining_prob),
    };
}

function createEmptyBreedingEntry() {
    return {
        id: null,
        pet_id: null,
        name: null,
        model_id: null,
        hatch_data: null,
        weight_low: null,
        weight_high: null,
        height_low: null,
        height_high: null,
        precious_egg_type: null,
        egg_base_glass_prob_array: null,
        egg_add_glass_prob_array: null,
        is_contact_add_glass_prob: null,
        is_contact_add_shining_prob: null,
    };
}

function hasWorldProfileValue(profile) {
    return Boolean(
        profile.type_desc ||
            profile.description_habitat ||
            profile.introduction ||
            profile.refresh_locations.length ||
            profile.movement_type ||
            profile.classis_name ||
            profile.handbook_area_ids.length,
    );
}

function hasBreedingValue(breeding) {
    return Boolean(
        breeding.id ||
            breeding.pet_id ||
            breeding.name ||
            breeding.model_id ||
            breeding.hatch_data ||
            breeding.weight_low ||
            breeding.weight_high ||
            breeding.height_low ||
            breeding.height_high ||
            breeding.variants.length,
    );
}

function compareHandbookEntries(left, right, pet) {
    return (
        getHandbookNamePriority(right, pet) - getHandbookNamePriority(left, pet) ||
        left.id - right.id
    );
}

function getHandbookNamePriority(entry, pet) {
    const targetName = normalizeName(pet?.localized?.zh?.name);

    if (!targetName) {
        return 0;
    }

    return normalizeName(entry?.name) === targetName ? 1 : 0;
}

function comparePetBaseEntries(left, right, displayNames, pet, handbookEntry) {
    return (
        scorePetBase(right, displayNames, pet, handbookEntry) -
            scorePetBase(left, displayNames, pet, handbookEntry) ||
        getPetBaseStatDistance(left, pet) - getPetBaseStatDistance(right, pet) ||
        left.id - right.id
    );
}

function scorePetBase(entry, displayNames, pet, handbookEntry) {
    let score = 0;

    if (displayNames.includes(entry?.name)) {
        score += 100;
    }

    if (
        handbookEntry &&
        typeof handbookEntry.id === "number" &&
        entry?.pictorial_book_id === handbookEntry.id
    ) {
        score += 20;
    }

    const statDistance = getPetBaseStatDistance(entry, pet);

    if (statDistance === 0) {
        score += 10;
    } else if (statDistance <= 10) {
        score += 6;
    } else if (statDistance <= 30) {
        score += 3;
    }

    if (typeof entry?.description === "string" && entry.description.trim()) {
        score += 1;
    }

    if (typeof entry?.pet_classis_id === "number") {
        score += 1;
    }

    return score;
}

function getPetBaseStatDistance(entry, pet) {
    const statPairs = [
        [entry?.hp_max_race, pet?.base_hp],
        [entry?.phy_attack_race, pet?.base_phy_atk],
        [entry?.spe_attack_race, pet?.base_mag_atk],
        [entry?.phy_defence_race, pet?.base_phy_def],
        [entry?.spe_defence_race, pet?.base_mag_def],
        [entry?.speed_race, pet?.base_spd],
    ];

    let distance = 0;

    for (const [left, right] of statPairs) {
        if (typeof left !== "number" || typeof right !== "number") {
            return Number.MAX_SAFE_INTEGER;
        }

        distance += Math.abs(left - right);
    }

    return distance;
}

function mergeCandidates(...groups) {
    const merged = [];
    const seenIds = new Set();

    for (const group of groups) {
        if (!Array.isArray(group)) {
            continue;
        }

        for (const entry of group) {
            if (!entry || typeof entry.id !== "number" || seenIds.has(entry.id)) {
                continue;
            }

            seenIds.add(entry.id);
            merged.push(entry);
        }
    }

    return merged;
}

function uniqueStrings(values) {
    return [...new Set(values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))];
}

function normalizeName(value) {
    return typeof value === "string" && value.trim() ? value.trim() : "";
}

function splitLocations(value) {
    if (typeof value !== "string" || !value.trim()) {
        return [];
    }

    return value
        .split(/[、，,/]/u)
        .map((item) => item.trim())
        .filter(Boolean);
}

function toStringOrNull(value) {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toNumberOrNull(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toBooleanOrNull(value) {
    return typeof value === "boolean" ? value : null;
}

function toNumberArrayOrNull(value) {
    if (!Array.isArray(value)) {
        return null;
    }

    const numbers = value.filter((item) => typeof item === "number");
    return numbers.length ? numbers : null;
}

async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
    await fs.writeFile(filePath, `${JSON.stringify(value, null, 4)}\n`, "utf8");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});