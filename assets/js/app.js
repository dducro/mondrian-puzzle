var Board = function() {
    this.$board = $('#board');
    this.$restart = $('#restart');
    this.$reduce = $('#reduce');
    this.$expand = $('#expand');
    this.$size = $('#size');
    this.$scores = $('#high-scores ul');

    this.cells = [];
    this.shapes = [];
    this.currentShape = null;
    this.shapeToRemove = null;
    this.score = 0;
    this.finished = false;
    this.size = 8;
    this.minSize = 5;
    this.maxSize = 25;
    this.minScore = 0;
    this.maxScore = 0;

    this.colors = ['orange', 'cyan', 'green', 'yellow', 'red', 'indigo', 'brown', 'purple', 'blue-grey', 'grey', 'blue', 'pink'];
    this.patterns = ['vertical', 'horizontal'];
    this.shapeColors = [];
    this.setColors();

    this.scores = {
        5: 4, 6: 5, 7: 5, 8: 6, 9: 6, 10: 8, 11: 6, 12: 7, 13: 8, 14: 9, 15: 9,
        16: 9, 17: 8, 18: 10, 19: 9, 20: 9, 21: 9, 22: 9, 23: 9, 24: 9, 25: 11
    };
    this.userScores = {
        5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [], 13: [], 14: [], 15: [],
        16: [], 17: [], 18: [], 19: [], 20: [], 21: [], 22: [], 23: [], 24: [], 25: []
    }
    this.currentScores = [];
}

Board.prototype = {
    init: function() {
        this.fetchUserScores();
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
        this.currentScores = this.userScores[this.size];
        this.setMinMacScores();
        this.updateScores();

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
    setMinMacScores: function() {
        this.minScore = (this.size * (this.size - 1)) - 1;
        this.maxScore = this.scores[this.size];
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
    fetchUserScores: function() {
        var userScores = JSON.parse(localStorage.getItem('userScores'));
        if (userScores != null && typeof userScores === 'object') {
            this.userScores = userScores;
        }
    },
    storeUserScores: function() {
        localStorage.setItem('userScores', JSON.stringify(this.userScores));
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
        this.animate(this.$board, 'shake', 800);
    },
    error: function($el) {
        this.animate($el, 'error', 3000);
    },
    animate: function($el, animation, duration) {
        $el.addClass(animation);
        setTimeout(function() {
            $el.removeClass(animation);
        }, duration);
    },
    createCurrentShape: function(cell) {
        if (this.currentShape === null) {
            this.currentShape = this.createShape(cell.point, cell.point);
            this.addShape(this.currentShape);
            this.moveCursor();
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
            this.calculateScore();
        }
    },
    calculateScore: function() {
        if (this.shapes.length > 1) {
            var sortedShapes = this.shapes.sort(function(a, b) {
                return a.value - b.value;
            });

            var low = sortedShapes[0].value;
            var high = sortedShapes[sortedShapes.length - 1].value;
            var score = high - low;

            if (score >= this.maxScore && score <= this.minScore) {
                this.score = score;

                this.currentScores.push(this.score);
                this.currentScores.sort(this.sortNumber);
                if (this.currentScores.length > 8) {
                    this.currentScores.pop();
                }
                this.userScores[this.size] = this.currentScores;
                this.storeUserScores();
                this.updateScores();
                this.animateScore();
            }
        }
    },
    updateScores: function() {
        var self = this;
        this.$scores.empty();
        this.currentScores.forEach(function(score) {
            var $el = $('<li></li>'),
                percentage = self.calculatePercentage(score);

            $el.addClass('score_' + score);
            $el.text(score + ' (' + percentage + '%)');
            self.$scores.append($el);
        });
    },
    calculatePercentage: function(score) {
        var diffScore = this.minScore - this.maxScore;
        var percentageScore = this.minScore - score;
        var percentage = percentageScore / diffScore * 100;

        return Math.round(percentage);
    },
    animateScore: function() {
        var $score = this.$scores.find('.score_' + this.score).first();
        this.animate($score, 'wiggle', 1000);
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
            this.defaultCursor();
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
    moveCursor: function() {
        this.$board.css('cursor', 'move');
    },
    defaultCursor: function() {
        this.$board.css('cursor', 'auto');
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
                self.shapeColors.push('color-' + color + ' pattern-' + pattern);
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
    },
    sortNumber: function(a, b) {
        return a - b;
    }
};
var Cell = function(point) {
    this.point = point;
    this.$el = null;
    this.$text = null;
    this.$remove = null;
    this.createElement();
}

Cell.prototype = {
    createElement: function() {
        this.$text = $('<span class="text"></span>');
        this.$el = $('<div class="cell ' + this.point.id + '"></div>');
        this.$el.data('cell', this);
        this.$el.append(this.$text);
    },
    text: function(text, position) {
        this.$text.html(text).attr('style', '');
        if (typeof position !== 'undefined') {
            this.$text.css(position);
        }
    },
    emptyText: function() {
        this.text('');
    },
    enableRemove: function() {
        this.$remove = $('<button ' +
            'class="remove mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored">' +
            '<i class="material-icons">clear</i>' +
            '</button>');
        this.$el.append(this.$remove);
    },
    disableRemove: function() {
        this.$remove.remove();
        this.$remove = null;
    },
    fill: function(color) {
        this.removeFill();
        this.$el.addClass('fill').addClass(color);
    },
    removeFill: function() {
        this.$el.removeClass(function(index, css) {
            return (css.match(/(^|\s)(color-|pattern-)\S+/g) || []).join(' ');
        }).removeClass('fill');
    },
    empty: function() {
        this.removeFill();
        this.emptyText();
    }
};

var CornerPoints = function(start, end) {
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