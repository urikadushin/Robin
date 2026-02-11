import { ThreatData } from '../App';

export const mapBackendToFrontend = (missile: any, weightAndSize: any[], aerodynamics: any[], performance: any[] = [], engines: any[] = []): ThreatData => {
    const getVal = (genName: string) => {
        const item = weightAndSize.find(w => w.generic_name === genName);
        return item ? item.property_value : undefined;
    };

    const getValBySubject = (subject: string, desc: string) => {
        const item = weightAndSize.find(w => w.subject === subject && w.description === desc);
        return item ? item.property_value : undefined;
    };

    return {
        id: missile.id.toString(),
        name: missile.name,
        range: getVal('maxRange') ? `${getVal('maxRange')} km` : 'Unknown',
        minRange: parseFloat(getVal('minRange') || '0'),
        maxRange: parseFloat(getVal('maxRange') || '0'),
        operationalRange: parseFloat(getVal('operationalRange') || getVal('maxRange') || '0'),
        speed: getVal('speed') || 'Unknown',
        weight: getVal('weight') ? `${getVal('weight')} kg` : 'Unknown',
        countries: missile.family_type || 'Unknown',
        manufacturer: getVal('manufacturer') || 'Unknown',
        warhead: missile.explosive_type || 'Unknown',
        color: getVal('color') || '#ff6b6b',
        missile: missile.type || 'Ballistic',
        status: getVal('status') || 'Operational',
        year: parseInt(getVal('year') || new Date().getFullYear().toString()),

        // Tech View
        length: getVal('totalLength'),
        diameter: getVal('d'),
        launchWeight: getVal('weight') || getVal('launchWeight'),
        payloadWeight: getVal('wh_weight'),

        // Performance
        maxAltitude: performance?.[0]?.apogeeAlt?.toString(),
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
        flight_logic_file_name: threat.flightProfile
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
