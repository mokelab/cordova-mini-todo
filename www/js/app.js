///<reference path="./Page.ts"/>
var App = (function () {
    function App() {
    }
    return App;
})();
///<reference path="./Page.ts"/>
var KiiUser;
var TitlePage = (function () {
    function TitlePage() {
    }
    TitlePage.prototype.onCreate = function (app) {
        var _this = this;
        this.ractive = new Ractive({
            el: '#container',
            template: '#titleTemplate',
            data: {
                inProgress: false
            }
        });
        this.ractive.on({
            login: function () {
                _this.login(app);
            },
            signup: function () {
                _this.signup(app);
            }
        });
    };
    TitlePage.prototype.login = function (app) {
        var _this = this;
        var username = this.ractive.get('username');
        var password = this.ractive.get('password');
        this.ractive.set('inProgress', true);
        KiiUser.authenticate(username, password, {
            success: function (user) {
                _this.ractive.set('inProgress', false);
                app.router.navigate('list', { trigger: true });
            },
            failure: function (user, err) {
                _this.ractive.set('inProgress', false);
                _this.showMessage('ログインに失敗した。。。' + err);
            }
        });
    };
    TitlePage.prototype.signup = function (app) {
        var _this = this;
        var username = this.ractive.get('username');
        var password = this.ractive.get('password');
        this.ractive.set('inProgress', true);
        var user = KiiUser.userWithUsername(username, password);
        user.register({
            success: function (u) {
                _this.ractive.set('inProgress', false);
                app.router.navigate('list', { trigger: true });
            },
            failure: function (u, err) {
                _this.showMessage('登録に失敗した。。。' + err);
            }
        });
    };
    TitlePage.prototype.showMessage = function (msg) {
        this.ractive.set('msg', msg);
    };
    return TitlePage;
})();
///<reference path="./Page.ts"/>
var KiiQuery;
var ListPage = (function () {
    function ListPage() {
    }
    ListPage.prototype.onCreate = function (app) {
        var _this = this;
        this.ractive = new Ractive({
            el: '#container',
            template: '#listTemplate',
            data: {
                inProgress: true,
                list: []
            }
        });
        this.ractive.on({
            add: function () {
                _this.add(app);
            },
            done: function (e, item) {
                _this.done(app, item);
            }
        });
        this.loadToDo();
    };
    ListPage.prototype.loadToDo = function () {
        var _this = this;
        var bucket = KiiUser.getCurrentUser().bucketWithName('todo');
        var query = KiiQuery.queryWithClause();
        var result = [];
        var total = 0;
        var callback = {
            success: function (queryPerformed, resultSet, nextQuery) {
                for (var i = 0; i < resultSet.length; i++) {
                    total += resultSet[i].get('amount');
                    result.push(resultSet[i]);
                }
                if (nextQuery != null) {
                    bucket.executeQuery(nextQuery, callback);
                }
                else {
                    _this.ractive.set('list', result);
                    _this.ractive.set('inProgress', false);
                }
            },
            failure: function (queryPerformed, err) {
                _this.showMessage('ToDoの取得に失敗した。。。' + err);
            }
        };
        bucket.executeQuery(query, callback);
    };
    ListPage.prototype.add = function (app) {
        var _this = this;
        var todo = this.ractive.get('todo');
        todo = todo.trim();
        if (todo.length == 0) {
            return;
        }
        var bucket = KiiUser.getCurrentUser().bucketWithName('todo');
        var obj = bucket.createObject();
        obj.set('todo', todo);
        this.ractive.set('inProgress', true);
        obj.save({
            success: function (o) {
                _this.ractive.set('inProgress', false);
                _this.ractive.set('todo', '');
                _this.ractive.push('list', o);
                _this.showMessage('ToDoの作成に成功したよ');
            },
            failure: function (o, err) {
                _this.ractive.set('inProgress', false);
                _this.showMessage('作成に失敗した。。 ' + err);
            }
        });
    };
    ListPage.prototype.done = function (app, item) {
        var _this = this;
        item.delete({
            success: function (o) {
                // remove from list
                var uri = o.objectURI();
                var list = _this.ractive.get('list');
                for (var i = 0; i < list.length; ++i) {
                    if (list[i].objectURI() == uri) {
                        _this.ractive.splice('list', i, 1);
                        break;
                    }
                }
                _this.showMessage(item.get('todo') + ' 完了！');
            },
            failure: function (o, err) {
                _this.showMessage('完了処理、失敗したよ ' + err);
            }
        });
    };
    ListPage.prototype.showMessage = function (msg) {
        this.ractive.set('msg', msg);
    };
    return ListPage;
})();
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
    routes: {
        "": "title",
        "list": "list"
    },
    title: function () {
        app.page = new TitlePage();
        app.page.onCreate(app);
    },
    list: function () {
        app.page = new ListPage();
        app.page.onCreate(app);
    }
});
$(function () {
    var APP_ID = "<Input your App ID>";
    var APP_KEY = "<Input your APP Key>";
    Kii.initializeWithSite(APP_ID, APP_KEY, KiiSite.JP);
    app.router = new AppRouter();
    Backbone.history.start();
});
