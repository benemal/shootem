var target
var targetTimeout
var targetCounter
var startTimeout = 2000;
var startCount = 3;

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
