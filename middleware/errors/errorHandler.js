const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).render("error", { message: err.message, statusCode });
};
module.exports = errorHandler;
