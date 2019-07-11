// RegionInfo
export class RegionInfo {
    // fields
    public x: number = 0.0;
    public y: number = 0.0;
    public w: number = 0.0;
    public h: number = 0.0;
    public ID: string = "";
    public color: string = "red";
    public generation: number = 0;

    // constructor
    constructor(x: number = 0, y: number = 0, w: number = 0, h: number = 0, ID: string = "", color: string = "red", generation = 0) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.ID = ID;
        this.color = color;
        this.generation = generation;
    }

    // normalize region
    normalize() {
        // horizontal normilize
        if (this.w < 0) {
            this.x += this.w;
            this.w = -this.w;
        }

        // vertical normilize
        if (this.h < 0) {
            this.y += this.h;
            this.h = -this.h;
        }
    }

    // scale region parameters
    scale(factor) {
        this.x *= factor;
        this.y *= factor;
        this.w *= factor;
        this.h *= factor;
    }

    // check intersection (regions MUST be normalized)
    checkIntersectionRegion(region) {
        return this.checkIntersection(region.x, region.y, region.w, region.h);
    }

    // check intersection (regions MUST be normalized)
    checkIntersection(x, y, w, h) {
        if ((this.x <= x + w) && (this.x + this.w >= x) &&
            (this.y <= y + h) && (this.y + this.h >= y)) {
            return true;
        } else {
            return false;
        }
    }

    // trim (regions MUST be normalized)
    trim(x0, y0, x1, y1) {
        // calc resulting coords
        var result_x0 = Math.max(x0, this.x);
        var result_y0 = Math.max(y0, this.y);
        var result_x1 = Math.min(x1, this.x + this.w - 1);
        var result_y1 = Math.min(y1, this.y + this.h - 1);

        // update fields
        this.x = result_x0;
        this.y = result_y0;
        this.w = result_x1 - result_x0;
        this.h = result_y1 - result_y0;
    }

    public asJSON() {
        return {
            "x_start": this.x,
            "y_start": this.y,
            "x_end": this.x + this.w,
            "y_end": this.y + this.h,
            "label": this.ID
        }
    }
}