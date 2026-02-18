import { ThreatData } from '../App';

const THREAT_PALETTE = [
    '#03879E', // Teal (Brand)
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#10B981', // Emerald
    '#6366F1', // Indigo
    '#F43F5E', // Rose
    '#3B82F6', // Blue
    '#84cc16', // Lime
    '#f97316'  // Orange
];

const getDynamicColor = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % THREAT_PALETTE.length;
    return THREAT_PALETTE[index];
};

export const mapBackendToFrontend = (missile: any, weightAndSize: any[], aerodynamics: any[], performance: any[] = [], engines: any[] = []): ThreatData => {
    const getVal = (genNames: string | string[]) => {
        const names = Array.isArray(genNames) ? genNames : [genNames];
        const item = weightAndSize.find(w => names.includes(w.generic_name));
        return item ? item.property_value : undefined;
    };

    const getValBySubject = (subject: string, desc: string) => {
        const item = weightAndSize.find(w => w.subject === subject && w.description === desc);
        return item ? item.property_value : undefined;
    };

    // Find max range and speed from performance data
    const maxRng = performance.length > 0 ? Math.max(...performance.map(p => p.rng || 0)) : 0;
    const maxVel = performance.length > 0 ? Math.max(...performance.map(p => p.velEndOfBurn || 0)) : 0;
    const maxAlt = performance.length > 0 ? Math.max(...performance.map(p => p.apogeeAlt || 0)) : 0;

    const missileName = missile.name || 'Unknown Threat';

    return {
        id: missile.id.toString(),
        name: missileName,
        range: getVal('maxRange') ? `${getVal('maxRange')} km` : (maxRng > 0 ? `${maxRng} km` : 'Unknown'),
        minRange: parseFloat(getVal('minRange') || '0'),
        maxRange: parseFloat(getVal('maxRange') || maxRng.toString() || '0'),
        operationalRange: parseFloat(getVal('operationalRange') || getVal('maxRange') || maxRng.toString() || '0'),
        speed: performance?.[0]?.velEndOfBurn ? `${performance[0].velEndOfBurn} m/s` : (maxVel > 0 ? `${maxVel} m/s` : 'Unknown'),
        weight: (getVal('weight') || getVal('launchWeight')) ? `${getVal('weight') || getVal('launchWeight')} kg` : 'Unknown',
        countries: missile.family_type || 'Unknown',
        manufacturer: missile.manufacturer || getVal('manufacturer') || 'Unknown',
        warhead: missile.explosive_type || 'Unknown',
        color: missile.color || getVal('color') || getDynamicColor(missileName),
        missile: missile.type || 'Ballistic',
        status: missile.status || getVal('status') || 'Operational',
        year: missile.year ? missile.year : parseInt(getVal('year') || new Date().getFullYear().toString()),
        description: missile.description || '',
        rvDesignName: missile.content_rv_file_name || '',

        // Tech View
        length: getVal(['totalLength', 'length']),
        diameter: getVal(['d', 'diameter']),
        launchWeight: getVal(['launchWeight', 'weight', 'launch_weight']),
        payloadWeight: getVal(['wh_weight', 'payload_weight']),

        // Performance
        maxAltitude: maxAlt > 0 ? maxAlt.toString() : undefined,
        burnTime: engines?.[0]?.tburn?.toString(),
        thrust: engines?.[0]?.thrust?.toString(),

        // Flight Logic (EAV)
        flightProfile: getValBySubject('logic', 'Flight Path Mode'),

        // Heat Transfer (EAV)
        maxTemp: getValBySubject('thermal', 'Max Temperature'),

        // Advanced
        aerodynamics: aerodynamics,
    };
};

export const mapFrontendToBackend = (threat: ThreatData): {
    missile: any,
    weightAndSize: any[],
    aerodynamics?: any[],
    engine?: any,
    performance?: any[]
} => {
    const missile = {
        id: parseInt(threat.id) || undefined,
        name: threat.name,
        type: threat.missile,
        num_of_stages: threat.stages ? parseInt(threat.stages) : 1,
        family_type: threat.countries,
        explosive_type: threat.warhead,
        flight_logic_file_name: threat.flightProfile,
        description: threat.description,
        status: threat.status,
        year: threat.year,
        manufacturer: threat.manufacturer,
        color: threat.color,
        content_rv_file_name: threat.rvDesignName
    };

    const weightAndSize: any[] = [];
    const addWS = (genName: string, desc: string, val: any, unit: string = '', subject: string = 'general') => {
        if (val !== undefined && val !== null && val !== 'Unknown') {
            weightAndSize.push({
                description: desc,
                generic_name: genName,
                property_value: val.toString(),
                unit: unit,
                subject: subject
            });
        }
    };

    addWS('totalLength', 'אורך כללי', threat.length, 'mm');
    addWS('d', 'קוטר(יחוס)', threat.diameter, 'mm');
    addWS('launchWeight', 'משקל בהמראה', threat.launchWeight, 'kg');
    addWS('wh_weight', 'משקל רש"ק', threat.warhead, 'kg');
    addWS('maxRange', 'טווח מקסימום', threat.maxRange, 'km');
    addWS('minRange', 'טווח מינימום', threat.minRange, 'km');

    // Logic/Thermal EAV mappings
    if (threat.flightProfile) addWS(undefined as any, 'Flight Path Mode', threat.flightProfile, '', 'logic');
    if (threat.maxTemp) addWS(undefined as any, 'Max Temperature', threat.maxTemp, 'C', 'thermal');

    const aerodynamics = threat.aerodynamics?.parts?.map((part: any) => ({
        part_name: part.name,
        aero_cx0_on: JSON.stringify(part.cx0_on),
        aero_cx0_off: JSON.stringify(part.cx0_off),
        aero_cna: JSON.stringify(part.cna),
        aero_xcp: JSON.stringify(part.xcp)
    }));

    return {
        missile,
        weightAndSize,
        aerodynamics,
        engine: threat.thrust ? {
            tburn: threat.burnTime ? parseFloat(threat.burnTime) : 0,
            thrust: threat.thrust ? parseFloat(threat.thrust) : 0
        } : undefined
    };
};
