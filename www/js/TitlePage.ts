///<reference path="./Page.ts"/>
var KiiUser;

class TitlePage implements Page {
    ractive : Ractive;
    onCreate(app : App) {
        this.ractive = new Ractive({
            el : '#container',
            template : '#titleTemplate',
            data : {
                inProgress : false,
            }
        });
        this.ractive.on({
            login : () => {
                this.login(app);
            },
            signup : () => {
                this.signup(app);
            }
        });
    }

    private login(app : App) {
        var username = this.ractive.get('username');
        var password = this.ractive.get('password');

        this.ractive.set('inProgress', true);
        KiiUser.authenticate(username, password, {
            success : (user : any) => {
                this.ractive.set('inProgress', false);
                app.router.navigate('list', {trigger:true});
            },
            failure : (user : any, err : string) => {
                this.ractive.set('inProgress', false);
                this.showMessage('ログインに失敗した。。。' + err);
            }
        });
    }

    private signup(app : App) {
        var username = this.ractive.get('username');
        var password = this.ractive.get('password');

        this.ractive.set('inProgress', true);

        var user = KiiUser.userWithUsername(username, password);
        user.register({
            success : (u : any) => {
                this.ractive.set('inProgress', false);
                app.router.navigate('list', {trigger:true});
            },
            failure : (u : any, err : string) => {
                this.showMessage('登録に失敗した。。。' + err);
            }
        });
    }
    
    private showMessage(msg : string) {
        this.ractive.set('msg', msg);
    }    
}