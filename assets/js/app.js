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
    this.score = 0;
    this.finished = false;
    this.size = 8;
    this.minSize = 4;
    this.maxSize = 20;

    this.colors = ['orange', 'cyan', 'green', 'yellow', 'red', 'indigo', 'brown', 'purple', 'blue-grey', 'grey', 'blue', 'pink'];
    this.paters = ['line1', 'line2', 'line3', 'line4', 'zig-zag'];
    shuffle(this.colors);
    shuffle(this.paters);
}

Board.prototype = {
    init: function() {
        this.generateBoard();
        this.binds();
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
        for (var y = 0; y < this.size; y++) {
            for (var x = 0; x < this.size; x++) {
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
        this.$restart.on('click', $.proxy(this.onRestart, this));
        this.$reduce.on('click', $.proxy(this.onReduceSize, this));
        this.$expand.on('click', $.proxy(this.onExpandSize, this));
    },
    draw: function() {
        this.shapes.forEach(function(shape) {
            shape.fill();
        });
        if (this.currentShape != null) {
            this.currentShape.fill();
        }
    },
    createShape: function(start, end) {
        return new Shape(start, end, this.getColorForIndex(this.shapes.length));
    },
    addShapeWithValidation: function(newShape) {
        if (this.validate(newShape)) {
            this.addShape(newShape);
            this.shapes.push(newShape);
            this.calculateScore();
            this.checkFinished();
        } else {
            this.removeShapeCells(newShape);
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
        this.removeShapeCells(removeShape);

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
            shape.cells.every(function(cell) {
                if (newShape.has(cell)) {
                    overlap = true;
                }
                return !overlap;
            });
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
        if (this.currentShape != null) {
            this.removeShapeCells(this.currentShape);
            this.currentShape = null;
        }
    },
    confirmRemoveShape: function(shape) {
        var remove = confirm('Remove?');
        if (remove) {
            this.removeShape(shape);
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

        if (this.finished) {
            return;
        }

        var cell = $(e.target).data('cell'),
            shape = this.getCurrentShape(cell);

        if (shape === null) {
            shape = this.getShape(cell);
        }

        // start creating a new shape
        if (shape === null) {
            this.createCurrentShape(cell);
        }
        // remove a shape
        else if (this.currentShape === null || shape.id != this.currentShape.id) {
            this.removeCurrentShape();
            this.confirmRemoveShape(shape);
        }
        // complete a shape
        else {
            this.addShapeWithValidation(this.currentShape);
            this.currentShape = null;
        }
    },
    onEnter: function(e) {
        e.preventDefault();

        if (this.finished) {
            return;
        }

        var cell = $(e.target).data('cell');

        // draw current shape while dragging
        if (this.currentShape != null) {
            this.drawCurentShapeWhileDragging(cell);
        }
    },
    onRestart: function() {
        this.clear();
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
        if (this.size < 20) {
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
    getColorForIndex: function(index) {
        if (index <= (this.colors.length - 1)) {
            return 'color-' + this.colors[index];
        }

        var paterIndex = Math.floor(index / (this.colors.length - 1)) - 1;
        var colorIndex = index % (this.colors.length);

        return 'color-' + this.colors[colorIndex] + '-' + this.paters[paterIndex];
    }
};
var Cell = function(point) {
    this.point = point;
    this.$el = null;
    this.createElement();
}

Cell.prototype = {
    createElement: function() {
        this.$el = $('<div class="cell"></div>');
        this.$el.data('cell', this);
    },
    fill: function(color) {
        this.removeColor();
        this.$el.addClass(color);
    },
    removeColor: function() {
        this.$el.removeClass(function(index, css) {
            return (css.match(/(^|\s)color-\S+/g) || []).join(' ');
        });
    }
};

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
    var board = new Board();
    board.init();
});
var Point = function(x, y) {
    this.x = x;
    this.y = y;
}
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