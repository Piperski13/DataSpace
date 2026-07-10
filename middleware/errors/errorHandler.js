const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).render("pages/error", { message: err.message });
};
module.exports = errorHandler;
