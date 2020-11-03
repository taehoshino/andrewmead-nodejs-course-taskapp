const express = require("express")
require("./db/mongoose")
const userRouter = require("./routers/user")
const taskRouter = require("./routers/task")

const app = express()

app.use(express.json()) // Parses requests with JSON payload and request body is populated (i.e. req.body)
app.use(userRouter)
app.use(taskRouter)

module.exports = app