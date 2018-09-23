const EventEmitter = require('events');

class Poller extends EventEmitter {
  /**
   * @param {int} timeout Time between the polls.
   * @param {function} callBack Function to evoke when polling.
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
