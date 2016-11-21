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