var App = new Marionette.Application();

// DATA STUFF

var Stat = Backbone.Model.extend({
    defaults: {
        name: "statName",
        value: 0
    }
});

var StatSet = Backbone.Collection.extend({
    model: Stat
});

var Character = Backbone.Model.extend({
    model: StatSet
    // stats: {

    //     },
    // actions: {

    //     },
    // defaults: {
    //     "stats": {
    //         "name": "Redma",
    //         "abilities": {
    //             "str": 9,
    //             "dex": 11,
    //             "con": 15,
    //             "int": 15,
    //             "wis": 7,
    //             "cha": 16
    //         },
    //         "modifiers": {
    //             "str": -1nn
    //         }
    //     },
    //     "actions": {
    //         "attack": function(roll) {
    //             return roll + this.get("stats")["abilities"]["str"];
    //         }
    //     }
    // }
});

// VIEW STUFF

var StatView = Marionette.ItemView.extend({
    template: "#stat-template",
    model: Stat
});

var StatSetView = Marionette.CompositeView.extend({
    template: "#statset-template",
    collection: StatSet,
    childView: StatView,
    childViewContainer: "#stats"
});

var CharacterView = Marionette.CompositeView.extend({
    template: "#char-template",
    // collection: Character,
    childView: StatSetView,
    childViewContainer: "#statsets"
});

App.addRegions({
    statRegion: "#stat-region",
    statsetRegion: "#statset-region",
    characterRegion: "#character-region"
});

App.on("start", function() {
    console.log("App started");

    var stat = new Stat(
        {name: "strength", value: 10}
    );
    var statView = new StatView({model:stat});
    App.statRegion.show(statView);
    
    var statSet = new StatSet([
        new Stat({name: "dexterity", value: 11}),
        new Stat({name: "intelligence", value: 12}),
    ]);
    
    var statSetView = new StatSetView({collection:statSet});
    App.statsetRegion.show(statSetView);

    var char1 = new Character([
        new StatSet([
            new Stat({name: "wisdom", value: 13}),
            new Stat({name: "charisma", value: 14})
        ]),
        new StatSet([
            new Stat({name: "wisdom modifier", value: 1}),
            new Stat({name: "charisma modifier", value: 2})
        ])
    ]);

    var characterView = new CharacterView({collection:char1});
    App.characterRegion.show(characterView);

    Backbone.history.start();
});

App.start();
