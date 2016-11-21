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
        var w = Math.abs(this.start.x - this.end.x);
        var h = Math.abs(this.start.y - this.end.y);
        this.id = w + 'x' + h;
        this.value = (w + 1) * (h + 1);
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
        if (cell.point.x >= this.corners.topLeft.x && cell.point.x <= this.corners.bottomRight.x
            && cell.point.y >= this.corners.topLeft.y && cell.point.y <= this.corners.bottomRight.y) {
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