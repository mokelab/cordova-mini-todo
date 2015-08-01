///<reference path="./Page.ts"/>
var KiiQuery;
class ListPage implements Page {
    ractive : Ractive;
    
    onCreate(app : App) {
        this.ractive = new Ractive({
            el : '#container',
            template : '#listTemplate',
            data : {
                inProgress : true,
                list : [],
            }
        });
        this.ractive.on({
            add : () => {
                this.add(app);
            },
            done : (e : any, item : any) => {
                this.done(app, item);
            }
        });

        this.loadToDo();
    }

    private loadToDo() {
        var bucket = KiiUser.getCurrentUser().bucketWithName('todo');
        var query = KiiQuery.queryWithClause();

        var result = [];
        var total = 0;
        var callback = {
            success: (queryPerformed : any, resultSet : Array<any>, nextQuery : any) => {
                for(var i = 0 ; i < resultSet.length ; i++) {
                    total += resultSet[i].get('amount');
                    result.push(resultSet[i]);
                }
                if(nextQuery != null) {
                    bucket.executeQuery(nextQuery, callback);
                } else {
                    this.ractive.set('list', result);
                    this.ractive.set('inProgress', false);
                }
            },
            failure: (queryPerformed : any, err : string) => {
                this.showMessage('ToDoの取得に失敗した。。。' + err);
            }
        };
        bucket.executeQuery(query, callback);        
    }

    private add(app : App) {
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
            success: (o : any) => {
                this.ractive.set('inProgress', false);
                this.ractive.set('todo', '');
                this.ractive.push('list', o);
                this.showMessage('ToDoの作成に成功したよ');
            },
            failure: (o : any, err : string) => {
                this.ractive.set('inProgress', false);
                this.showMessage('作成に失敗した。。 ' + err);
            }
        });
    }

    private done(app : App, item : any) {
        item.delete({
            success: (o : any) => {
                // remove from list
                var uri = o.objectURI();
                var list = this.ractive.get('list');
                for (var i = 0 ; i < list.length ; ++i) {
                    if (list[i].objectURI() == uri) {
                        this.ractive.splice('list', i, 1);
                        break;
                    }
                }
                this.showMessage(item.get('todo') + ' 完了！');
            },
            failure: (o : any, err : string) => {
                this.showMessage('完了処理、失敗したよ ' + err);
            }
        });
    }

    private showMessage(msg : string) {
        this.ractive.set('msg', msg);
    }
}
