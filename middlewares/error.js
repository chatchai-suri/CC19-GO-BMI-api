const handleErrors = (err, req, res, next) => {
  console.log(err)
  res
  .status(err.statusCode || 500)
  .json({message: err.message || 'Somthing wrong!!!'})
}

module.exports = handleErrors