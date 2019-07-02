import { ImageInfo } from "./TextureML/Types/ImageInfo";
import { TextureID } from "./TextureML/Types/TextureID";
import { SessionInfo } from "./TextureML/Types/SessionInfo";
import { ImageInfoEditor } from "./TextureML/Components/ImageInfoEditor";

// get elements - left panel
let divImageInfoPanel: HTMLDivElement = null;
let inputUsername: HTMLInputElement = null;
let inputSessionID: HTMLInputElement = null;
let inputDescription: HTMLInputElement = null;
let buttonLoadImages: HTMLButtonElement = null;
let selectImageNumber: HTMLSelectElement = null;
let radioGrayScale: HTMLInputElement = null;
let radioColorMapJet: HTMLInputElement = null;
let radioManual: HTMLInputElement = null;
let radioLoaded: HTMLInputElement = null;
let radioEdit: HTMLInputElement = null;
let radioPreview: HTMLInputElement = null;
let radioSetectionModeAdd: HTMLInputElement = null;
let radioSetectionModeRemove: HTMLInputElement = null;
let buttonAddTextureID: HTMLInputElement = null;
let buttonSubmit: HTMLButtonElement = null;
let buttonLoadRegions: HTMLButtonElement = null;
let buttonLoadCurves: HTMLButtonElement = null;
let inputSourceIndex: HTMLInputElement = null;
// get elements - center panel
let buttonScaleDown: HTMLButtonElement = null;
let buttonScaleUp: HTMLButtonElement = null;

// globals
let gImageInfoList: Array<ImageInfo> = null;
let gTextureIDList: Array<TextureID> = null;
let gSessionInfo: SessionInfo = null;

// components
let gImageInfoEditor: ImageInfoEditor = null;

// window.onload
window.onload = event => {
    // get elements - left panel
    divImageInfoPanel = document.getElementById("image_canvas_panel") as HTMLDivElement;
    inputUsername = document.getElementById("inputUsername") as HTMLInputElement;
    inputSessionID = document.getElementById("inputSessionID") as HTMLInputElement;
    inputDescription = document.getElementById("inputDescription") as HTMLInputElement;
    buttonLoadImages = document.getElementById("buttonLoadImages") as HTMLButtonElement;
    selectImageNumber = document.getElementById("selectImageNumber") as HTMLSelectElement;
    radioGrayScale = document.getElementById("radioGrayScale") as HTMLInputElement;
    radioColorMapJet = document.getElementById("radioColorMapJet") as HTMLInputElement;
    radioManual = document.getElementById("radioManual") as HTMLInputElement;
    radioLoaded = document.getElementById("radioLoaded") as HTMLInputElement;
    radioEdit = document.getElementById("radioEdit") as HTMLInputElement;
    radioPreview = document.getElementById("radioPreview") as HTMLInputElement;
    radioSetectionModeAdd = document.getElementById("radioSetectionModeAdd") as HTMLInputElement;
    radioSetectionModeRemove = document.getElementById("radioSetectionModeRemove") as HTMLInputElement;
    buttonAddTextureID = document.getElementById("buttonAddTextureID") as HTMLInputElement;
    buttonSubmit = document.getElementById("buttonSubmit") as HTMLButtonElement;
    buttonLoadRegions = document.getElementById("buttonLoadRegions") as HTMLButtonElement;
    buttonLoadCurves = document.getElementById("buttonLoadCurves") as HTMLButtonElement;
    inputSourceIndex = document.getElementById("inputSourceIndex") as HTMLInputElement;

    // create global objects
    gImageInfoList = new Array<ImageInfo>();
    gTextureIDList = new Array<TextureID>();
    gSessionInfo = new SessionInfo();
    gSessionInfo.sessionID = Math.random().toString(36).slice(2);

    // create image info editor
    gImageInfoEditor = new ImageInfoEditor(divImageInfoPanel);

    // get elements - center panel
    buttonScaleDown = document.getElementById("buttonScaleDown") as HTMLButtonElement;
    buttonScaleUp = document.getElementById("buttonScaleUp") as HTMLButtonElement;

    // init elements
    inputSessionID.value = gSessionInfo.sessionID;

    // set events
    inputUsername.oninput = event => gSessionInfo.username = inputUsername.value;
    inputDescription.oninput = event => gSessionInfo.description = inputDescription.value;
    buttonScaleDown.onclick = event => console.log("buttonScaleDown on click");
    buttonScaleUp.onclick = event => console.log("buttonScaleUp on click");
}