import { ImageInfo } from "./TextureML/Types/ImageInfo";

// globals
let gImageInfos: Array<ImageInfo> = new Array<ImageInfo>();

// window.onload
window.onload = event => {
    // get elements - left panel
    let inputUsername = document.getElementById("inputUsername") as HTMLInputElement;
    let inputSessionID = document.getElementById("inputSessionID") as HTMLInputElement;
    let inputDescription = document.getElementById("inputDescription") as HTMLInputElement;
    let buttonLoadImages = document.getElementById("buttonLoadImages") as HTMLButtonElement;
    let selectImageNumber = document.getElementById("selectImageNumber") as HTMLSelectElement;
    let radioGrayScale = document.getElementById("radioGrayScale") as HTMLInputElement;
    let radioColorMapJet = document.getElementById("radioColorMapJet") as HTMLInputElement;
    let radioManual = document.getElementById("radioManual") as HTMLInputElement;
    let radioLoaded = document.getElementById("radioLoaded") as HTMLInputElement;
    let radioEdit = document.getElementById("radioEdit") as HTMLInputElement;
    let radioPreview = document.getElementById("radioPreview") as HTMLInputElement;
    let radioSetectionModeAdd = document.getElementById("radioSetectionModeAdd") as HTMLInputElement;
    let radioSetectionModeRemove = document.getElementById("radioSetectionModeRemove") as HTMLInputElement;
    let buttonAddTextureID = document.getElementById("buttonAddTextureID") as HTMLInputElement;
    let buttonSubmit = document.getElementById("buttonSubmit") as HTMLButtonElement;
    let buttonLoadRegions = document.getElementById("buttonLoadRegions") as HTMLButtonElement;
    let buttonLoadCurves = document.getElementById("buttonLoadCurves") as HTMLButtonElement;
    let inputSourceIndex = document.getElementById("inputSourceIndex") as HTMLInputElement;

    // get elements - center panel
    let buttonScaleDown = document.getElementById("buttonScaleDown") as HTMLButtonElement;
    let buttonScaleUp = document.getElementById("buttonScaleUp") as HTMLButtonElement;

    // init elements
    inputSessionID.value = Math.random().toString(36).slice(2);

    // set events
    inputUsername.oninput = event => console.log(inputUsername.value);
    inputSessionID.oninput = event => console.log(inputSessionID.value);
    inputDescription.oninput = event => console.log(inputDescription.value);
    buttonScaleDown.onclick = event => console.log("buttonScaleDown on click");
    buttonScaleUp.onclick = event => console.log("buttonScaleUp on click");
}