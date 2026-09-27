const express = require("express")

const router = express.Router()

const { validateFields, validateLengths, normalizeFields } = require("../middleware/profile-field-validation")

router.get("/", async (req, res) => {

    const db = req.app.locals.db

    const profiles = await db.collection("profiles").find().toArray()

    res.json(profiles)

})

router.get("/:name", async (req, res) => {

    const db = req.app.locals.db

    const profile = await db.collection("profiles").findOne({ name: req.params.name })

    if (profile) {
        res.status(200).json({
            message: "Found Profile",
            data: profile
        })
    } else {
        res.status(200).json({
            message: "Profile Not Found",
            data: null
        })
    }

})

router.get("/o/names", async (req, res) => {
    try {
        const db = req.app.locals.db
        const profiles = await db
            .collection("profiles")
            .find({}, { projection: { name: 1, _id: 0 } })
            .toArray();

        const names = profiles.map(profiles => profiles.name);

        res.json(names);
    } catch (error) {

        res.status(500).json({ message: "Failed to get Profile Names" });

    }
});

router.post("/", validateFields, validateLengths, normalizeFields, async (req, res) => {

    try {

        const db = req.app.locals.db

        const data = req.body

        await db.collection("profiles").insertOne({
            ...data
        })

        res.status(201).json({
            message: "Profile Created Successfully",
            data
        })

    } catch (error) {

        console.log(error)

        res.status(500).json({
            message: "Internal Server Error. Failed to Create Profile",
            data: null
        })

    }

})

router.get("/o/clear", async (req, res) => {

    try {
        const db = req.app.locals.db

        await db.collection("profiles").deleteMany({})

        res.status(200).json({
            message: "Deleted all Entries in Profiles Collection."
        })

    } catch (error) {

        res.status(400).json({
            message: "Internal Server Error. Unable to Clear Collection."
        })

    }
})

module.exports = router