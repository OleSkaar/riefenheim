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

To start the app, create a file named data.json and paste the following:

[
  [
    {
      "watch": "Dawn",
      "location": "Grasslands",
      "day": 1,
      "month": 6,
      "year": 1352,
      "precipitation": "0",
      "wind": "1",
      "temperature": "3",
      "sun": {
        "watches": [
          true,
          true,
          true,
          true
        ],
        "totalHours": 17,
        "remainingHours": 13
      },
      "moon": "New",
      "encounter": "none"
    },
    {
      "watch": "Midday",
      "location": "Grasslands",
      "day": 1,
      "month": 6,
      "year": 1352,
      "precipitation": "0",
      "wind": "1",
      "temperature": "3",
      "sun": {
        "watches": [
          true,
          true,
          true,
          true
        ],
        "totalHours": 17,
        "remainingHours": 9
      },
      "moon": "New  ",
      "encounter": "none"
    }
  ]
]

