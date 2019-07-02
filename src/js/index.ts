import { ImageInfo } from "./TextureML/Types/ImageInfo";
import { TextureID } from "./TextureML/Types/TextureID";
import { SessionInfo } from "./TextureML/Types/SessionInfo";
import { ImageInfoEditor } from "./TextureML/Components/ImageInfoEditor";
import { ColorMapType } from "./TextureML/Types/ColorMapType";
import { RegionInfoSource } from "./TextureML/Types/RegionInfoSource";
import { SelectionMode } from "./TextureML/Types/SelectionMode";

// get elements - left panel
let divImageInfoPanel: HTMLDivElement = null;
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
let buttonAddTextureID: HTMLInputElement = null;
let buttonSubmit: HTMLButtonElement = null;
let buttonLoadRegions: HTMLButtonElement = null;
let buttonLoadCurves: HTMLButtonElement = null;
let inputSourceIndex: HTMLInputElement = null;
// get elements - center panel
let labelScaleFactor: HTMLLabelElement = null;
let buttonScaleDown: HTMLButtonElement = null;
let buttonScaleUp: HTMLButtonElement = null;

// globals
let gImageInfoList: Array<ImageInfo> = null;
let gTextureIDList: Array<TextureID> = null;
let gSessionInfo: SessionInfo = null;

// components
let gImageInfoEditor: ImageInfoEditor = null;

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
        optionImageInfo.value = imageInfo as any;
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

// buttonScaleDownOnClick
function buttonScaleDownOnClick(event: MouseEvent) {
    gImageInfoEditor.setScale(gImageInfoEditor.scale / 2);
    labelScaleFactor.innerText = Math.round(gImageInfoEditor.scale * 100) + "%";
}

// buttonScaleUpOnClick
function buttonScaleUpOnClick(event: MouseEvent) {
    gImageInfoEditor.setScale(gImageInfoEditor.scale * 2);
    labelScaleFactor.innerText = Math.round(gImageInfoEditor.scale * 100) + "%";
}

// window.onload
window.onload = event => {
    // get elements - left panel
    divImageInfoPanel = document.getElementById("image_canvas_panel") as HTMLDivElement;
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
    buttonAddTextureID = document.getElementById("buttonAddTextureID") as HTMLInputElement;
    buttonSubmit = document.getElementById("buttonSubmit") as HTMLButtonElement;
    buttonLoadRegions = document.getElementById("buttonLoadRegions") as HTMLButtonElement;
    buttonLoadCurves = document.getElementById("buttonLoadCurves") as HTMLButtonElement;
    inputSourceIndex = document.getElementById("inputSourceIndex") as HTMLInputElement;
    // get elements - center panel
    labelScaleFactor = document.getElementById("labelScaleFactor") as HTMLLabelElement;
    buttonScaleDown = document.getElementById("buttonScaleDown") as HTMLButtonElement;
    buttonScaleUp = document.getElementById("buttonScaleUp") as HTMLButtonElement;

    // create global objects
    gImageInfoList = new Array<ImageInfo>();
    gTextureIDList = new Array<TextureID>();
    gSessionInfo = new SessionInfo();
    gSessionInfo.sessionID = Math.random().toString(36).slice(2);

    // create image info editor
    gImageInfoEditor = new ImageInfoEditor(divImageInfoPanel);

    // init elements
    inputSessionID.value = gSessionInfo.sessionID;

    // left panel events
    buttonLoadImages.onclick = event => buttonLoadImagesOnClick(event);
    selectImageNumber.onchange = event => selectImageNumberOnChange(event);
    radioGrayScale.onchange = event => gImageInfoEditor.setColorMapType(ColorMapType.GRAY_SCALE);
    radioColorMapJet.onchange = event => gImageInfoEditor.setColorMapType(ColorMapType.JET);
    radioManual.onchange = event => gImageInfoEditor.setRegionInfoSource(RegionInfoSource.MANUAL);
    radioLoaded.onchange = event => gImageInfoEditor.setRegionInfoSource(RegionInfoSource.LOADED);
    radioSelectionModeAdd.onchange = event => gImageInfoEditor.setSelectionMode(SelectionMode.ADD);
    radioSelectionModeRemove.onchange = event => gImageInfoEditor.setSelectionMode(SelectionMode.REMOVE);
    // center panel events
    divImageInfoPanel.onmouseup = event => gImageInfoEditor.onMouseUp(event);
    divImageInfoPanel.onmousemove = event => gImageInfoEditor.onMouseMove(event);
    divImageInfoPanel.onmousedown = event => gImageInfoEditor.onMouseDown(event);
    inputUsername.oninput = event => gSessionInfo.username = inputUsername.value;
    inputDescription.oninput = event => gSessionInfo.description = inputDescription.value;
    buttonScaleDown.onclick = event => buttonScaleDownOnClick(event);
    buttonScaleUp.onclick = event => buttonScaleUpOnClick(event);
}