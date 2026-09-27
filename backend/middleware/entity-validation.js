const { checkMinMax, checkLength } = require("../utils")

function matchPattern(value, field) {
    const pattern = new RegExp(field.pattern)
    if (!pattern.test(value)) {
        return {
            error: `The Text Doesnt Match the Pattern`
        }
    }
}

function checkMinMaxAndLen(value, field) {
    const min_max = checkMinMax(field)
    const len = checkLength(value, field)

    if (min_max.error)
        return min_max

    if (len.error)
        return len

}

function checkType(value, field) {

    let type = field.type

    if (field.type == "text") {
        type = "string"
    }

    if (typeof value != type) {
        return {
            error: `The Value for ${field.name} is not ${field.type}`
        }
    }
}


async function validateEntity(req, res, next) {

    try {

        const entity = req.body

        const db = req.app.locals.db

        // Checking for Required Entries

        // Checkinf if Entity Name Exists.

        const entityName = entity.name

        if (!entityName) {
            return res.status(400).json({
                message: "Entity Name is Required"
            })
        }

        // Check if Profile Exist.

        const profileName = entity.profile

        if (!profileName) {
            return res.status(400).json({
                message: "Profile is Required"
            })
        }

        // Check if Profile is Valid

        const profile = await db.collection("profiles").findOne({ name: profileName })

        if (!profile) {
            return res.status(400).json({
                message: `Unknown Profile ${profileName}`
            })
        }

        // Check if Entity Data Exists

        const entityData = entity.data

        if (!entityData) {
            return res.status(400).json({
                message: "Entity Data is Required"
            })
        }

        // Checking if Entity Data Has Unknown Fields

        const field_names = profile.fieldNames

        Object.keys(entityData).forEach(key => {
            if (!field_names.includes(key)) {
                return res.status(400).json({
                    message: `Unknown Field ${key} is Present in Entity`
                })
            }
        })

        // Checking if Entity Data is Valid

        for (let i = 0; i < profile.fields.length; i++) {

            const field = profile.fields[i]

            const fieldValue = entityData[field.name]


            const required = field.required ? true : false

            if (!fieldValue) {
                return res.status(400).json({
                    message: `Entity Doesnt Contain the Field ${field.name}`
                })
            }

            if (required && (fieldValue == null || fieldValue == undefined || fieldValue == "")) {
                return res.status(400).json({
                    message: `The Field ${field.name} is Required`
                })
            }

            if (field.type == "text") {

                const type_val = checkType(fieldValue, field)
                const min_max_len_val = checkMinMaxAndLen(fieldValue, field)

                if (type_val)
                    return res.status(400).json({ message: `${field.name} : ${type_val.error}` })

                if (min_max_len_val)
                    return res.status(400).json({ message: `${field.name} : ${min_max_len_val.error}` })

                if (field.pattern) {
                    const pattern_val = matchPattern(value, field)
                    if (pattern_val) {
                        return res.status(400).json({ message: `${field.name} : ${pattern_val.error}` })
                    }
                }

            }else if (field.type == "number") {

                const type_val = checkType(fieldValue, field)
                const min_max_len_val = checkMinMaxAndLen(fieldValue, field)

                if (type_val)
                    return res.status(400).json({ message: type_val.error })

                if (min_max_len_val)
                    return res.status(400).json({ message: min_max_len_val.error })

            }
        }

        next()

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error."
        })
    }

}

module.exports = { validateEntity }