function checkMinMax(field) {
    const hasMin = Object.hasOwn(field, 'min')
    const hasMax = Object.hasOwn(field, 'max')
    const hasLength = Object.hasOwn(field, 'length')

    const lengthValue = Number(field.length)

    const minValue = Number(field.min)
    const maxValue = Number(field.max)

    if (hasLength && Number.isNaN(lengthValue)) {
        return {
            error: "The Value of Length is Not a Number."
        }
    }
    if (hasMin && Number.isNaN(minValue)) {
        return {
            error: "The Value of Min is Not a Number."
        }
    }
    if (hasMax && Number.isNaN(maxValue)) {
        return {
            error: "The Value of Max is Not a Number."
        }
    }
    if (hasMin && minValue < 0) {
        return {
            error: "The Value of Min Cannot be Negative"
        }
    }
    if (hasMax && maxValue <= 0) {
        return {
            error: "The Value of Max Cannot be Negative or Zero"
        }
    }
    if (hasMax && hasMin && minValue > maxValue) {
        return {
            error: "The Value of Max Cannot be Less than Min Value"
        }
    }
    if (hasLength && (hasMax || hasMin) && field.type != 'number') {
        return {
            error: "The Field Has Attributes Min, Max and Length. Use Either Min & Max or Length"
        }
    }
    return {
        error: null
    }
}

function checkLength(value, field) {

    const hasMin = Object.hasOwn(field, 'min')
    const hasMax = Object.hasOwn(field, 'max')
    const hasLength = Object.hasOwn(field, 'length')


    const minValue = Number(field.min)
    const maxValue = Number(field.max)

    const lengthValue = Number(field.length)

    const valueLength = value.toString().length

    const cmpVal = field.type == "number" ? Number(value) : value.toString().length


    if (hasLength && valueLength != lengthValue) {
        return {
            error: `Expected Length ${lengthValue} (Given ${valueLength})`
        }
    }

    if (hasMin && cmpVal < minValue) {
        return {
            error: `Expected Min ${minValue} (Given ${cmpVal})`
        }
    }

    if (hasMax && cmpVal > maxValue) {
        return {
            error: `Expected Max ${maxValue} (Given ${cmpVal})`
        }
    }

    return {
        error: null
    }



}

module.exports = { checkMinMax, checkLength }