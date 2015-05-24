
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
        this.makeAbility("strength");
        this.makeAbility("dexterity");
        this.makeAbility("constitution");
        this.makeAbility("intelligence");
        this.makeAbility("wisdom");
        this.makeAbility("charisma");
    },
    makeAbility: function (statName) {
        this.add(new Stat({
            id: statName,
            name: statName,
            value: 10,
            mutable: true
        }));
        console.log(this.get(statName));
        this.add(new Stat({
            id: statName + " mod.",
            name: statName + " mod.",
            value: 0,
            mutable: false
        }));
        this.on("change", function () {
                this.get(statName + " mod.")
                .set("value",
                     Math.floor((this.get(statName).get("value") - 10)
                                / 2))});
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
                this.model.set("value", parseInt(newval));
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
