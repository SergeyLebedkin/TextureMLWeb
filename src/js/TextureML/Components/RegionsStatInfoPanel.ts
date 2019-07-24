import { ImageInfo } from "../Types/ImageInfo"
import { TextureID } from "../Types/TextureID"

export const REGION_MIN_AREA_CRITERIA: number = 1000;

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
        this.infoCanvas.width = 200;
        this.infoCanvas.height = this.values.size * 16 + 10;
        this.infoCanvasCtx.globalAlpha = 0.2;
        this.infoCanvasCtx.fillStyle = "white";
        this.infoCanvasCtx.fillRect(0, 0, this.infoCanvas.width, this.infoCanvas.height);
        this.infoCanvasCtx.globalAlpha = 1.0;
        let index = this.values.size - 1;
        this.values.forEach((val, id) => {
            let y = index * 16 + 8;
            let x = Math.min((val / REGION_MIN_AREA_CRITERIA), 1) * this.infoCanvas.width;
            let color = this.textureIDList.find(textureID => textureID.ID === id).color
            //this.values.values[index]
            //this.values.keys[index]
            this.infoCanvasCtx.strokeStyle = color;
            this.infoCanvasCtx.fillStyle = color;
            this.infoCanvasCtx.lineWidth = 12;
            this.infoCanvasCtx.beginPath();
            this.infoCanvasCtx.moveTo(this.infoCanvas.width, y);
            this.infoCanvasCtx.lineTo(this.infoCanvas.width - x, y);
            this.infoCanvasCtx.stroke();
            index--;
        });
        this.infoCanvasCtx.fillStyle = "white";
        this.infoCanvasCtx.strokeStyle = "white";
        this.infoCanvasCtx.font = "10px Arial";
        this.infoCanvasCtx.fillText("Texture Area Requirements", 0, this.infoCanvas.height - 2);
    }

    // checkRequirement
    public checkRequirement(): boolean {
        let ok = this.values.size > 0;
        this.values.forEach((val, id) => { if (val < REGION_MIN_AREA_CRITERIA) ok = false });
        return ok;
    }
}