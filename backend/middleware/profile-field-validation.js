const { acceptedFieldAttributes } = require("../config/attr")
const { checkMinMax } = require("../utils")

async function validateFields(req, res, next) {

    try {
        const profile = req.body

        const profileName = profile.name

        // Checking Existing Profile Name

        const db = req.app.locals.db

        const exists = await db
            .collection("profiles")
            .findOne({ name: profileName })


        if (exists) {

            return res.status(400).json({
                message: `The Profile ${profileName} Already Exists`,
                data: profile
            })

        }


        // Checkin if Profile Has Atleast One Field

        const fields = profile.fields

        if (!fields || fields.length == 0) {
            return res.status(400).json({
                message: `The Profile ${profileName} Should Have atleast one Field`,
                data: null
            })
        }

        const errors = []

        // Checking if Attributes are Valid

        fields.forEach(field => {

            // Checking for Required Attributes

            if (!field.type || !field.name || !field.label) {
                errors.push({
                    message: "The Attributes Type, Name and Label are Required",
                    data: field
                })

                return
            }

            // Checking if Unknown Type is Sent.

            if (!Object.keys(acceptedFieldAttributes).includes(field.type)) {
                errors.push({
                    message: `Unknown Type ${field.type} is Used`,
                    data: field
                })

                return
            }

            // Checkin if Unknown Attriubute is Sent.

            Object.keys(field).forEach(attribute => {

                if (!acceptedFieldAttributes[field.type].includes(attribute)) {
                    errors.push({
                        message: `Unknown Attribute ${attribute} is Used`,
                        data: field
                    })
                }

            })

        })

        if (errors.length > 0) {

            return res.status(400).json(errors)

        }

        next()

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error."
        })
    }

}

function validateMinMax(req, res, next) {
    try {

        const fields = req.body.fields

        for (let i = 0; i < fields.length; i++) {
            const validated = checkMinMax(fields[i])

            if (validated.error) {

                return res.status(400).json({ message: validated.error })

            }
        }

        next()

    } catch (error) {

        console.log(error)

        return res.status(500).json({
            message: "Internal Server Error."
        })
    }

}

function normalizeFields(req, res, next) {
    try {
        const fields = req.body.fields

        fields.forEach(field => {

            for (const attribute in field) {
                field[attribute] = field[attribute].toString()

                if (attribute == 'name' || attribute == 'type') {
                    field[attribute] = field[attribute].toLowerCase()
                }

            }

        })

        next()
    } catch (error) {

        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

module.exports = { validateFields, normalizeFields, validateMinMax }