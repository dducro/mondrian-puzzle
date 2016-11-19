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
