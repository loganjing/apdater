function EventEmitter() {
    this.eventBus = {};
}
EventEmitter.prototype = {
    on: function(eName, handler) {
        this.eventBus[eName] = handler;
    },
    off: function(eName) {
        delete this.eventBus[eName];
    },
    emit: function(eName) {
        var handler = this.eventBus[eName];
        if (handler) {
            var args = [].slice.call(arguments, 1);
            handler.apply(this, args);
        }
    }
}

function initEvent(Component){
    
}

module.exports = initEvent;