import {Tank} from "./game-objects/Tank";
import Group = Phaser.Physics.Arcade.Group;
import {Blocker} from "./game-objects/Blocker";
import * as Phaser from "phaser";
import {MapService} from "../services/MapService";

export class Playground extends Phaser.Scene {
    private map: MapService;
    private tanks: Group;

    public create(): void {
        this.map = new MapService(this);
        this.map.init();
        this.tanks = this.physics.add.group({runChildUpdate: true});
        this.tanks.addMultiple([
            new Tank(this, 't-red', 10),
            new Tank(this, 't-blue', 20),
            new Tank(this, 't-green', 25),
        ]);
        this.activateTank(this.tanks.getFirstDead());
        this.map.setPlayer(this.tanks.getFirst(true));
        this.setUIHandlers();
    }

    public update(): void {
        this.map.update();
    }

    private activateTank(tank: Tank): void {
        const activeTank = this.tanks.getFirst(true) as Tank;
        const position = this.map.getPlayerPosition();
        if (activeTank) {
            tank.rotation = activeTank.rotation;
            activeTank.setActive(false).setVisible(false);
        }
        this.cameras.main.startFollow(tank, true, 0.05, 0.05);
        tank.setActive(true).setVisible(true).setPosition(position.x, position.y);
    }

    private setUIHandlers(): void {
        const ui = this.scene.get('UI');
        ui.events.on('joystickdown', (angle) => {
            this.tanks.getFirst(true).speedUp();
        });
        ui.events.on('joystickmove', (angle) => {
            this.tanks.getFirst(true).rotate(angle);
        });
        ui.events.on('joystickup', (angle) => {
            this.tanks.getFirst(true).speedDown();
        });
        ui.events.on('fire', () => {
            let bullet = this.tanks.getFirst(true).fire();
            if (bullet) {
                this.physics.add.collider(this.map.getBlockers(), bullet, (wall: Blocker) => {
                    if (bullet.active) {
                        wall.setDamage(this.tanks.getFirst(true).getDamage());
                        if (!wall.isAlive()) {
                            wall.destroy();
                        }

                        bullet.setActive(false).setVisible(false);
                    }
                });
            }
        });

        ui.events.on('tankchanged', (index: number) => {
            this.tanks.getChildren().forEach((tank: Tank, i: number) => {
                if (index === i) {
                    this.activateTank(tank);
                }
            })
        });
    }
}
