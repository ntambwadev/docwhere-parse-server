var moment = require("moment");
var govDataModule = require('./modules/gov-data-module.js');
var googleDataModule = require('./modules/google-data-module.js');
var scheduledJobsModule = require('./modules/scheduled-jobs-module.js');
var facilityModule = require('./modules/facility-module.js');

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hello from DocWhere cloud code! ');
});


