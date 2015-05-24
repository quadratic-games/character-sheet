var App = new Marionette.Application();

// DATA STUFF

var Stat = Backbone.Model.extend({
    defaults: {
        id: "Undefined",
        name: "Statname",
        value: 0,
        mutable: true,
        category: "Misc"
    }
});

var Character = Backbone.Collection.extend({
    model: Stat,
    categories: ["Character", "Abilities", "Modifiers", "Combat", "Misc"],
    comparator: function (model) {
        return this.categories.indexOf(model.get("category"));
    },
    initialize: function () {
        this.addStat("Character", "Name", "Enter your name!", [], function (){});
        this.addStat("Character", "Level", 0, [], function (){});
        
        ["Strength", "Dexterity", "Constitution",
         "Intelligence", "Wisdom", "Charisma"]
            .forEach(function (statName, index, array) {
                this.addStat("Abilities", statName, 10, [],
                            function(){});
                this.addStat("Modifiers", statName + " mod.", 0, [statName],
                            function (statVal) {
                                return Math.floor(
                                    (statVal - 10)
                                        / 2);
                            });
            }, this);
        this.addStat("Combat", "Base Attack Bonus", 0, ["Level"],
                    function (level) {
                        return level - 1;
                    });
        this.addStat("Combat", "Melee AB", 0, ["Base Attack Bonus", "Strength mod."],
                     function (bab, strmod) {
                         return bab + strmod;
                     });
        this.addStat("Combat", "Ranged AB", 0, ["Base Attack Bonus", "Dexterity mod."],
                     function (bab, dexmod) {
                         return bab + dexmod;
                     });
    },
    addStat: function (statCat, statName, statVal, listenTos,
                     generator) {
         var mutability = listenTos.length === 0;
         var stat = new Stat({
             id: statName,
             name: statName,
             value: statVal,
             mutable: mutability,
             category: statCat
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

