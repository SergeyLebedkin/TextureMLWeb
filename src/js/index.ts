import { ImageInfo } from "./TextureML/Types/ImageInfo";
import { TextureID } from "./TextureML/Types/TextureID";
import { SessionInfo } from "./TextureML/Types/SessionInfo";
import { ImageInfoEditor } from "./TextureML/Components/ImageInfoEditor";
import { ColorMapType } from "./TextureML/Types/ColorMapType";
import { RegionInfoSource } from "./TextureML/Types/RegionInfoSource";
import { SelectionMode } from "./TextureML/Types/SelectionMode";
import { RegionInfo } from "./TextureML/Types/RegionInfo";
import { TextureIDListView } from "./TextureML/Components/TextureIDListViewer";
import { ImageInfoListViewer } from "./TextureML/Components/ImageInfoListViewer";
import { RegionInfosViewer } from "./TextureML/Components/RegionInfosViewer";
import { rejects } from "assert";
import { CurvePoint } from "./TextureML/Types/CurvePoint";

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
let radioManual: HTMLInputElement = null;
let radioLoaded: HTMLInputElement = null;
let radioEdit: HTMLInputElement = null;
let radioPreview: HTMLInputElement = null;
let radioSelectionModeAdd: HTMLInputElement = null;
let radioSelectionModeRemove: HTMLInputElement = null;
let divTextureIDListContainer: HTMLDivElement = null;
let buttonAddTextureID: HTMLInputElement = null;
let buttonSubmit: HTMLButtonElement = null;
let buttonLoadRegions: HTMLButtonElement = null;
let buttonLoadCurves: HTMLButtonElement = null;
let inputLoadTextFiles: HTMLInputElement = null;
let inputSourceIndex: HTMLInputElement = null;
// get elements - center panel
let labelScaleFactor: HTMLLabelElement = null;
let buttonScaleDown: HTMLButtonElement = null;
let buttonScaleUp: HTMLButtonElement = null;
// get elements - right panel
let selectTextureID: HTMLSelectElement = null;
let divRegionInfosListViewer: HTMLDivElement = null;

// globals
let gImageInfoList: Array<ImageInfo> = null;
let gTextureIDList: Array<TextureID> = null;
let gSessionInfo: SessionInfo = null;

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

// selectTextureIDUpdate
function selectTextureIDUpdate() {
    // get selected index
    var selectedIndex = selectTextureID.selectedIndex;
    // clear childs
    while (selectTextureID.firstChild) { selectTextureID.removeChild(selectTextureID.firstChild); }

    // add items
    for (let textureID of gTextureIDList) {
        // create new selector
        let textureIDOption = document.createElement('option');
        textureIDOption["textureID"] = textureID;
        textureIDOption.innerHTML = textureID.ID + ": " + textureID.name;
        selectTextureID.appendChild(textureIDOption);
    }
    // set selected value
    if ((selectedIndex < 0) && (gTextureIDList.length > 0)) {
        selectTextureID.selectedIndex = 0;
        gRegionInfosViewer.setTextureID(gTextureIDList[selectTextureID.selectedIndex])
    } else {
        selectTextureID.selectedIndex = selectedIndex;
    }
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

// radioManualOnChange
function radioManualOnChange(event) {
    gImageInfoEditor.setRegionInfoSource(RegionInfoSource.MANUAL);
    gRegionInfosViewer.setRegionInfoSource(RegionInfoSource.MANUAL);
}

// radioLoadedOnChange
function radioLoadedOnChange(event) {
    gImageInfoEditor.setRegionInfoSource(RegionInfoSource.LOADED);
    gRegionInfosViewer.setRegionInfoSource(RegionInfoSource.LOADED);
}

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
    selectTextureIDUpdate();
}

// buttonSubmitOnClick
function buttonSubmitOnClick(event) {
    if (gImageInfoEditor.imageInfo) {
        gSessionInfo.postSession().then(result => {
            console.log(result);
            return gSessionInfo.postImages(gImageInfoList);
        }).then(result => {
            console.log(result);
            return gSessionInfo.postRegions(gImageInfoList)
        }).then(result => {
            parceRegionsResponse(result);
            radioLoaded.checked = true;
            radioLoaded.onchange(null);
            gImageInfoEditor.drawImageInfo();
        });
    }
}

// buttonLoadRegionsOnClick
function buttonLoadRegionsOnClick(event) {
    inputLoadTextFiles.accept = '.txt';
    inputLoadTextFiles.onchange = event => {
        let files: Array<File> = event.currentTarget["files"];
        for (let file of files) {
            var fileReader = new FileReader();
            fileReader.onload = event => {
                event.target["result"].split('\n').forEach((str: string) => {
                    if (str.length === 0) return;
                    let params: string[] = str.split(',');
                    params = params.map(param => param.trim());
                    // gey image info and texture id
                    let imageInfo = gImageInfoList.find(imageInfo => imageInfo.fileRef.name === params[0]);
                    let textureID = gTextureIDList.find(textureID => textureID.ID === params[7]);
                    // add new region info 
                    let regionInfo = new RegionInfo();
                    regionInfo.ID = textureID ? textureID.ID : gTextureIDList[0].ID;
                    regionInfo.color = textureID ? textureID.color : gTextureIDList[0].color;
                    regionInfo.x = parseFloat(params[1]);
                    regionInfo.y = parseFloat(params[2]);
                    regionInfo.w = parseFloat(params[4]) - parseFloat(params[1]);
                    regionInfo.h = parseFloat(params[5]) - parseFloat(params[2]);
                    if (imageInfo)
                        imageInfo.regionsLoaded.push(regionInfo);
                });
                gImageInfoEditor.drawImageInfo();
                gRegionInfosViewer.update();
            }
            fileReader.readAsText(file);
        }
    }
    inputLoadTextFiles.click();
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
    radioManual = document.getElementById("radioManual") as HTMLInputElement;
    radioLoaded = document.getElementById("radioLoaded") as HTMLInputElement;
    radioEdit = document.getElementById("radioEdit") as HTMLInputElement;
    radioPreview = document.getElementById("radioPreview") as HTMLInputElement;
    radioSelectionModeAdd = document.getElementById("radioSelectionModeAdd") as HTMLInputElement;
    radioSelectionModeRemove = document.getElementById("radioSelectionModeRemove") as HTMLInputElement;
    divTextureIDListContainer = document.getElementById("divTextureIDListContainer") as HTMLDivElement;
    buttonAddTextureID = document.getElementById("buttonAddTextureID") as HTMLInputElement;
    buttonSubmit = document.getElementById("buttonSubmit") as HTMLButtonElement;
    buttonLoadRegions = document.getElementById("buttonLoadRegions") as HTMLButtonElement;
    buttonLoadCurves = document.getElementById("buttonLoadCurves") as HTMLButtonElement;
    inputLoadTextFiles = document.getElementById("inputLoadTextFiles") as HTMLInputElement;
    inputSourceIndex = document.getElementById("inputSourceIndex") as HTMLInputElement;
    // get elements - center panel
    labelScaleFactor = document.getElementById("labelScaleFactor") as HTMLLabelElement;
    buttonScaleDown = document.getElementById("buttonScaleDown") as HTMLButtonElement;
    buttonScaleUp = document.getElementById("buttonScaleUp") as HTMLButtonElement;
    // get elements - right panel
    selectTextureID = document.getElementById("selectTextureID") as HTMLSelectElement;
    divRegionInfosListViewer = document.getElementById("region_preview") as HTMLDivElement;

    // create global objects
    gImageInfoList = new Array<ImageInfo>();
    gTextureIDList = [
        new TextureID("A", "blue"),
        new TextureID("B", "red"),
        new TextureID("C", "green"),
        new TextureID("D", "orange"),
        new TextureID("E", "#B0187B"),
        new TextureID("F", "#8B7DA3"),
        new TextureID("G", "#A545BB"),
        new TextureID("H", "#C7A248"),
        new TextureID("I", "#39F992"),
        new TextureID("J", "#324CF7"),
        new TextureID("K", "#D04D5E"),
        new TextureID("L", "#1E88E6"),
        new TextureID("M", "#92BFB3"),
        new TextureID("N", "#858D1A"),
        new TextureID("O", "#92E877"),
        new TextureID("P", "#1FDFD9"),
        new TextureID("Q", "#DD7488"),
        new TextureID("R", "#9DACBB"),
        new TextureID("S", "#934591"),
        new TextureID("T", "#FC9AA4"),
    ];
    gSessionInfo = new SessionInfo();
    //gSessionInfo.sessionID = Math.random().toString(36).slice(2);
    gSessionInfo.sessionID = "1234567";

    // create image info editor
    gImageInfoEditor = new ImageInfoEditor(divImageInfoPanel);
    gImageInfoEditor.onchangedImageInfo = imageInfo => gRegionInfosViewer.update();
    gImageInfoEditor.setTextureID(gTextureIDList[0]);
    // create image info list viewer
    gImageInfoListViewer = new ImageInfoListViewer(divImageInfoPreviewPanel, gImageInfoList);
    gImageInfoListViewer.onclickImageInfo = imageInfo => setCurrentImageInfo(imageInfo);
    divImageInfoPreviewPanel.style.display = "none";
    // create texture ID list viewer
    gTextureIDListView = new TextureIDListView(divTextureIDListContainer, gTextureIDList);
    gTextureIDListView.onchangedTextureID = textureID => gImageInfoEditor.setTextureID(textureID);
    gTextureIDListView.onchangedDescription = textureID => selectTextureIDUpdate();
    // create region infos viewer
    gRegionInfosViewer = new RegionInfosViewer(divRegionInfosListViewer, gTextureIDList, gImageInfoList);
    gRegionInfosViewer.onclickImageInfo = imageInfo => setCurrentImageInfo(imageInfo);
    gRegionInfosViewer.setTextureID(gTextureIDList[0]);
    // update
    selectTextureIDUpdate();

    // init session
    inputSessionID.value = gSessionInfo.sessionID;

    // left panel events
    buttonLoadImages.onclick = event => buttonLoadImagesOnClick(event);
    selectImageNumber.onchange = event => selectImageNumberOnChange(event);
    radioGrayScale.onchange = event => radioGrayScaleOnChange(event);
    radioColorMapJet.onchange = event => radioColorMapJetOnChange(event);
    radioManual.onchange = event => radioManualOnChange(event);
    radioLoaded.onchange = event => radioLoadedOnChange(event);
    radioEdit.onchange = event => radioEditOnChange(event);
    radioPreview.onchange = event => radioPreviewOnChange(event);
    radioSelectionModeAdd.onchange = event => gImageInfoEditor.setSelectionMode(SelectionMode.ADD);
    radioSelectionModeRemove.onchange = event => gImageInfoEditor.setSelectionMode(SelectionMode.REMOVE);
    buttonAddTextureID.onclick = event => buttonAddTextureIDOnClick(event);
    buttonSubmit.onclick = event => buttonSubmitOnClick(event);
    buttonLoadRegions.onclick = event => buttonLoadRegionsOnClick(event);
    // center panel events
    divImageInfoPanel.onmouseup = event => gImageInfoEditor.onMouseUp(event);
    divImageInfoPanel.onmousemove = event => gImageInfoEditor.onMouseMove(event);
    divImageInfoPanel.onmousedown = event => gImageInfoEditor.onMouseDown(event);
    inputUsername.oninput = event => gSessionInfo.username = inputUsername.value;
    inputDescription.oninput = event => gSessionInfo.description = inputDescription.value;
    buttonScaleDown.onclick = event => buttonScaleDownOnClick(event);
    buttonScaleUp.onclick = event => buttonScaleUpOnClick(event);
    // right panel events
    selectTextureID.onchange = (event) => gRegionInfosViewer.setTextureID(selectTextureID.options[selectTextureID.selectedIndex]["textureID"]);
}

// parceRegionsResponse
function parceRegionsResponse(response: string): void {
    let data = JSON.parse(response);
    // check for saccess
    if (data["success"]) {
        let eval_results = data["eval_results"];
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
            let imageInfo = gImageInfoList.find(imageInfo => imageInfo.baseName == basenames[basename]);
            let textureID = gTextureIDList[labels[basename]];
            if (imageInfo) {
                let emb0: number = emb0s[basename];
                let emb1: number = emb1s[basename];
                let emb2: number = emb2s[basename];
                let pixel_start: number = pixel_starts[basename];
                let pixel_end: number = pixel_ends[basename];
                console.log(pixel_start);
                console.log(pixel_end);
                imageInfo.curves[0].color = gTextureIDList[0].color;
                imageInfo.curves[1].color = gTextureIDList[1].color;
                imageInfo.curves[2].color = gTextureIDList[2].color;
                imageInfo.curves[0].points.push(new CurvePoint(emb0, (pixel_end + pixel_start) / 2));
                imageInfo.curves[1].points.push(new CurvePoint(emb1, (pixel_end + pixel_start) / 2));
                imageInfo.curves[2].points.push(new CurvePoint(emb2, (pixel_end + pixel_start) / 2));
                imageInfo.regionsLoaded.push(new RegionInfo(0, pixel_start, imageInfo.canvasImage.width, pixel_end - pixel_start, textureID.ID, textureID.color));
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
