export class Blocker extends Phaser.Physics.Arcade.Sprite {
    constructor
    (
        scene: Phaser.Scene,
        textureKey: string,
        private health: number,
        private immortal: boolean
    ) {
        super(scene, 0, 0, textureKey);
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.body.immovable = true;
        this.setActive(true);
        this.setVisible(true);
    }
    public setDamage(damage: number): void {
        if (!this.immortal) {
            this.health -= damage;
        }
    }
    public isAlive(): boolean {
        return this.health > 0 || this.immortal;
    }
    public dispose(): void {
        this.destroy(true);
    }
}