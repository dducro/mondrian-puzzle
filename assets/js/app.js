var Board = function() {
    this.$board = $('#board');
    this.$score = $('#score');
    this.$restart = $('#restart');
    this.$reduce = $('#reduce');
    this.$expand = $('#expand');
    this.$size = $('#size');

    this.cells = [];
    this.shapes = [];
    this.currentShape = null;
    this.shapeToRemove = null;
    this.score = 0;
    this.finished = false;
    this.size = 10;
    this.minSize = 4;
    this.maxSize = 32;

    this.colors = ['orange', 'cyan', 'green', 'yellow', 'red', 'indigo', 'brown', 'purple', 'blue-grey', 'grey', 'blue', 'pink'];
    this.patterns = ['line1', 'line2', 'line3', 'line4', 'zig-zag'];
    this.shapeColors = [];
    this.setColors();
}

Board.prototype = {
    init: function() {
        this.generateBoard();
        this.binds();
        return this;
    },
    generateBoard: function() {
        var width = this.size * 50 + 2;
        this.$board.css({
            'width': width,
            'hegiht': width,
            'min-width': width,
            'min-hegiht': width
        });

        this.cells = [];
        this.shapes = [];
        this.$board.empty();
        for (var y = this.size; y > 0; y--) {
            for (var x = 1; x <= this.size; x++) {
                var cell = new Cell(new Point(x, y));
                this.cells.push(cell);
                this.$board.append(cell.$el);
            }
        }
        this.$size.html(this.size + ' x ' + this.size);
    },
    binds: function() {
        this.$board.on('click', '.cell', $.proxy(this.onClick, this));
        this.$board.on('mouseenter', '.cell', $.proxy(this.onEnter, this));
        this.$board.on('mouseleave', '.cell', $.proxy(this.onLeave, this));
        this.$board.on('mouseleave', '.cell, .cell .remove', $.proxy(this.onLeave, this));
        this.$board.on('click', '.cell .remove', $.proxy(this.onRemove, this));
        this.$restart.on('click', $.proxy(this.onRestart, this));
        this.$reduce.on('click', $.proxy(this.onReduceSize, this));
        this.$expand.on('click', $.proxy(this.onExpandSize, this));
    },
    draw: function() {
        this.shapes.forEach(function(shape) {
            shape.fill();
        });
        if (this.currentShape !== null) {
            this.currentShape.fill();
        }
    },
    createShape: function(start, end) {
        return new Shape(start, end, this.getColor());
    },
    addShapeWithValidation: function(newShape) {
        if (this.validate(newShape)) {
            this.addShape(newShape);
            this.shapes.push(newShape);
            this.calculateScore();
            this.checkFinished();
        } else {
            this.removeShapeCells(newShape);
            this.reuseColor(newShape.color);
        }
    },
    addShape: function(newShape) {
        newShape.clearCells();
        this.availableCells().forEach(function(cell) {
            if (newShape.has(cell)) {
                newShape.addCell(cell);
            }
        });

        this.draw();
    },
    removeShape: function(removeShape) {
        if (this.shapeToRemove !== null) {
            this.shapeToRemove.disableRemove();
            this.shapeToRemove = null;
        }
        this.removeShapeCells(removeShape);
        this.reuseColor(removeShape.color);
        this.calculateScore();

        this.shapes = this.shapes.filter(function(shape) {
            return removeShape.id != shape.id;
        });
    },
    removeShapeCells: function(removeShape) {
        removeShape.removeFill();
    },
    validate: function(newShape) {
        if (this.isShapeInUse(newShape)) {
            this.shake();
            this.error($('.rule-in-use'));
            return false;
        }
        if (this.detectOverlap(newShape)) {
            this.shake();
            this.error($('.rule-overlap'));
            return false;
        }
        return true;
    },
    isShapeInUse: function(newShape) {
        var shapeInUse = this.shapes.filter(function(shape) {
            return newShape.id == shape.id;
        });

        return shapeInUse.length;
    },
    detectOverlap: function(newShape) {
        var overlap = false;
        this.shapes.every(function(shape) {
            for (var id in shape.cells) {
                var cell = shape.cells[id];
                if (newShape.has(cell)) {
                    overlap = true;
                    break;
                }
            }
            return !overlap;
        });

        return overlap;
    },
    shake: function() {
        this.animation(this.$board, 'shake', 800);
    },
    error: function($el) {
        this.animation($el, 'error', 3000);
    },
    animation: function($el, animation, duration) {
        $el.addClass(animation);
        setTimeout(function() {
            $el.removeClass(animation);
        }, duration);
    },
    createCurrentShape: function(cell) {
        if (this.currentShape === null) {
            this.currentShape = this.createShape(cell.point, cell.point);
            this.addShape(this.currentShape);
        }
    },
    removeCurrentShape: function() {
        if (this.currentShape !== null) {
            this.removeShapeCells(this.currentShape);
            this.currentShape = null;
        }
    },
    drawCurentShapeWhileDragging: function(cell) {
        this.removeShapeCells(this.currentShape);
        this.currentShape.setEnd(cell.point);
        this.addShape(this.currentShape);
    },
    checkFinished: function() {
        if (this.availableCells().length == 0) {
            this.finished = true;
        }
    },
    calculateScore: function() {
        if (this.shapes.length > 1) {
            var sortedShapes = this.shapes.sort(function(a, b) {
                return a.value - b.value;
            });

            var low = sortedShapes[0].value;
            var high = sortedShapes[sortedShapes.length - 1].value;
            this.score = high - low;
        }
        else {
            this.score = 0;
        }

        this.$score.html(this.score);
    },
    onClick: function(e) {
        e.preventDefault();

        var cell = $(e.target).data('cell'),
            shape = this.getCurrentShape(cell);

        if (shape === null) {
            shape = this.getShape(cell);
        }

        // start creating a new shape
        if (shape === null) {
            this.createCurrentShape(cell);
        }
        // complete a shape
        else if (this.currentShape !== null && shape.id == this.currentShape.id) {
            this.addShapeWithValidation(this.currentShape);
            this.currentShape = null;
        }
    },
    onEnter: function(e) {
        e.preventDefault();

        var cell = $(e.target).data('cell'),
            shape = this.getShape(cell);

        // draw current shape while dragging
        if (this.currentShape !== null) {
            this.drawCurentShapeWhileDragging(cell);
        }
        // show remove button
        else if (shape !== null) {
            this.shapeToRemove = shape;
            shape.enableRemove();
        }
    },
    onLeave: function(e) {
        e.preventDefault();

        // hide remove button
        if (this.shapeToRemove !== null) {
            this.shapeToRemove.disableRemove();
            this.shapeToRemove = null;
        }
    },
    onRemove: function(e) {
        e.preventDefault();
        e.stopPropagation();

        // remove shape
        if (this.shapeToRemove !== null) {
            this.removeCurrentShape();
            this.removeShape(this.shapeToRemove);
        }
    },
    onRestart: function() {
        this.clear();
        this.setColors();
        this.finished = false;
        this.calculateScore();
    },
    onReduceSize: function() {
        if (this.size > this.minSize) {
            this.size--;
            this.generateBoard();
        }
        this.disableSizeButtons();
    },
    onExpandSize: function() {
        if (this.size < this.maxSize) {
            this.size++;
            this.generateBoard();
        }
        this.disableSizeButtons();
    },
    disableSizeButtons: function() {
        if (this.size == this.minSize) {
            this.$reduce.prop('disabled', true);
        } else {
            this.$reduce.prop('disabled', false);
        }
        if (this.size == this.maxSize) {
            this.$expand.prop('disabled', true);
        } else {
            this.$expand.prop('disabled', false);
        }
    },
    clear: function() {
        var self = this;
        this.shapes.forEach(function(shape) {
            self.removeShape(shape);
        });
    },
    getCurrentShape: function(cell) {
        if (this.currentShape !== null && this.currentShape.has(cell)) {
            return this.currentShape;
        }

        return null;
    },
    getShape: function(cell) {
        var selectedShape = null
        if (this.shapes.length) {
            this.shapes.forEach(function(shape) {
                if (shape.has(cell)) {
                    selectedShape = shape;
                    return false;
                }
                return true;
            });
        }
        return selectedShape;
    },
    availableCells: function() {
        var self = this;
        return this.cells.filter(function(cell) {
            return self.getShape(cell) === null;
        });
    },
    setColors: function() {
        var self = this;
        shuffle(this.colors);
        shuffle(this.patterns);

        this.shapeColors = this.colors.map(function(color) {
            return 'color-' + color;
        });
        this.patterns.forEach(function(pattern) {
            self.colors.forEach(function(color) {
                self.shapeColors.push('color-' + color + '-' + pattern);
            });
        });
    },
    getColor: function() {
        var color = this.shapeColors.shift();
        this.shapeColors.push(color);
        return color;
    },
    reuseColor: function(color) {
        this.shapeColors.splice(this.shapeColors.indexOf(color), 1);
        this.shapeColors.unshift(color);
    }
};
var Cell = function(point) {
    this.point = point;
    this.$el = null;
    this.$remove = null;
    this.createElement();
}

Cell.prototype = {
    createElement: function() {
        this.$el = $('<div class="cell ' + this.point.id + '"></div>');
        this.$el.data('cell', this);
    },
    enableRemove: function() {
        this.$remove = $('<button ' +
            'class="remove mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored">' +
            '<i class="material-icons">clear</i>' +
            '</button>');
        this.$el.append(this.$remove);
    },
    disableRemove: function() {
        this.$el.empty();
        this.$remove = null;
    },
    fill: function(color) {
        this.removeFill();
        this.$el.addClass(color);
    },
    removeFill: function() {
        this.$el.removeClass(function(index, css) {
            return (css.match(/(^|\s)color-\S+/g) || []).join(' ');
        });
    }
};

var Corners = function(start, end) {
    this.bottomLeft = new Point(start.x, start.y);
    this.topRight = new Point(end.x, end.y);

    if (end.x < start.x) {
        this.bottomLeft.setX(end.x);
        this.topRight.setX(start.x);
    }
    if (end.y < start.y) {
        this.bottomLeft.setY(end.y);
        this.topRight.setY(start.y);
    }

    this.bottomRight = new Point(this.topRight.x, this.bottomLeft.y);
    this.topLeft = new Point(this.bottomLeft.x, this.topRight.y);
}
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}
$(document).ready(function() {
    window.board = (new Board()).init();
});
var Point = function(x, y) {
    this.x = x;
    this.y = y;
    this.setId();
}

Point.prototype = {
    setX: function(x) {
        this.x = x;
        this.setId();
    },
    setY: function(y) {
        this.y = y;
        this.setId();
    },
    setId: function() {
        this.id = this.x + 'x' + this.y;
    }
};
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