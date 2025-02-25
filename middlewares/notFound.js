module.exports = (req, res) => {
  res
  .status(400)
  .json({message: 'Service not found'})
}