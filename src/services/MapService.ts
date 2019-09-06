import {Blocker} from "../scenes/game-objects/Blocker";
import * as Phaser from "phaser";
import Point = Phaser.Geom.Point;
import Container = Phaser.GameObjects.Container;
import {Tank} from "../scenes/game-objects/Tank";
import Group = Phaser.GameObjects.Group;

interface IChunk {
    id: number;
    position: Point;
    bounds: Phaser.Geom.Rectangle;
    renderable: boolean;
    current: boolean;
    // todo: should I need this field
    edges: IChunk[];
    blockerGroup: Group;
    landGroup: Group;
}


export class MapService {
    private cellSize: number = 150;
    private chunkSize: number = 20;
    private chunkList: IChunk[] = [];
    private renderableChunkList: IChunk[] = [];
    private player: Tank;
    private currentChunk: IChunk;
    private landLayer: Container;
    private blockerLayer: Container;
    private playerLayer: Container;
    // todo: is this OK to work with game-objects?
    private blockers: Blocker[] = [];
    constructor (private scene: Phaser.Scene) {}

    public init(): void {
        this.landLayer = this.scene.add.container(0, 0);
        this.blockerLayer = this.scene.add.container(0, 0);
        this.playerLayer = this.scene.add.container(0, 0);

        const mainChunk = this.createChunk(0,0);
        mainChunk.renderable = true;
        mainChunk.current = true;
        this.currentChunk = mainChunk;
    }

    // todo: is this method need to be?
    public setPlayer(tank: Tank): void {
        this.player = tank;
    }

    public addCollider(group: Phaser.Physics.Arcade.Group): void {
        this.scene.physics.add.collider(group, this.blockers);
    }

    public getBlockers(): Blocker[] {
        return this.blockers;
    }

    public removeBlocker(x: number, y: number): void {
        let index = 0;
        while (index < this.blockers.length) {
            if (this.blockers[index].getBounds().contains(x,y)){
                this.blockers[index].dispose();
                this.blockers.splice(index, 1);
                break;
            }
            index++;
        }
    }

    public update(): void {
        if (!this.player || this.currentChunk.bounds.contains(this.player.x, this.player.y)) {
            return;
        }

        this.refreshMap(this.player.x, this.player.y);
    }

    public refreshMap(x: number, y: number): void {
        this.currentChunk.current = false;
        this.currentChunk = null;

        for (let i = 0, len = this.chunkList.length; i < len; i++) {
            const chunk = this.chunkList[i];
            if (chunk.bounds.contains(x, y)) {
                this.currentChunk = chunk;
                chunk.current = true;
                this.refreshNeighbors(chunk);
                this.createNeighbors(chunk, true);
                break;
            }
        }
        for (let i = 0, len = this.chunkList.length; i < len; i++) {
            const chunk = this.chunkList[i];

            if (this.currentChunk !== chunk && this.currentChunk.edges.indexOf(chunk) === -1) {
                chunk.renderable = false;
            }

            if (chunk.renderable && this.renderableChunkList.indexOf(chunk) === -1) {
                this.renderableChunkList.push(chunk);
            } else if (!chunk.renderable && this.renderableChunkList.indexOf(chunk) !== -1) {
                this.unloadChunk(chunk);
            }
        }
    }

    public clearArea(x: number, y: number): void {
        let startX = x - this.cellSize;
        let startY = y - this.cellSize;
        let currentY = startY;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.removeBlocker(startX, currentY);
                currentY += this.cellSize;
            }
            startX += this.cellSize;
            currentY = startY;
        }
    }

    private refreshNeighbors(chunk: IChunk): void {
        let edgeIndex = 0;
        let startX = chunk.position.x - chunk.bounds.width;
        let startY = chunk.position.y - chunk.bounds.height;
        let stepX = chunk.bounds.width;
        let stepY = chunk.bounds.height;
        let currentY = startY;
        //todo: separate on different methods
        // todo: optimize it
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (chunk.edges[edgeIndex]) {
                    currentY += stepY;
                    edgeIndex++;
                    continue;
                }
                chunk.edges[edgeIndex] = null;
                for (let chunkIndex = 0, len = this.renderableChunkList.length; chunkIndex < len; chunkIndex++) {
                    const renderableChunk = this.renderableChunkList[chunkIndex];

                    if (chunk === renderableChunk) {
                        continue;
                    }

                    // todo: fix it
                    if (renderableChunk.bounds.contains(startX+10, currentY+10)) {
                        chunk.edges[edgeIndex] = renderableChunk;
                        break;
                    }
                }
                currentY += stepY;
                edgeIndex++;
            }
            startX += stepX;
            currentY = startY;
        }
    }

    private createNeighbors(chunk: IChunk, renderable: boolean): void {
        let edgeIndex = 0;
        let startX = chunk.position.x - chunk.bounds.width;
        let startY = chunk.position.y - chunk.bounds.height;
        let stepX = chunk.bounds.width;
        let stepY = chunk.bounds.height;
        let currentY = startY;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (!chunk.edges[edgeIndex] && !chunk.bounds.contains(startX+10, currentY+10)) {
                    const newChunk = this.createChunk(startX, currentY);
                    newChunk.renderable = renderable;
                    chunk.edges[edgeIndex] = newChunk;
                }
                currentY += stepY;
                edgeIndex++;
            }
            startX += stepX;
            currentY = startY;
        }
    }

    private createChunk(x: number, y: number): IChunk {
        const chunk: IChunk = {
            id: 0,
            position: new Point(x,y),
            bounds: null,
            renderable: false,
            current: false,
            edges: [],
            blockerGroup: this.scene.add.group({classType: Blocker}),
            landGroup: this.scene.add.group(),
        };
        const tileSize = this.chunkSize * this.cellSize;
        let land = this.scene.add.tileSprite( x, y, tileSize, tileSize, 'ground');
        land.setOrigin(0,0);
        this.landLayer.add(land);
        chunk.landGroup.add(land);
        for (let xIndex = 0; xIndex < this.chunkSize; xIndex++) {
            for (let yIndex = 0; yIndex < this.chunkSize; yIndex++) {
                const probability = Phaser.Math.Between(0, 100);
                const localX = xIndex * this.cellSize + x;
                const localY = yIndex * this.cellSize + y;
                let blocker: Blocker;
                if (probability > 95) {
                    blocker = new Blocker(this.scene, 'wall',0, true);
                } else if (probability > 90) {
                    blocker = new Blocker(this.scene, 'hay', 100, false);
                }
                if (blocker) {
                    blocker.displayHeight = blocker.displayWidth = this.cellSize;
                    blocker.setPosition(localX, localY);
                    this.blockerLayer.add(blocker);
                    this.blockers.push(blocker);
                    chunk.blockerGroup.add(blocker);
                }
            }
        }

        chunk.id = this.chunkList.push(chunk) - 1;
        chunk.bounds = land.getBounds();

        return chunk;
    }

    private unloadChunk(chunk: IChunk): void {
        const index = this.renderableChunkList.indexOf(chunk);
        if (index >= 0) {
            this.renderableChunkList.splice(index, 1);
        }
        chunk.renderable = false;
        chunk.current = false;


        const lands = chunk.landGroup.getChildren();
        const blockers = chunk.blockerGroup.getChildren();

        lands.forEach((land) => {
            this.landLayer.remove(land);
        });

        blockers.forEach((blocker) => {
            this.blockerLayer.remove(blocker);
        });

        chunk.landGroup.clear(true, true);
        chunk.blockerGroup.clear(true, true);
        // todo remove from blockers array
    }
}