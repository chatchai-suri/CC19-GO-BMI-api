const createError = (code, message) => {
  console.log('Step1 Create error')
  const error = new Error(message)
  error.statusCode = code
  throw error
}

module.exports = createError