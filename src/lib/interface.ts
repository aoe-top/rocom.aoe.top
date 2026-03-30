export interface IFriend {
    id: number;
    name: string;
    form: string;
    main_type: {
        id: number;
        name: string;
        localized: {
            zh: string;
        };
    };
    sub_type: any;
    default_legacy_type: {
        id: number;
        name: string;
        localized: {
            zh: string;
        };
    };
    leader_potential: boolean;
    is_leader_form: boolean;
    preferred_attack_style: string;
    localized: {
        zh: {
            name: string;
        };
    };
    base_hp: number;
    base_phy_atk: number;
    base_mag_atk: number;
    base_phy_def: number;
    base_mag_def: number;
    base_spd: number;
    evolves_from_id: any;
}
