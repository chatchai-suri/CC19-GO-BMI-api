
require('dotenv').config()
const helmet = require("helmet")
const express = require("express")
const cors  = require("cors")
const morgan = require("morgan")
const authRoute = require('./routes/auth-route')
const userRoute = require('./routes/user-route')
const handleErrors = require('./middlewares/error')
const notFound = require('./middlewares/notFound')


const app = express()

// Middlewares
app.use(cors())
app.use(morgan("dev"))
app.use(express.json())



// Routhing
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)

// Not found
app.use(notFound)

// Middlewares Error
app.use(handleErrors)


// Start Server
const port = process.env.PORT || 8000
app.listen(port, ()=> console.log("Server is running on", port))