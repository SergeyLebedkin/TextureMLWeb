import { ImageInfo } from "../Types/ImageInfo"
import { RegionInfo } from "../Types/RegionInfo"
import { TextureID } from "../Types/TextureID"
import { SelectionMode } from "../Types/SelectionMode"
import { ColorMapType } from "../Types/ColorMapType"

// ImageInfoEditor
export class ImageInfoEditor {
    // parent
    private parent: HTMLDivElement = null;
    // main canvas
    private imageCanvas: HTMLCanvasElement = null;
    private imageCanvasCtx: CanvasRenderingContext2D = null;
    // div gap
    private gapElement: HTMLElement = null;
    // curves canvas
    private curvesCanvas: HTMLCanvasElement = null;
    private curvesCanvasCtx: CanvasRenderingContext2D = null;
    // image info
    public imageInfo: ImageInfo = null;
    public textureID: TextureID = null;
    // scale
    public scale: number = 1.0;
    // selection
    private selectionStarted: boolean = false;
    private selectionMode: SelectionMode = SelectionMode.ADD;
    private selectionRegionInfo: RegionInfo = null;
    // color map type
    private colorMapType: ColorMapType = ColorMapType.GRAY_SCALE;
    // current generation
    private generation: number = 0;
    // permit overlapping
    private permitOverlapping: boolean = false;
    // events
    public onchangedImageInfo: (this: ImageInfoEditor, imageInfo: ImageInfo) => any = null;

    // constructor
    constructor(parent: HTMLDivElement) {
        // parent
        this.parent = parent;
        // create image canvas
        this.imageCanvas = document.createElement("canvas");
        this.imageCanvas.style.border = "1px solid orange";
        this.imageCanvasCtx = this.imageCanvas.getContext('2d');
        this.parent.appendChild(this.imageCanvas);
        // create gap
        this.gapElement = document.createElement("canvas");
        this.gapElement.style.width = "15px";
        this.gapElement.style.height = "15px";
        this.parent.appendChild(this.gapElement);
        // create curves canvas
        this.curvesCanvas = document.createElement("canvas");
        this.curvesCanvas.style.border = "1px solid gray";
        this.curvesCanvasCtx = this.curvesCanvas.getContext('2d');
        this.parent.appendChild(this.curvesCanvas);
        // image info
        this.imageInfo = null;
        this.textureID = null;
        // scale
        this.scale = 1.0;
        // selection
        this.selectionStarted = false;
        this.selectionMode = SelectionMode.ADD;
        this.selectionRegionInfo = new RegionInfo();
        // color map type
        this.colorMapType = ColorMapType.GRAY_SCALE;
        // current generation
        this.generation = 0;
        // permit overlapping
        this.permitOverlapping = false;
    }

    // onMouseUp
    public onMouseUp(event: MouseEvent): void {
        // proceed selection
        if (this.selectionStarted) {
            // celection region normalize and scale
            this.selectionRegionInfo.normalize();
            this.selectionRegionInfo.scale(1.0 / this.scale);

            // add regions from list
            if (this.selectionMode === SelectionMode.ADD) {
                if (this.isRegionInfoInside(this.selectionRegionInfo)) {
                    // add new region info 
                    var regionInfo = new RegionInfo();
                    regionInfo.x = this.selectionRegionInfo.x;
                    regionInfo.y = this.selectionRegionInfo.y;
                    regionInfo.w = this.selectionRegionInfo.w;
                    regionInfo.h = this.selectionRegionInfo.h;
                    regionInfo.ID = this.selectionRegionInfo.ID;
                    regionInfo.color = this.selectionRegionInfo.color;
                    regionInfo.generation = this.generation;
                    regionInfo.trim(0, 0, this.imageInfo.canvasImage.width, this.imageInfo.canvasImage.height);

                    // check size restrictions for small images
                    if ((this.imageInfo.canvasImage.width < 200) &&
                        (this.imageInfo.canvasImage.height < 200)) {
                        if (!this.permitOverlapping)
                            this.removeRegionsInArea(this.selectionRegionInfo);
                        this.imageInfo.regionsManual.push(regionInfo);
                        if (this.onchangedImageInfo)
                            this.onchangedImageInfo(this.imageInfo);
                    }
                    else // check size restrictions for regular images
                        if ((regionInfo.w > 100) && (regionInfo.h > 200)) {
                            if (!this.permitOverlapping)
                                this.removeRegionsInArea(this.selectionRegionInfo);
                            this.imageInfo.regionsManual.push(regionInfo);
                            if (this.onchangedImageInfo)
                                this.onchangedImageInfo(this.imageInfo);
                        }
                        else {
                            if ((regionInfo.w <= 100) && (regionInfo.h <= 200)) {
                                window.alert("Region is too small")
                            } else if (regionInfo.w <= 100) {
                                window.alert("Width is too small")
                            } else if (regionInfo.h <= 200) {
                                window.alert("Height is too small")
                            }
                        }
                }
            };
            // remove regions from list
            if (this.selectionMode === SelectionMode.REMOVE) {
                this.removeRegionsInArea(this.selectionRegionInfo);
                if (this.onchangedImageInfo)
                    this.onchangedImageInfo(this.imageInfo);
            }
            // redraw all stuff
            this.drawImageInfo();
        }
        this.selectionStarted = false;
    }

    // onMouseMove
    public onMouseMove(event: MouseEvent): void {
        // update selection region info
        if (this.selectionStarted) {
            // get mouse coords
            var mouseCoords = getMousePosByElement(this.imageCanvas, event);
            // update selection region width and height
            this.selectionRegionInfo.w = mouseCoords.x - this.selectionRegionInfo.x;
            this.selectionRegionInfo.h = mouseCoords.y - this.selectionRegionInfo.y;
            // redraw stuff
            this.drawImageInfo();
            this.drawSelectionRegion();
        }
    }

    // onMouseDown
    public onMouseDown(event: MouseEvent): void {
        // set selection state and setup selection region if preview mod is MANUAL
        if (this.imageInfo !== null) {
            // get mouse coords
            let mouseCoords = getMousePosByElement(this.imageCanvas, event);
            // start selection
            this.selectionStarted = true;
            // check selection mode and set color
            if (this.selectionMode === SelectionMode.ADD) {
                if (this.textureID) {
                    this.selectionRegionInfo.ID = this.textureID.ID;
                    this.selectionRegionInfo.color = this.textureID.color;
                }
            } else if (this.selectionMode === SelectionMode.REMOVE) {
                this.selectionRegionInfo.color = "#FF0000";
            }
            // set base coords
            this.selectionRegionInfo.x = mouseCoords.x;
            this.selectionRegionInfo.y = mouseCoords.y;
            this.selectionRegionInfo.w = 0;
            this.selectionRegionInfo.h = 0;
        };
    }

    // is region info inside
    private isRegionInfoInside(regionInfo: RegionInfo): boolean {
        if (this.imageInfo != null)
            return regionInfo.checkIntersection(0, 0, this.imageInfo.canvasImage.width, this.imageInfo.canvasImage.height);
        return false;
    }

    // remove regions from list by other region
    private removeRegionsInArea(regionInfo: RegionInfo): void {
        regionInfo.normalize();
        // this is temporary solution. There will be previews
        for (let i = this.imageInfo.regionsManual.length - 1; i >= 0; i--) {
            let region = this.imageInfo.regionsManual[i];
            if (region.checkIntersectionRegion(regionInfo))
                this.imageInfo.regionsManual.splice(i, 1);
        }
    }

    // setColorMapType
    public setColorMapType(colorMapType: ColorMapType): void {
        this.colorMapType = colorMapType;
        this.drawImageInfo();
    }

    // setSelectionMode
    public setSelectionMode(selectionMode: SelectionMode): void {
        this.selectionMode = selectionMode;
        this.drawImageInfo();
    }

    // setTextureID
    public setTextureID(textureID: TextureID): void {
        if (this.textureID !== textureID)
            this.textureID = textureID;
    }

    // setImageInfo
    public setImageInfo(imageInfo: ImageInfo): void {
        if (this.imageInfo !== imageInfo) {
            this.imageInfo = imageInfo;
            this.drawImageInfo();
        }
    }

    // setScale
    public setScale(scale: number): void {
        if (this.scale !== scale) {
            this.scale = scale;
            this.drawImageInfo();
        }
    }

    // setGeneration
    public setGeneration(generation: number): void {
        if (this.generation !== generation) {
            this.generation = generation;
            this.drawImageInfo();
        }
    }

    // setGeneration
    public setPermitOverlapping(permitOverlapping: boolean): void {
        if (this.permitOverlapping !== permitOverlapping) {
            this.permitOverlapping = permitOverlapping;
            this.drawImageInfo();
        }
    }

    // drawSelectionRegion
    public drawSelectionRegion(): void {
        if (this.selectionStarted) {
            // check selection mode and set alpha
            if (this.selectionMode === SelectionMode.ADD) {
                this.imageCanvasCtx.globalAlpha = 0.8;
            } else if (this.selectionMode === SelectionMode.REMOVE) {
                this.imageCanvasCtx.globalAlpha = 0.85;
            }
            this.imageCanvasCtx.fillStyle = this.selectionRegionInfo.color;
            this.imageCanvasCtx.fillRect(this.selectionRegionInfo.x, this.selectionRegionInfo.y, this.selectionRegionInfo.w, this.selectionRegionInfo.h);
            this.imageCanvasCtx.globalAlpha = 1.0;
        }
    }

    // drawImageInfoRegions
    public drawImageInfoRegions(): void {
        // check for null
        if (this.imageInfo === null) return;
        // draw manual regions
        for (let region of this.imageInfo.regionsManual) {
            // skip old generations
            if (region.generation != this.generation) continue;
            this.imageCanvasCtx.globalAlpha = 0.5;
            this.imageCanvasCtx.fillStyle = region.color;
            this.imageCanvasCtx.fillRect(region.x * this.scale, region.y * this.scale, region.w * this.scale, region.h * this.scale);
            this.imageCanvasCtx.globalAlpha = 1.0;
        }
        // draw loaded regions
        for (let region of this.imageInfo.regionsLoaded) {
            this.imageCanvasCtx.globalAlpha = 0.5;
            this.imageCanvasCtx.fillStyle = region.color;
            this.imageCanvasCtx.fillRect(region.x * this.scale, region.y * this.scale, region.w * this.scale, region.h * this.scale);
            this.imageCanvasCtx.globalAlpha = 1.0;
        }
    }

    // drawImageInfo
    public drawImageInfo(): void {
        // check for null
        if (this.imageInfo === null) return;
        // resize canvas
        this.imageCanvas.width = this.imageInfo.canvasImage.width * this.scale;
        this.imageCanvas.height = this.imageInfo.canvasImage.height * this.scale;
        this.imageCanvasCtx.globalAlpha = 1.0;
        // draw image original
        if (this.colorMapType === ColorMapType.GRAY_SCALE)
            this.imageCanvasCtx.drawImage(this.imageInfo.canvasImage, 0, 0, this.imageCanvas.width, this.imageCanvas.height);
        // draw image jet
        if (this.colorMapType === ColorMapType.JET)
            this.imageCanvasCtx.drawImage(this.imageInfo.canvasImageJet, 0, 0, this.imageCanvas.width, this.imageCanvas.height);
        // draw image info regions
        this.drawImageInfoRegions();
        // draw curves
        this.drawCurves();
    }

    // drawCurves
    drawCurves() {
        if (this.imageInfo !== null) {
            // set curves parameters
            this.curvesCanvas.width = this.imageInfo.canvasImage.width * this.scale;
            this.curvesCanvas.height = this.imageInfo.canvasImage.height * this.scale;
            this.curvesCanvasCtx.fillStyle = "black";
            this.curvesCanvasCtx.fillRect(0, 0, this.curvesCanvas.width, this.curvesCanvas.height);

            // draw curves
            //for (var i = 0; i < this.imageInfo.curves.length; i++) {
            for (let curve of this.imageInfo.curves) {
                if (curve.points.length > 1) {
                    this.curvesCanvasCtx.lineWidth = 3;
                    this.curvesCanvasCtx.strokeStyle = curve.color;
                    this.curvesCanvasCtx.beginPath();
                    let x = curve.points[0].x * this.curvesCanvas.width;
                    let y = curve.points[0].y * this.scale;
                    this.curvesCanvasCtx.moveTo(x, y);
                    // move by points
                    for (var j = 1; j < curve.points.length; j++) {
                        let x = curve.points[j].x * this.curvesCanvas.width;
                        let y = curve.points[j].y * this.scale;
                        this.curvesCanvasCtx.lineTo(x, y);
                    }
                    this.curvesCanvasCtx.stroke();
                }
            }
        }
    }

}

// get mause position for element
function getMousePosByElement(node: HTMLElement, event: MouseEvent) {
    let rect = node.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}