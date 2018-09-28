// LOGIC CONTROLLER 

var logicController = (function() {
    
    return {
        
        encounter: function(watch) {
            
            var result = {};
            
            // Roll dice to determine if an enounter happens
            var dice = logicController.diceRoll(8);
            if (dice < 7) {
                result.text = 'No encounter'
                
                } else {    
                    
                        // 1. Get the appropriate encounter table
                    var locationSplit = watch.location.split('_')[1]
                    var location = locationSplit
                    var encounters = dataController.getEncounters()[location] 
                    
                        // 2. Determine the time
                    var time = logicController.diceRoll(4)    
                    result.time = time;

                        // 3. Get the creature type
                    function creatureRoll () {    
                        var bellCurve = logicController.diceRoll(4) + logicController.diceRoll(4) -2
                        var creature = encounters[bellCurve]
                        
                        return creature
                    }
                    
                    creatureType = creatureRoll()
                    result.creature = creatureType.creature;
                
                        // If the result is a spoor
                    if (dice === 7) {
                        result.type = 'Spoor'
                        var spoorDice = logicController.diceRoll(5);
                        
                        if (spoorDice === 1) {
                            result.text = creatureType.lair
                        } else if (spoorDice === 2) {
                            result.text = creatureType.spoor
                        } else if (spoorDice === 3) {
                            result.text = creatureType.tracks
                        } else if (spoorDice === 4) {
                            result.text = creatureType.primaryTraces
                        } else if (spoorDice === 5) {
                            result.text = creatureType.secondaryTraces
                        }
                        
                        // If the result is an encounter
                    } else if (dice === 8) {
                        result.type = 'Encounter'
                        
                        // Replace any dice roll indicators with numbers
                        
                        function diceToNumber (creature) {
                            var dice = 0;
                            var re = /[0-9]+d[0-9]+/
                            var typeOfDice = re.exec(creature)
                            if (typeOfDice !== null) {
                            var numberOfDice = typeOfDice[0].split('d')
                            
                            for (i = 0; i < numberOfDice[0]; i++) {
                                dice = dice + logicController.diceRoll(numberOfDice[1])
                            }
                            
                            var newString = creature.replace(typeOfDice, dice)
                            
                            return newString

                            } else {
                                return creature
                            }
                        }
                        
                        result.creature = diceToNumber(result.creature)
                        
                        
                        // Determine what the encounter is doing
                        var encounterActions = ['Returning to lair low on HP (50%)',
                        'Fighting [creature]',
                        'Returning to lair with dead [creature]',
                        'Returning to lair with treasure equal to xp value',
                        'Just passing by. [reaction]',
                        'Defending lair',
                        'Hunting for food (advantage to Perception)',
                        'Chasing [creature] (at 50% HP)',
                        'Ready to ambush [creature] in 1d6 hours, -5 to passive Perception',
                        'Building a new lair (Perception 10 to hear)',
                        'Sleeping in lair']
                        
                        var actionRoll = logicController.diceRoll(11) -1;
                        
                        result.text = encounterActions[actionRoll]
                         
                            if (actionRoll === 1 || 2 || 7 || 8) {

                                var newCreature = creatureRoll().creature
                                newCreature = diceToNumber(newCreature)
                                result.text = result.text.replace('[creature]', newCreature)
                            }

                            if (actionRoll === 4) {

                                var reaction = ['Hostile.',
                                    'Hostile.',
                                    'Does not care.',
                                    'Does not care.',
                                    'Friendly.',
                                    'Friendly, will backstab later.']

                                var reactionRoll = logicController.diceRoll(6) -1;

                                result.text = result.text.replace('[reaction]', reaction[reactionRoll])
                            }
                        
                        // Distance, direction, and heading
                        
                        result.distance = (logicController.diceRoll(6) + logicController.diceRoll(6)) * 50 + ' feet away'
                        
                        function direction () {
                            var directions = ['North','North-east','East', 'South-east','South','South-west','West','North-west']
                            var directionRoll = logicController.diceRoll(8) -1
                            
                            return directions[directionRoll]
                        }
                        
                        result.direction = direction()
                        result.heading = direction()
                    }        
                     
            }      
              
            return result      
        },
        
        weather: function(watch, weatherIndex, precipOrWind) {
            var result, monthData, locationData;
            
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
                for (i = 0; i < array.length; i++) {

                    if (array[i] > roll) {
                        
                        result = i
                        break
                    }
                }
                return result 
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
                
            // 4. Add each state to the previous one to get totals    
            arrayAdded = addArray(newArray)

            // 5. Roll 1-100 to find next weather state
            nextWeather = weatherRoll(arrayAdded)

                return nextWeather
            }        
        
        var locationString = watch.location.split('_')[0]
        monthData = dataController.getMonths()[watch.month -1]
        locationData = dataController.getLocations()[locationString]
        
        result = assignProbs(weatherIndex, monthData, locationData, precipOrWind);
        
        return result
            
        },
        
        temperature: function(watch) {
            var temp = dataController.getMonths()[watch.month -1].temperature;
            
            if (watch.sun.watches.includes('Easterly sun') || watch.sun.watches.includes('Westerly sun')) {
                temp += 1;
            }
            
            if (watch.wind > 3) {
                temp -= 1;
            }
            
            if (watch.precipitation < 2) {
                temp += 1;   
            }
            
            var locString = watch.location.split('_')[0]
            var local = dataController.getLocations()[locString].temperatureModifier;
            temp += local;
            
            return temp
        },
        
        fog: function(watch, newPrecip, newTime) {
            var result;
            // Dependent on season
            // Winter
            if (watch.month > 10 || watch.month < 4) {
                if (newPrecip === 0) {
                    result = 1;
                }
            } 
            // Fall or spring
            if ((watch.month > 3 && watch.month < 6) || (watch.month > 7 && watch.month < 11)) {
                if (watch.precipitation > 3 && newPrecip < 4) {
                    result = 2;
                }
            } 
            // Summer
            if (watch.month > 5 && watch.month < 8) {
                var first = dataController.getWatchNames();
                if (newTime === first[0] && watch.precipitation > 2) {
                    result = 1;
                }
            } 
            
            if (result === undefined) {
                
                if (watch.fog === undefined) {
                    result = 0;
                } else {
                    result = watch.fog - 1
                }
                
                if (result < 0) {
                    result = 0;
                }
            }
                
            return result    
        },
        
        diceRoll: function(die) {
            
            var result = Math.floor(Math.random() * die) + 1;
        
        return result
            
        },
        
        sunlight: function(watch) {
            
            var differenceSolstices = 12;
            var dailyDifference = 12/180;
            
            function Sun(hours, rem) {
                this.totalHours = hours
                this.remainingHours = rem;
                this.watches = ['Night', 'Night', 'Night', 'Night'];
            }

            var sun = new Sun(watch.sun.totalHours, watch.sun.remainingHours);
            var finalWatch = dataController.getWatchNames()[5]

            if (watch.watch === finalWatch) {
                
                if (watch.month > 6) {
                    sun.totalHours = sun.totalHours - dailyDifference
                    sun.remainingHours = Math.round(sun.totalHours)
                } else {
                    sun.totalHours = sun.totalHours + dailyDifference
                    sun.remainingHours = Math.round(sun.totalHours)
                }        
            }
            
            if (sun.remainingHours !== 0) {
                var solarNoon = Math.round(sun.totalHours/2)
                
                sun.watches.forEach(function(element, index) {
                    
                    if (element === 'Night' && sun.remainingHours !== 0) {
                        if (sun.remainingHours === Math.round(sun.totalHours)) {
                            console.log('sunrise')
                            sun.watches[index] = 'Sunrise';
                        } else if (sun.remainingHours === solarNoon) {
                            sun.watches[index] = 'SolarNoon'
                        } else if (sun.remainingHours - 1 === 0) {
                            sun.watches[index] = 'Sunset'
                        } else {
                            if (sun.remainingHours > solarNoon) {
                                sun.watches[index] = 'EasterlySun'
                            } else {
                                sun.watches[index] = 'WesterlySun'
                            }
                        }
                        sun.remainingHours = sun.remainingHours -1
                    }
                    
                })
            }
            
            return sun
        },
        
        moon: function (day) {
            var phase, phaseLength = 3, dayRounded = Math.floor(day/phaseLength), 
                phases = ['New', 
                          'Young', 
                          'Waxing Crescent', 
                          'Waxing Quarter', 
                          'Waxing Gibbous', 
                          'Full', 
                          'Waning Gibbous', 
                          'Waning Quarter', 
                          'Waning Crescent', 
                          'Old']
            
                if (dayRounded === day/phaseLength) {
                    phase = phases[dayRounded - 1]
                } else {
                    phase = phases[dayRounded]
                }
            
            return phase         
        },
        
        conditionals: function (watches) {
            var current, next, conditional, rain, storm, length = watches.length;
            
            current = watches[0];
            next = watches[1];
            
            function checkWatches (stateNumber) {
                var condition;
                for (var i = 0; i < length -1; i++) {
                    if (watches[i+1].precipitation >= stateNumber) {
                        condition = true;
                    }
                }
                return condition
            }
            
            rain = checkWatches(4)
            storm = checkWatches(7)
            
            if (rain === true) {
                if (current.watch === 'Dawn' && current.precipitation <= 2) {
                    conditional = {name: 'Red skies in the morning', effect: 'It will rain later.'}
                } else if (current.precipitation === 3) {
                    conditional = {name: 'Humid air', effect: 'Birds fly low. Leaves are upturned. Smoke hovers near the ground. It will rain later.'}
                } else if ((current.precipitation === 1 || current.precipitation === 2) && current.wind >= 2) {
                    conditional = {name: 'Clouds move against the wind', effect: 'It will rain later.'}
                } else if ((current.sun.watches.includes('Night') && current.precipitation <= 3) || 
                           (next.sun.watches.includes('Night') && current.precipitation <= 3)) {
                    conditional = {name: 'Halo around the moon', effect: 'It will rain later.'}
                }
            } 
            
            if (storm === true) {
                conditional = {name: 'Tall dark clouds to the west', effect: 'There is a storm coming.'}
            }
            
            if (rain === undefined && storm === undefined) {
                if ((current.sun.watches.includes('Sunset')) || (next.sun.watches.includes('Sunset'))) {
                    conditional = {name: 'Red skies at night', effect: 'The skies will be clear later.'}
                }
            }
                    
            return conditional
        }
    }
    
})();

// DATA CONTROLLER
var dataController = (function() {
    
var watchNames = ['Dawn', 'Midday', 'Evening', 'Dusk', 'First night', 'Second night'];
    
var weatherEffects = {
    precipitation: [
        {level: 'Clear skies', effect: '+1 temperature.'}, 
        {level: 'Wispy clouds', effect: '+1 temperature.'},
        {level: 'Thick, cottony clouds', effect: 'No effect.'},
        {level: 'Low-hanging, grey clouds', effect: 'No effect.'},
        {level: 'Light rain', effect: 'Visual range reduced to 75%. Characters soaked after 3 watches.'},
        {level: 'Medium rain', effect: 'Visual range reduced to 50%. Characters soaked after 2 watches. Disadvantage to Perception.'},
        {level: 'Heavy rain and dark clouds', effect: 'Visual range reduced to 25%. Characters soaked after 1 watch. Disadvantage to Perception.'},
        {level: 'Storm', effect: 'Visual range reduced to 25%. Characters instantly soaked. Disadvantage to Perception.'},
        {level: 'Thunderstorm', effect: 'Visual range reduced to 25%. Characters instantly soaked. Disadvantage to Perception. Each hour outside, 1% chance that lightning hits party. 10d10 lightning dmg, random target, lasts 1 minute. +25% chance for each level of elevation.'}],
    wind: [
       {level: 'Calm', effect: 'Smoke rises vertically.'},
       {level: 'Fresh breeze', effect: 'Wind felt on face, leaves rustle.'},
       {level: 'Moderate breeze', effect: 'Small tree branches move, tall grass sways.'},
       {level: 'Strong breeze', effect: 'Large branches move, tents and other loose items shake.'},
       {level: 'Near gale', effect: 'Temperature -1. Whole trees in motion. Inconvenience felt walking against wind.'}, 
       {level: 'Fresh gale', effect: 'Temperature -1. Twigs break off trees.'},
       {level: 'Strong gale', effect: 'Temperature -1. Disadvantage to ranged attacks.'},
       {level: 'Storm', effect: 'Temperature -1. Disadvantage to ranged attacks. Movement speed reduced by 25%.'},
       {level: 'Hurricane', effect: 'Temperature -1. Disadvantage to ranged attacks. Movement speed reduced by 25%. In forest, 25% chance each round to be hit by flying branch. DC 15 Dex save or 1d6 dmg. In open terrain, DC 12 Str save or be knocked prone when trying to move.'}
    ]
}

var fogEffects = [{level: 'Light fog', effect: 'Visual range reduced by 50%'}, {level: 'Heavy fog', effect: 'Visual range reduced by 90%'}] 
    
var encounters = {
    "outskirts": [
        {
            "creature": "3d4 kobolds",
            "lair": "A small, crude campsite",
            "spoor": "A pit trap with a chest on top (1d6 falling damage + 1d10 spike damage)",
            "tracks": "Big footprints",
            "primaryTraces": "Crude mining tools, small",
            "secondaryTraces": "Simple sculpture of a dragon"
        }, 
        {
            "creature": "1d4 orcs",
            "lair": "A crude campsite",
            "spoor": "Dead goblins",
            "tracks": "Shoeprints",
            "primaryTraces": "A crude axe broken in two",
            "secondaryTraces": "A goblin hung by its neck"
        },
        {
            "creature": "3d3 goblins",
            "lair": "A small campsite",
            "spoor": "A bled-out deer, hung up in a crude trap",
            "tracks": "Footprints, some with boots, some not",
            "primaryTraces": "A blackened pentagram carved into rock",
            "secondaryTraces": "An orc corpse with a chain around its neck and a spear through the head"
        },
        {
            "creature": "2d4 goblins",
            "lair": "A small campsite",
            "spoor": "A bled-out deer, hung up in a crude trap",
            "tracks": "Footprints, some with boots, some not",
            "primaryTraces": "A blackened pentagram carved into rock",
            "secondaryTraces": "An orc corpse with a chain around its neck and a spear through the head"
        },
        {
            "creature": "2d2 wolves",
            "lair": "Shelter under a rock",
            "spoor": "Droppings",
            "tracks": "Paw marks",
            "primaryTraces": "Tufts of hair",
            "secondaryTraces": "Wolves howling"
        },
        {
            "creature": "Giant eagle",
            "lair": "A nest in an elevated location",
            "spoor": "A bundle of straw",
            "tracks": "A piercing eagle scream far away",
            "primaryTraces": "Uprooted trees",
            "secondaryTraces": "A large egg shell"
        },
        {
            "creature": "Mammoth",
            "lair": "Flattened grass near a pond",
            "spoor": "Flattened grass",
            "tracks": "Giant hoof prints",
            "primaryTraces": "Tufts of hair",
            "secondaryTraces": "Piece of a tusk"
        },
    ],
    "east": [
        {
            "creature": "3d4 kobolds",
            "lair": "A small, crude campsite",
            "spoor": "A pit trap with a chest on top (1d6 falling damage + 1d10 spike damage)",
            "tracks": "Big footprints",
            "primaryTraces": "Crude mining tools, small",
            "secondaryTraces": "Simple sculpture of a dragon"
        }, 
        {
            "creature": "1d2 orcs",
            "lair": "A crude campsite",
            "spoor": "Dead goblins",
            "tracks": "Shoeprints",
            "primaryTraces": "A crude axe broken in two",
            "secondaryTraces": "A goblin hung by its neck"
        },
        {
            "creature": "2d3 goblins and a goblin boss",
            "lair": "A small campsite",
            "spoor": "A bled-out deer, hung up in a crude trap",
            "tracks": "Footprints, some with boots, some not",
            "primaryTraces": "A blackened pentagram carved into rock",
            "secondaryTraces": "An orc corpse with a chain around its neck and a spear through the head"
        },
        {
            "creature": "3d3 goblins",
            "lair": "A small campsite",
            "spoor": "A bled-out deer, hung up in a crude trap",
            "tracks": "Footprints, some with boots, some not",
            "primaryTraces": "A blackened pentagram carved into rock",
            "secondaryTraces": "An orc corpse with a chain around its neck and a spear through the head"
        },
        {
            "creature": "2d2 wolves",
            "lair": "Shelter under a rock",
            "spoor": "Droppings",
            "tracks": "Paw marks",
            "primaryTraces": "Tufts of hair",
            "secondaryTraces": "Wolves howling"
        },
        {
            "creature": "Giant eagle",
            "lair": "A nest in an elevated location",
            "spoor": "A bundle of straw",
            "tracks": "A piercing eagle scream far away",
            "primaryTraces": "Uprooted trees",
            "secondaryTraces": "A large egg shell"
        },
        {
            "creature": "Mammoth",
            "lair": "Flattened grass near a pond",
            "spoor": "Flattened grass",
            "tracks": "Giant hoof prints",
            "primaryTraces": "Tufts of hair",
            "secondaryTraces": "Piece of a tusk"
        },
    ],
    "west": [
        {
            "creature": "1d4 lizardmen",
            "lair": "A simple campsite. Frogs grilling on a spit and spears in the ground indicate recent activity",
            "spoor": "A slain, skinned, and gutten giant toad",
            "tracks": "Many footprints of humanoid feet that have toe webbing and long claws",
            "primaryTraces": "A broken necklace made from bear teeth",
            "secondaryTraces": "Drums in the distance"
        }, 
        {
            "creature": "1d4 orcs",
            "lair": "A crude campsite",
            "spoor": "Dead goblins",
            "tracks": "Shoeprints",
            "primaryTraces": "A crude axe broken in two",
            "secondaryTraces": "A goblin hung by its neck"
        },
        {
            "creature": "2d2 dire wolves",
            "lair": "Underground cave",
            "spoor": "A party of orcs torn apart",
            "tracks": "Gigantic paw marks",
            "primaryTraces": "Wolves howling",
            "secondaryTraces": "Tufts of hair"
        },
        {
            "creature": "2d6 winged kobolds",
            "lair": "A small shelter built against a rock",
            "spoor": "A deer killed by falling rocks",
            "tracks": "A few tiny footprints that don't go anywhere",
            "primaryTraces": "Carving in Draconic: \"The true dragon god is in the west!\"",
            "secondaryTraces": "An elaborate sculpture of a green dragon"
        },
        {
            "creature": "3d4 kobolds",
            "lair": "A small, crude campsite",
            "spoor": "A pit trap with a chest on top (1d6 falling damage + 1d10 spike damage)",
            "tracks": "Tiny footprints",
            "primaryTraces": "Crude mining tools, small",
            "secondaryTraces": "Simple sculpture of a dragon"
        },
        {
            "creature": "Giant eagle",
            "lair": "A nest in an elevated location",
            "spoor": "A bundle of straw",
            "tracks": "A piercing eagle scream far away",
            "primaryTraces": "Uprooted trees",
            "secondaryTraces": "A large egg shell"
        },
        {
            "creature": "Mammoth",
            "lair": "Flattened grass near a pond",
            "spoor": "Flattened grass",
            "tracks": "Giant hoof prints",
            "primaryTraces": "Tufts of hair",
            "secondaryTraces": "Piece of a tusk"
        },
    ],
    "north": [
        {
            "creature": "3d4 kobolds",
            "lair": "A small, crude campsite",
            "spoor": "A pit trap with a chest on top (1d6 falling damage + 1d10 spike damage)",
            "tracks": "Big footprints",
            "primaryTraces": "Crude mining tools, small",
            "secondaryTraces": "Simple sculpture of a dragon"
        }, 
        {
            "creature": "1d2 orcs",
            "lair": "A crude campsite",
            "spoor": "Dead goblins",
            "tracks": "Shoeprints",
            "primaryTraces": "A crude axe broken in two",
            "secondaryTraces": "A goblin hung by its neck"
        },
        {
            "creature": "3d3 goblins",
            "lair": "A small campsite",
            "spoor": "A bled-out deer, hung up in a crude trap",
            "tracks": "Footprints, some with boots, some not",
            "primaryTraces": "A blackened pentagram carved into rock",
            "secondaryTraces": "An orc corpse with a chain around its neck and a spear through the head"
        },
        {
            "creature": "2d2 goblins",
            "lair": "A small campsite",
            "spoor": "A bled-out deer, hung up in a crude trap",
            "tracks": "Footprints, some with boots, some not",
            "primaryTraces": "A blackened pentagram carved into rock",
            "secondaryTraces": "An orc corpse with a chain around its neck and a spear through the head"
        },
        {
            "creature": "2d2 wolves",
            "lair": "Shelter under a rock",
            "spoor": "Droppings",
            "tracks": "Paw marks",
            "primaryTraces": "Tufts of hair",
            "secondaryTraces": "Wolves howling"
        },
        {
            "creature": "Giant eagle",
            "lair": "A nest in an elevated location",
            "spoor": "A bundle of straw",
            "tracks": "A piercing eagle scream far away",
            "primaryTraces": "Uprooted trees",
            "secondaryTraces": "A large egg shell"
        },
        {
            "creature": "Mammoth",
            "lair": "Flattened grass near a pond",
            "spoor": "Flattened grass",
            "tracks": "Giant hoof prints",
            "primaryTraces": "Tufts of hair",
            "secondaryTraces": "Piece of a tusk"
        },
    ],
    "forest": [
        {
            "creature": "3d4 kobolds",
            "lair": "A small, crude campsite",
            "spoor": "A pit trap with a chest on top (1d6 falling damage + 1d10 spike damage)",
            "tracks": "Big footprints",
            "primaryTraces": "Crude mining tools, small",
            "secondaryTraces": "Simple sculpture of a dragon"
        }, 
        {
            "creature": "Black bear",
            "lair": "An underground cave",
            "spoor": "A savaged deer",
            "tracks": "Bear tracks",
            "primaryTraces": "A tree trunk scraped up by claws",
            "secondaryTraces": "Large bear droppings"
        },
        {
            "creature": "Black bear",
            "lair": "An underground cave",
            "spoor": "A savaged deer",
            "tracks": "Bear tracks",
            "primaryTraces": "A tree trunk scraped up by claws",
            "secondaryTraces": "Bear droppings"
        },
        {
            "creature": "Swarm of ravens",
            "lair": "Nests in trees",
            "spoor": "Black feathers",
            "tracks": "A kobold with its eyes picked out",
            "primaryTraces": "Dark clouds moving fast",
            "secondaryTraces": "Distant cawing"
        },
        {
            "creature": "2d2 wolves",
            "lair": "Shelter under a rock",
            "spoor": "Droppings",
            "tracks": "Paw marks",
            "primaryTraces": "Tufts of hair",
            "secondaryTraces": "Wolves howling"
        },
        {
            "creature": "Giant elk",
            "lair": "Flattened grass near a pond",
            "spoor": "A chewed-on bush",
            "tracks": "Big hoof prints",
            "primaryTraces": "A tree trunk with claw marks (actually from antlers)",
            "secondaryTraces": "A baby elk"
        },
        {
            "creature": "Werewolf",
            "lair": "A basic hut",
            "spoor": "A bloody holy symbol to Iov",
            "tracks": "Shoeprints",
            "primaryTraces": "Wolf hairs",
            "secondaryTraces": "Torn human clothing"
        },
    ],
    "wetlands": [
        {
            "creature": "Shambling Mound",
            "lair": "A murky marsh pond",
            "spoor": "Crushed animal bones covered in rotten plant matter",
            "tracks": "A slimy streak of rotten plant matter",
            "primaryTraces": "The foul stench of compost",
            "secondaryTraces": "A large swamp bush charred by lightning"
        },
        {
            "creature": "2d3 nothics",
            "lair": "A small underground cave. 1 table B item (p. 144 DMG). Writings that reference the powerful magic of the great fortress in the West",
            "spoor": "Draconic runes carved into a stone (gives general direction towards lair)",
            "tracks": "Humanoid footprints with three claws",
            "primaryTraces": "The feeling of being observed",
            "secondaryTraces": "Whispers in Undercommon pertaining to the characters' deepest secrets"
        },
        {
            "creature": "Oni (shapeshifted into a lizardman during the day, shapeshifts into a human if it surprises party)",
            "lair": "A small, well-kept stone house. 1 table B item (p. 144 DMG). Copious notes on lizardman civilization: what they eat, their reverence for the Reptile Matriarch, their tribal structure, etc",
            "spoor": "A well-concealed, extinguished campfire. Investigation reveals lizardfolk bones and eggshells",
            "tracks": "Large, humanoid footprints",
            "primaryTraces": "Long, black hairs stuck on a bush",
            "secondaryTraces": "A dead lizardman with a short ivory horn stuck in his chest"
        },
        {
            "creature": "2d4 giant toads",
            "lair": "A swamp pond with lots of regular toads",
            "spoor": "Flies buzzing incessantly",
            "tracks": "Sporadic, large webbed footprints, four and four",
            "primaryTraces": "A bellowing, loud quack",
            "secondaryTraces": "Patches of flattened grass"
        },   
        {
            "creature": "Green hag",
            "lair": "A coven of three hags (this, sea hag & night hag) dwelling in a thatched hut. 50% chance for each hag to be present. 1 table F item (p. 146 DMG)",
            "spoor": "A faraway voice crying for help in Common",
            "tracks": "Footprints from slim human feet",
            "primaryTraces": "Twisted, blackened trees",
            "secondaryTraces": "A foul, stinking fog"
        },
        {
            "creature": "3d6 lizardmen",
            "lair": "A simple campsite. Frogs grilling on a spit and spears in the ground indicate recent activity",
            "spoor": "A slain, skinned, and gutten giant toad",
            "tracks": "Many footprints of humanoid feet that have toe webbing and long claws",
            "primaryTraces": "A broken necklace made from bear teeth",
            "secondaryTraces": "Drums in the distance"
        },
        {
            "creature": "1d10 lizardmen and a shaman",
            "lair": "A simple campsite, with a separate tent covered in bones and other relics",
            "spoor": "Dead snakes organized in a dragon-shaped pattern",
            "tracks": "Many footprints of humanoid feet that have toe webbing and long claws",
            "primaryTraces": "A broken necklace made from bear teeth",
            "secondaryTraces": "Drums and chanting in the distance, lanterns in the distance if at night"
        },
        {
            "creature": "1d4 giant constrictors",
            "lair": "The base of a large, sunken will tree",
            "spoor": "Remains of a lizardman with crushed bones",
            "tracks": "Slimy trackmarks through the swamp grass",
            "primaryTraces": "Something moving below the water",
            "secondaryTraces": "Tall grass shaking"
        },
        {
            "creature": "Troll (only found outside during night)",
            "lair": "A cave under an old, crumbling stone bridge",
            "spoor": "A bush burned to the ground, torch nearby, signs of a struggle",
            "tracks": "Large, wide, humanoid footprints",
            "primaryTraces": "A large, green severed arm",
            "secondaryTraces": "Large felled trees"
        },
        {
            "creature": "1d6 will-o-wisps (DC 14 Wisdom not to be compelled to follow, new save at end of turn)",
            "lair": "A field of tar, acting like quicksand (p. 110 DMG)",
            "spoor": "A lifeless troll covered in tar",
            "tracks": "None",
            "primaryTraces": "Glowing lantern-like lights in the distance (DC 14 Wisdom not to be compelled to follow, new save at end of turn)",
            "secondaryTraces": "Faint, distant whispers (DC 14 Wisdom not to be compelled to follow, new save at end of turn)"
        },
        {
            "creature": "Sea hag",
            "lair": "A coven of three hags (this, green hag & night hag) dwelling in a thatched hut. 50% chance for each hag to be present. 1 table F item (p. 146 DMG)",
            "spoor": "A mangled white dove",
            "tracks": "Slim humanoid footprints with webbed feet",
            "primaryTraces": "Streaks of seaweed stuck to the marsh grass",
            "secondaryTraces": "Discarded gutted fish by a marsh pond"
        },
        {
            "creature": "2d5 swarms of poisonous snakes",
            "lair": "The roots of an old tree growing sideways",
            "spoor": "White snake eggs under a bush",
            "tracks": "Hundreds of slimy trails",
            "primaryTraces": "Dead rabbits with snake bites",
            "secondaryTraces": "Slithering noises"
        },         
        {
            "creature": "Night hag",
            "lair": "A coven of three hags (this, sea hag & green hag) dwelling in a thatched hut. 50% chance for each hag to be present. 1 table F item (p. 146 DMG)",
            "spoor": "Pieces of a burgundy robe stuck on a thorn bush",
            "tracks": "Shoeprints of someone with a slim foot",
            "primaryTraces": "Nightmare haunting during sleep (p. 178 MM)",
            "secondaryTraces": "The feeling of being observed"
        },
        {
            "creature": "Wyvern",
            "lair": "The ruins of an old tower",
            "spoor": "A stray deer with blackened, disintegrated veins",
            "tracks": "Wings on the horizon",
            "primaryTraces": "A terrible shriek in the distance",
            "secondaryTraces": "Flocks of birds escaping frantically"
        },
        {
            "creature": "1d3 basilisks",
            "lair": "An old underground cellar. 50% chance to find 1d3 basilisk eggs",
            "spoor": "A very lifelike statue of a lizardman",
            "tracks": "Footprints from a four-clawed beast with six feet",
            "primaryTraces": "Remains of a partially petrified, partially chewed up racooon",
            "secondaryTraces": "Grass shaking"
        },
        {
            "creature": "Young green dragon (the Reptile Matriarch)",
            "lair": "A huge treasure-laden vault in the ruins of the great city to the west. Double treasure",
            "spoor": "A flock of half-consumed giant toads, their throats clawed at as they gasped for air through asphyxiating poison",
            "tracks": "Large clawed footprints on the ground, accompanied by lizardmen tracks",
            "primaryTraces": "A great roar in the distance",
            "secondaryTraces": "A momentary shadow passing overhead"
        }         
    ]
}
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
    "Grasslands": {precipitationMean: 1, windMean: 4, temperatureModifier: 0},
    "Marsh": {precipitationMean: 4, windMean: 0, temperatureModifier: 1}
}
    
    return {
        
        getEncounters: function () {
            return encounters
        },
        
        getMonths: function() {
            return months
        },
        
        getLocations: function() {
            return locations
        },
        
        getWeatherEffects: function() {
            return weatherEffects
        },
        
        getFogEffects: function() {
            return fogEffects
        },
        
        newWatches: function (currentWatch) {
            
            function Watch(watch, location, day, month, year, precipitation, wind, temperature, fog, sun, moon, encounter) {
                this.watch = watch;
                this.location = location;
                this.day = day;
                this.month = month;
                this.year = year;
                this.precipitation = precipitation;
                this.wind = wind;
                this.temperature = temperature;
                this.fog = fog;
                this.sun = sun;
                this.moon = moon;
                this.encounter = encounter;
            } 

            
            function singleWatch (current) {
            
                var newWatch = new Watch()

                // 1. Move to next watch

                for (i = 0; i < watchNames.length; i++) {
                    
                    if (current.watch === watchNames[i] && i !== watchNames.length -1) {
                        newWatch.watch = watchNames[i+1];
                    }  else if (current.watch === watchNames[i] && i === watchNames.length -1) {
                        newWatch.watch = watchNames[0];
                    }
                }
                
                // 2. Check and set location
                
                var selectedLocation = UIController.findChecked();
                
                if (selectedLocation !== current.location) {
                    newWatch.location = selectedLocation;
                } else {
                    newWatch.location = current.location;
                }

                // 3. Change date, month and year if applicable
                
                    newWatch.day = current.day;
                    newWatch.month = current.month;
                    newWatch.year = current.year;
                
                if (newWatch.watch === watchNames[0]) {
                    newWatch.day = current.day + 1;
                    
                    if (newWatch.day > 30) {
                        newWatch.day = 1
                        newWatch.month = current.month + 1
                    }
                    
                    if (newWatch.month > 12) {
                        newWatch.month = 1
                        newWatch.year = current.year +1
                    }
                }

                // 4. Note sunlight state and moon phase
                
                newWatch.sun = logicController.sunlight(current)
                newWatch.moon = logicController.moon(current.day)

                // 5. Encounter roll
                
                newWatch.encounter = logicController.encounter(current);

                // 6. Weather
                
                newWatch.precipitation = logicController.weather(current, current.precipitation, 'Precipitation')
                newWatch.wind = logicController.weather(current, current.wind, 'Wind')
                newWatch.temperature = logicController.temperature(newWatch)
                newWatch.fog = logicController.fog(current, newWatch.precipitation, newWatch.watch)
                
                return newWatch
            }
            
            var exports = []
            
            var first = singleWatch(currentWatch)
            exports.push(first)
            
            var second = singleWatch(first)
            exports.push(second)
            
            return exports
        },
        
        getWatchNames: function() {
            return watchNames    
        },
         
        
        getLatestWatches: function(array) {
        
            if (array !== null) {
                array.reverse();
                var result = []
                for (var i = 5; i > -1; i--) {
                    result.push(array[i])
                }
                return result
            }
            
        },
        
        updateArray: function(array, newWatches) {
            var watchList = array;
            for (var i = 0; i < newWatches.length; i++) {
                watchList.shift();
                watchList.push(newWatches[i])
            }
            
            return watchList
        },
        
        getJSON: function(dataURL, callback) {
        
            var url, req, res;
            url = dataURL;
            req = new XMLHttpRequest();
 
            req.responseType = 'json';
            req.onload = function() {
                callback(req.response);
                
            }
            
            req.open('GET', url, true);
            req.send();   
            
            
        },
        
        postToServer: function(data) {
            var http = new XMLHttpRequest();
            var url = '/data';
            
            http.open('POST', url);
            http.setRequestHeader("Content-Type", "application/json");
            http.send(JSON.stringify(data));
            
        } 
        
    }
    
})();

// UI CONTROLLER

var UIController = (function() {
    
    var DOMstrings = {
        1: '1',
        2: '3',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        locationButtons: 'locations',
        container: 'mainContainer',
        daylight: 'daylight',
        encounter: 'encounter',
        weather: 'weather',
        temperature: 'temperature',
        daylightIndicator: 'sun',
        hourIndicator: 'redborder',
        small: 'smalltext'
    }
    
    return {
        
        getDOMstrings: function() {
            return DOMstrings
        },
        
        findChecked: function() {
            var checked;
            var buttons = document.getElementById(DOMstrings.locationButtons).getElementsByTagName('input');
            
                for (var i = 0; i < buttons.length; i++) {
                    
                    if (buttons[i].checked === true) {
                        checked = buttons[i].value
                        break
                    }
                }
            
            return checked
        },
        
        updateUI: function(array) {
            
            function removeChildren (div) {
                while (div.firstChild) {
                    div.removeChild(div.firstChild);
                }
            }
            
            // 1. Set location radio button
                var last = array.length -1;
                var location = array[last].location;
                var buttons = document.getElementById(DOMstrings.locationButtons).getElementsByTagName('input');
                
                for (var i = 0; i < buttons.length; i++) {
                    if (buttons[i].value === location) {
                        buttons[i].checked = true;
                        break
                    }
                }
            // 2. Refresh date
                // Date
                var currentDay = array[0];
                var s = '/'
                var date = currentDay.day + s + currentDay.month + s + currentDay.year;
                var field = document.getElementById('date')
                field.innerHTML = date;
            
            // 3. Print data to UI
            array.forEach(function(element, index, array) {
                
                // Set background color based on precipitation level
                
                function updateBackground (el, indx, type) {
                    var div = document.getElementById(type + index)
                    var classes = div.classList;
                    var nameRegEx = /^precipitation[0-9]+/
                    
                    
                    classes.forEach(function(className, classIndex) {
                        var classToRemove = nameRegEx.exec(className)
                        if (classToRemove !== null) {
                            console.log(classToRemove[0])
                            div.classList.remove(classToRemove[0])
                        }
                        
                            
                    })
                }
                
                updateBackground(element, index, 'daylight')
                updateBackground(element, index, 'encounter')
                updateBackground(element, index, 'weather')
                updateBackground(element, index, 'temperature')
                
                document.getElementById('daylight' + index).classList.add('precipitation' + element.precipitation)
                document.getElementById('encounter' + index).classList.add('precipitation' + element.precipitation)
                document.getElementById('weather' + index).classList.add('precipitation' + element.precipitation)
                document.getElementById('temperature' + index).classList.add('precipitation' + element.precipitation)
                
                // Daylight indicator, CSS classes match strings in sun.watches array
                var daylight = document.getElementById(DOMstrings.daylight + index);
                removeChildren(daylight);
                
                if (index < 2) {
                    element.sun.watches.forEach(function(currentWatch, currentWatchNumber) {
                        var el = document.createElement('div');
                        el.classList.add(DOMstrings.daylightIndicator, currentWatch.toLowerCase());
                        var hour = currentWatchNumber + 1
                        el.id = element.watch.toLowerCase().replace(/ /g,'') +  hour.toString();
                        daylight.appendChild(el)
                    })    
                } else {
                    var el = document.createElement('div');
                    el.classList.add(DOMstrings.daylightIndicator, element.sun.watches[0].toLowerCase());
                    daylight.appendChild(el)
                }
                
                // Encounter
                var encounter = document.getElementById(DOMstrings.encounter + index);
                removeChildren(encounter);
                
                var p = document.createElement('p')
                p.innerHTML = '<strong>' + element.watch + '</strong>';
                encounter.appendChild(p);
                
                if (index < 2) {
                    var p = document.createElement('p');
                    
                    if (element.encounter.type !== undefined) {
                        p.innerHTML = element.encounter.type + ': ' + element.encounter.creature;
                        var time = document.getElementById(element.watch.toLowerCase().replace(/ /g,'') + element.encounter.time);
                        time.classList.add(DOMstrings.hourIndicator);
                        
                        var text = document.createElement('p');
                        text.innerHTML = element.encounter.text;
                        text.classList.add(DOMstrings.small);
                        p.appendChild(text);
                        
                        if (element.encounter.type === 'Encounter') {

                            var distance = document.createElement('p')
                            distance.innerHTML = element.encounter.distance + ' to the ' + element.encounter.direction.toLowerCase()
                            distance.classList.add(DOMstrings.small)
                            p.appendChild(distance)
                            
                            var heading = document.createElement('p');
                            if (element.encounter.direction !== element.encounter.heading) {
                                heading.innerHTML = 'Heading ' + element.encounter.heading.toLowerCase();
                            } else {
                                heading.innerHTML = 'Stationary';
                            }
                            
                            heading.classList.add(DOMstrings.small)
                            p.appendChild(heading)
                            
                        }
                        
                    } else {
                        p.innerHTML = element.encounter.text;
                    }
                    
                    encounter.appendChild(p)
                    
                }
            // Weather
            var weather = document.getElementById(DOMstrings.weather + index);
            removeChildren(weather)    
                
            var windLevel = document.createElement('p');
                
            for (var i = 0; i < 8; i++) {
                if (element.wind <= i) {
                    windLevel.innerHTML += '-';
                } else {
                    windLevel.innerHTML += '/';
                }
            }    
            
            weather.appendChild(windLevel)
                
                
            // Temperature
            var temperature = document.getElementById(DOMstrings.temperature + index)
            removeChildren(temperature)
            var temp = document.createElement('p');
            temp.innerHTML = element.temperature;
            temperature.appendChild(temp);
            
            if (index < 2) { 
                
            var effects = dataController.getWeatherEffects();
            var windLvl = element.wind;
            var precipLvl = element.precipitation;
                
            function level(lvl, type, effects) {
                var level = document.createElement('p');
                level.innerHTML = effects[type][lvl].level
                var text = document.createElement('p');
                text.innerHTML = effects[type][lvl].effect;
                text.classList.add(DOMstrings.small);
                level.appendChild(text)
                
                return level
            }
            
            var wind = level(windLvl, 'wind', effects)
            weather.appendChild(wind)
            var precipitation = level(precipLvl, 'precipitation', effects)
            weather.appendChild(precipitation)
            
                
            // Fog    
            if (element.fog > 0) {
                var fogEffects = dataController.getFogEffects()
                var fog = document.createElement('p');
                fog.innerHTML = fogEffects[element.fog].level;
                
                var fogEffect = document.createElement('p');
                fogEffect.innerHTML = fogEffects[element.fog].effect;
                fogEffect.classList.add(DOMstrings.small)
                fog.appendChild(fogEffect)
                
                weather.appendChild(fog)
            }
                

              

            var conditional = logicController.conditionals(array)
            if (conditional !== undefined) {   
                var lore = document.createElement('p');
                lore.innerHTML = conditional.name;
                var loreEffect = document.createElement('p');
                loreEffect.innerHTML = conditional.effect;
                loreEffect.classList.add(DOMstrings.small);
                lore.appendChild(loreEffect);
                weather.appendChild(lore);
            }
                
            }
            
                
                
            // End of array loop    
            })
            
            
        }
        
    }
    
    //If sun pos goes from true to false or vica versa, show sunrise/sunset color
    
})();

// GLOBAL CONTROLLER
var controller = (function(logicCtrl, dataCtrl, UICtrl) {

    var setupEventListeners = function(watches) {
        
        var btn = document.getElementById('nextWatch');
        btn.addEventListener('click', (function() {
                return function() {
                    
                // 1. Get data for next two watches based on latest watch   
                    var newWatches = dataCtrl.newWatches(watches[watches.length -1]);
                    
                // 2. Send to server
                    newWatches.forEach(function(element) {
                        dataCtrl.postToServer(element);
                    })
                
                // 3. Update watch list 
                    var newList = dataCtrl.updateArray(watches, newWatches) 
                    
                // 4. Check conditionals    
                    console.log(newList)
                    var lore = logicCtrl.conditionals(newList)
                    console.log('Weather lore: ' + lore)
                    
                // 5. Update UI    
                    UICtrl.updateUI(newList);    
                    
                // 6. Update event listener
                    var btn = document.getElementById('nextWatch');
                    var newBtn = btn.cloneNode(true)
                    btn.parentNode.replaceChild(newBtn, btn)    
                    setupEventListeners(newList)
                }
            })())};

    
    return {
    
        init: function() {
            console.log('DM page loaded');
            
            // 1. Load the JSON file
            dataCtrl.getJSON('data.json', function(response) {
                var watches = dataCtrl.getLatestWatches(response);
                
                //2. Check conditionals
                var lore = logicCtrl.conditionals(watches)
                console.log('Weather lore: ' + lore)
                
                // 2. Send to DOM
                UICtrl.updateUI(watches);
                
                // 3. Set event listeners
                setupEventListeners(watches)
                    });
            }
        }
        
})(logicController, dataController, UIController);

controller.init();
