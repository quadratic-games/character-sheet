var App = new Marionette.Application();

// DATA STUFF

// Data from the Pathfinder PRD
var sizes = ["Fine", "Diminutive", "Tiny", "Small", "Medium", "Large", "Huge", "Garganutan", "Colossal"];
var levels = {
    "Slow": [3000, 7500, 14000, 23000, 35000, 53000, 77000, 115000, 160000, 235000, 330000, 475000, 665000, 955000, 135000, 1900000, 2700000, 3850000, 5350000],
    "Medium": [2000, 5000, 14000, 23000, 35000, 51000, 75000, 105000, 155000, 220000, 315000, 445000, 665000, 955000, 1350000, 1800000, 2550000, 3600000],
    "Fast": [1300, 3300, 6000, 10000, 15000, 23000, 24000, 50000, 71000, 105000, 145000, 210000, 295000, 425000, 600000, 850000, 120000, 170000, 240000],
};

var Stat = Backbone.Model.extend({
    defaults: {
        id: "undefined",
        name: "Statname",
        value: 0,
        mutable: true,
        category: "Misc"
    }
});

var Character = Backbone.Collection.extend({
    model: Stat,
    url: "/server",
    categories: ["Character", "Abilities", "Modifiers", "Combat", "Saving Throws", "Misc"],
    comparator: function (model) {
        return this.categories.indexOf(model.get("category"));
    },
    initialize: function () {
        this.addStat("Character", "Name", [], function (){return "Enter your name!";});
        this.addStat("Character", "Experience", [], function(){return 0;});
        this.addStat("Character", "Exp. Track", [], function(){return "Medium";});
        this.addStat("Character", "Level", ["Experience", "Exp. Track"],
                     function (exp, track)  {
                         for (var index = 0; index < levels[track].length; index++) {
                             if (exp <= levels[track][index]) {
                                 return index + 1;
                             }
                         }
                         return levels[track].length;
                     });
        this.addStat("Character", "Size", [], function(){return "Medium";});
        this.addStat("Modifiers", "Size mod", ["Size"],
                     function(size){
                         var sizeIndex = sizes.indexOf(size) - 4;
                         return Math.sign(sizeIndex) * Math.pow(2, Math.abs(sizeIndex));
                     });
        this.addStat("Character", "Race", [], function(){return "Human";});
        this.addStat("Character", "Class", [], function(){return "Fighter";});
        
        ["Strength", "Dexterity", "Constitution",
         "Intelligence", "Wisdom", "Charisma"]
            .forEach(function (statName, index, array) {
                this.addStat("Abilities", statName, [],
                            function(){return 10;});
                this.addStat("Modifiers", statName + " mod", [statName],
                            function (statVal) {
                                return Math.floor(
                                    (statVal - 10)
                                        / 2);
                            });
            }, this);
        this.addStat("Combat", "Base Attack Bonus", ["Level"],
                     function (level) {
                         return level - 1;
                     });
        this.addStat("Combat", "Melee AB", ["Base Attack Bonus", "Strength mod"],
                     function (bab, strmod) {
                         return bab + strmod;
                     });
        this.addStat("Combat", "Ranged AB", ["Base Attack Bonus", "Dexterity mod"],
                     function (bab, dexmod) {
                         return bab + dexmod;
                     });
        this.addStat("Combat", "Combat Maneuver Bonus", ["Base Attack Bonus", "Size mod",
                                                            "Strength mod"],
                    function (bab, sizemod, strmod) {
                        return bab - sizemod + strmod;
                    });
        this.addStat("Combat", "Combat Maneuver Defense", ["Base Attack Bonus", "Size mod",
                                                            "Strength mod", "Dexterity mod"],
                    function (bab, sizemod, strmod, dexmod) {
                        return 10 - sizemod + bab + strmod + dexmod;
                    });
        this.addStat("Combat", "Flat-Footed", ["Base Attack Bonus", "Size mod",
                                                 "Strength mod"],
                     function (bab, sizemod, strmod) {
                         return 10 + bab - sizemod + strmod;
                     });
        this.addStat("Saving Throws", "Fortitude Save", ["Constitution mod"],
                     function(conmod) {
                         return conmod;
                     });
        this.addStat("Saving Throws", "Reflex Save", ["Dexterity mod"],
                     function(dexmod) {
                         return dexmod;
                     });
        this.addStat("Saving Throws", "Will Save", ["Wisdom mod"],
                     function(wismod) {
                         return wismod;
                     });
        this.trigger("change");
    },
    addStat: function (statCat, statName, listenTos,
                       generator) {
        var mutability = listenTos.length === 0;
        var collection = this;
        var stat = new Stat({
            id: statName,
            name: statName,
            value: generator.apply(collection,
                                   listenTos.map(function (val) {
                                       return collection.get(val).get("value");
                                   })),
            mutable: mutability,
            category: statCat
         });
         this.add(stat);
        
         listenTos.forEach(function (val, index, array) {
             stat.listenTo(collection.get(val), "change", function () {
                 stat.set("value",
                     generator.apply(this,
                         array.map(function (val) {
                             return collection.get(val).get("value");
                         })));
                 stat.sync("update", stat);
             });
         });

        this.sort();
     }
});

// VIEW STUFF

var StatView = Marionette.ItemView.extend({
    template: "#stat-template",
    tagName: "tr",
    model: Stat,
    initialize: function () {
        this.listenTo(this.model, "change", this.render);
    },
    ui: {
        value: "#value",
    update: "#update"
    },
    events: {
        "click @ui.update": function () {
            var newval = this.ui.value.val();
            if (!isNaN(parseInt(newval))) {
                newval = parseInt(newval);
            }
            if (typeof(this.model.get("value")) === typeof(newval)) {
                this.model.set("value", newval);
            }
        }
    }
});

var CharacterView = Marionette.CompositeView.extend({
    template: "#character-template",
    collection: Character,
    childView: StatView,
    childViewContainer: "tbody",
});

App.addRegions({
    characterRegion: "#character-region"
});

App.on("start", function() {
    console.log("App started");

    var character = new Character();

    var characterView = new CharacterView({collection:character});
    App.characterRegion.show(characterView);

    Backbone.history.start();
});

App.start();

