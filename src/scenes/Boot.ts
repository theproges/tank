export class Boot extends Phaser.Scene {
    public preload(): void {
        this.load.image("bullet", "assets/img/bullet.png");
        this.load.image("ground", "assets/img/ground.png");
        this.load.image("hay", "assets/img/hay.png");
        this.load.image("t-blue", "assets/img/t-blue.png");
        this.load.image("t-green", "assets/img/t-green.png");
        this.load.image("t-red", "assets/img/t-red.png");
        this.load.image("wall", "assets/img/wall.png");
    }

    public create(): void {
        this.scene.start('Playground');
    }
}