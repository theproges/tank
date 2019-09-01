export class Boot extends Phaser.Scene {
    public preload(): void {
        this.load.image("bullet", "assets/img/bullet.png");
        this.load.image("ground", "assets/img/ground.png");
        this.load.image("hay", "assets/img/hay.png");
        this.load.image("joystick", "assets/img/joystick.png");
        this.load.image("joystick-orbit", "assets/img/joystick-orbit.png");
        this.load.image("t-blue", "assets/img/t-blue.png");
        this.load.image("t-green", "assets/img/t-green.png");
        this.load.image("t-red", "assets/img/t-red.png");
        this.load.image("wall1", "assets/img/wall1.png");
        this.load.image("wall2", "assets/img/wall2.png");
        this.load.image("wall3", "assets/img/wall3.png");
    }

    public create(): void {
        this.scene.start('Playground');
    }
}