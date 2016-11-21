var Corners = function(start, end) {
    this.topLeft = new Point(start.x, start.y);
    this.bottomRight = new Point(end.x, end.y);

    if (end.x < start.x) {
        this.topLeft.setX(end.x);
        this.bottomRight.setX(start.x);
    }
    if (end.y < start.y) {
        this.topLeft.setY(end.y);
        this.bottomRight.setY(start.y);
    }

    this.topRight = new Point(this.bottomRight.x, this.topLeft.y);
    this.bottomLeft = new Point(this.topLeft.x, this.bottomRight.y);
}