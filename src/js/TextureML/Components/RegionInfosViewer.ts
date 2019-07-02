import { ImageInfo } from "../Types/ImageInfo"
import { RegionInfo } from "../Types/RegionInfo"
import { TextureID } from "../Types/TextureID"

// RegionInfosViewer
export class RegionInfosViewer {
    // parent
    private parent: HTMLDivElement = null;
    // base lists
    private textureIDList: Array<TextureID> = null
    private imageInfoList: Array<ImageInfo> = null;
    // constructor
    constructor(parent: HTMLDivElement, textureIDList: Array<TextureID>, imageInfoList: Array<ImageInfo>) {
        // parent
        this.parent = parent;
        // base lists
        this.textureIDList = textureIDList;
        this.imageInfoList = imageInfoList;
    }
}