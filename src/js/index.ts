import { ImageInfo } from "./TextureML/Types/ImageInfo";
import { TextureID } from "./TextureML/Types/TextureID";
import { SessionInfo } from "./TextureML/Types/SessionInfo";
import { ImageInfoEditor } from "./TextureML/Components/ImageInfoEditor";
import { ColorMapType } from "./TextureML/Types/ColorMapType";
import { SelectionMode } from "./TextureML/Types/SelectionMode";
import { RegionInfo } from "./TextureML/Types/RegionInfo";
import { TextureIDListView } from "./TextureML/Components/TextureIDListViewer";
import { ImageInfoListViewer } from "./TextureML/Components/ImageInfoListViewer";
import { RegionInfosViewer } from "./TextureML/Components/RegionInfosViewer";
import { CurvePoint } from "./TextureML/Types/CurvePoint";
import { setTimeout } from "timers";

// get elements - left panel
let divImageInfoPanel: HTMLDivElement = null;
let divImageInfoPreviewPanel: HTMLDivElement = null;
let inputUsername: HTMLInputElement = null;
let inputSessionID: HTMLInputElement = null;
let inputDescription: HTMLInputElement = null;
let buttonLoadImages: HTMLButtonElement = null;
let inputLoadImages: HTMLInputElement = null;
let selectImageNumber: HTMLSelectElement = null;
let radioGrayScale: HTMLInputElement = null;
let radioColorMapJet: HTMLInputElement = null;
let radioEdit: HTMLInputElement = null;
let radioPreview: HTMLInputElement = null;
let radioSelectionModeAdd: HTMLInputElement = null;
let radioSelectionModeRemove: HTMLInputElement = null;
let divTextureIDListContainer: HTMLDivElement = null;
let buttonAddTextureID: HTMLInputElement = null;
let buttonSubmit: HTMLButtonElement = null;
let buttonSave: HTMLButtonElement = null;
let aStatus: HTMLElement = null;
// get elements - center panel
let labelScaleFactor: HTMLLabelElement = null;
let buttonScaleDown: HTMLButtonElement = null;
let buttonScaleUp: HTMLButtonElement = null;
// get elements - right panel
let divRegionInfosListViewer: HTMLDivElement = null;

// globals
let gImageInfoList: Array<ImageInfo> = null;
let gTextureIDList: Array<TextureID> = null;
let gSessionInfo: SessionInfo = null;
let gCurrentGeneration: number = 0;

// components
let gImageInfoEditor: ImageInfoEditor = null;
let gImageInfoListViewer: ImageInfoListViewer = null;
let gTextureIDListView: TextureIDListView = null;
let gRegionInfosViewer: RegionInfosViewer = null;

// setCurrentImageInfo
function setCurrentImageInfo(imageInfo: ImageInfo) {
    gImageInfoEditor.setImageInfo(imageInfo);
    selectImageNumber.selectedIndex = gImageInfoList.findIndex(item => item === imageInfo);
    radioEdit.checked = true;
    radioEdit.onchange(null);
}

// selectImageNumberUpdate
function selectImageNumberUpdate() {
    // get selected index
    var selectedIndex = selectImageNumber.selectedIndex;
    // clear childs
    while (selectImageNumber.firstChild) { selectImageNumber.removeChild(selectImageNumber.firstChild); }
    // add items
    for (let imageInfo of gImageInfoList) {
        // create new selector
        let optionImageInfo = document.createElement('option') as HTMLOptionElement;
        optionImageInfo.value = imageInfo.fileRef.name;
        optionImageInfo.innerHTML = imageInfo.fileRef.name;
        selectImageNumber.appendChild(optionImageInfo);
    }
    // set selected index
    if ((selectedIndex < 0) && (gImageInfoList.length > 0)) selectedIndex = 0;
    selectImageNumber.selectedIndex = selectedIndex;
}

// buttonLoadImagesOnClick
function buttonLoadImagesOnClick(event: MouseEvent) {
    inputLoadImages.accept = ".png,.jpg";
    inputLoadImages.onchange = event => {
        let files: Array<File> = event.currentTarget["files"];
        for (let file of files) {
            let imageInfo = new ImageInfo();
            imageInfo.onloadImageFile = imageInfo => {
                // add image info
                gImageInfoList.push(imageInfo);
                selectImageNumberUpdate();
                if (gImageInfoEditor.imageInfo === null)
                    gImageInfoEditor.setImageInfo(imageInfo);
            }
            imageInfo.loadImageFromFile(file);
        }
    }
    inputLoadImages.click();
}

// selectImageNumberOnChange
function selectImageNumberOnChange(event) {
    gImageInfoEditor.setImageInfo(gImageInfoList[selectImageNumber.selectedIndex]);
}

// radioGrayScaleOnChange
function radioGrayScaleOnChange(event) {
    gImageInfoEditor.setColorMapType(ColorMapType.GRAY_SCALE);
    gImageInfoListViewer.setColorMapType(ColorMapType.GRAY_SCALE);
    gRegionInfosViewer.setColorMapType(ColorMapType.GRAY_SCALE);
};

// radioColorMapJetOnChange
function radioColorMapJetOnChange(event) {
    gImageInfoEditor.setColorMapType(ColorMapType.JET);
    gImageInfoListViewer.setColorMapType(ColorMapType.JET);
    gRegionInfosViewer.setColorMapType(ColorMapType.JET);
};

// radioEditOnChange
function radioEditOnChange(event) {
    divImageInfoPanel.style.display = "block";
    divImageInfoPreviewPanel.style.display = "none";
    gImageInfoEditor.drawImageInfo();
}

// radioPreviewOnChange
function radioPreviewOnChange(event) {
    divImageInfoPanel.style.display = "none";
    divImageInfoPreviewPanel.style.display = "flex";
    gImageInfoListViewer.update();
}

// buttonAddTextureIDOnClick
function buttonAddTextureIDOnClick(event) {
    let id = nextChar(gTextureIDList[gTextureIDList.length - 1].ID);
    let color = generateRandomColor();
    gTextureIDList.push(new TextureID(id, color));
    gTextureIDListView.update();
    gRegionInfosViewer.update();
}

// buttonSubmitOnClick
function buttonSubmitOnClick(event) {
    if (gImageInfoEditor.imageInfo) {
        let timeoutServerWait = setTimeout(() => {
            aStatus.style.color = "red";
            aStatus.innerText = "Server timeout...";
            buttonSubmit.disabled = false;
        }, 1000*5*60);
        aStatus.style.color = "blue";
        aStatus.innerText = "Post SessionID...";
        buttonSubmit.disabled = true;
        gSessionInfo.postSession()
            .then(value => {
                aStatus.style.color = "blue";
                aStatus.innerText = "Post Images...";
                return gSessionInfo.postImages(gImageInfoList);
            }, reason => {
                aStatus.style.color = "red";
                aStatus.innerText = "Server error... (" + reason + ")";
                buttonSubmit.disabled = false;
                clearTimeout(timeoutServerWait);
                return Promise.reject(reason);
            })
            .then(value => {
                aStatus.style.color = "blue";
                aStatus.innerText = "Working...";
                return gSessionInfo.postRegions(gImageInfoList)
            }, reason => {
                aStatus.style.color = "red";
                aStatus.innerText = "Server error... (" + reason + ")";
                buttonSubmit.disabled = false;
                clearTimeout(timeoutServerWait);
                return Promise.reject(reason);
            })
            .then(value => {
                parceRegionsResponse(value);
                buttonSave.disabled = false;
                gCurrentGeneration++;
                gImageInfoEditor.setPermitOverlapping(true);
                gImageInfoEditor.setGeneration(gCurrentGeneration);
                gImageInfoEditor.drawImageInfo();
                gRegionInfosViewer.update()
                aStatus.style.color = "green";
                aStatus.innerText = "OK"
                buttonSubmit.disabled = false;
                clearTimeout(timeoutServerWait);
            }, reason => {
                aStatus.style.color = "red";
                aStatus.innerText = "Server error... (" + reason + ")";
                buttonSubmit.disabled = false;
                clearTimeout(timeoutServerWait);
            });
    }
}

// buttonSaveOnClick
function buttonSaveOnClick(event: MouseEvent) {
    var regionsString = '';
    for (let imageInfo of gImageInfoList) {
        for (let regionInfo of imageInfo.regionsLoaded) {
            regionsString +=
                imageInfo.fileRef.name + ", " +
                regionInfo.x + ", " +
                regionInfo.y + ", " +
                "1, " +
                (regionInfo.x + regionInfo.w) + ", " +
                (regionInfo.y + regionInfo.h) + ", " +
                "1, " +
                regionInfo.ID + ", " +
                gTextureIDList.find(textureID => textureID.ID === regionInfo.ID).name + "\r\n";
            ;
        }
    }
    // download file
    downloadFile(regionsString, 'regions.txt', 'text/plain');
}

// buttonScaleDownOnClick
function buttonScaleDownOnClick(event: MouseEvent) {
    gImageInfoEditor.setScale(gImageInfoEditor.scale / 2);
    gImageInfoListViewer.setScale(gImageInfoListViewer.scale / 2);
    labelScaleFactor.innerText = Math.round(gImageInfoEditor.scale * 100) + "%";
}

// buttonScaleUpOnClick
function buttonScaleUpOnClick(event: MouseEvent) {
    gImageInfoEditor.setScale(gImageInfoEditor.scale * 2);
    gImageInfoListViewer.setScale(gImageInfoListViewer.scale * 2);
    labelScaleFactor.innerText = Math.round(gImageInfoEditor.scale * 100) + "%";
}

// window.onload
window.onload = event => {
    // get elements - left panel
    divImageInfoPanel = document.getElementById("image_canvas_panel") as HTMLDivElement;
    divImageInfoPreviewPanel = document.getElementById("image_preview_canvas_panel") as HTMLDivElement;
    inputUsername = document.getElementById("inputUsername") as HTMLInputElement;
    inputSessionID = document.getElementById("inputSessionID") as HTMLInputElement;
    inputDescription = document.getElementById("inputDescription") as HTMLInputElement;
    buttonLoadImages = document.getElementById("buttonLoadImages") as HTMLButtonElement;
    inputLoadImages = document.getElementById("inputLoadImages") as HTMLInputElement;
    selectImageNumber = document.getElementById("selectImageNumber") as HTMLSelectElement;
    radioGrayScale = document.getElementById("radioGrayScale") as HTMLInputElement;
    radioColorMapJet = document.getElementById("radioColorMapJet") as HTMLInputElement;
    radioEdit = document.getElementById("radioEdit") as HTMLInputElement;
    radioPreview = document.getElementById("radioPreview") as HTMLInputElement;
    radioSelectionModeAdd = document.getElementById("radioSelectionModeAdd") as HTMLInputElement;
    radioSelectionModeRemove = document.getElementById("radioSelectionModeRemove") as HTMLInputElement;
    divTextureIDListContainer = document.getElementById("divTextureIDListContainer") as HTMLDivElement;
    buttonAddTextureID = document.getElementById("buttonAddTextureID") as HTMLInputElement;
    buttonSubmit = document.getElementById("buttonSubmit") as HTMLButtonElement;
    buttonSave = document.getElementById("buttonSave") as HTMLButtonElement;
    aStatus = document.getElementById("aStatus") as HTMLElement;
    // get elements - center panel
    labelScaleFactor = document.getElementById("labelScaleFactor") as HTMLLabelElement;
    buttonScaleDown = document.getElementById("buttonScaleDown") as HTMLButtonElement;
    buttonScaleUp = document.getElementById("buttonScaleUp") as HTMLButtonElement;
    // get elements - right panel
    divRegionInfosListViewer = document.getElementById("region_preview") as HTMLDivElement;

    // create global objects
    gImageInfoList = new Array<ImageInfo>();
    gTextureIDList = [
        new TextureID("A", "blue"), new TextureID("B", "red"), new TextureID("C", "green"), new TextureID("D", "orange"),
        new TextureID("E", "#B0187B"), new TextureID("F", "#8B7DA3"), new TextureID("G", "#A545BB"), new TextureID("H", "#C7A248"),
        new TextureID("I", "#39F992"), new TextureID("J", "#324CF7"), new TextureID("K", "#D04D5E"), new TextureID("L", "#1E88E6"),
        new TextureID("M", "#92BFB3"), new TextureID("N", "#858D1A"), new TextureID("O", "#92E877"), new TextureID("P", "#1FDFD9"),
        new TextureID("Q", "#DD7488"), new TextureID("R", "#9DACBB"), new TextureID("S", "#934591"), new TextureID("T", "#FC9AA4"),
    ];
    gSessionInfo = new SessionInfo();
    gSessionInfo.sessionID = Math.random().toString(36).slice(2);

    // create image info editor
    gImageInfoEditor = new ImageInfoEditor(divImageInfoPanel);
    gImageInfoEditor.onchangedImageInfo = imageInfo => { gRegionInfosViewer.update(); buttonSave.disabled = true; }
    gImageInfoEditor.setTextureID(gTextureIDList[0]);
    // create image info list viewer
    gImageInfoListViewer = new ImageInfoListViewer(divImageInfoPreviewPanel, gImageInfoList);
    gImageInfoListViewer.onclickImageInfo = imageInfo => setCurrentImageInfo(imageInfo);
    divImageInfoPreviewPanel.style.display = "none";
    // create texture ID list viewer
    gTextureIDListView = new TextureIDListView(divTextureIDListContainer, gTextureIDList);
    gTextureIDListView.onchangedTextureID = textureID => gImageInfoEditor.setTextureID(textureID);
    gTextureIDListView.onchangedDescription = textureID => gRegionInfosViewer.update();
    // create region infos viewer
    gRegionInfosViewer = new RegionInfosViewer(divRegionInfosListViewer, gTextureIDList, gImageInfoList);
    gRegionInfosViewer.onclickImageInfo = imageInfo => setCurrentImageInfo(imageInfo);
    gRegionInfosViewer.update();

    // init session
    inputSessionID.value = gSessionInfo.sessionID;

    // left panel events
    buttonLoadImages.onclick = event => buttonLoadImagesOnClick(event);
    selectImageNumber.onchange = event => selectImageNumberOnChange(event);
    radioGrayScale.onchange = event => radioGrayScaleOnChange(event);
    radioColorMapJet.onchange = event => radioColorMapJetOnChange(event);
    radioEdit.onchange = event => radioEditOnChange(event);
    radioPreview.onchange = event => radioPreviewOnChange(event);
    radioSelectionModeAdd.onchange = event => gImageInfoEditor.setSelectionMode(SelectionMode.ADD);
    radioSelectionModeRemove.onchange = event => gImageInfoEditor.setSelectionMode(SelectionMode.REMOVE);
    buttonAddTextureID.onclick = event => buttonAddTextureIDOnClick(event);
    buttonSubmit.onclick = event => buttonSubmitOnClick(event);
    buttonSave.onclick = event => buttonSaveOnClick(event);
    // center panel events
    divImageInfoPanel.onmouseup = event => gImageInfoEditor.onMouseUp(event);
    divImageInfoPanel.onmousemove = event => gImageInfoEditor.onMouseMove(event);
    divImageInfoPanel.onmousedown = event => gImageInfoEditor.onMouseDown(event);
    inputUsername.oninput = event => gSessionInfo.username = inputUsername.value;
    inputDescription.oninput = event => gSessionInfo.description = inputDescription.value;
    buttonScaleDown.onclick = event => buttonScaleDownOnClick(event);
    buttonScaleUp.onclick = event => buttonScaleUpOnClick(event);
}

// parceRegionsResponse
function parceRegionsResponse(response: string): void {
    let data = JSON.parse(response);
    // check for saccess
    if (data["success"]) {
        // cleare all curves
        gImageInfoList.forEach(ImageInfo => ImageInfo.curves.forEach(curve => curve.points = []));
        gImageInfoList.forEach(ImageInfo => ImageInfo.regionsLoaded = []);
        gImageInfoList.forEach(ImageInfo => ImageInfo.regionsPreview = []);
        // get results
        let eval_results = data["eval_results"];
        if (eval_results) {
            // get main nodes
            let basenames = eval_results["basename"];
            let cropnames = eval_results["cropname"];
            let emb0s = eval_results["emb0"];
            let emb1s = eval_results["emb1"];
            let emb2s = eval_results["emb2"];
            let ids = eval_results["id"];
            let labels = eval_results["label"];
            let pixel_starts = eval_results["pixel_start"];
            let pixel_ends = eval_results["pixel_end"];
            for (let basename in basenames) {
                let imageInfo: ImageInfo = gImageInfoList.find(imageInfo => imageInfo.baseName == basenames[basename]);
                let textureID: TextureID = gTextureIDList.find(textureID => textureID.ID == labels[basename]);
                //let textureID: TextureID = gTextureIDList[labels[basename]];
                if (imageInfo) {
                    let emb0: number = emb0s[basename];
                    let emb1: number = emb1s[basename];
                    let emb2: number = emb2s[basename];
                    let pixel_start: number = pixel_starts[basename];
                    let pixel_end: number = pixel_ends[basename];
                    imageInfo.curves[0].color = "blue";
                    imageInfo.curves[1].color = "red";
                    imageInfo.curves[2].color = "green";
                    imageInfo.curves[0].points.push(new CurvePoint(emb0, (pixel_end + pixel_start) / 2));
                    imageInfo.curves[1].points.push(new CurvePoint(emb1, (pixel_end + pixel_start) / 2));
                    imageInfo.curves[2].points.push(new CurvePoint(emb2, (pixel_end + pixel_start) / 2));
                    imageInfo.regionsLoaded.push(new RegionInfo(0, pixel_start, imageInfo.canvasImage.width, pixel_end - pixel_start, textureID.ID, textureID.color));
                }
            }
        }
        let texture_preview = data["texture_preview"];
        if (texture_preview) {
            // get main nodes
            let basenames = texture_preview["basename"];
            let labels = texture_preview["label"];
            let pixel_starts = texture_preview["pixel_start"];
            let pixel_ends = texture_preview["pixel_end"];
            for (let basename in basenames) {
                let imageInfo: ImageInfo = gImageInfoList.find(imageInfo => imageInfo.baseName == basenames[basename]);
                let textureID: TextureID = gTextureIDList.find(textureID => textureID.ID == labels[basename]);
                //let textureID: TextureID = gTextureIDList[labels[basename]];
                if (imageInfo) {
                    let pixel_start: number = pixel_starts[basename];
                    let pixel_end: number = pixel_ends[basename];
                    imageInfo.regionsPreview.push(new RegionInfo(0, pixel_start, imageInfo.canvasImage.width, pixel_end - pixel_start, textureID.ID, textureID.color));
                }
            }
        }
    }
}

// generate random color
function generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}

// next char
function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

//  downloadFile
function downloadFile(text: string, name: string, type: string) {
    let a = document.createElement("a");
    let file = new Blob([text], { type: type });
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}
