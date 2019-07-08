import { ImageInfo } from "./ImageInfo";

// base URL
export const URL = "http://localhost:8082";

// SessionInfo
export class SessionInfo {
    // fields
    public username: string = "";
    public sessionID: string = "";
    public description: string = "";
    // constructor
    constructor() {
        this.username = "";
        this.sessionID = "";
        this.description = "";
    }

    // postSession
    public postSession(): void {
        let xhr = new XMLHttpRequest();
        let url = URL + "/post_session_id";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = event => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                console.log("Post Session ID: " + xhr.responseText);
            }
        };
        // generate request data
        let data = JSON.stringify({
            "session_id": this.sessionID
        });
        xhr.send(data);
    }

    // postImages
    public postImages(imageInfos: Array<ImageInfo>): void {
        for (let imageInfo of imageInfos) {
            let xhr = new XMLHttpRequest();
            let url = URL + "/post_image";
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = event => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let response = JSON.parse(xhr.responseText);
                    console.log("Post Image: " + xhr.responseText);
                }
            }
            // generate request data
            let data = JSON.stringify({
                "session_id": this.sessionID,
                "imagename": imageInfo.fileRef.name,
                "image": imageInfo.canvasImage.toDataURL().replace("data:image/png;base64,", "")
            });
            xhr.send(data);
        }
    }

    // postRegions
    public postRegions(imageInfos: Array<ImageInfo>): void {
        let xhr = new XMLHttpRequest();
        let url = URL + "/post_regions";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = event => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                console.log("Post Regions: " + xhr.responseText);
            }
        }
        let dataJSON = {
            session_id: this.sessionID,
            regions: {}
        };
        imageInfos.forEach(imageInfo => dataJSON.regions[imageInfo.fileRef.name] = imageInfo.regionsManual.map(region => region.asJSON()))
        let data = JSON.stringify(dataJSON);
        xhr.send(data);
        console.log("postRegions: " + data);
    }
}