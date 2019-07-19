import { ImageInfo } from "../Types/ImageInfo"
import { RegionInfo } from "../Types/RegionInfo"
import { TextureID } from "../Types/TextureID"
import { stringify } from "querystring";
import { deflateRaw } from "zlib";

// RegionsStatInfoPanel
export class RegionsStatInfoPanel {
    // parent
    private parent: HTMLDivElement = null;
    // base lists
    private textureIDList: Array<TextureID> = null
    private imageInfoList: Array<ImageInfo> = null;
    // base canvas
    private infoCanvas: HTMLCanvasElement = null;
    private infoCanvasCtx: CanvasRenderingContext2D = null;
    // values
    private values: Map<string, number>;
    // constructor
    constructor(parent: HTMLDivElement, textureIDList: Array<TextureID>, imageInfoList: Array<ImageInfo>) {
        // parent
        this.parent = parent;
        // create image canvas
        this.infoCanvas = document.createElement("canvas");
        this.infoCanvas.style.borderLeft = "1px solid gray";
        this.infoCanvas.style.borderRight = "1px solid gray";
        this.infoCanvasCtx = this.infoCanvas.getContext('2d');
        this.parent.appendChild(this.infoCanvas);
        // base lists
        this.textureIDList = textureIDList;
        this.imageInfoList = imageInfoList;
        // values
        this.values = new Map<string, number>();
    }

    // update
    public update(): void {
        // check for nulls
        if (!this.textureIDList) return;
        if (!this.imageInfoList) return;
        // regionsMap
        this.values.clear();
        for (let imageInfo of this.imageInfoList) {
            for (let regionInfo of imageInfo.regionsManual) {
                let height = 0;
                if (this.values.has(regionInfo.ID))
                    height = this.values.get(regionInfo.ID);
                this.values.set(regionInfo.ID, height + regionInfo.h);
            }
        }
        // redraw
        this.redraw();
    }

    // redraw
    public redraw(): void {
        // add info
        this.infoCanvas.width = 256;
        this.infoCanvas.height = this.values.size * 16;
        this.infoCanvasCtx.globalAlpha = 0.2;
        this.infoCanvasCtx.fillStyle = "white";
        this.infoCanvasCtx.fillRect(0, 0, this.infoCanvas.width, this.infoCanvas.height);
        this.infoCanvasCtx.globalAlpha = 1.0;
        let index = 0;
        this.values.forEach((val, id) => {
            let color = this.textureIDList.find(textureID => textureID.ID === id).color
            //this.values.values[index]
            //this.values.keys[index]
            this.infoCanvasCtx.strokeStyle  = color;
            this.infoCanvasCtx.fillStyle  = color;
            this.infoCanvasCtx.lineWidth = 6;
            this.infoCanvasCtx.beginPath();
            this.infoCanvasCtx.moveTo(0, index*16+8);
            this.infoCanvasCtx.lineTo(Math.min((val/2000), 1)*256, index*16+8);
            this.infoCanvasCtx.stroke();
            index++;
        });
    }
}