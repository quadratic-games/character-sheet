
var App = new Marionette.Application();

// DATA STUFF

var Stat = Backbone.Model.extend({
    defaults: {
        id: "undefined",
        name: "statName",
        value: 0,
        mutable: true
    }
});

var Character = Backbone.Collection.extend({
    model: Stat,
    initialize: function () {
        this.addStat("Name", "Enter your name!", [],
                     function (){});
        this.addStat("Level", 0, [],
                     function (){});
        ["Strength", "Dexterity", "Constitution",
         "Intelligence", "Wisdom", "Charisma"]
            .forEach(function (statName, index, array) {
                this.addStat(statName, 10, [],
                             function(){});
                this.addStat(statName + " mod.", 0, [statName],
                             function (statVal) {
                                 return Math.floor(
                                     (statVal - 10)
                                         / 2);
                             });
            }, this);
        this.addStat("BAB", 0, ["Level"],
                     function (level) {
                         return level - 1;
                     });
        this.addStat("Melee AB", 0, ["BAB", "Strength mod."],
                     function (bab, strmod) {
                         return bab + strmod;
                     });
    },
    addStat: function (statName, statVal, listenTos,
                       generator) {
        var mutability = listenTos.length === 0;
        var stat = new Stat({
            id: statName,
            name: statName,
            value: statVal,
            mutable: mutability
        });
        this.add(stat);

        var collection = this;
        listenTos.forEach(function (val, index, array) {
            stat.listenTo(collection.get(val), "change", function () {
                stat.set("value",
                         generator.apply(this,
                                         array.map(function (val) {
                                             return collection
                                                 .get(val)
                                                 .get("value");
                                         })));
            });
        });
        // modifierCallback: function (statName) {
        //     return function () {
        //         this.get(statName + " mod.")
        //             .set("value",
        //                  Math.floor((this.get(statName)
        //                              .get("value") - 10)
        //                             / 2));
        //     };
        // }
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
    childViewContainer: "#stats"
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
