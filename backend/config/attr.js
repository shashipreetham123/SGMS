const acceptedFieldAttributes = {
    text: ["type", "pattern", "label", "placeholder", "name", "min", "max", "length", "required"],
    number: ["type", "min", "label", "max", "placeholder", "name", "length", "required"],
    email: ["type", "placeholder", "label", "name", "required"],
    select: ["name", "type", "label", "options", "placeholder", "required"]
}

module.exports = { acceptedFieldAttributes }