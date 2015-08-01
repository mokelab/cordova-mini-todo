declare class Ractive {
    constructor(option : any);
    on(action : string, func : any);
    on(params : any);
    get(name : string) : any;
    set(name : string, value : any);
    push(keypath : string, item : any);
    pop(keypath : string);
    splice(keypath : string, index : number, count : number);
    observe(params : any);
    observe(keypath : string, func : any);
    update();
}