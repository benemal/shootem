// Add your JavaScript below!

var hits
var misses

var targetLocMargin = 0.1
var targetRadius = { min: 10, max: 30 }
var targetModFactors

$(document).ready(function() {
    var viewSize = readyView(document.getElementById("shootem"));
    // Calculate RNG modifiers for target location/radius
    targetModFactors = {
        width: { mod: viewSize.width * (1-targetLocMargin*2), min: viewSize.width*targetLocMargin},
        height: { mod: viewSize.height * (1-targetLocMargin*2), min: viewSize.height*targetLocMargin},
        radius: { mod: (targetRadius.max - targetRadius.min), min: targetRadius.min}
    }
    
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
    restartGame(startTimeout, startCount);
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

function generateRandomLocation() {
    return { x:      Math.round(Math.random()*targetModFactors.width.mod + targetModFactors.width.min), 
             y:      Math.round(Math.random()*targetModFactors.height.mod + targetModFactors.height.min) }
}

function generateRandomRadius() {
    return Math.round(Math.random()*targetModFactors.radius.mod + targetModFactors.radius.min)
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

    return {x:canvasX, y:canvasY}
}

function isTargetHit(shotLoc, target) {
    return Math.pow(shotLoc.x - target.loc.x, 2) + Math.pow(shotLoc.y - target.loc.y, 2) < Math.pow(target.radius, 2)
}

function shoot(event) {
    var c = relMouseCoords(event)

    drawBulletHole(c);
    // check if the target was hit
    if(targetCounter.count > 0) {
        if(isTargetHit(c, target)) {
            targetHit(target);
        }
        else {
            targetMiss();
        }
    }

    updateScoreboard()
}
