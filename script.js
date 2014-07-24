// Add your JavaScript below!
var shootCanvas
var bulletCanvas
var shootContext
var bulletContext

var target
var hits
var misses
var targetTimeout
var targetCounter
var startTimeout = 4000;
var startCount = 10;

var targetLocMargin = 0.1
var targetRadius = { min: 10, max: 30 }
var targetMod

var TargetCounter = function(startCount) {
    var count = startCount;
    this.decrement = function() {
        count--;
        if(count > 0) {
            target = new Target();
            updateDebug();
        }
        else {
            $("#shootem").click(endGame);
        }
        updateScoreboard();
    }
    
    this.__defineGetter__("count", function() { return count; });
}

function endGame() {
    $("#shootem").unbind();
    $("#shootem").click(restartGameEvent);
}

var Target = function() {
    this.startTime = Date.now()
    this.loc = generateRandomLocation()
    this.radius = generateRandomRadius()
    this.timeoutID = window.setTimeout(targetExpired, targetTimeout)
}

function targetExpired() {
    misses++;
    targetTimeout *= 1.1;
    targetCounter.decrement();
}

$(document).ready(function() {
    shootCanvas = document.getElementById('shootem')
    shootContext = shootCanvas.getContext('2d')
    
    bulletCanvas = document.createElement('canvas');
    bulletCanvas.width = shootCanvas.width;
    bulletCanvas.height = shootCanvas.height;    
    bulletContext = bulletCanvas.getContext('2d');
    
    // Calculate RNG modifiers for target location/radius
    targetMod = {
        width: { mod: shootCanvas.width * (1-targetLocMargin*2), min: shootCanvas.width*targetLocMargin},
        height: { mod: shootCanvas.height * (1-targetLocMargin*2), min:shootCanvas.height*targetLocMargin},
        radius: { mod: (targetRadius.max - targetRadius.min), min: targetRadius.min}
    }
    
    // Generate and draw the first target
    restartGame(startTimeout, startCount);
})

function restartGameEvent(event) {
    restartGame(startTimeout, startCount);
}

function restartGame(sTargetTimeout, sTargetCount) {
    targetTimeout = sTargetTimeout;
    targetCounter = new TargetCounter(sTargetCount);
    hits = 0;
    misses = 0;
    target = new Target();
    
    updateDebug();
    updateScoreboard();

    $("#shootem").unbind("click", restartGameEvent);
    document.getElementById("shootem").addEventListener("mousedown", shoot, false)

    bulletContext.clearRect(0,0, bulletCanvas.height, bulletCanvas.width);
    window.requestAnimationFrame(render);
}

function generateRandomLocation() {
    return { x:      Math.round(Math.random()*targetMod.width.mod + targetMod.width.min), 
             y:      Math.round(Math.random()*targetMod.height.mod + targetMod.height.min) }
}

function generateRandomRadius() {
    return Math.round(Math.random()*targetMod.radius.mod + targetMod.radius.min)
}

function render() {
    shootContext.clearRect(0,0, shootCanvas.height, shootCanvas.width)
    shootContext.drawImage(bulletCanvas, 0, 0);
    if(targetCounter.count > 0) {
        drawTarget();
    }
    window.requestAnimationFrame(render)
}

//draw a red target circle at (x,y) with radius r
//TODO add parameter "target"
function drawTarget() {
    shootContext.fillStyle = "yellow"
    shootContext.beginPath()
    shootContext.arc(target.loc.x, target.loc.y, target.radius, 0, 2*Math.PI)
    shootContext.fill()

    var timeElapsed = (Date.now()-target.startTime) / (targetTimeout)
    $("#targetTime").val(timeElapsed)
    //alert(timeElapsed)
    shootContext.fillStyle = "red"
    shootContext.beginPath()
    shootContext.moveTo(target.loc.x, target.loc.y)
    shootContext.arc(target.loc.x, target.loc.y, 
                target.radius+1, 
                0, 2*Math.PI* timeElapsed)
    shootContext.fill()
}

function drawBulletHole(coord) {
    bulletContext.fillStyle = "gray"
    bulletContext.beginPath()
    bulletContext.arc(coord.x, coord.y, 1, 0, 2*Math.PI)
    bulletContext.fill()
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

    drawBulletHole(c)
    // check if the target was hit
    if(targetCounter.count > 0) {
        if(isTargetHit(c, target)) {
            hits++       
            targetTimeout *= 0.9
            // must clear timeout before calling decrement, lest the timeout event be left hanging
            window.clearTimeout(target.timeoutID)
            delete target.timeoutID
            targetCounter.decrement();
        }
        else {
            misses++
        }
    }

    updateScoreboard()
}

function updateScoreboard() {
    $("#score").val(hits)
    $("#missCount").val(misses)
    var accuracy = Math.round(hits / (hits + misses) * 100)
    $("#accuracy").val((isNaN(accuracy) ? 100 : accuracy) + "%")
    $("#targetCount").val(targetCounter.count)
}

function updateDebug() {
    // update debugging info
    $("#targetx").val(target.loc.x)
    $("#targety").val(target.loc.y)
    $("#targetr").val(target.radius)
}
