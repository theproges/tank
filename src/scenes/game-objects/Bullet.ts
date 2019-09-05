export class Bullet extends Phaser.GameObjects.Sprite {
    private speed;
    private born;
    private direction;
    private xSpeed;
    private ySpeed;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0, 'bullet');
        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
    }

    public fire (x: number, y: number, rotation: number) {
        this.setPosition(x, y);

        this.setActive(true);
        this.setVisible(true);
        this.xSpeed = this.speed * Math.cos(rotation);
        this.ySpeed = this.speed * Math.sin(rotation);

        this.rotation = rotation + Math.PI / 2;
        this.born = 0;
    }
    public update (time, delta) {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1000) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}