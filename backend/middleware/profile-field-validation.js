const { acceptedFieldAttributes } = require("../config/attr")

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

        // Checking if Attributes are Valid

        const fields = profile.fields

        if (!fields || fields.length == 0) {
            return res.status(400).json({
                message: `The Profile ${profileName} Should Have atleast one Field`,
                data: null
            })
        }

        const errors = []

        fields.forEach(field => {

            if (!field.type || !field.name || !field.label) {
                errors.push({
                    message: "The Attributes Type, Name and Label are Required",
                    data: field
                })

                return
            }

            if (!Object.keys(acceptedFieldAttributes).includes(field.type)) {
                errors.push({
                    message: `Unknown Type ${field.type} is Used`,
                    data: field
                })

                return
            }

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

function validateLengths(req, res, next) {

    try {
        const fields = req.body.fields

        const errors = []

        fields.forEach(field => {
            if (Object.hasOwn(field, "min") && Number.isNaN(parseInt(field.min))) {
                errors.push({
                    message: `The Field ${field.name} Attribute Min is Not a Number`
                })
            }
            if (Object.hasOwn(field, "max") && Number.isNaN(parseInt(field.max))) {
                errors.push({
                    message: `The Field ${field.name} Attribute Max is Not a Number`
                })
            }
            if (Object.hasOwn(field, "length") && Number.isNaN(parseInt(field.length))) {
                errors.push({
                    message: `The Field ${field.name} Attribute Length is Not a Number`
                })

            }
            if ((Object.hasOwn(field, "min") && parseInt(field.min) < 0)) {
                errors.push({
                    message: `The Field ${field.name} Attribute Min Cannot be Negative and Max Cannot be Zero`
                })
            }

            if ((Object.hasOwn(field, "length") && parseInt(field.length) <= 0) || (Object.hasOwn(field, "max") && parseInt(field.max) <= 0)) {
                errors.push({
                    message: `The Field ${field.name} Attribute Length & Max Cannot be Negative or Zero`
                })
            }

            if (Object.hasOwn(field, "min") && Object.hasOwn(field, "max") && parseInt(field.min) >= parseInt(field.max)) {
                errors.push({
                    message: `The Field ${field.name} Attribute Min Should be Less than Max.`
                })
            }

            if ((Object.hasOwn(field, "min") && Object.hasOwn(field, "length")) || (Object.hasOwn(field, "max") && Object.hasOwn(field, "length"))) {
                errors.push({
                    message: `The Field ${field.name} Attributes Length is Defined While Min or Max is Defined. Either Define Min, Max or Length`
                })
            }

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

function normalizeFields(req, res, next) {
    try {
        const fields = req.body.fields

        fields.forEach(field => {
            field.name = field.name.toLowerCase()
            field.type = field.type.toLowerCase()
        })

        next()
    } catch (error) {

        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

module.exports = { validateFields, validateLengths, normalizeFields }