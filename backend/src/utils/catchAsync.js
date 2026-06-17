/**
 * CatchAsync — Middleware wrapper to eliminate try-catch boilerplate in controllers.
 * Passes any thrown or rejected promise errors to the centralized global error handler.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
