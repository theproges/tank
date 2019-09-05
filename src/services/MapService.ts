import {Blocker} from "../scenes/game-objects/Blocker";
import * as Phaser from "phaser";
import Point = Phaser.Geom.Point;
import Container = Phaser.GameObjects.Container;
import {Tank} from "../scenes/game-objects/Tank";

interface IChunk {
    id: number;
    position: Point;
    container: Container;
    bounds: Phaser.Geom.Rectangle;
    items: Blocker[];
    renderable: boolean;
    current: boolean;
    // todo: should I need this field
    edges: IChunk[];
}


export class MapService {
    private cellSize: number = 150;
    private chunkSize: number = 20;
    private chunkList: IChunk[];
    private renderableChunkList: IChunk[];
    private player: Tank;
    private currentChunk: IChunk;
    // todo: is this OK to work with game-objects?
    private blockers: Blocker[] = [];
    constructor (private scene: Phaser.Scene) {}

    public init(): void {
        const mainChunk = this.createChunk(0,0);
        mainChunk.renderable = true;
        mainChunk.current = true;
        this.currentChunk = mainChunk;
        this.chunkList.push(mainChunk);
    }

    public setPlayer(tank: Tank): void {
        this.player = tank;
        this.scene.physics.add.collider(tank, this.blockers);
    }

    public getBlockers(): Blocker[] {
        return this.blockers;
    }

    public getPlayerPosition(): Point {
        return new Point(0,0);
    }

    public update(): void {
        if (this.currentChunk.bounds.contains(this.player.x, this.player.y)) {
            return;
        }

        this.refreshMap(this.player.x, this.player.y);
    }

    private refreshMap(x: number, y: number): void {
        this.currentChunk.current = false;

        for (let i = 0, len = this.chunkList.length; i < len; i++) {
            const chunk = this.chunkList[i];
            if (chunk.bounds.contains(x,y)) {
                this.currentChunk = chunk;
                chunk.current = true;
                this.refreshNeighbors(chunk);
                this.createNeighbors(chunk, true);
                continue;
            } else {
                if (chunk.container && !isNewNeighbor) {
                    this.destroyChunk(chunk);
                }
            }
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
                    const renderableChunk = this.renderableChunkList[i];
                    if (renderableChunk.bounds.contains(startX, currentY)) {
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
                if (!chunk.edges[edgeIndex]) {
                    const newChunk = this.createChunk(startX, currentY);
                    newChunk.renderable = renderable;
                    chunk.edges[edgeIndex] = newChunk;
                    this.chunkList.push(newChunk);
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
            container: null,
            bounds: null,
            items: [],
            renderable: false,
            current: false,
            edges: []
        };
        const tileSize = this.chunkSize * this.cellSize;
        const container = this.scene.add.container(x, y);
        let land = this.scene.add.tileSprite( 0, 0, tileSize, tileSize, 'ground');
        container.add(land);
        for (let xIndex = 0; xIndex < this.chunkSize; xIndex++) {
            for (let yIndex = 0; yIndex < this.chunkSize; yIndex++) {
                const probability = Phaser.Math.Between(0, 1);
                const x = xIndex * this.cellSize;
                const y = yIndex * this.cellSize;
                let blocker;
                if (probability > 0.9) {
                    blocker = new Blocker(this.scene, 'wall', 0, true);
                } else if (probability > 0.8) {
                    blocker = new Blocker(this.scene, 'hay', 100, false);
                }

                if (blocker) {
                    blocker.displayHeight = blocker.displayWidth = this.cellSize;
                    blocker.setPosition(x, y);
                    container.add(blocker);
                    this.blockers.push(blocker);
                    chunk.items.push(blocker);
                }
            }
        }

        chunk.id = this.chunkList.push(chunk) - 1;
        chunk.container = container;
        chunk.bounds = chunk.container.getBounds();

        return chunk;
    }

    private destroyChunk(chunk: IChunk): void {

    }
}