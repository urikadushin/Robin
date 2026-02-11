import { ThreatData } from '../App';

export const mapBackendToFrontend = (missile: any, weightAndSize: any[], aerodynamics: any[]): ThreatData => {
    const getVal = (genName: string) => {
        const item = weightAndSize.find(w => w.generic_name === genName);
        return item ? item.property_value : undefined;
    };

    // Helper for description matching if generic_name matches are insufficient
    const getValByDesc = (desc: string) => {
        const item = weightAndSize.find(w => w.description === desc);
        return item ? item.property_value : undefined;
    };

    return {
        id: missile.id.toString(),
        name: missile.name,
        range: getVal('range') ? `${getVal('range')} km` : 'Unknown',
        minRange: 0,
        maxRange: parseFloat(getVal('range') || '0'),
        operationalRange: parseFloat(getVal('range') || '0'),
        speed: getVal('speed') || 'Unknown',
        weight: getVal('weight') ? `${getVal('weight')} kg` : 'Unknown',
        countries: getVal('country') || 'Unknown',
        manufacturer: getVal('manufacturer') || 'Unknown',
        warhead: getVal('warhead') ? `${getVal('warhead')} kg` : 'Unknown',
        color: getVal('color') || '#ff6b6b',
        missile: missile.type || 'Ballistic',
        status: getVal('status') || 'Operational',
        year: parseInt(getVal('year') || new Date().getFullYear().toString()),

        // Tech View
        length: getVal('totalLength'),
        diameter: getVal('d'),
        launchWeight: getVal('weight') || getVal('launchWeight'),

        // Advanced
        aerodynamics: aerodynamics,
    };
};

export const mapFrontendToBackend = (threat: ThreatData): { missile: any, weightAndSize: any[] } => {
    const missile = {
        id: parseInt(threat.id) || undefined,
        name: threat.name,
        type: threat.missile,
        // family_type, explosive_type... map if present in ThreatData
    };

    const weightAndSize: any[] = [];
    const addWS = (genName: string, desc: string, val: string | number | undefined, unit: string = '', sign: string = '') => {
        if (val !== undefined && val !== 'Unknown') {
            weightAndSize.push({
                missile_id: parseInt(threat.id),
                missile_name: threat.name,
                description: desc,
                generic_name: genName,
                property_value: val.toString(),
                sign: sign,
                unit: unit,
                subject: 'general' // Default subject
            });
        }
    };

    addWS('totalLength', 'אורך כללי', threat.length, 'mm');
    addWS('d', 'קוטר(יחוס)', threat.diameter, 'mm');
    addWS('launchWeight', 'משקל בהמראה', threat.launchWeight, 'kg');
    addWS('wh_weight', 'משקל רש"ק', threat.warhead, 'kg');
    // Map maxRange to 'טווח מקסימום'
    addWS('maxRange', 'טווח מקסימום', threat.maxRange, 'km');

    return { missile, weightAndSize };
};
