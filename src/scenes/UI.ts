import {Joystick} from "./game-objects/Joystick";
import Sprite = Phaser.GameObjects.Sprite;

export class UI extends Phaser.Scene {
    constructor(){
        super({ key: 'UI', active: true });
    }

    preload(): void {
        this.load.image("joystick", "assets/img/joystick.png");
        this.load.image("joystick-orbit", "assets/img/joystick-orbit.png");
        this.load.image("red-btn", "assets/img/red-btn.png");
        this.load.image("control-panel", "assets/img/control-panel.png");
    }

    create(): void {
        const joystick = new Joystick(this, 150, 570);
        joystick.onDown = () => {
            this.events.emit('joystickdown');
        };
        joystick.onMove = (angle) => {
            this.events.emit('joystickmove', angle);
        };
        joystick.onUp = (angle) => {
            this.events.emit('joystickup', angle);
        };

        /*
         * FIRE BUTTON
         */

        const fireBtn = this.add.sprite(1100, 530, 'red-btn');
        fireBtn.setInteractive();
        fireBtn.on('pointerdown', () => {
            this.events.emit('fire');
        });

        const tanksCP = this.add.container(1100, 650);
        tanksCP.setScale(0.6);
        const tanksBg = this.add.sprite(0, 0, 'control-panel');
        tanksBg.displayWidth = 300;
        tanksBg.displayHeight = 100;
        tanksCP.add(tanksBg);
        const tanks =
            [
                this.add.sprite(-100, 0, 't-red').setScale(0.4).setInteractive().setAlpha(.4),
                this.add.sprite(0, 0, 't-blue').setScale(0.4).setInteractive().setAlpha(.4),
                this.add.sprite(100, 0, 't-green').setScale(0.4).setInteractive(),
            ];
        const switchTank = (index: number) => {
            tanks.forEach((tank: Sprite) => {
                tank.alpha = .4;
            });
            tanks[index].alpha = 1;
        };
        tanks.forEach((tank: Sprite, index: number) => {
            tanksCP.add(tank);
            tank.on('pointerdown', () => {
                switchTank(index);
                this.events.emit('tankchanged', index);
            });
        });
    }
}