import { ImageInfo } from "../Types/ImageInfo"
import { RegionInfo } from "../Types/RegionInfo"
import { TextureID } from "../Types/TextureID"
import { ColorMapType } from "../Types/ColorMapType";

// RegionInfosViewer
export class RegionInfosViewer {
    // parent
    private parent: HTMLDivElement = null;
    // base lists
    private textureIDList: Array<TextureID> = null
    private imageInfoList: Array<ImageInfo> = null;
    // color map type
    private colorMapType: ColorMapType = ColorMapType.GRAY_SCALE;
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
            for (let regionInfo of imageInfo.regionsManual) {
                if (regionInfo.ID === this.textureID.ID) {
                    this.appendRegionInfoItem(imageInfo, regionInfo, " (manual)");
                    regionInfoCount++;
                }
            }
            // add loaded regions
            for (let regionInfo of imageInfo.regionsLoaded) {
                if (regionInfo.ID === this.textureID.ID) {
                    this.appendRegionInfoItem(imageInfo, regionInfo, " (generated)");
                    regionInfoCount++;
                }
            }

            // add separation line
            if (regionInfoCount > 0) {
                let hr = document.createElement("hr");
                hr.style.width = "90%";
                this.parent.appendChild(hr);
            }
        }
    }

    // addRegionInfoItem
    private appendRegionInfoItem(imageInfo: ImageInfo, regionInfo: RegionInfo, comment: string): void {
        // add div
        let div = document.createElement('div');
        div.style.display = "flex";
        div.style.flexDirection = "column";
        div.style.padding = "5px";

        // add label
        let filaNameLabel = document.createElement('a');
        filaNameLabel.innerText = imageInfo.fileRef.name + comment;
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