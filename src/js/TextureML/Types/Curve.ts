import { CurvePoint } from "./CurvePoint"

// Curve
export class Curve {
    // fields
    public color: string = "red";
    public points: Array<CurvePoint> = null;
    // constructor
    constructor() {
        this.color = "red";
        this.points = new Array<CurvePoint>();
    }
}