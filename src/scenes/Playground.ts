import {Bullet} from "./game-objects/Bullet";

export class Playground extends Phaser.Scene {
    private cursors;
    private tank;
    private land;
    private currentSpeed = 0;
    private fireRate = 5;
    private nextFire = 0;

    public create(): void {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cameras.main.setBounds(-1000, -1000, 2000, 2000);
        this.physics.world.setBounds(-1000, -1000, 2000, 2000);

        let land = this.add.tileSprite( 0, 0, 2000, 2000, 'ground');
        this.land = land;

        let tank = this.physics.add.sprite(0, 0, 't-green');
        tank.setOrigin(0.5, 0.5);
        tank.setDrag(0.2);
        tank.setScale(0.4)
        tank.setMaxVelocity(400, 400);
        this.cameras.main.startFollow(tank, true,0.05,0.05);
        this.tank = tank;

        let hay = this.physics.add.sprite(300, 300,'hay');
        (hay as any).health = 100;


        // todo: generate walls
        let walls = this.physics.add.staticGroup();
        let wall = walls.create(-300, -300, 'wall3').setScale(1.5).refreshBody();
        this.physics.add.collider(tank, wall);
        this.physics.add.collider(tank, wall);



        let playerBullets = this.physics.add.group({classType: Bullet, runChildUpdate: true, key: 'bullet'});

        this.input.on('pointerdown', function (pointer, time, lastFired) {
            // Get bullet from bullets group
            var bullet = playerBullets.get().setActive(true).setVisible(true);

            if (bullet) {
                // todo: remove math.pi / 2
                bullet.fire(tank.x, tank.y, tank.rotation + Math.PI / 2);
                this.physics.add.collider(hay, bullet, () => {
                    if (bullet.active) {
                        let enemy = hay as any;

                        enemy.health -= bullet.damage;
                        if (enemy.health <= 0) {
                            enemy.destroy();
                        }

                        bullet.setActive(false).setVisible(false);
                    }
                });
                this.physics.add.collider(wall, bullet, () => {
                    bullet.setActive(false).setVisible(false);
                })
            }
        }, this);
    }

    public update () {
        if (this.cursors.left.isDown)
        {
            this.tank.angle -= 4;
        }
        else if (this.cursors.right.isDown)
        {
            this.tank.angle += 4;
        }

        if (this.cursors.up.isDown)
        {
            this.currentSpeed = 300;
        }
        else
        {
            if (this.currentSpeed > 0)
            {
                this.currentSpeed -= 4;
            }
        }

        if (this.currentSpeed > 0)
        {
            this.physics.velocityFromRotation(this.tank.rotation + Math.PI / 2, this.currentSpeed, this.tank.body.velocity);
        }

        this.land.tilePositionX = -this.cameras.main.x;
        this.land.tilePositionY = -this.cameras.main.y;
    }
}