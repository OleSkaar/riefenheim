var watch = {
    location: "Grasslands",
    month: 1,
    weather: {
        precipitation: 'Medium rain'
    }
};

function weather (wtch) {
    var weatherResult, currentState, nextStates, curIndex, middleState;
    var remainder = 0;
    var precipitation = ['Clear Skies', 'Thin, wispy clouds', 'Thick, cottony clouds', 'Low-hanging grey clouds', 'Light rain', 'Medium rain', 'Heavy rain', 'Storm', 'Thunderstorm']
    var months = [{volatility: 10}]
    
    function round (number) {
        number = number.toFixed(3);
        number = parseFloat(number, 10)
        return number
    }
    
    function stateIndex (stateName, states) {
            for (var i = 0; i <= states.length; i++) {
                if (states[i] === stateName) {
                    return i
                }
            }  
        }
    
    function newStates (current, states) {
        var nextLevels = [];
            for (var i = -3; i < 0; i++) {
                if (curIndex + i >= 0) {
                    nextLevels.push({name: states[curIndex + i], mainIndex: curIndex + i})    
                }
            }
            for (var i = 0; i < 4; i++) {
                if (curIndex + i <= states.length - 1) {
                    nextLevels.push({name: states[curIndex + i], mainIndex: curIndex + i})
                }
            }      
        return nextLevels        
        }   
    
    // 1. Take the current state and find the next ones
    currentState = watch.weather.precipitation;
    curIndex = stateIndex(currentState, precipitation)
    nextStates = newStates(currentState, precipitation)
    
    // 2. Assign probabilites to each possible new state
    var baseProbabilities = [0.33, 0.25, 0.055, 0.03]
    
    nextStates.forEach(function(element) {
        if (element.mainIndex === curIndex) {
            // Assign the middle (highest) probability to the current weather
            element.probability = baseProbabilities[0]
            middleState = element.mainIndex
        }
    })
    
    nextStates.forEach(function(element, index) {
        if (element.probability === undefined) {
            // Assign probability according to distance from middle, divide remainder
            var probability;
            var distFromMid = element.mainIndex - middleState;
            var opposite = distFromMid * -1;
            
            if (distFromMid > 0) {
                    probability = baseProbabilities[distFromMid];
                } else {
                    probability = baseProbabilities[opposite];
                }
                
            element.probability = probability;
            
            if (nextStates[index + (distFromMid * -2)] === undefined) {
                remainder += probability;
            } 
        }
    })
    
    if (remainder !== 0) { 
        nextStates.forEach(function(element) {
            var prob = remainder/nextStates.length
            var result = round(element.probability += prob)
            element.probability = result
        })
    }

    
    
    console.log(nextStates)
}


weather(watch)