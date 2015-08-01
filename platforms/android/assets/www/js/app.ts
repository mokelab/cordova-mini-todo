/// <reference path="./ractive.d.ts"/>

/// <reference path="./Application.ts"/>
/// <reference path="./TitlePage.ts"/>
/// <reference path="./ListPage.ts"/>

var $;
var _;
var Kii;
var KiiSite;
var Backbone;

var app = new App();

var AppRouter = Backbone.Router.extend({
    routes : {
        "" : "title",
        "list" : "list",
    },
    title : function() {
        app.page = new TitlePage();
        app.page.onCreate(app);
    },
    list : function() {
        app.page = new ListPage();
        app.page.onCreate(app);
    }           
});

$(() => {
    var APP_ID = "<Input your App ID>";
    var APP_KEY = "<Input your APP Key>";
    Kii.initializeWithSite(APP_ID, APP_KEY, KiiSite.JP);

    app.router = new AppRouter();
    Backbone.history.start();
});



