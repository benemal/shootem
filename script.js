// Add your JavaScript below!
var shootCanvas
var bulletCanvas
var shootContext
var bulletContext

var target
var hits = 0
var misses = 0

var targetCount = 10
var targetLocMargin = 0.1
var targetRadius = { min: 10, max: 30 }
var targetTimeout = 4000 //milliseconds
var targetMod

var Target = function() {
    this.startTime = Date.now()
    var l = generateRandomLocation()
    this.x = l.x
    this.y = l.y
    this.radius = generateRandomRadius()
}

$(document).ready(function() {
    shootCanvas = document.getElementById('shootem')
    shootContext = shootCanvas.getContext('2d')
    
    bulletCanvas = document.createElement('canvas');
    bulletCanvas.width = shootCanvas.width;
    bulletCanvas.height = shootCanvas.height;    
    bulletContext = bulletCanvas.getContext('2d');
    
    document.getElementById("shootem").addEventListener("mousedown", shoot, false)
    updateScoreboard()

    // Calculate modifiers for target location/radius
    targetMod = {
        width: { mod: $("#shootem").attr("width") * (1-targetLocMargin*2), min: $("#shootem").attr("width")*targetLocMargin},
        height: { mod: $("#shootem").attr("height") * (1-targetLocMargin*2), min: $("#shootem").attr("height")*targetLocMargin},
        radius: { mod: (targetRadius.max - targetRadius.min), min: targetRadius.min}
    }
    
    // Generate and draw the first target
    target = new Target()
    updateDebug()
    window.requestAnimationFrame(render)
})

function generateRandomLocation() {
    return { x:      Math.round(Math.random()*targetMod.width.mod + targetMod.width.min), 
             y:      Math.round(Math.random()*targetMod.height.mod + targetMod.height.min) }
}

function generateRandomRadius() {
    return Math.round(Math.random()*targetMod.radius.mod + targetMod.radius.min)
}

function render() {
    shootContext.drawImage(bulletCanvas, 0, 0);
    if(targetCount > 0) {
        drawTarget();
    	window.requestAnimationFrame(render)
    }
}

//draw a red target circle at (x,y) with radius r
//TODO add parameter "target"
function drawTarget() {
    shootContext.fillStyle = "yellow"
    shootContext.beginPath()
    shootContext.arc(target.x, target.y, target.radius, 0, 2*Math.PI)
    shootContext.fill()

    var timeElapsed = (Date.now()-target.startTime) / (targetTimeout)
    $("#targetTime").val(timeElapsed)
    //alert(timeElapsed)
    shootContext.fillStyle = "red"
    shootContext.beginPath()
    shootContext.moveTo(target.x, target.y)
    shootContext.arc(target.x, target.y, 
                target.radius+1, 
                0, 2*Math.PI* timeElapsed)
    shootContext.fill()
    //TODO separate game logic code from rendering code
    if(timeElapsed >= 1) {
        misses++
        targetCount--
        shootContext.clearRect(0,0, $("#shootem").attr("height"), $("#shootem").attr("width"))
        
        if(targetCount > 0) {
            targetTimeout *= 1.1
            target = new Target()
            updateDebug()
        }
        else {
            target = 0
        }
        
        updateScoreboard()
    }
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
    return Math.pow(shotLoc.x - target.x, 2) + Math.pow(shotLoc.y - target.y, 2) < Math.pow(target.radius, 2)
}

function shoot(event) {
    var c = relMouseCoords(event)
    // check if the target was hit
    if(targetCount > 0) {
        if(isTargetHit(c, target)) {
            hits++
            targetCount--        
            targetTimeout *= 0.9
            target = 0
            shootContext.clearRect(0,0, $("#shootem").attr("height"), $("#shootem").attr("width"))
            
            if(targetCount > 0) {
                target = new Target()
                updateDebug()
                window.requestAnimationFrame(render)
            }
        }
        else {
            misses++
            drawBulletHole(c)
        }
    }

    updateScoreboard()
}

function updateScoreboard() {
    $("#score").val(hits)
    $("#missCount").val(misses)
    var accuracy = Math.round(hits / (hits + misses) * 100)
    $("#accuracy").val((isNaN(accuracy) ? 100 : accuracy) + "%")
    $("#targetCount").val(targetCount)
}

function updateDebug() {
    // update debugging info
    $("#targetx").val(target.x)
    $("#targety").val(target.y)
    $("#targetr").val(target.radius)
}
