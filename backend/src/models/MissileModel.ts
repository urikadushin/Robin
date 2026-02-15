export interface Missile {
    id?: number;
    name: string;
    type?: string;
    num_of_stages?: number;
    family_type?: string;
    explosive_type?: string;
    executive_summary_file_name?: string;
    content_rv_file_name?: string;
    content_bt_file_name?: string;
    flight_logic_file_name?: string;
    description?: string;
    status?: string;
    year?: number;
    manufacturer?: string;
    color?: string;
    // Capabilities
    mirv?: boolean;
    maneuverable?: boolean;
    decoys?: boolean;
    nuclear_capable?: boolean;
    hypersonic?: boolean;
    terminal_maneuver?: boolean;
    slv_capable?: boolean;
}
