export namespace ModbusSlaveDemoDataApi {
  export namespace Bundle {
    /**
     * Bundle id: 1
     */
    export interface Memory {
      /**
       * Variable id: 2
       */
      freeMemoryMB: number;

      /**
       * Variable id: 4
       */
      totalMemoryMB: number;

      /**
       * Variable id: 9
       */
      freeMemoryPercentage: number;
    }

    /**
     * Bundle id: 2
     */
    export interface CPUs {
      /**
       * Variable id: 6
       */
      cpuCount: number;

      /**
       * Variable id: 11
       */
      cpuUsagePercentage: number;
    }

    /**
     * Bundle id: 3
     */
    export interface Control {
      /**
       * Variable id: 13
       */
      screenBrightness: number;
    }
  }

  export interface Data {
    memory: Bundle.Memory;

    cPUs: Bundle.CPUs;

    control: Bundle.Control;
  }
}
