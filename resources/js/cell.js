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
