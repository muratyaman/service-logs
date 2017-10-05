// Main application file

const compression = require('compression');
const express     = require('express');
const bodyParser  = require('body-parser');
const mongoose    = require('mongoose');
const Schema      = mongoose.Schema;
const Types       = mongoose.Types;
const app         = express();

// TODO: load config from .env
const config = {
  port: 3000,
  db: {
    url: 'mongodb://localhost:27017/service-logs',
    collection_name: 'logs'
  }
};

// Attempt to connect to the database server
mongoose.connect(config.db.url, { useMongoClient: true, promiseLibrary: global.Promise });

/**
 * Define/initialize Log Schema
 */
const logSchema = new Schema({
  _id:        { type: Schema.Types.ObjectId, unique: true,  required: true },
  app_id:     { type: String, index: true, required: true },
  level:      { type: String, index: true },
  module:     { type: String, index: true },
  request_id: { type: String, index: true },
  visitor_id: { type: String, index: true },
  message:    String,
  meta:       Schema.Types.Mixed,
  created:    { type: Date, index: true, required: true },
  received:   { type: Date, default: Date.now }
});

// Mongoose automatically looks for the plural version of your model name
const LogModel = mongoose.model('LogModel', logSchema, config.db.collection_name);

/**
 * Define log service
 */
class LogService {

  /**
   * Constructor
   */
  constructor () {
    console.log('new LogService instance');// TODO: remove on production
  }

  /**
   * Index handler
   * @param request
   * @param response
   */
  index (request, response) {
    console.log('index');// TODO: remove on production
    response.send('service-logs');
  }

  /**
   * Search log entries
   * @param request
   * @param response
   */
  search (request, response) {
    console.log('search');// TODO: remove on production
    let { app_id, level, module, limit, offset, start_date, end_date } = request.params;

    let criteria = { app_id };
    if (level) { // string
      criteria[ 'level' ] = level;
    }
    if (module) { // string
      criteria[ 'module' ] = module;
    }
    if (start_date) { // TODO: convert to date
      criteria[ 'created' ] = { $gt: start_date };
    }
    if (end_date) { // TODO: convert to date
      criteria[ 'created' ] = { $lt: end_date };
    }

    limit = parseInt(limit);
    if (limit < 0) limit = 10;
    if (100 < limit) limit = 100;

    offset = parseInt(offset);
    if (offset < 0) offset = 0;
    if (100 < offset) offset = 0;

    const sort = { created: -1 };

    const service = this;
    LogModel.find(criteria)
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec((err, logs) => service.onSearch(err, logs, request, response));
  }

  /**
   * Callback for search results
   * @param err
   * @param logs
   * @param request
   * @param response
   */
  onSearch (err, logs, request, response) {
    console.log('onSearch');// TODO: remove on production
    response.json({
      error: err,
      data: logs
    });
  }

  /**
   * Create a log entry
   * @param request
   * @param response
   */
  create (request, response) {
    console.log('create');// TODO: remove on production
    const app_id   = request.params.app_id;

    // destructuring with default value
    const { data } = request.body;

    // destructuring with default values
    let { level, module, request_id, visitor_id, message, meta, created } = data;
    const log_id  = new Types.ObjectId();
    const logData = { _id: log_id, app_id, level, module, request_id, visitor_id, message, meta, created };
    const service = this;
    try {
      LogModel.create(logData, (err, log) => service.onCreate(err, log, request, response));
    } catch (err) {
      service.onCreate(err, null, request, response);
    }
  }

  /**
   * Callback for create action
   * @param err
   * @param log
   * @param request
   * @param response
   */
  onCreate (err, log, request, response) {
    console.log('onCreate');// TODO: remove on production
    response.json({
      error: err,
      data: log
    });
  }

  /**
   * Retrieve a log entry
   * @param request
   * @param response
   */
  retrieve (request, response) {
    console.log('retrieve');// TODO: remove on production
    const app_id  = request.params.app_id;
    const log_id  = request.params.log_id;
    const service = this;
    LogModel.find({ _id: log_id, app_id }, (err, log) => service.onRetrieve(err, log, request, response));
  }

  /**
   * Callback for retrieve action
   * @param err
   * @param log
   * @param request
   * @param response
   */
  onRetrieve (err, log, request, response) {
    console.log('onRetrieve');// TODO: remove on production
    response.json({
      error: err,
      data: log
    });
  }

  /**
   * Update a log entry
   * @param request
   * @param response
   */
  update (request, response) {
    console.log('update');// TODO: remove on production
    const app_id   = request.params.app_id;
    const log_id   = request.params.log_id;
    const { data } = request.body;
    const setter   = { $set: data };
    const service  = this;
    try {
      // TODO: use app_id
      LogModel.findByIdAndUpdate(
        log_id, setter, { new: false }, (err, logUpdated) => service.onUpdate(err, logUpdated, request, response)
      );
    } catch (err) {
      service.onUpdate(err, null, request, response);
    }
  }

  /**
   * Callback for update action
   * @param err
   * @param logUpdated
   * @param request
   * @param response
   */
  onUpdate (err, logUpdated, request, response) {
    console.log('onUpdate');// TODO: remove on production
    response.json({
      error: err,
      data: logUpdated
    });
  }

  /**
   * Delete a log entry
   * @param request
   * @param response
   */
  remove (request, response) {
    console.log('remove');// TODO: remove on production
    const app_id  = request.params.app_id;
    const log_id  = request.params.log_id;
    const options = {};
    const service = this;
    try {
      // TODO: use app_id
      LogModel.findByIdAndRemove(
        log_id, options, (err, logDeleted) => service.onRemove(err, logDeleted, request, response)
      );
    } catch (err) {
      service.onRemove(err, null, request, response);
    }
  }

  /**
   * Callback for remove/delete action
   * @param err
   * @param logDeleted
   * @param request
   * @param response
   */
  onRemove (err, logDeleted, request, response) {
    console.log('onRemove');// TODO: remove on production
    response.json({
      error: err,
      data: logDeleted
    });
  }
}


// If/when we are behind a proxy, we will trust on the localhost for now
// @see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 'loopback');

// Use compression
app.use(compression());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Note: bodyParser has to be defined before the routes; otherwise we receive empty request.body

// Define routes
app.get   ('/',                     (request, response) => { const logs = new LogService(); logs.index(request, response); });
app.post  ('/test',                 (request, response) => { response.json(request.body); });
app.get   ('/logs/:app_id',         (request, response) => { const logs = new LogService(); logs.search(request, response) });
app.post  ('/logs/:app_id',         (request, response) => { const logs = new LogService(); logs.create(request, response); });
app.get   ('/logs/:app_id/:log_id', (request, response) => { const logs = new LogService(); logs.retrieve(request, response); });
app.put   ('/logs/:app_id/:log_id', (request, response) => { const logs = new LogService(); logs.update(request, response); });
app.delete('/logs/:app_id/:log_id', (request, response) => { const logs = new LogService(); logs.remove(request, response); });


// TODO: use a process manager: http://pm2.keymetrics.io/

// TODO: use a cluster: https://nodejs.org/dist/latest/docs/api/cluster.html

// Start listening on port
app.listen(config.port, function () {
  console.log('service-logs is listening on port ' + config.port);
});

// TODO: also use websockets
