import Scene = Phaser.Scene;
import {Bullet} from "./Bullet";

/**
 * Players tank
 */
export class Tank extends Phaser.Physics.Arcade.Sprite {
    private damage: number;
    private isTankMoving = false;
    private currentSpeed = 0;
    private bullets: Phaser.Physics.Arcade.Group;

    constructor(scene: Scene, textureKey: string, damage: number) {
        super(scene, 0, 0, textureKey);
        scene.add.existing(this);
        scene.physics.world.enable(this);

        // basic setup of a tank
        this.damage = damage;
        this.setOrigin(0.5, 0.5);
        this.setDrag(0.2);
        this.setScale(0.4);
        this.setMaxVelocity(400, 400);
        this.setActive(false);
        this.setVisible(false);

        // creating ammo
        this.bullets = scene.physics.add.group({classType: Bullet, runChildUpdate: true, key: 'bullet', visible: false});
    }

    // allow movement
    public speedUp(): void {
        this.isTankMoving = true;
    }

    // deny movement
    public speedDown(): void {
        this.isTankMoving = false;
    }

    // rotate a tank (in radians)
    public rotate(rotation: number): void {
        this.rotation = rotation - Math.PI / 2;
    }

    // boom!
    public fire(): Bullet {
        let bullet = this.bullets.get().setActive(true).setVisible(true);

        if (bullet) {
            bullet.fire(this.x, this.y, this.rotation + Math.PI / 2);
        }

        return bullet;
    }

    // get damage value of this tank
    public getDamage(): number {
        return this.damage;
    }

    // non-stop tracking state changes
    public update(): void {
        // movement value management
        if (this.isTankMoving) {
            this.currentSpeed = 300;
        }
        else {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= 10;
            }
        }

        // applying speed value
        if (this.currentSpeed > 0) {
            this.scene.physics.velocityFromRotation(this.rotation + Math.PI / 2, this.currentSpeed, this.body.velocity);
        }
    }
}
