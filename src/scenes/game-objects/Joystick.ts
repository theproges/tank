import Point = Phaser.Geom.Point;
import Sprite = Phaser.GameObjects.Sprite;

export class Joystick extends Phaser.Physics.Arcade.Sprite {
    private draggerW = 200;
    private draggerH = 200;
    private distance = 0;
    private draggerAngle = 0;
    private isBeingDragged = false;
    private pin: Sprite;
    private dragger: Sprite;


    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, 0, 0, 'joystick-orbit');
        this.setOrigin(0.5, 0.5);

        /* Pin indicator - what players think they drag */
        this.pin = scene.add.sprite(0, 0, 'joystick');
        this.pin.setScale(0.5);
        this.pin.setOrigin(0.5, 0.5);
        /* Invisible sprite that players actually drag */
        let dragger = scene.add.sprite(0, 0, null);
        dragger.width = this.width;
        dragger.height = this.height;
        dragger.alpha = 0.001;
        dragger.setOrigin(0.5, 0.5);
        dragger.setInteractive();
        scene.input.setDraggable(dragger);
        /* Set flags on drag */

        dragger.on('dragstart', () => {
            this.onDragStart();
        });
        dragger.on('dragend', () => {
            this.onDragEnd();
        });

        dragger.on('drag', (pointer, dragX, dragY) => {
            if (this.isBeingDragged) {
                let angle = this.draggerAngle = Phaser.Math.Angle.Between(0, 0, dragX, dragY);
                let distance = this.distance = Point.GetMagnitude(new Point(dragX, dragY));
                this.pin.setPosition(dragX, dragY);
                if (distance > 85) {
                    let point = new Point(dragX,dragY);
                    Point.SetMagnitude(point, 85);
                    this.pin.setPosition(point.x, point.y);
                }
                this.onMove(angle);
            }
        });
        this.dragger = dragger;

        const container = this.scene.add.container(x, y);
        container.add(this);
        container.add(this.dragger);
        container.add(this.pin);
    }
    private onDragStart(){
        this.isBeingDragged = true;
        this.onDown();
    }
    private onDragEnd(){
        this.isBeingDragged = false;
        /* Reset pin and dragger position */
        this.dragger.setPosition(0, 0);
        this.pin.setPosition(0, 0);
        this.onUp(this.angle);
    }
    onUp(angle) {
        console.log('up', angle);
    }
    onDown() {
        console.log('down');
    }
    onMove(angle) {
        console.log('move', angle);
    }
}