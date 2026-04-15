import { formatEggGroupSummary } from "@/lib/eggGroups";
import type { IPets } from "@/lib/interface";

export type PetImplementationFilter = "all" | "implemented" | "unimplemented";

type PetImplementationSource = Pick<IPets, "implemented" | "breeding_profile">;

export const PET_IMPLEMENTATION_OPTIONS = [
    { label: "全部状态", value: "all" },
    { label: "已实装", value: "implemented" },
    { label: "未实装", value: "unimplemented" },
] as const satisfies ReadonlyArray<{
    label: string;
    value: PetImplementationFilter;
}>;

export function getPetEggGroupIds(pet: PetImplementationSource) {
    return [...(pet.breeding_profile?.egg_groups ?? [])].sort(
        (left, right) => left - right,
    );
}

export function isPetImplemented(pet: PetImplementationSource) {
    if (typeof pet.implemented === "boolean") {
        return pet.implemented;
    }

    return getPetEggGroupIds(pet).length > 0;
}

export function getPetImplementationStatus(
    pet: PetImplementationSource,
): Exclude<PetImplementationFilter, "all"> {
    return isPetImplemented(pet) ? "implemented" : "unimplemented";
}

export function getPetImplementationLabel(pet: PetImplementationSource) {
    return isPetImplemented(pet) ? "已实装" : "未实装";
}

export function matchesPetImplementationFilter(
    pet: PetImplementationSource,
    filter: PetImplementationFilter,
) {
    return filter === "all" || getPetImplementationStatus(pet) === filter;
}

export function formatPetEggGroupSummary(
    pet: PetImplementationSource,
    emptyLabel = "暂无蛋组数据",
) {
    return formatEggGroupSummary(getPetEggGroupIds(pet), emptyLabel);
}
