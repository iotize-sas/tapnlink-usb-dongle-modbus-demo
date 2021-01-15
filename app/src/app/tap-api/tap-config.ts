import {
  PipeConverter,
  ByteSwapConverter,
  ArrayConverter,
  NumberConverter,
  StringConverter,
  FloatConverter,
  BooleanConverter
} from "@iotize/tap/client/impl";
import { TapDataManagerConfig } from "@iotize/tap/data";
import { ModbusSlaveDemoDataApi } from "./definitions";

export const dataManagerConfig: TapDataManagerConfig<ModbusSlaveDemoDataApi.Data> = {
  bundles: {
    memory: {
      id: 1, // Memory
      variables: {
        freeMemoryMB: {
          id: 2,
          converter: NumberConverter.uint16()
        },

        totalMemoryMB: {
          id: 4,
          converter: NumberConverter.uint16()
        },

        freeMemoryPercentage: {
          id: 9,
          converter: NumberConverter.uint16()
        }
      }
    },

    cPUs: {
      id: 2, // CPUs
      variables: {
        cpuCount: {
          id: 6,
          converter: NumberConverter.uint16()
        },

        cpuUsagePercentage: {
          id: 11,
          converter: NumberConverter.uint16()
        }
      }
    },

    control: {
      id: 3, // Control
      variables: {
        screenBrightness: {
          id: 13,
          converter: NumberConverter.uint16()
        }
      }
    }
  }
};
