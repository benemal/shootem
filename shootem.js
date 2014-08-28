// Add your JavaScript below!

var hits
var misses

$(document).ready(function() {
    var viewSize = readyView(document.getElementById("shootem"));
    
    readyTarget(viewSize);

    $("#startScreen").click(restartGameEvent);
    showStartScreen();
})

function pauseGame(event) {
    //  push/pop screens on a stack?
    //  if game is running
    //      stop game action
    //      display pause screen
    //  else
    //      back out of current screen
    
}

function restartGameEvent(event) {
    restartGame(1500, 3);
}

function restartGame(sTargetTimeout, sTargetCount) {
    $("#startScreen").hide();
    targetTimeout = sTargetTimeout;
    targetCounter = new TargetCounter(sTargetCount);
    hits = 0;
    misses = 0;
    target = new Target();
    
    updateDebug();
    updateScoreboard();

    $("#shootem").unbind("click", restartGameEvent);
    document.getElementById("shootem").addEventListener("mousedown", shoot, false)

    clearBullets();
    window.requestAnimationFrame(render);
}

// from http://stackoverflow.com/a/5932203
function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = event.target;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.clientX - totalOffsetX;
    canvasY = event.clientY - totalOffsetY;

    return new Vector(canvasX, canvasY);
}

function isTargetHit(shotLoc, target) {
    return Math.pow(shotLoc.x - target.x, 2) + Math.pow(shotLoc.y - target.y, 2) < Math.pow(target.radius, 2)
}

function shoot(event) {
    var c = relMouseCoords(event)

    drawBulletHole(c);
    // check if the target was hit
    if(isTargetHit(c, target)) {
        targetHit(target);
    }
    else {
        targetMiss();
    }

    updateScoreboard()
}

var Vector = function(x, y) {
    this.x = x;
    this.y = y;
};

Vector.prototype.toString = function() {
    return "[" + this.x + ", " + this.y + "]";
};
