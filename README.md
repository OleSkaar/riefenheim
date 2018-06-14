# Riefenheim 0.1 alpha
A tabletop RPG-app that creates rich detail for overland travel

Overland travel is often glossed over in tabletop RPGs, D&D in particular, because it lacks the structure and detail found in dungeons. 

This app is intended to prevent that by providing all the information a Game Master needs to make each day in the wilderness unique and
interesting with a single button click. 

It generates the following data:
- Encounters
- Weather
- Date
- Hours of sunlight in the day
- Moon phase


Features on the way:
- An actual user interface
- Showing 24 hours of weather instead of 8
- Weather lore

Potential features:
- Dynamic encounter tables based on tribal strength
- Name generation for humanoid creatures
- Map interface and distance calculation

The app currently requires an initial data file to function, which is not included here for testing purposes.

To start the app, create a file named data.json in the /public/ directory and paste the following:

[
{
    "watch": "Dawn",
    "location": "Grasslands",
    "day": 2,
    "month": 6,
    "year": 1352,
    "precipitation": 1,
    "wind": 2,
    "temperature": 3,
    "sun": {
      "totalHours": 16.933333333333334,
      "remainingHours": 13,
      "watches": [
        true,
        true,
        true,
        true
      ]
    },
    "moon": "New",
    "encounter": {
      "text": "Nothing"
    }
  },
  {
    "watch": "Midday",
    "location": "Grasslands",
    "day": 2,
    "month": 6,
    "year": 1352,
    "precipitation": 1,
    "wind": 2,
    "temperature": 3,
    "sun": {
      "totalHours": 16.933333333333334,
      "remainingHours": 9,
      "watches": [
        true,
        true,
        true,
        true
      ]
    },
    "moon": "New",
    "encounter": {
      "time": 3,
      "creature": "2d8 wolves",
      "type": "Spoor",
      "text": "Wolves howling"
    }
  },
  {
    "watch": "Evening",
    "location": "Grasslands",
    "day": 2,
    "month": 6,
    "year": 1352,
    "precipitation": 1,
    "wind": 2,
    "temperature": 3,
    "sun": {
      "totalHours": 16.933333333333334,
      "remainingHours": 5,
      "watches": [
        true,
        true,
        true,
        true
      ]
    },
    "moon": "New",
    "encounter": {
      "time": 2,
      "creature": "Giant eagle",
      "type": "Encounter",
      "text": "Just passing by. Does not care.",
      "distance": "300 feet",
      "direction": "South",
      "heading": "North"
    }
  },
  {
    "watch": "Dusk",
    "location": "Grasslands",
    "day": 2,
    "month": 6,
    "year": 1352,
    "precipitation": 1,
    "wind": 3,
    "temperature": 3,
    "sun": {
      "totalHours": 16.933333333333334,
      "remainingHours": 1,
      "watches": [
        true,
        true,
        true,
        true
      ]
    },
    "moon": "New",
    "encounter": {
      "text": "Nothing"
    }
  },
  {
    "watch": "First night",
    "location": "Grasslands",
    "day": 2,
    "month": 6,
    "year": 1352,
    "precipitation": 1,
    "wind": 3,
    "temperature": 3,
    "sun": {
      "totalHours": 16.933333333333334,
      "remainingHours": 0,
      "watches": [
        true,
        false,
        false,
        false
      ]
    },
    "moon": "New",
    "encounter": {
      "text": "Nothing"
    }
  },
  {
    "watch": "Second night",
    "location": "Grasslands",
    "day": 2,
    "month": 6,
    "year": 1352,
    "precipitation": 1,
    "wind": 3,
    "temperature": 3,
    "sun": {
      "totalHours": 16.933333333333334,
      "remainingHours": 0,
      "watches": [
        false,
        false,
        false,
        false
      ]
    },
    "moon": "New",
    "encounter": {
      "text": "Nothing"
    }
  }
 ]
