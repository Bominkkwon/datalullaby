import express from "express"

const app = express()

app.use(express.json())

app.get("/", (_req, res) => {
  res.send("datalullaby server is running")
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
