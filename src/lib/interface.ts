export interface ILocalizedTypeName {
    zh: string;
}

export interface ILocalizedFriendName {
    zh: {
        name: string;
    };
}

export interface ILocalizedFriendText {
    zh: {
        name: string;
        description: string;
    };
}

export interface IFriendType {
    id: number;
    name: string;
    localized: ILocalizedTypeName;
}

export interface IFriendSpecies {
    id: number;
    name: string;
    localized: ILocalizedTypeName;
}

export interface IFriendTrait {
    id: number;
    name: string;
    description: string;
    localized: ILocalizedFriendText;
}

export interface IFriendMove {
    id: number;
    name: string;
    move_type: IFriendType;
    localized: ILocalizedFriendText;
    move_category: string;
    energy_cost: number;
    power: number | null;
    description: string;
}

export interface IFriendLegacyMove {
    monster_id: number;
    type_id: number;
    move_id: number;
}

export interface IFriendEvolutionNode {
    id: number;
    name: string;
    form: string;
    localized: ILocalizedFriendName;
    is_leader_form: boolean;
    main_type: IFriendType;
    sub_type: IFriendType | null;
}

export interface IFriendEvolutionStage {
    depth: number;
    is_leader_stage?: boolean;
    monsters: IFriendEvolutionNode[];
}

export interface IFriendEvolutionTree {
    stages: IFriendEvolutionStage[];
    max_depth: number;
    total_unique_monsters: number;
    species_id: number;
    current_monster_id: number;
}

export interface IFriend {
    id: number;
    name: string;
    form: string;
    main_type: IFriendType;
    sub_type: IFriendType | null;
    default_legacy_type: IFriendType;
    leader_potential: boolean;
    is_leader_form: boolean;
    preferred_attack_style: string;
    localized: ILocalizedFriendName;
    base_hp: number;
    base_phy_atk: number;
    base_mag_atk: number;
    base_phy_def: number;
    base_mag_def: number;
    base_spd: number;
    evolves_from_id: number | null;
}

export interface IFriendDetail extends IFriend {
    species: IFriendSpecies;
    trait: IFriendTrait | null;
    move_pool: IFriendMove[];
    move_stones: IFriendMove[];
    legacy_moves: IFriendLegacyMove[];
    evolution_tree: IFriendEvolutionTree;
}

export interface IMonsterTypeDetail {
    id: number;
    name: string;
    localized: ILocalizedTypeName;
    vulnerable_to: string[];
    resistant_to: string[];
}
