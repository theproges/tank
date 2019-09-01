import Point = Phaser.Geom.Point;
import Sprite = Phaser.GameObjects.Sprite;

export class Joystick extends Phaser.GameObjects.Sprite {
    private draggerW = 181;
    private draggerH = 181;
    private distance = 0;
    private draggerAngle = 0;
    private isBeingDragged = false;
    private pin: Sprite;
    private dragger: Sprite;


    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'joystick-orbit');
        const container = this.scene.add.container(x, y);
        container.setInteractive();
        const orbit = this.scene.add.sprite(0,0, '');
        this.width = this.draggerW + 20;
        this.height = this.draggerH + 20;
        this.setOrigin(0.5, 0.5);
        container.add(orbit);
        //
        // this.fixedToCamera = true;
        // this.cameraOffset.setTo(x, y);

        /* Pin indicator - what players think they drag */
        this.pin = this.scene.add.sprite(0, 0, 'joystick');
        this.pin.width = this.draggerW;
        this.pin.height = this.draggerH;
        this.pin.setOrigin(0.5, 0.5);
        container.add(this.pin);
        /* Invisible sprite that players actually drag */
        let dragger = scene.add.sprite(0, 0, null);
        dragger.setOrigin(0.5, 0.5);
        dragger.width = this.draggerW;
        dragger.height = this.draggerH;
        dragger.setInteractive();
        scene.input.setDraggable(dragger);
        /* Set flags on drag */

        dragger.on('dragstart', () => {
            this.onDragStart();
        });
        dragger.on('dragend', () => {
            this.onDragEnd();
        });

        container.add(dragger);
        this.dragger = dragger;
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
    public update() {
        if (this.isBeingDragged) {
            let angle = this.draggerAngle = Phaser.Math.Angle.Between(0, 0, this.dragger.x, this.dragger.y);
            let distance = this.distance = Point.GetMagnitude(new Point(this.dragger.x, this.dragger.y));
            this.pin.setPosition(this.dragger.x, this.dragger.y);
            if (distance > 85) {
                let point = new Point(0,0);
                Point.SetMagnitude(point, 85);
                this.pin.setPosition(point.x, point.y);
            }
            this.onMove(angle);
        }
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