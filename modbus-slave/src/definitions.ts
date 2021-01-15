
/**
 * Must be the same Modbus address configured in IoTize Studio
 */
export enum HoldingRegister {
    // Hardware usage
    FREE_MEMORY_MB = 2,
    TOTAL_MEMORY_MB = 4,
    FREE_MEMORY_PERCENTAGE = 9,

    // CPU
    CPU_COUNT = 6,
    CPU_USAGE_PERCENTAGE = 11,

    // Screen
    SCREEN_BRIGHTNESS = 0x100
}