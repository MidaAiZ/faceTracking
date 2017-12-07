/*
 * 事件分发接口代码
 */

(function() {

  tracking.EventEmitter = function() {};


  tracking.EventEmitter.prototype.events_ = null;

  /**
   * 再一个特定的事件后追加事件
   * @param {string} event
   * @param {function} listener
   * @return {object} Returns e
   */
  tracking.EventEmitter.prototype.addListener = function(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    if (!this.events_) {
      this.events_ = {};
    }

    this.emit('newListener', event, listener);

    if (!this.events_[event]) {
      this.events_[event] = [];
    }

    this.events_[event].push(listener);

    return this;
  };

  /**
   * 返回所有监听事件
   * @param {string} event
   * @return {array} Array 事件列表
   */
  tracking.EventEmitter.prototype.listeners = function(event) {
    return this.events_ && this.events_[event];
  };


  tracking.EventEmitter.prototype.emit = function(event) {
    var listeners = this.listeners(event);
    if (listeners) {
      var args = Array.prototype.slice.call(arguments, 1);
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i]) {
          listeners[i].apply(this, args);
        }
      }
      return true;
    }
    return false;
  };

  /**
   * 添加事件监听
   */
  tracking.EventEmitter.prototype.on = tracking.EventEmitter.prototype.addListener;

  /**
   * 添加一次性事件监听
   * @param {string} event
   * @param {function} listener
   * @return {object} Returns
   */
  tracking.EventEmitter.prototype.once = function(event, listener) {
    var self = this;
    self.on(event, function handlerInternal() {
      self.removeListener(event, handlerInternal);
      listener.apply(this, arguments);
    });
  };

  /**
   *移除所有监听的事件
   * @param {string} event
   * @return {object} Returns
   */
  tracking.EventEmitter.prototype.removeAllListeners = function(opt_event) {
    if (!this.events_) {
      return this;
    }
    if (opt_event) {
      delete this.events_[opt_event];
    } else {
      delete this.events_;
    }
    return this;
  };

  /**
   * 移除一个监听事件
   * @param {string} event
   * @param {function} listener
   * @return {object} Returns
   */
  tracking.EventEmitter.prototype.removeListener = function(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    if (!this.events_) {
      return this;
    }

    var listeners = this.listeners(event);
    if (Array.isArray(listeners)) {
      var i = listeners.indexOf(listener);
      if (i < 0) {
        return this;
      }
      listeners.splice(i, 1);
    }

    return this;
  };

  tracking.EventEmitter.prototype.setMaxListeners = function() {
    throw new Error('Not implemented');
  };

}());
