var App = new Marionette.Application();

// DATA STUFF

var Character = Backbone.Model.extend({
    defaults: {
        "stats": {
            "name": "Redma",
            "abilities": {
                "str": 9,
                "dex": 11,
                "con": 15,
                "int": 15,
                "wis": 7,
                "cha": 16
            },
            "modifiers": {
                "str": -1
            }
        },
        "actions": {
            "attack": function(roll) {
                return roll + this.get("stats")["abilities"]["str"];
            }
        }
    }
});

// VIEW STUFF

App.addRegions({
    charRegion:"#char-region"
});

App.CharacterView = Marionette.ItemView.extend({
    template: "#char-template",
    tagName: "table"
});

App.on("start", function() {
    console.log("App started");

    var char1 = new Character();
    
    char1.on("change:stats", function() {
        var newStats = _.clone(this.get("stats"));
        newStats.modifiers.str = (newStats.abilities.str - 10) / 2;

        this.set("stats", newStats);
    });

    var characterView = new App.CharacterView({model:char1});
    App.charRegion.show(characterView);

    Backbone.history.start();
});

App.start();
