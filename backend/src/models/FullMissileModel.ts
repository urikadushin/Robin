import { Missile } from './MissileModel';
import { Aerodynamic } from './AerodynamicModel';
import { WeightAndSize } from './WeightAndSizeModel';
import { Engine, Capability, Performance, RCS, MassMomentAndXCG, ThreatImage, LaunchAreaAssociation } from './EngineeringModels';

export interface FullMissileData {
    missile: Missile;
    aerodynamics?: Aerodynamic[];
    weightAndSize?: WeightAndSize[];
    engine?: Engine;
    capability?: Capability;
    performance?: Performance[];
    rcs?: RCS[];
    massProperties?: MassMomentAndXCG[];
    images?: ThreatImage[];
    launchAreaAssociations?: LaunchAreaAssociation[];
}
