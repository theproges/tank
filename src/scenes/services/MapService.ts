import {Blocker} from "../game-objects/Blocker";
import * as Phaser from "phaser";
import Point = Phaser.Geom.Point;
import Container = Phaser.GameObjects.Container;
import {Tank} from "../game-objects/Tank";
import Group = Phaser.GameObjects.Group;

// chunk data
interface IChunk {
    // global position of a chunk
    position: Point;
    // bounds of a chunk
    bounds: Phaser.Geom.Rectangle;
    // is it displayeble or not
    renderable: boolean;
    // all chunk neighbors of this chunk
    edges: IChunk[];
    // all blockers of this chunk
    blockerGroup: Group;
    // all land tiles of this chunk
    landGroup: Group;
}

/**
 * Service which manage a map generation
 */
export class MapService {
    // cell is a square, so width = height = cellSize
    private cellSize: number = 150;
    // count of cells in one dimension
    private chunkSize: number = 20;
    // todo: remove it?
    // list of all chunks on map (even destroyed)
    private chunkList: IChunk[] = [];
    // list of all active (renderable) chunks
    private renderableChunkList: IChunk[] = [];
    // reference to current player tank
    private player: Tank;
    // reference to chunk where currently placed a player
    private currentChunk: IChunk;
    // bottom container for ground tiles
    private landLayer: Container;
    // container under landContainer for all blockers
    private blockerLayer: Container;
    // list of all active blockers
    private blockers: Blocker[] = [];

    constructor (private scene: Phaser.Scene) {}

    public init(): void {
        this.landLayer = this.scene.add.container(0, 0);
        this.blockerLayer = this.scene.add.container(0, 0);

        // creating a first chunk
        const mainChunk = this.createChunk(0,0);
        mainChunk.renderable = true;
        this.currentChunk = mainChunk;
    }

    // set reference to current players tank
    public setPlayer(tank: Tank): void {
        this.player = tank;
    }

    // add group of colliders with blockers
    public addCollider(group: Phaser.Physics.Arcade.Group): void {
        this.scene.physics.add.collider(group, this.blockers);
    }

    // get all active map blockers
    public getBlockers(): Blocker[] {
        return this.blockers;
    }

    // remove blocker from position x,y
    public removeBlocker(x: number, y: number): void {
        let index = 0;
        while (index < this.blockers.length) {
            if (this.blockers[index].getBounds().contains(x,y)){
                // remove blocker from list and memory
                this.blockers[index].dispose();
                this.blockers.splice(index, 1);
                break;
            }
            index++;
        }
    }

    // for non-stop tracking changes
    public update(): void {
        // if player is on current chunk - nothing to change
        if (!this.player || this.currentChunk.bounds.contains(this.player.x, this.player.y)) {
            return;
        }

        // if player outside of current chunk then map should be updated
        this.refreshMap(this.player.x, this.player.y);
    }

    // updating the map
    public refreshMap(x: number, y: number): void {
        this.currentChunk = null;

        // searching a chunk where currently player is
        for (let i = 0, len = this.chunkList.length; i < len; i++) {
            const chunk = this.chunkList[i];
            if (chunk.bounds.contains(x, y)) {
                this.currentChunk = chunk;
                // this two methods creates neighbors around new current chunk
                this.refreshNeighbors(chunk);
                this.createNeighbors(chunk, true);
                break;
            }
        }

        // updating the view
        for (let i = 0, len = this.chunkList.length; i < len; i++) {
            const chunk = this.chunkList[i];

            // if chunk from list isn't neighbor of current (players) chunk - should be unloaded
            if (this.currentChunk !== chunk && this.currentChunk.edges.indexOf(chunk) === -1) {
                chunk.renderable = false;
            }
            // activate all renderable chunks
            if (chunk.renderable && this.renderableChunkList.indexOf(chunk) === -1) {
                this.renderableChunkList.push(chunk);
            }
            // unload old chunks
            else if (!chunk.renderable && this.renderableChunkList.indexOf(chunk) !== -1) {
                this.unloadChunk(chunk);
            }
        }
    }

    // clear area from blockers in cellSize radius
    public clearArea(x: number, y: number): void {
        let startX = x - this.cellSize;
        let startY = y - this.cellSize;
        let currentY = startY;
        // 'radius' is a matrix 3x3. Center is x,y parameters
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.removeBlocker(startX, currentY);
                currentY += this.cellSize;
            }
            startX += this.cellSize;
            currentY = startY;
        }
    }

    // get all neighbor chunks from list of active chunks
    private refreshNeighbors(chunk: IChunk): void {
        let edgeIndex = 0;
        let startX = chunk.position.x - chunk.bounds.width;
        let startY = chunk.position.y - chunk.bounds.height;
        let stepX = chunk.bounds.width;
        let stepY = chunk.bounds.height;
        let currentY = startY;
        // all active map is chunk matrix 3x3, so current chunk has 8 neighbors and 9th is the current chunk itself
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                // if current chunk already 'know' about this neighbor
                if (chunk.edges[edgeIndex]) {
                    currentY += stepY;
                    edgeIndex++;
                    continue;
                }
                chunk.edges[edgeIndex] = null;
                // searching for neighbor in position (startX, currentY)
                for (let chunkIndex = 0, len = this.renderableChunkList.length; chunkIndex < len; chunkIndex++) {
                    const renderableChunk = this.renderableChunkList[chunkIndex];

                    // ignore current chunk
                    if (chunk === renderableChunk) {
                        continue;
                    }

                    if (renderableChunk.bounds.contains(startX, currentY)) {
                        chunk.edges[edgeIndex] = renderableChunk;
                        break;
                    }
                }
                // move down in matrix
                currentY += stepY;
                edgeIndex++;
            }
            // move right in matrix and go to top
            startX += stepX;
            currentY = startY;
        }
    }

    // create all missing neighbor chunks
    private createNeighbors(chunk: IChunk, renderable: boolean): void {
        let edgeIndex = 0;
        let startX = chunk.position.x - chunk.bounds.width;
        let startY = chunk.position.y - chunk.bounds.height;
        let stepX = chunk.bounds.width;
        let stepY = chunk.bounds.height;
        let currentY = startY;
        // matrix 3x3 loop
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                // if chunk on current position does not exists - create it!
                if (!chunk.edges[edgeIndex] && !chunk.bounds.contains(startX, currentY)) {
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

    // Create a piece of map in x,y
    private createChunk(x: number, y: number): IChunk {
        // new chunk object
        const chunk: IChunk = {
            position: new Point(x,y),
            bounds: null,
            renderable: false,
            edges: [],
            blockerGroup: this.scene.add.group(),
            landGroup: this.scene.add.group(),
        };
        // size of a tile equals size of a chunk
        const tileSize = this.chunkSize * this.cellSize;
        // create land
        let land = this.scene.add.tileSprite(x, y, tileSize, tileSize, 'ground');
        land.setOrigin(0.5,0.5);
        this.landLayer.add(land);
        chunk.landGroup.add(land);
        // create blockers: going through each cell of chunk
        for (let xIndex = 0; xIndex < this.chunkSize; xIndex++) {
            for (let yIndex = 0; yIndex < this.chunkSize; yIndex++) {
                // probability of creation of a new block
                const probability = Phaser.Math.Between(0, 100);
                // position of a new block
                const localX = xIndex * this.cellSize + x;
                const localY = yIndex * this.cellSize + y;
                let blocker: Blocker;
                if (probability > 95) {
                    blocker = new Blocker(this.scene, 'wall',0, true);
                } else if (probability > 90) {
                    blocker = new Blocker(this.scene, 'hay', 100, false);
                }
                if (blocker) {
                    // make blocker squareble, set it position and register in all lists
                    blocker.displayHeight = blocker.displayWidth = this.cellSize;
                    blocker.setPosition(localX, localY);
                    this.blockerLayer.add(blocker);
                    this.blockers.push(blocker);
                    chunk.blockerGroup.add(blocker);
                }
            }
        }

        this.chunkList.push(chunk);
        chunk.bounds = land.getBounds();

        return chunk;
    }

    // release memory from old chunks
    private unloadChunk(chunk: IChunk): void {
        // remove chunk from active list
        const index = this.renderableChunkList.indexOf(chunk);
        if (index >= 0) {
            this.renderableChunkList.splice(index, 1);
        }
        chunk.renderable = false;

        const lands = chunk.landGroup.getChildren();
        const blockers = chunk.blockerGroup.getChildren();

        // remove all chunk land tiles from land layer
        lands.forEach((land) => {
            this.landLayer.remove(land);
        });

        // remove all chunk blockers from blocker layer
        blockers.forEach((blocker) => {
            this.blockerLayer.remove(blocker);
        });

        // remove chunk blocker from global blockers list
        const startIndex = this.blockers.indexOf(chunk.blockerGroup.getFirst(true));
        this.blockers.splice(startIndex, blockers.length);

        // destroy all lands and blockers...
        chunk.landGroup.clear(true, true);
        chunk.blockerGroup.clear(true, true);
    }
}