import 'phaser';
import {Boot} from "./scenes/Boot";
import {Playground} from "./scenes/Playground";
import {UI} from "./scenes/UI";

export class Game extends Phaser.Game {
    constructor() {
        let renderer: number = Phaser.AUTO;

        super(
            {
                type: renderer,
                parent: "game",
                width: 1280,
                height: 720,
                title: "MONSTER TANK",
                physics: {
                    default: 'arcade',
                },
            }
        );

        this.scene.add("Boot", Boot);
        this.scene.add("Playground", Playground);
        this.scene.add("UI", UI);

        this.scene.start("Boot");
    }
}