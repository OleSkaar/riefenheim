var months = [
    {name: 'Iov\'s Moon', precipitationMean: 1, windMean: 4, volatility: 'low', temperature: -4},
    {name: 'Vyz\'s Moon', precipitationMean: 2, windMean: 3, volatility: 'low', temperature: -2},
    {name: 'Saan\'s Moon', precipitationMean: 3, windMean: 2, volatility: 'mid', temperature: 0},
    {name: 'Jardels\'s Moon', precipitationMean: 3, windMean: 2, volatility: 'high', temperature: 1},
    {name: 'Illein\'s Moon', precipitationMean: 2, windMean: 1, volatility: 'mid', temperature: 2},
    {name: 'Era\'s Moon', precipitationMean: 0, windMean: 0, volatility: 'low', temperature: 3},
    {name: 'Rhinodell\'s Moon', precipitationMean: 1, windMean: 2, volatility: 'low', temperature: 3},
    {name: 'Dracul\'s Moon', precipitationMean: 2, windMean: 3, volatility: 'mid', temperature: 2},
    {name: 'Deratini\'s Moon', precipitationMean: 4, windMean: 4, volatility: 'high', temperature: 1},
    {name: 'Xyth\'s Moon', precipitationMean: 5, windMean: 6, volatility: 'high', temperature: 0},
    {name: 'Yarloth\'s Moon', precipitationMean: 4, windMean: 4, volatility: 'mid', temperature: -1},
    {name: 'Rakshi\'s Moon', precipitationMean: 3, windMean: 3, volatility: 'low', temperature: -2}
    ]

var locations = {
    "Grasslands": {precipitationMean: 1, windMean: 4},
    "Marsh": {precipitationMean: 4, windMean: 0}
}

function assignProbs (weatherIndex, month, location, precipOrWind)  {
    var vol, baseWeight = 50, seasonLocalWeight = 25, 
        lowVolProbs = [34.1, 6.8, 1.1], 
        midVolProbs = [22.1, 8.4, 5.5], 
        highVolProbs = [10, 10, 10],
        arrayAdded, nextWeather;
    
    function ProbabilityArray (number) {
        var arr = [];
            for (var i = 0; i < number; i++) {
                arr.push(0);    
            }
        return arr
    }
    
    function distributeModifiers (mean, index, array, volArray, modifier) {    
        if (mean !== index) {
                var maxDist = volArray.length, 
                    diff = index - mean, 
                    absDiff = Math.abs(diff)

                if (absDiff > maxDist) {
                    if (diff < 0) {
                        diff = maxDist * -1;
                    } else {
                        diff = maxDist;
                    }
                }

                if (diff > 0) {
                        for (var i = 0; i < diff; i++) {
                            array[index - i] += modifier/diff
                    }   
                    } else {
                        for (var i = 0; i < Math.abs(diff); i++) {
                            array[index + i] -= modifier/diff
                        }
                    }

            } else {
                array[index] += seasonLocalWeight;
            }
    }
   
  // 1. Get monthly volatility  
    switch (month.volatility) {
        case 'low':
            vol = lowVolProbs;
            break;
        case 'mid': 
            vol = midVolProbs;
            break;  
        case 'high': 
            vol = highVolProbs;
}

// 2. Create new array with probability points from volatility 
//    and position current weather in the array

    var newArray = ProbabilityArray(9), remainderNumber = 0, remainder = 0;
    newArray[weatherIndex] = vol[0];
    
    for (var i = 1 - vol.length; i < vol.length; i++) {
        if (i !== 0) {
            var prob = vol[Math.abs(i)]
            
            if (newArray[weatherIndex+i] !== undefined) {
                newArray[weatherIndex+i] = prob;
                remainderNumber += 1
            } else {
                remainder += prob;
            }
        }
    }
    
    if (remainder !== 0) {
        var rem = remainder/remainderNumber;
        newArray.forEach(function(element, index) {
            if (element !== 0 && remainder !== 0) {
                    newArray[index] += rem;
                    remainder -= rem;
            }
        })
    }
    
// 3. For both season and local mean, distribute 
//    the remainder of probability points equally between 
//    each step between local/seasonal mean and current weather
    
    if (precipOrWind === 'Precipitation') {
        distributeModifiers(month.precipitationMean, weatherIndex, newArray, vol, seasonLocalWeight)
        distributeModifiers(location.precipitationMean, weatherIndex, newArray, vol, seasonLocalWeight)
    } else if (precipOrWind === 'Wind') {
        distributeModifiers(month.windMean, weatherIndex, newArray, vol, seasonLocalWeight)
        distributeModifiers(location.windMean, weatherIndex, newArray, vol, seasonLocalWeight)        
    }
    
function addArray (array) {
    
    array.forEach(function(element, index) {
        if (index !== 0 && element !== 0) {
            array[index] += array[index - 1];
            if (array[index] > 100) {
                array[index] = 100;
            }
        }
    })
    return array
}    

function weatherRoll (array) {
    var roll = Math.floor(Math.random() * 100), result, i;
    console.log('Roll = ' + roll)
    for (i = 0; i < array.length; i++) {
        
        if (array[i] > roll) {
            console.log('Element = ' + array[i])
            result = i
            break
        }
    }
    return result 
}
    
// 4. Add each state to the previous one to get totals    
arrayAdded = addArray(newArray)

// 5. Roll 1-100 to find next weather state
console.log(arrayAdded);
nextWeather = weatherRoll(arrayAdded)
console.log(nextWeather)
    return nextWeather
} 



var precipArray = [];
var windArray = [];


for (var x = 0; x < 2160; x++) {
    console.log(x, 'Month = ' + Math.round(x/180))
    if (precipArray.length === 0 && windArray.length === 0) {
        precipArray.push(assignProbs(0, months[0], locations["Marsh"], 'Precipitation'))
        windArray.push(assignProbs(0, months[0], locations["Marsh"], 'Wind'))
        } else if (Math.round(x/180) === 0) {
        precipArray.push(assignProbs(precipArray[x - 1], months[Math.round(x/180)], locations["Marsh"], 'Precipitation'))
        windArray.push(assignProbs(windArray[x - 1], months[Math.round(x/180)], locations["Marsh"], 'Wind'))
        } else {
        precipArray.push(assignProbs(precipArray[x - 1], months[Math.round(x/180) - 1], locations["Marsh"], 'Precipitation'))
        windArray.push(assignProbs(windArray[x - 1], months[Math.round(x/180) - 1], locations["Marsh"], 'Wind'))    
        }
}

var pNode = document.createTextNode(precipArray)
var wNode = document.createTextNode(windArray)
document.getElementById('pResult').appendChild(pNode)
document.getElementById('wResult').appendChild(wNode)