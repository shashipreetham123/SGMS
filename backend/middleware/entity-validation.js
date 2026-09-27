const { acceptedFieldAttributes } = require("../config/attr")

function checkLength(name, value, field) {

    if (Object.hasOwn(field, "min") && Number.isNaN(parseInt(field.min))) {
        return ({
            message: `The Field ${name} Attribute Min is Not a Number`
        })
    }
    if (Object.hasOwn(field, "max") && Number.isNaN(parseInt(field.max))) {
        return ({
            message: `The Field ${name} Attribute Max is Not a Number`
        })
    }
    if (Object.hasOwn(field, "length") && Number.isNaN(parseInt(field.length))) {
        return ({
            message: `The Field ${name} Attribute Length is Not a Number`
        })

    }
    if ((Object.hasOwn(field, "min") && parseInt(field.min) < 0)) {
        return ({
            message: `The Field ${name} Attribute Min Cannot be Negative and Max Cannot be Zero`
        })
    }

    if ((Object.hasOwn(field, "length") && parseInt(field.length) <= 0) || (Object.hasOwn(field, "max") && parseInt(field.max) <= 0)) {
        return ({
            message: `The Field ${name} Attribute Length & Max Cannot be Negative or Zero`
        })
    }

    if (Object.hasOwn(field, "min") && Object.hasOwn(field, "max") && parseInt(field.min) >= parseInt(field.max)) {
        return ({
            message: `The Field ${name} Attribute Min Should be Less than Max.`
        })
    }

    if ((Object.hasOwn(field, "min") && Object.hasOwn(field, "length")) || (Object.hasOwn(field, "max") && Object.hasOwn(field, "length"))) {
        return ({
            message: `The Field ${name} Attributes Length is Defined While Min or Max is Defined. Either Define Min, Max or Length`
        })
    }

    if (Object.hasOwn(field, "length") && value.length != field.length) {
        return ({
            message: `The Expected Length of the Value is ${field.length}`
        })
    }

    if (Object.hasOwn(field, "min") && value.length < min) {
        return ({
            message: `The Length of the Value is Less Than Min`
        })
    }
    if (Object.hasOwn(field, "max") && value.length > max) {
        return ({
            message: `The Length of the Value is Greater Than Max`
        })
    }

    return 'valid'
    
}

function checkText(name, value, data) {

    // Check If Type is Text

    if (typeof value != "string") {
        return {
            message: `The Type of ${name} is not Text`
        }
    }

    const status = checkLength(name, value, { min: data.min, max: data.max, length: data.length })

    if (status != 'valid') {
        return status
    }

    if (data.pattern) {
        const pattern = new RegExp(data.pattern)

        if (pattern.test(value)) {
            return {
                message: "The Value Doesnt Match the Pattern"
            }
        }
    }

    return 'valid'
}

function validateEntity(req, res, next) {

    const entity = req.body

    if (!entity.profile) {
        return res.status(400).json({
            message: "The Attribute Profile is Required",
            data: null
        })
    }

    const db = req.app.locals.db

    const profile = db.collection("profiles").findOne({ name: entity.profile })

    if (!profile) {
        return res.status(400).json({
            message: `The Profile ${entity.profile} is Not found`,
            data: null
        })
    }

    if (!profile.fields) {
        return res.status(400).json({
            message: `The Profile ${entity.profile} Doesnt Have any Fields`,
            data: null
        })
    }

    if (!entity.data) {
        return res.status(400).json({
            message: `The Enitity ${entity.name} Doesnt Have Data`,
            data: null
        })
    }

    // Check If Entity has Valid Data

    const entityData = entity.data

    const fields = profile.fields

    const errors = []

    // Check for Each Field that its Corresponding Entity Data is Valid

    for (let i = 0; i < fields.length; i++) {
        const field = fields[i]

        const fieldName = field.name
        const fieldType = field.type
        const required = field.required ? true : false

        // Check if Required Field Exist in Enitity

        if (required) {

            if (!entityData[fieldName]) {
                errors.push({
                    message: `Required Field ${fieldName}`,
                    data: entityData
                })

                break
            }

        } else {
            if (!entityData[fieldName]) {
                continue
            }
        }

        if (fieldType == "text") {

            const status = checkText(fieldName, entityData[fieldName], field)

            if (status != 'valid') {

                res.status(400).json(status)

            }

        }

    }

}