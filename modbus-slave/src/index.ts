import { cpus } from 'os';
import * as SerialPort from 'serialport';

import { HoldingRegister } from './definitions';
import { debug } from './lib/debug';
import { ModbusSlave } from './lib/modbus/modbus-slave';
import { SerialController } from './lib/serial/serial-controller';

const brightness = require('brightness');
const osu = require('node-os-utils');

const { cpu, mem } = osu;

let refreshInterval: NodeJS.Timeout | undefined;
let slave: ModbusSlave | undefined;
let serialController: SerialController | undefined;

async function start() {
    const availablePorts = await SerialController.listSerialPort();

    if (availablePorts.length === 0) {
        throw new Error(`No serial port available. Make sur USB is properly connected to the PC`);
    }

    // You must use same serial settings configured with IoTize Studio
    const openOptions: SerialPort.OpenOptions = {
        baudRate: 9600,
        parity: 'none',
        stopBits: 1,
        dataBits: 8
    };

    const argvPort = process.argv.length >= 3 ? process.argv[2] : undefined;

    let comPortPath: string;
    if (argvPort || availablePorts.length > 1) {
        if (!argvPort){
            throw new Error(`Multiple serial port available: ${availablePorts.map(p => p.path).join(', ')}. Add argument for serial port.`);
        }
        const selectedPort = availablePorts.find(p => p.path === argvPort);
        if (!selectedPort) {
            throw new Error(`Serial port "${argvPort}" does not exist`);
        }
        comPortPath = selectedPort.path;
    }
    else {
        comPortPath = availablePorts[0].path;
    }

    serialController = SerialController.create(comPortPath, openOptions);

    const CPUS = cpus();
    const cpuCount = CPUS.length;

    slave = new ModbusSlave(serialController, {
        holdingRegisters: {
            // CPU
            [HoldingRegister.CPU_COUNT]: cpuCount,
            [HoldingRegister.CPU_USAGE_PERCENTAGE]: 0,

            // Memory
            [HoldingRegister.FREE_MEMORY_MB]: 0,
            [HoldingRegister.FREE_MEMORY_PERCENTAGE]: 0,
            [HoldingRegister.TOTAL_MEMORY_MB]: 0,

            // Control
            [HoldingRegister.SCREEN_BRIGHTNESS]: 0
        },
        onWriteRegister: async (pdu) => {
            switch (pdu.address) {
                case HoldingRegister.SCREEN_BRIGHTNESS:
                    const brightnessToSet = Buffer.from(pdu.value).readUInt16BE() / 100;
                    if (brightnessToSet >= 0 && brightnessToSet <= 1) {
                        await brightness.set(brightnessToSet)
                            .then(() => {
                                debug(`Changed brightness to ${brightnessToSet * 100}%`);
                            })
                            .catch((err: Error) => {
                                console.error(`Cannot changed screen brightness to ${brightnessToSet * 100}%. ${err}`);
                            });
                    }
                    break;
            }
        }
    });

    const currentBrightness = await brightness.get();
    slave.registers.holdingRegisters[HoldingRegister.SCREEN_BRIGHTNESS] = currentBrightness * 100;

    // Create an interval function to update modbus registers periodically
    refreshInterval = setInterval(async () => {
        try {

            await Promise.all([
                cpu.usage()
                    .then((usage: number) => {
                        if (slave) {
                            slave.registers.holdingRegisters[HoldingRegister.CPU_USAGE_PERCENTAGE] = Math.round(usage);
                        }
                    })
                    .catch((err: Error) => {
                        console.error(`Cannot read CPU usage. ${err}`);
                    }),
                await mem.info()
                    .then((info: {
                        totalMemMb: number;
                        usedMemMb: number;
                        freeMemMb: number;
                        freeMemPercentage: number;
                    }) => {
                        if (slave) {
                            slave.registers.holdingRegisters[HoldingRegister.TOTAL_MEMORY_MB] = Math.round(info.totalMemMb);
                            slave.registers.holdingRegisters[HoldingRegister.FREE_MEMORY_MB] = Math.round(info.freeMemMb);
                            slave.registers.holdingRegisters[HoldingRegister.FREE_MEMORY_PERCENTAGE] = Math.round(info.freeMemPercentage);
                        }
                    })
                    .catch((err: Error) => {
                        console.error(`Cannot get memory info. ${err}`);
                    })
            ]);

            debug('New registers', slave?.registers.holdingRegisters);
        }
        catch (err) {
            console.warn(`cannot refresh info`, err);
        }
    }, 1000);


    console.log(`Modbus slave started. Listening to serial port ${comPortPath}`);
    return slave.listen();
}

function tearDown() {
    if (refreshInterval !== undefined) {
        clearInterval(refreshInterval);
    }
    if (slave) {
        slave.stop();
    }
    if (serialController){
        serialController.close();
    }
}

start()
    .then(() => {
        console.info('Thank you, bye!');
    })
    .catch(err => {
        console.error('An error occurred: ', err);
        tearDown();
        process.exit(1);
    });

process.on('SIGINT', function () {
    tearDown();
});

