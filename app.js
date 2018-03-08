'use strict';

module.exports = app => {
  app.view.use('ractive', require('./lib/view'));
};
