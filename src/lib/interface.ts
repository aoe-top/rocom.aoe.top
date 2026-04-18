export interface ILocalizedTypeName {
    zh: string;
}

export interface ILocalizedPetsName {
    zh: {
        name: string;
    };
}

export interface ILocalizedPetsText {
    zh: {
        name: string;
        description: string;
    };
}

export interface IPetsType {
    id: number;
    name: string;
    localized: ILocalizedTypeName;
}

export interface IPetsSpecies {
    id: number;
    name: string;
    localized: ILocalizedTypeName;
}

export interface IPetsTrait {
    id: number;
    name: string;
    description: string;
    localized: ILocalizedPetsText;
}

export interface IPetsMove {
    id: number;
    name: string;
    move_type: IPetsType;
    localized: ILocalizedPetsText;
    move_category: string;
    energy_cost: number;
    power: number | null;
    description: string;
}

export interface IPersonality {
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

export interface IPetBloodlineMoveSummary {
    type_id: number;
    type_name: string;
    type_label: string;
    move_id: number;
    move_name: string;
    move_category: string;
    energy_cost: number;
    power: number | null;
}

export interface IPetBloodlineIndexEntry {
    pet_id: number;
    pet_name: string;
    form: string;
    implemented: boolean;
    main_type_id: number;
    sub_type_id: number | null;
    default_legacy_type_id: number;
    preferred_attack_style: string;
    bloodline_moves: IPetBloodlineMoveSummary[];
}

export interface IPetsBreedingVariant {
    id: number | null;
    pet_id: number | null;
    name: string | null;
    model_id: number | null;
    hatch_data: number | null;
    weight_low: number | null;
    weight_high: number | null;
    height_low: number | null;
    height_high: number | null;
    precious_egg_type?: number | null;
    egg_base_glass_prob_array?: number[] | null;
    egg_add_glass_prob_array?: number[] | null;
    is_contact_add_glass_prob?: boolean | null;
    is_contact_add_shining_prob?: boolean | null;
}

export interface IPetsBreedingInfo extends IPetsBreedingVariant {
    variants: IPetsBreedingVariant[];
}

export interface IPetsBreedingProfile {
    pet_base_id: number | null;
    egg_groups: number[];
    proportion_male: number | null;
    male_rate: number | null;
    female_rate: number | null;
}

export interface IPetsWorldProfile {
    type_desc: string | null;
    description_habitat: string | null;
    introduction: string | null;
    refresh_locations: string[];
    movement_type: string | null;
    classis_id: number | null;
    classis_name: string | null;
    handbook_area_ids: number[];
}

export interface IPetsLegacyMove {
    monster_id: number;
    type_id: number;
    move_id: number;
}

export interface IPetsEvolutionNode {
    id: number;
    name: string;
    form: string;
    localized: ILocalizedPetsName;
    is_leader_form: boolean;
    main_type: IPetsType;
    sub_type: IPetsType | null;
    evolution_conditions: string[];
}

export interface IPetsEvolutionStage {
    depth: number;
    is_leader_stage?: boolean;
    monsters: IPetsEvolutionNode[];
}

export interface IPetsEvolutionTree {
    stages: IPetsEvolutionStage[];
    max_depth: number;
    total_unique_monsters: number;
    species_id: number;
    current_monster_id: number;
}

export interface IPets {
    id: number;
    name: string;
    form: string;
    main_type: IPetsType;
    sub_type: IPetsType | null;
    default_legacy_type: IPetsType;
    leader_potential: boolean;
    is_leader_form: boolean;
    preferred_attack_style: string;
    localized: ILocalizedPetsName;
    implemented: boolean;
    base_hp: number;
    base_phy_atk: number;
    base_mag_atk: number;
    base_phy_def: number;
    base_mag_def: number;
    base_spd: number;
    evolves_from_id: number | null;
    world_profile?: IPetsWorldProfile | null;
    breeding?: IPetsBreedingInfo | null;
    breeding_profile?: IPetsBreedingProfile | null;
}

export interface IPetsDetail extends IPets {
    species: IPetsSpecies;
    trait: IPetsTrait | null;
    move_pool: IPetsMove[];
    move_stones: IPetsMove[];
    legacy_moves: IPetsLegacyMove[];
    evolution_tree: IPetsEvolutionTree;
}

export interface IMonsterTypeDetail {
    id: number;
    name: string;
    localized: ILocalizedTypeName;
    vulnerable_to: string[];
    resistant_to: string[];
}
