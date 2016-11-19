var Shape = function(start, end, color) {
    this.start = start;
    this.end = end;
    this.id = null;
    this.color = color;
    this.cells = [];
    this.value = 0;
    this.topLeft = null;
    this.bottomRight = null;

    this.setId();
    this.setTopLeftBottomRight();
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
        this.setTopLeftBottomRight();
    },
    setTopLeftBottomRight: function() {
        this.topLeft = jQuery.extend({}, this.start);
        this.bottomRight = jQuery.extend({}, this.end);

        if (this.end.x < this.start.x) {
            this.topLeft.x = this.end.x;
            this.bottomRight.x = this.start.x;
        }
        if (this.end.y < this.start.y) {
            this.topLeft.y = this.end.y;
            this.bottomRight.y = this.start.y;
        }
    },
    has: function(cell) {
        if (cell.point.x >= this.topLeft.x && cell.point.x <= this.bottomRight.x
            && cell.point.y >= this.topLeft.y && cell.point.y <= this.bottomRight.y) {
            return true;
        }

        return false;
    },
    clearCells: function() {
        this.cells = [];
    },
    addCell: function(cell) {
        this.cells.push(cell);
    },
    fill: function() {
        var self = this;
        this.cells.forEach(function(cell) {
            cell.fill(self.color);
        });
    },
    removeFill: function() {
        this.cells.forEach(function(cell) {
            cell.removeColor();
        });
    }
};