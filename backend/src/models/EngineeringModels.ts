export interface Engine {
    idengine?: number;
    missile_id: number;
    missile_name?: string;
    type?: string;
    isp0?: number;
    tburn?: number;
    thrust?: number;
    mass_propelant?: number;
    thrust_profile_file_name?: string;
}

export interface Capability {
    idcapability?: number;
    missile_id: number;
    missile_name?: string;
    is_burning_debris: boolean;
    is_decoy: boolean;
    is_debris: boolean;
    acs_algorithm: boolean;
    is_lofted: boolean;
}

export interface Performance {
    perfIndex?: number;
    missile_id: number;
    missile_name?: string;
    rng: number;
    trajType?: string;
    launchAngle?: number;
    angleEndOfBurn?: number;
    timeEndOfBurn?: number;
    velEndOfBurn?: number;
    separationTime?: number;
    separationAlt?: number;
    separationVel?: number;
    apogeeAlt?: number;
    apogeeVel?: number;
    timeOfFlight?: number;
    hitVel?: number;
    hitAngle?: number;
    trajectoryRvPath?: string;
    trajectoryBtPath?: string;
}

export interface RCS {
    idrcs?: number;
    frequency?: number;
    rcs_type?: string;
    radars?: string;
    source?: string;
    perf_id?: number;
}

export interface MassMomentAndXCG {
    id?: number;
    missile_id: number;
    missile_name?: string;
    description?: string;
    launch_value?: number;
    eob_value?: number;
    sign?: string;
    unit?: string;
}

export interface ThreatImage {
    idimages?: number;
    missile_id: number;
    missile_name?: string;
    part_name: string;
    image_type?: string;
    image_path?: string;
    image_description?: string;
}

export interface LaunchAreaAssociation {
    idmissileLaunchAssociation?: number;
    missile_id: number;
    missile_name?: string;
    launch_area_id: number;
}
