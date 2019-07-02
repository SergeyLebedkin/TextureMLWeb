import { RegionInfo } from "./RegionInfo"
import { Curve } from "./Curve"

// ImageInfo
export class ImageInfo {
    // file reference
    public fileRef: File = null;
    // canvases
    public canvasImage: HTMLCanvasElement = null;
    public canvasJet: HTMLCanvasElement = null;
    // data
    public regionsManual: Array<RegionInfo> = [];
    public regionsLoaded: Array<RegionInfo> = [];
    public curves: Array<Curve> = [];
    // events
    public onloadImageFile: (this: ImageInfo, imageInfo: ImageInfo) => any = null;
    public onloadRegionsFile: (this: ImageInfo, imageInfo: ImageInfo) => any = null;
    public onloadCurvesFile: (this: ImageInfo, imageInfo: ImageInfo) => any = null;

    // constructor
    constructor() {
        // file reference
        this.fileRef = null;
        // canvases
        this.canvasImage = document.createElement("canvas");
        this.canvasJet = document.createElement("canvas");
        // data
        this.regionsManual = [];
        this.regionsLoaded = [];
        this.curves = [];
        // events
        this.onloadImageFile = null;
        this.onloadRegionsFile = null;
        this.onloadCurvesFile = null;
    }
}