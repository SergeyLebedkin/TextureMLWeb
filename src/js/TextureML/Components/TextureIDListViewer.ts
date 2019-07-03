import { TextureID } from "../Types/TextureID";

// TextureIDListView
export class TextureIDListView {
    // fields
    private parent: HTMLDivElement = null;
    private textureIDList: Array<TextureID> = null;
    // events
    public onchangedTextureID: (this: TextureIDListView, textureID: TextureID) => any = null;
    public onchangedDescription: (this: TextureIDListView, textureID: TextureID) => any = null;
    // constructor
    constructor(parent: HTMLDivElement, textureIDList: Array<TextureID>) {
        // set fields
        this.parent = parent;
        this.textureIDList = textureIDList;
        // update
        this.update();
    }

    // update
    public update(): void {
        // get checked textureID
        let textureID: TextureID = this.findCheckedTextureID();

        // just clear
        while (this.parent.firstChild) { this.parent.removeChild(this.parent.firstChild); }

        // add new items
        for (let textureID of this.textureIDList)
            this.addTextureIDItem(textureID);

        // check first textureID not cheked
        if (textureID) {
            this.checkByTextureID(textureID);
        }
        else if ((!textureID) && (this.textureIDList.length > 0))
            (document.getElementsByName('textureID')[0] as HTMLInputElement).checked = true;
    }

    // checkByTextureID
    private checkByTextureID(textureID: TextureID): void {
        if (textureID) {
            let radios = document.getElementsByName('textureID');
            for (var i = 0, length = radios.length; i < length; i++) {
                if ((radios[i] as any).textureID == textureID) {
                    (radios[i] as HTMLInputElement).checked = true;
                    return;
                }
            }
        }
    }

    // find checked texture ID
    public findCheckedTextureID(): TextureID {
        var radios = document.getElementsByName('textureID');
        for (var i = 0, length = radios.length; i < length; i++) {
            if ((radios[i] as HTMLInputElement).checked) {
                return (radios[i] as any).textureID;
            }
        }
        return null;
    }

    // addItemInfoListItem
    addTextureIDItem(textureID: TextureID) {
        if (textureID !== null) {
            let div = document.createElement("div") as HTMLDivElement;
            div.style.display = "flex";
            div.style.flexDirection = "row";
            // create new radio button
            var radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "textureID";
            radio["textureID"] = textureID;
            radio.onchange = event => { 
                if (this.onchangedTextureID) 
                    this.onchangedTextureID(event.target["textureID"]);
            };
            radio.style.background = textureID.color;
            div.appendChild(radio);
            // create ID label
            var item = document.createElement("a");
            item.innerText = textureID.ID;
            item.style.background = textureID.color;
            item.style.minWidth = "15px";
            item.style.fontWeight = "bold";
            div.appendChild(item);
            // create name
            var name = document.createElement("a");
            name.innerText = "Name:";
            div.appendChild(name);
            // create descr
            var descr = document.createElement("input");
            descr.type = "text";
            descr.value = textureID.name;
            descr.style.width = "100%";
            descr["textureID"] = textureID;
            descr.oninput = event => {
                event.target["textureID"]["name"] = event.target["value"];
                if (this.onchangedDescription)
                    this.onchangedDescription(event.target["textureID"]);
            };
            div.appendChild(descr);
            // append to list
            this.parent.appendChild(div);
            return radio;
        }
        return null;
    }
}