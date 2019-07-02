// TextureID
export class TextureID {
    // fields
    public ID: string = "";
    public color: string = "red";
    public name: string = "";

    // constructor
    constructor(ID: string, color: string = "red") {
        this.ID = ID;
        this.color = color;
        this.name = "";
    }
}