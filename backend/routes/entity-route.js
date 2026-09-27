const express = require("express")

const router = express.Router()

router.get("/", async (req, res) => {

    const db = req.app.locals.db

    const entities = await db.collection("entities").find().toArray()

    res.json(entities)

})

router.post("/", async (req, res) => {

    

})

module.exports = router