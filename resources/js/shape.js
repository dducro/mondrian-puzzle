var Shape = function(start, end, color) {
    this.start = start;
    this.end = end;
    this.width = null;
    this.height = null;
    this.id = null;
    this.cornerPoints = null;
    this.color = color;
    this.cells = [];
    this.value = 0;
    this.cellWidth = 50;

    this.setId();
    this.setCornerPoints();
}

Shape.prototype = {
    setId: function() {
        this.width = Math.abs(this.start.x - this.end.x) + 1;
        this.height = Math.abs(this.start.y - this.end.y) + 1;
        if (this.width < this.height) {
            this.id = this.width + 'x' + this.height;
        } else {
            this.id = this.height + 'x' + this.width;
        }
        this.value = this.width * this.height;
    },
    setEnd: function(end) {
        this.end = end;
        this.setId();
        this.setCornerPoints();
    },
    setCornerPoints: function() {
        this.cornerPoints = new CornerPoints(this.start, this.end);
    },
    has: function(cell) {
        if (cell.point.x >= this.cornerPoints.bottomLeft.x && cell.point.x <= this.cornerPoints.topRight.x
            && cell.point.y >= this.cornerPoints.bottomLeft.y && cell.point.y <= this.cornerPoints.topRight.y) {
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
        this.topRight().enableRemove();
    },
    disableRemove: function() {
        this.topRight().disableRemove();
    },
    fill: function() {
        for (var id in this.cells) {
            var cell = this.cells[id];
            cell.fill(this.color);
        }
        this.showSize();
    },
    showSize: function() {
        this.startCell().text(this.value + '<br>' + this.id, this.sizePosition());
    },
    sizePosition: function() {
        var offsetX = (this.cellWidth * (this.width / 2)) - (this.cellWidth / 2);
        var offsetY = (this.cellWidth * (this.height / 2)) - (this.cellWidth / 2);

        if (typeof this.topLeft() !== 'undefined' && this.start.id == this.topLeft().point.id) {
            return {
                'top': offsetY,
                'left': offsetX
            }
        }
        if (typeof this.topRight() !== 'undefined' && this.start.id == this.topRight().point.id) {
            return {
                'top': offsetY,
                'right': offsetX
            }
        }
        if (typeof this.bottomLeft() !== 'undefined' && this.start.id == this.bottomLeft().point.id) {
            return {
                'bottom': offsetY,
                'left': offsetX
            }
        }
        if (typeof this.bottomRight() !== 'undefined' && this.start.id == this.bottomRight().point.id) {
            return {
                'bottom': offsetY,
                'right': offsetX
            }
        }
    },
    removeFill: function() {
        for (var id in this.cells) {
            var cell = this.cells[id];
            cell.empty();
        }
    },
    bottomLeft: function() {
        return this.cells[this.cornerPoints.bottomLeft.id];
    },
    topRight: function() {
        return this.cells[this.cornerPoints.topRight.id];
    },
    bottomRight: function() {
        return this.cells[this.cornerPoints.bottomRight.id];
    },
    topLeft: function() {
        return this.cells[this.cornerPoints.topLeft.id];
    },
    startCell: function() {
        return this.cells[this.start.id];
    }
};