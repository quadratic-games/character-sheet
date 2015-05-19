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

var Character = Backbone.Collection.extend({
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
    //             "str": -1
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

App.addRegions({
    charRegion:"#char-region"
});

var StatView = Marionette.ItemView.extend({
    template: "#stat-template",
    model: Stat
});

var StatSetView = Marionette.CompositeView.extend({
    template: "#statset-template",
    childView: StatView,
    childViewContainer: "#stats",
});

var CharacterView = Marionette.CompositeView.extend({
    template: "#char-template",
    childView: StatSetView,
    childViewContainer: "#statsets"
});

App.on("start", function() {
    console.log("App started");

    // var statSet = new StatSet([
    //     new Stat({name: "strength", value: 10}),
    //     new Stat({name: "wisdom", value: 8})
    // ]);
    var char1 = new Character([
        new StatSet([
            new Stat({name: "strength", value: 10}),
            new Stat({name: "wisdom", value: 8})
        ]),
        new StatSet([
            new Stat({name: "strength modifier", value: 0}),
            new Stat({name: "wisdom modifier", value: -1})
        ])
    ]);
    // char1.on("change:stats", function() {
    //     var newStats = _.clone(this.get("stats"));
    //     newStats.modifiers.str = (newStats.abilities.str - 10) / 2;

    //     this.set("stats", newStats);
    // });

    // var statSetView = new StatSetView({collection:statSet});
    // App.charRegion.show(statSetView);

    var characterView = new CharacterView({collection:char1});
    App.charRegion.show(characterView);
    
    Backbone.history.start();
});

App.start();
