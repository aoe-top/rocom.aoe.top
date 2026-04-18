import type {
    IPetBloodlineIndexEntry,
    IPetBloodlineMoveSummary,
} from "@/lib/interface";

export function normalizeBloodlineKeyword(value: string) {
    return value.trim().toLowerCase();
}

export function getMatchedBloodlineMoves(
    entry: IPetBloodlineIndexEntry,
    keyword: string,
) {
    const normalizedKeyword = normalizeBloodlineKeyword(keyword);

    if (!normalizedKeyword) {
        return [] as IPetBloodlineMoveSummary[];
    }

    return entry.bloodline_moves.filter((move) => {
        return [move.move_name, move.type_label, String(move.move_id)].some(
            (field) => field.toLowerCase().includes(normalizedKeyword),
        );
    });
}

export function matchesBloodlineKeyword(
    entry: IPetBloodlineIndexEntry,
    keyword: string,
) {
    return getMatchedBloodlineMoves(entry, keyword).length > 0;
}

export function formatBloodlineMatchSummary(
    moves: IPetBloodlineMoveSummary[],
    limit = 3,
) {
    return moves
        .slice(0, limit)
        .map((move) => `${move.move_name} · ${move.type_label}`)
        .join(" / ");
}
