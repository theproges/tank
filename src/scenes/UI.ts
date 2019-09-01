import {Joystick} from "./game-objects/Joystick";

export class UI extends Phaser.Scene {
    constructor(){
        super({ key: 'UI', active: true });
    }

    create(): void {
        const joystick = new Joystick(this, 300, 300);
        joystick.setActive(true);
    }
}