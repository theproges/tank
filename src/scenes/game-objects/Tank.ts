import Scene = Phaser.Scene;

export class Tank extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Scene, textureKey: string, damage: number) {
        super(scene, 0, 0, textureKey);
    }
}
