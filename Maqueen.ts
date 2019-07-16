let alreadyInit = 0
let strip = neopixel.create(DigitalPin.P15, 4, NeoPixelMode.RGB)
const MOTER_ADDRESSS = 0x10

//% weight=10 color=#008B00 icon="\uf136" block="Maqueen"
//% groups='["Motors", "Distance Sensor", "Line Reader","Headlights", "Servo"]'

namespace Maqueen {
    export enum Motors {
        //% blockId="LeftMotor" block="LeftMotor"
        LeftMotor = 0,
        //% blockId="RightMotor" block="RightMotor"
        RightMotor = 1, 
        //% blockId="BothMotors" block="BothMotors"
        BothMotors = 2
    }
    export enum Servos {
        //% blockId="Servo 1" block="Servo 1"
        S1 = 0,
        //% blockId="Servo 2" block="Servo 2"
        S2 = 1
    }
    export enum Direction {
        //% blockId="forward" block="forward"
        forwards = 0x0,
        //% blockId="backward" block="backward"
        backwards = 0x1
    }

    export enum PingUnit {
        //% block="cm"
        Centimeters,
        //% block="μs"
        MicroSeconds
    }
    export enum Linesensor {
        //% blockId="Left line reader" block="Left line reader"
        LeftLineSensor = 13,
        //% blockId="Right line reader" block="Right line reader"
        RightLineSensor = 14
    }
    export enum LEDpin {
        //% blockId="Headlight Left" block="Headlight Left"
        HeadlightLeft = 8,
        //% blockId="Headlight Right" block="Headlight Right"
        HeadlightRight = 12
    }
    export enum LEDmode {
        //% blockId="ON" block="ON"
        ON = 0x01,
        //% blockId="OFF" block="OFF"
        OFF = 0x00
    }
    export enum linevalue{
        white,
        black
    }
    //% weight=100
    //% group="Motors"
    //% blockId=motor_MotorRun block="Set|%index|to|%Direction|at the speed|%speed" 
    //% speed.min=0 speed.max=100
    //% speed.defl=100
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% Directionection.fieldEditor="gridpicker" Directionection.fieldOptions.columns=2
    export function MotorRun(index: Motors, Directionection: Direction, speed: number): void {
        let buf = pins.createBuffer(3);
        speed = speed * 2.55
        buf[1] = Directionection;
        buf[2] = speed;

        if (index == 0) {
            buf[0] = 0x00;
        }
        if (index == 1) {
            buf[0] = 0x02;
        }
        if (index == 2){
            buf[0] = 0x00;
            pins.i2cWriteBuffer(0x10, buf);
            buf[0] = 0x02;
            pins.i2cWriteBuffer(0x10, buf);
        }
        pins.i2cWriteBuffer(0x10, buf);


    }
    //% weight=98
    //% group="Motors"
    //% blockId=motor_motorStop block="Stop|%motors"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2
    export function motorStop(motors: Motors): void {
        let buf = pins.createBuffer(3);
        buf[1] = 0;
        buf[2] = 0;

        if (motors == 0) {
            buf[0] = 0x00;
        }
        if (motors == 1) {
            buf[0] = 0x02;
        }
        if (motors == 2) {
            buf[0] = 0x00;
            pins.i2cWriteBuffer(0x10, buf);
            buf[0] = 0x02;
            pins.i2cWriteBuffer(0x10, buf);
        }
        pins.i2cWriteBuffer(0x10, buf);
        
    }

    //% weight=90
    //% group="Distance Sensor"
    //% blockId=ultrasonic_sensor block="distance sensor value in |%unit"
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

    //% weight=89
    //% group="Line Reader"
    //% blockId=read_Linesensor block=" %Linesensor detects %type"
    //% Linesensor.fieldEditor="gridpicker" Linesensor.fieldOptions.columns=2 
    
    export function readlinereadervalue(Line: Linesensor, typeline: linevalue): boolean {
        let LeftLineSensorValue = pins.digitalReadPin(DigitalPin.P13)
        let RightLineSensorValue = pins.digitalReadPin(DigitalPin.P14)
        if (typeline == linevalue.white && LeftLineSensorValue == 0) {
            return true
        }
        else if (typeline == linevalue.black && LeftLineSensorValue == 1) {
            return true
        }
        else{
            return false
        }
    }

    //% weight=87
    //% group="Headlights"
    //% blockId=writeLED block="Set|%led|to|%ledswitch"
    //% led.fieldEditor="gridpicker" led.fieldOptions.columns=2 
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    export function writeLED(led: LEDpin, ledswitch: LEDmode): void {
        if (led == LEDpin.HeadlightLeft) {
            pins.digitalWritePin(DigitalPin.P8, ledswitch)
        } else if (led == LEDpin.HeadlightRight) {
            pins.digitalWritePin(DigitalPin.P12, ledswitch)
        } else {
            return
            
        }
    }
    //% weight=50
    //% group="Servo"
    //% blockId=servo_ServoRun block="Set |%index| to a |%angle angle"
    //% angle.min=0 angle.max=180
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    export function ServoRun(index: Servos, angle: number): void {
        let buf = pins.createBuffer(2);
        if (index == 0) {
            buf[0] = 0x14;
        }
        if (index == 1) {
            buf[0] = 0x15;
        }
        buf[1] = angle;
        pins.i2cWriteBuffer(0x10, buf);
    }
}