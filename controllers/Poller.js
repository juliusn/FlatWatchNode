const EventEmitter = require('events');

class Poller extends EventEmitter {
  /**
   * @param {int} timeout how long should we wait after the poll started?
   */
  constructor(timeout = 100, callBack) {
    super();
    this.timeout = timeout;
    this.callBack = callBack;
    this.on('poll', () => {
      this.callBack();
      this.timer = setTimeout(() => {
        this.emit('poll');
      }, this.timeout);
    });
  }

  start() {
    this.emit('poll');
  }

  stop() {
    clearTimeout(this.timer);
  }
}

module.exports = Poller;
