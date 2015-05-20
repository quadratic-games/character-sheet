
var App = new Marionette.Application();

// DATA STUFF

var Stat = Backbone.Model.extend({
    defaults: {
        name: "statName",
        value: 0
    }
});

var Character = Backbone.Collection.extend({
    model: Stat
});

// var Character = Backbone.Model.extend({
//     model: StatSet
//     // stats: {

//     //     },
//     // actions: {

//     //     },
//     // defaults: {
//     //     "stats": {
//     //         "name": "Redma",
//     //         "abilities": {
//     //             "str": 9,
//     //             "dex": 11,
//     //             "con": 15,
//     //             "int": 15,
//     //             "wis": 7,
//     //             "cha": 16
//     //         },
//     //         "modifiers": {
//     //             "str": -1nn
//     //         }
//     //     },
//     //     "actions": {
//     //         "attack": function(roll) {
//     //             return roll + this.get("stats")["abilities"]["str"];
//     //         }
//     //     }
//     // }
// });

// VIEW STUFF

var StatView = Marionette.ItemView.extend({
    template: "#stat-template",
    model: Stat
});

var CharacterView = Marionette.CompositeView.extend({
    template: "#character-template",
    collection: Character,
    childView: StatView,
    childViewContainer: "#stats"
});

App.addRegions({
    statRegion: "#stat-region",
    characterRegion: "#character-region"
});

App.on("start", function() {
    console.log("App started");

    var stat = new Stat(
        {name: "strength", value: 10}
    );
    var statView = new StatView({model:stat});
    App.statRegion.show(statView);
    
    var character = new Character([
        new Stat({name: "dexterity", value: 11}),
        new Stat({name: "intelligence", value: 12}),
    ]);
    
    var characterView = new CharacterView({collection:character});
    App.characterRegion.show(characterView);

    Backbone.history.start();
});

App.start();
