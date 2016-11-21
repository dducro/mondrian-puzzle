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
