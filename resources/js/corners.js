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