import {Tank} from "./game-objects/Tank";
import Group = Phaser.Physics.Arcade.Group;
import {Blocker} from "./game-objects/Blocker";
import * as Phaser from "phaser";
import {MapService} from "./services/MapService";
/**
 * The main gameplay scene
 */
export class Playground extends Phaser.Scene {
    private map: MapService;
    private tanks: Group;

    public create(): void {
        // initializing a map
        this.map = new MapService(this);
        this.map.init();
        // creating all players tanks
        this.tanks = this.physics.add.group({runChildUpdate: true});
        this.tanks.addMultiple([
            // red tank - 10 damage
            new Tank(this, 't-red', 10),
            // blue tank - 20 damage
            new Tank(this, 't-blue', 20),
            // green tank - 25 damage
            new Tank(this, 't-green', 25),
        ]);
        // initial tank position
        const startX = 200;
        const startY = 200;
        // activating the green tank - the last in the list
        this.activateTank(this.tanks.getLast(false).setPosition(startX, startY));
        // adding player tanks on map
        this.map.addCollider(this.tanks);
        // remove all blockers in place where player should start
        this.map.clearArea(startX, startY);
        // set green tank as a player
        this.map.setPlayer(this.tanks.getFirst(true));
        // create map chunk around the player tank
        this.map.refreshMap(startX, startY);
        // activating UI
        this.setUIHandlers();
    }

    public update(): void {
        // tracking any changes on map
        this.map.update();
    }

    private activateTank(tank: Tank): void {
        const activeTank = this.tanks.getFirst(true) as Tank;
        if (activeTank) {
            // setting new tank in previous tank position
            tank.rotation = activeTank.rotation;
            tank.setPosition(activeTank.x, activeTank.y);
            // disabling old tank
            activeTank.setActive(false).setVisible(false);
        }
        // activating new tank
        this.cameras.main.startFollow(tank, true, 0.05, 0.05);
        this.map.setPlayer(tank);
        tank.setActive(true).setVisible(true);
    }

    private setUIHandlers(): void {
        const ui = this.scene.get('UI');
        // joystick logic
        ui.events.on('joystickdown', (angle) => {
            // speed up
            this.tanks.getFirst(true).speedUp();
        });
        ui.events.on('joystickmove', (angle) => {
            // rotation
            this.tanks.getFirst(true).rotate(angle);
        });
        ui.events.on('joystickup', (angle) => {
            // speed down
            this.tanks.getFirst(true).speedDown();
        });
        // fire button logic
        ui.events.on('fire', () => {
            let bullet = this.tanks.getFirst(true).fire();
            if (bullet) {
                // make bullet collide with all blockers on the map
                this.physics.add.collider(this.map.getBlockers(), bullet, (blocker: Blocker) => {
                    if (bullet.active) {
                        // set damage to blocker
                        blocker.setDamage(this.tanks.getFirst(true).getDamage());
                        // if health <= 0 blocker should be destroyed
                        if (!blocker.isAlive()) {
                            blocker.destroy();
                        }

                        // remove the bullet
                        bullet.setActive(false).setVisible(false).destroy(true);
                    }
                });
            }
        });
        // tanks control panel logic
        ui.events.on('tankchanged', (index: number) => {
            this.tanks.getChildren().forEach((tank: Tank, i: number) => {
                // if tank with 'index' exists in tanks list
                if (index === i) {
                    this.activateTank(tank);
                }
            })
        });
    }
}
