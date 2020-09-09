import { GET_ERRORS, CLEAR_ERRORS } from './types'

export const returnErrors = (text, status, id = null) => {
    return {
        type: GET_ERRORS,
        payload: { text, status, id }
    }
}

//clear errors

export const clearErrors = () => {
    return {
        type: CLEAR_ERRORS
    }
}