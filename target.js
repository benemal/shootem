var target
var targetTimeout
var targetCounter

var targetLocMargin = 0.1
var targetRadius = { min: 10, max: 30 }
var targetModFactors

var readyTarget = function(viewSize) {
    // Calculate RNG modifiers for target location/radius
    targetModFactors = {
        width: { mod: viewSize.width * (1-targetLocMargin*2), min: viewSize.width*targetLocMargin},
        height: { mod: viewSize.height * (1-targetLocMargin*2), min: viewSize.height*targetLocMargin},
        radius: { mod: (targetRadius.max - targetRadius.min), min: targetRadius.min}
    }
};

var TargetCounter = function(startCount) {
    var count = startCount;
    this.decrement = function() {
        count--;
        if(count > 0) {
            target = new Target();
            updateDebug();
        }
        else {
            $("#startScreen").show();
        }
        updateScoreboard();
    }
    
    this.__defineGetter__("count", function() { return count; });
}

var Target = function() {
    this.startTime = Date.now()
    this.loc = generateRandomLocation()
    this.radius = generateRandomRadius()
    this.timeoutID = window.setTimeout(targetExpired, targetTimeout, this)
}

function generateRandomLocation() {
    return { x:      Math.round(Math.random()*targetModFactors.width.mod + targetModFactors.width.min), 
             y:      Math.round(Math.random()*targetModFactors.height.mod + targetModFactors.height.min) }
}

function generateRandomRadius() {
    return Math.round(Math.random()*targetModFactors.radius.mod + targetModFactors.radius.min)
}

function targetHit(target) {
    hits++       
    targetTimeout *= 0.9
    // must clear timeout before calling decrement, lest the timeout event be left hanging
    window.clearTimeout(target.timeoutID)
    delete target.timeoutID
    targetCounter.decrement();
    
    console.log("Target hit: " + target);
};

function targetMiss() {
    misses++;
    console.log("Miss");
};

function targetExpired() {
    misses++;
    targetTimeout *= 1.1;
    targetCounter.decrement();
    console.log("Target expired");
}
