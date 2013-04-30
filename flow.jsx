// flow.jsx: asynchronous processes flow pattern
//
// jsx --executable web --output flow.js flow.jsx
//
class Flow {
    var _missable = 0;                  // Integer: Number of missable. default 0
    var _waits = 0;
    var _state = "progress";            // String: "progress", "done", "error", "exit"
    var _pass =  0;                     // Integer: #pass() called
    var _miss =  0;                     // Integer: #miss() called
    var _args =  []:Array.<variant>;    // MixArray: #pass(arg), #miss(arg) collections
    var _map  =  {}:Map.<variant>;      // MixObject: #pass(arg, key), #miss(arg, key) collections
    var _fn =    null:function(:variant, :Array.<variant>, :Map.<variant>):void;

    function constructor(waits:number,
                         callback:function(:variant, :Array.<variant>,
                                                     :Map.<variant>):void) {
        this._waits = waits;
        this._fn = callback;

        Flow._updateState(this);
    }

    function missable(count:number):Flow { // @arg Integer: missable count
                                           // @ret this:
                                           // @desc: extend missable count
        this._missable += count;
        return this;
    }

    function extend(waits:number):Flow { // @arg Integer:  Number of wait for processes
                                         // @ret this:
                                         // @desc: extend processes count
        this._waits += waits;
        return this;
    }

    function pass():Flow { // @ret this:
        ++this._pass;
        Flow._updateState(this);
        return this;
    }
    function pass(value:variant):Flow { // @arg Mix: value
                                        // @ret this:
        ++this._pass;
        this._args.push(value);
        Flow._updateState(this);
        return this;
    }
    function pass(value:variant,     // @arg Mix: value
                  key:string):Flow { // @arg String: key
                                     // @ret this:
        ++this._pass;
        this._args.push(value);
        key && (this._map[key] = value);
        Flow._updateState(this);
        return this;
    }

    function miss():Flow { // @ret this:
        ++this._miss;
        Flow._updateState(this);
        return this;
    }
    function miss(value:variant):Flow { // @arg Mix: value
                                        // @ret this:
        ++this._miss;
        this._args.push(value);
        Flow._updateState(this);
        return this;
    }
    function miss(value:variant,     // @arg Mix: value
                  key:string):Flow { // @arg String: key
                                     // @ret this:
        ++this._miss;
        this._args.push(value);
        key && (this._map[key] = value);
        Flow._updateState(this);
        return this;
    }

    static function _updateState(that:Flow):void { // @arg this:
                                                   // @inner: judge state and callback function
        if (that._state == "progress") {
            that._state = that._miss > that._missable ? "fail"
                        : that._pass + that._miss >= that._waits ? "done"
                        : that._state;
        }
        if (that._state == "progress" || !that._fn) { // progress or already finished
            return;
        }
        if (that._state == "done") {
            that._fn(null, that._args, that._map);
        } else {
            that._fn(new Error(that._state as string), that._args, that._map); // err.message: "fail" or "exit"
        }
        // --- finished ---
        that._fn = null;
        that._args = []:Array.<variant>; // free
        that._map = {}:Map.<variant>; // free
    }

    function exit():void { // @desc: exit the Flow
        if (this._state == "progress") {
            this._state = "exit";
        }
        Flow._updateState(this);
    }
}


