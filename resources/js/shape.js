var Shape = function(start, end, color) {
    this.start = start;
    this.end = end;
    this.id = null;
    this.color = color;
    this.cells = [];
    this.value = 0;

    this.setId();
    this.setCorners();
}

Shape.prototype = {
    setId: function() {
        var w = Math.abs(this.start.x - this.end.x) + 1;
        var h = Math.abs(this.start.y - this.end.y) + 1;
        if (w < h) {
            this.id = w + 'x' + h;
        } else {
            this.id = h + 'x' + w;
        }
        this.value = w * h;
    },
    setEnd: function(end) {
        this.end = end;
        this.setId();
        this.setCorners();
    },
    setCorners: function() {
        this.corners = new Corners(this.start, this.end);
    },
    has: function(cell) {
        if (cell.point.x >= this.corners.bottomLeft.x && cell.point.x <= this.corners.topRight.x
            && cell.point.y >= this.corners.bottomLeft.y && cell.point.y <= this.corners.topRight.y) {
            return true;
        }

        return false;
    },
    clearCells: function() {
        this.cells = [];
    },
    addCell: function(cell) {
        this.cells[cell.point.id] = cell;
    },
    enableRemove: function() {
        this.cells[this.corners.topRight.id].enableRemove();
    },
    disableRemove: function() {
        this.cells[this.corners.topRight.id].disableRemove();
    },
    fill: function() {
        for (var id in this.cells) {
            var cell = this.cells[id];
            cell.fill(this.color);
        }
    },
    removeFill: function() {
        for (var id in this.cells) {
            var cell = this.cells[id];
            cell.removeFill();
        }
    }
};