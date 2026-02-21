// Type definitions for ESRI modules

declare module 'esri/Map' {
  export default class Map {
    constructor(params: {
      basemap?: string | object;
      layers?: any[];
      [key: string]: any;
    });
    add(layer: any, index?: number): void;
    remove(layer: any): void;
    destroy(): void;
  }
}

declare module 'esri/views/MapView' {
  import Map from 'esri/Map';

  export default class MapView {
    constructor(params: {
      container: HTMLElement | string;
      map?: Map;
      center?: [number, number] | { x: number; y: number };
      zoom?: number;
      [key: string]: any;
    });
    container: HTMLElement;
    map: Map;
    center: { x: number; y: number };
    zoom: number;
    destroy(): void;
    when(callback?: () => void): Promise<void>;
  }
}

declare module 'esri/views/SceneView' {
  import Map from 'esri/Map';

  export default class SceneView {
    constructor(params: {
      container: HTMLElement | string;
      map?: Map;
      center?: [number, number] | { x: number; y: number };
      zoom?: number;
      camera?: any;
      [key: string]: any;
    });
    container: HTMLElement;
    map: Map;
    destroy(): void;
    when(callback?: () => void): Promise<void>;
  }
}

declare module 'esri/layers/TileLayer' {
  export default class TileLayer {
    constructor(params: {
      url: string;
      id?: string;
      opacity?: number;
      visible?: boolean;
      [key: string]: any;
    });
    id: string;
    opacity: number;
    visible: boolean;
  }
}

// Declare the loadModules function
declare module 'esri-loader' {
  export function loadModules(
    modules: string[],
    options?: {
      css?: boolean | string;
      url?: string;
      dojoConfig?: { [key: string]: any };
    }
  ): Promise<any[]>;
}
