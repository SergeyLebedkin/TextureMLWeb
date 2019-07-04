import { ImageInfo } from "../Types/ImageInfo"
import { RegionInfo } from "../Types/RegionInfo"
import { TextureID } from "../Types/TextureID"
import { ColorMapType } from "../Types/ColorMapType";
import { RegionInfoSource } from "../Types/RegionInfoSource";

// RegionInfosViewer
export class RegionInfosViewer {
    // parent
    private parent: HTMLDivElement = null;
    // base lists
    private textureIDList: Array<TextureID> = null
    private imageInfoList: Array<ImageInfo> = null;
    // color map type
    private colorMapType: ColorMapType = ColorMapType.GRAY_SCALE;
    // region info source
    private regionInfoSource: RegionInfoSource = RegionInfoSource.MANUAL;
    // texture id
    private textureID: TextureID = null;
    // events
    public onclickImageInfo: (this: RegionInfosViewer, imageInfo: ImageInfo) => any = null;
    // constructor
    constructor(parent: HTMLDivElement, textureIDList: Array<TextureID>, imageInfoList: Array<ImageInfo>) {
        // parent
        this.parent = parent;
        // base lists
        this.textureIDList = textureIDList;
        this.imageInfoList = imageInfoList;
        // region info source
        this.regionInfoSource = RegionInfoSource.MANUAL;
        // color map type
        this.colorMapType = ColorMapType.GRAY_SCALE;
        // texture id
        this.textureID = null;
    }

    // setColorMapType
    public setColorMapType(colorMapType: ColorMapType): void {
        this.colorMapType = colorMapType;
        this.update();
    }

    // setRegionInfoSource
    public setRegionInfoSource(regionInfoSource: RegionInfoSource): void {
        this.regionInfoSource = regionInfoSource;
        this.update();
    }

    // setTextureID
    public setTextureID(textureID: TextureID): void {
        this.textureID = textureID;
        this.update();
    }

    // drawRegions
    public update(): void {
        // just clear
        while (this.parent.firstChild)
            this.parent.removeChild(this.parent.firstChild);

        // check for null
        if (this.textureID === null)
            return;

        // this is temporary solution. There will be previews
        for (let imageInfo of this.imageInfoList) {
            let regionInfoCount = 0;
            // add manual regions
            if (this.regionInfoSource === RegionInfoSource.MANUAL) {
                for (let regionInfo of imageInfo.regionsManual) {
                    if (regionInfo.ID === this.textureID.ID) {
                        this.appendRegionInfoItem(imageInfo, regionInfo);
                        regionInfoCount++;
                    }
                }
            }
            // add loaded regions
            if (this.regionInfoSource === RegionInfoSource.LOADED) {
                for (let regionInfo of imageInfo.regionsLoaded) {
                    if (regionInfo.ID === this.textureID.ID) {
                        this.appendRegionInfoItem(imageInfo, regionInfo);
                        regionInfoCount++;
                    }
                }
            }
            // add separation line
            if (regionInfoCount > 0) {
                let hr = document.createElement("hr");
                hr.style.width = "100%";
                this.parent.appendChild(hr);
            }
        }
    }

    // addRegionInfoItem
    private appendRegionInfoItem(imageInfo: ImageInfo, regionInfo: RegionInfo): void {
        // add div
        let div = document.createElement('div');
        div.style.display = "flex";
        div.style.flexDirection = "column";
        div.style.padding = "5px";

        // add label
        let filaNameLabel = document.createElement('a');
        filaNameLabel.innerText = imageInfo.fileRef.name;
        filaNameLabel.style.fontSize = "16px";
        div.appendChild(filaNameLabel);

        // get ratio
        let ratio = regionInfo.w / regionInfo.h;
        let canvas_width = Math.min(regionInfo.w, 256);
        let canvas_height = canvas_width / ratio;

        // create div canvas
        var divCanvas = document.createElement('div');
        divCanvas.style.textAlign = "center";

        // create canvas
        var canvas = document.createElement('canvas');
        canvas.width = canvas_width;
        canvas.height = canvas_height;
        canvas.style.cursor = "pointer";
        canvas.style.border = "3px solid " + regionInfo.color;
        canvas["imageInfo"] = imageInfo;
        canvas.onclick = (event) => {
            if (this.onclickImageInfo)
                this.onclickImageInfo(event.target["imageInfo"]);
        };

        // get context and draw original image
        var ctx = canvas.getContext('2d');
        // draw region original
        if (this.colorMapType === ColorMapType.GRAY_SCALE)
            ctx.drawImage(imageInfo.canvasImage,
                regionInfo.x, regionInfo.y, regionInfo.w, regionInfo.h,
                0, 0, canvas.width, canvas.height);
        // draw region jet
        if (this.colorMapType === ColorMapType.JET)
            ctx.drawImage(imageInfo.canvasImageJet,
                regionInfo.x, regionInfo.y, regionInfo.w, regionInfo.h,
                0, 0, canvas.width, canvas.height);

        divCanvas.appendChild(canvas);
        div.appendChild(divCanvas);

        // append new canvas
        this.parent.appendChild(div);
    }
}