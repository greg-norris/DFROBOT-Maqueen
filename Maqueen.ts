let alreadyInit = 0
let strip = light.createNeoPixelStrip(pins.P15, 4)
const MOTER_ADDRESSS = 0x10

enum PingUnit {
    //% block="cm"
    Centimeters,
    //% block="μs"
    MicroSeconds
}

//% weight=100 color=#008B00 icon="\uf136" block="Maqueen"
//% groups="['Motors', 'Distance Sensor', 'Line Reader','Headlights and Underlights']"
namespace Maqueen {

    export class Packeta {
        public mye: string;
        public myparam: number;
    }

    export enum Motors {
        //% blockId="LeftMotor" block="LeftMotor"
        LeftMotor = 0,
        //% blockId="RightMotor" block="RightMotor"
        RightMotor = 1
    }

    export enum Servos {
        //% blockId="S1" block="S1"
        S1 = 0,
        //% blockId="S2" block="S2"
        S2 = 1
    }
    export enum LEDStrip {
        //% blockId="RBG0" block="RGB0"
        RGB0 = 0,
        //% blockId="RBG1" block="RGB1"
        RGB1 = 1,
        //% blockId="RBG2" block="RGB2"
        RGB2 = 2,
        //% blockId="RBG3" block="RGB3"
        RGB3 = 3,
    }
    export enum Direction {
        //% blockId="forwards" block="forwards"
        forwards = 0x0,
        //% blockId="backwards" block="backwards"
        backwards = 0x1
    }

    export enum Linesensor {
        //% blockId="Left line reader" block="Left line reader"
        Left = 13,
        //% blockId="Right line reader" block="Right line reader"
        Right = 14
    }

    export enum LED {
        //% blockId="Headlight Left" block="Headlight Left"
        HeadlightLeft = 8,
        //% blockId="Headlight Right" block="Headlight Right"
        HeadlightRight = 12
    }

    export enum LEDswitch {
        //% blockId="ON" block="ON"
        ON = 0x01,
        //% blockId="OFF" block="OFF"
        OFF = 0x00
    }


    //% advanced=true shim=maqueenIR::getParam
    function getParam(): number {
        return 0
    }

    function maqueenInit(): void {
        if (alreadyInit == 1) {
            return
        }
        //initIR(Pins.P16)
        alreadyInit = 1
    }


    //% block
    //% group="Motors"
    //% weight=50
    //% blockId=motor_MotorRun block="Set|%index|to|%Direction|at the speed|%speed"
    //% speed.min=0 speed.max=100
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% Directionection.fieldEditor="gridpicker" Directionection.fieldOptions.columns=2
    export function MotorRun(index: Motors, Directionection: Direction, speed: number): void {
        let buf = pins.createBuffer(3);
        if (index == 0) {
            buf[0] = 0x00;
        }
        if (index == 1) {
            buf[0] = 0x02;
        }
        speed = speed * 2.55
        buf[1] = Directionection;
        buf[2] = speed;
        pins.i2cWriteBuffer(0x10, buf);
    }


    //% block
    //% group="Motors"
    //% weight=50
    //% blockId=motor_motorStop block="Stop|%motors"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2 
    export function motorStop(motors: Motors): void {
        let buf = pins.createBuffer(3);
        if (motors == 0) {
            buf[0] = 0x00;
        }
        if (motors == 1) {
            buf[0] = 0x02;
        }
        buf[1] = 0;
        buf[2] = 0;
        pins.i2cWriteBuffer(0x10, buf);
    }
    //% block
    //% group="Motors"
    //% weight=50
    //% blockId=motor_motorStopAll block="Motor Stop All"
    export function motorStopAll(): void {
        let buf = pins.createBuffer(3);
        buf[0] = 0x00;
        buf[1] = 0;
        buf[2] = 0;
        pins.i2cWriteBuffer(0x10, buf);
        buf[0] = 0x02;
        pins.i2cWriteBuffer(0x10, buf);
    }

    //% group="Distance Sensor"
    //% blockId=ultrasonic_sensor block="read distance sensor unit in |%unit"
    //% weight=20
    export function sensor(unit: PingUnit, maxCmDistance = 500): number {
        // send pulse  basic.pause=sleep control.waitMicros=delay
        pins.setPull(DigitalPin.P1, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P1, 0);
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P1, 1);
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P1, 0);
        pins.setPull(DigitalPin.P2, PinPullMode.PullUp);



        let d = pins.pulseIn(DigitalPin.P2, PulseValue.High, maxCmDistance * 42);
        let dr = Math.round(d / 42);
        console.log("Distance: " + dr);

        basic.pause(50)

        switch (unit) {
            case PingUnit.Centimeters: return dr;
            default: return dr;
        }
    }
    //% group="Line Reader"
    //% weight=15
    //% blockId=read_Linesensor block="read |%Linesensor value"
    //% Linesensor.fieldEditor="gridpicker" Linesensor.fieldOptions.columns=2 
    export function readlinereadervalue(Line: Linesensor): number {
        if (Line == Linesensor.Left) {
            return pins.digitalReadPin(DigitalPin.P13)
        } else if (Line == Linesensor.Right) {
            return pins.digitalReadPin(DigitalPin.P14)
        } else {
            return -1
        }
    }

    //% group="Headlights and Underlights"
    //% weight=11
    //% blockId=writeLED block="Set|%led|to|%ledswitch"
    //% led.fieldEditor="gridpicker" led.fieldOptions.columns=2 
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    export function writeLED(led: LED, ledswitch: LEDswitch): void {
        if (led == LED.HeadlightLeft) {
            pins.digitalWritePin(DigitalPin.P8, ledswitch)
        } else if (led == LED.HeadlightRight) {
            pins.digitalWritePin(DigitalPin.P12, ledswitch)
        } else {
            return
        }
    }

    //% group="Headlights and Underlights"
    //% block="set UnderGlow color of %LEDStrip to %rgb=colorNumberPicker"
    //% weight=11 blockGap=8
    export function setUnderGlowColor(index: LEDStrip, color: number): void {
        strip.setBrightness(100)
        if (index == LEDStrip.RGB0) { strip.setPixelColor(0, color) }
        else if (index == LEDStrip.RGB1) { strip.setPixelColor(1, color) }
        else if (index == LEDStrip.RGB2) { strip.setPixelColor(2, color) }
        else if (index == LEDStrip.RGB3) { strip.setPixelColor(3, color) }

    }

    //% group="Headlights and Underlights"
    //% block="set UnderGlow of %LEDStrip off"
    //% weight=11 blockGap=8
    export function setUnderGlowColoroff(index: LEDStrip): void {
        strip.setBrightness(100)
        if (index == LEDStrip.RGB0) { strip.setPixelColor(0, 0x000000) }
        else if (index == LEDStrip.RGB1) { strip.setPixelColor(1, 0x000000) }
        else if (index == LEDStrip.RGB2) { strip.setPixelColor(2, 0x000000) }
        else if (index == LEDStrip.RGB3) { strip.setPixelColor(3, 0x000000) }

    }


}