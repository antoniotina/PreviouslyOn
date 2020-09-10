import axios from 'axios'
import {
    USER_LOADED,
    USER_LOADED_TOKEN,
    REGISTER_FAIL,
    REGISTER_SUCCESS,
    LOGOUT_SUCCESS,
    LOGIN_FAIL,
    LOGIN_SUCCESS,
    AUTH_ERROR,
    USER_LOADING
} from '../actions/types'
import { returnErrors } from './errorActions'
import md5 from 'md5'

// dispatch is a function of the Redux store. You call store.dispatch to dispatch an action. This is the only way to trigger a state change.
// check token first and then load the user
export const loadUser = () => (dispatch, getState) => {
    // loading user
    dispatch({ type: USER_LOADING })
    const token = localStorage.getItem('token')

    if (token !== null) {
        console.log('test')
        axios.get(process.env.REACT_APP_API_LINK + '/members/is_active?token=' + token + '&key=' + process.env.REACT_APP_API_KEY)
            .then(res => {
                dispatch({
                    type: USER_LOADED_TOKEN,
                    // res.data is an object with user object and the token
                    payload: token
                })
                axios.get(process.env.REACT_APP_API_LINK + '/members/infos?token=' + token + '&key=' + process.env.REACT_APP_API_KEY)
                    .then(res => dispatch({
                        type: USER_LOADED,
                        // res.data is an object with user object and the token
                        payload: res.data
                    }))
            })
            .catch(err => {
                dispatch({
                    type: AUTH_ERROR
                })
            })
    }
    else {
        dispatch({
            type: AUTH_ERROR
        })
    }
}

// Register User
export const register = ({ username, email, password }) => dispatch => {
    // headers 
    const config = {
        headers: {
            "Content-type": "application/json"
        }
    }
    //request info
    const body = JSON.stringify({ 'login': username, email, 'key': process.env.REACT_APP_API_KEY, password })

    axios.post(process.env.REACT_APP_API_LINK + '/members/signup', body, config)
        .then(res => dispatch({
            type: REGISTER_SUCCESS,
            payload: res.data
        }))
        .catch(err => {
            dispatch(returnErrors(err.response.data, err.response.status, 'REGISTER_FAIL'))
            dispatch({
                type: REGISTER_FAIL
            })
        })
}

// setup function for token/headers
export const tokenConfig = getState => {
    // getting token
    const token = getState().auth.token

    // headers
    const config = {
        headers: {
            "Content-type": "application/json"
        }
    }

    // if token is good, add it to headers
    if (token) {
        config.headers['x-auth-token'] = token
    }
    return config
}

//logout no need for dispatch
export const logout = (token) => {
    // headers 
    // const config = {
    //     headers: {
    //         "Content-type": "application/json"
    //     }
    // }
    // //request info
    // const body = JSON.stringify({ token, 'key': process.env.REACT_APP_API_KEY })

    // axios.post(process.env.REACT_APP_API_LINK + '/members/destroy', body, config)

    return {
        type: LOGOUT_SUCCESS
    }
}

//logout no need for dispatch
export const login = ({ email, password }) => dispatch => {
    // headers 
    const config = {
        headers: {
            "Content-type": "application/json"
        }
    }

    //request info
    const body = JSON.stringify({ 'login': email, 'key': process.env.REACT_APP_API_KEY, 'password': md5(password) })

    axios.post(process.env.REACT_APP_API_LINK + '/members/auth', body, config)
        .then(res => {
            dispatch({
                type: LOGIN_SUCCESS,
                payload: res.data
            })
        })
        .catch(err => {
            dispatch(returnErrors(err.response.data, err.response.status, 'LOGIN_FAIL'))
            dispatch({
                type: LOGIN_FAIL
            })
        })
}

// lost password/ send email
export const lostPasswordEmail = ({ find }) => dispatch => {
    // headers 
    const config = {
        headers: {
            "Content-type": "application/json"
        }
    }

    //request info
    const body = JSON.stringify({ find, 'key': process.env.REACT_APP_API_KEY })

    axios.post(process.env.REACT_APP_API_LINK + '/members/lost', body, config)
}