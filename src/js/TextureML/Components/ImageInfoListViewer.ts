import { ImageInfo } from "../Types/ImageInfo"

// ImageInfoListViewer
export class ImageInfoListViewer {
    // parent
    private parent: HTMLDivElement = null;
    private imageInfoList: Array<ImageInfo> = null;

    // constructor 
    constructor(parent: HTMLDivElement, imageInfoList: Array<ImageInfo>) {
        // set image info list
        this.imageInfoList = imageInfoList;
    }
}