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
    base_hp: number;
    base_phy_atk: number;
    base_mag_atk: number;
    base_phy_def: number;
    base_mag_def: number;
    base_spd: number;
    evolves_from_id: number | null;
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
