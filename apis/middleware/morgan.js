const morgan = require("morgan");

const Logger = require("../../services/logger");

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream = {
  // Use the http severity
  write: (message) => Logger.http(message),
};

// Skip all the Morgan http log if the
// application is not running in development mode.
const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
  // TODO change back to prod logging at some point
  // return false;
};

const morganMiddleware = morgan(
  // Define message format string (this is the default one).
  ":method :url :status :res[content-length] - :response-time ms",
  // Options: in this case, overwrite.
  // See the methods above.
  { stream, skip }
);

module.exports = morganMiddleware;
