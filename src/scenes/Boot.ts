/**
 * Load game resources
 */
export class Boot extends Phaser.Scene {
    public preload(): void {
        this.load.image("bullet", "assets/bullet.png");
        this.load.image("ground", "assets/ground.png");
        this.load.image("hay", "assets/hay.png");
        this.load.image("t-blue", "assets/t-blue.png");
        this.load.image("t-green", "assets/t-green.png");
        this.load.image("t-red", "assets/t-red.png");
        this.load.image("wall", "assets/wall.png");
    }

    public create(): void {
        this.scene.start('Playground');
    }
}