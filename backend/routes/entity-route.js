const express = require("express")

const { validateEntity } = require("../middleware/entity-validation")

const router = express.Router()

router.get("/", async (req, res) => {

    const db = req.app.locals.db

    const entities = await db.collection("entities").find().toArray()

    res.json(entities)

})

router.post("/", validateEntity, async (req, res) => {

    res.json(req.body)
})

module.exports = router