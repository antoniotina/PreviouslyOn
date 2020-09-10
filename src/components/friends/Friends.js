import React, { useEffect, useState } from "react"
import axios from 'axios'
import PropTypes from "prop-types"
import { useRouteMatch, Redirect } from "react-router-dom"
import { connect } from 'react-redux'
import Rating from '@material-ui/lab/Rating'
import Image from 'react-bootstrap/Image'
import 'react-toastify/dist/ReactToastify.css'

const Friends = ({ auth }) => {
  const [friends, setFriends] = useState(false)

  useEffect(() => {
    if (auth.isAuthenticated) {
      console.log('null')
      axios.get(process.env.REACT_APP_API_LINK + '/friends/list?key=' + process.env.REACT_APP_API_KEY + '&token=' + auth.token)
        .then(res => {
          console.log(res.data.users)
          setFriends(res.data.users)
        })
    }
    else if (auth.isAuthenticated === null) {
    }
    else {
      window.location.replace('http://' + process.env.REACT_APP_LINK)
    }
  }, [auth])

  const removeFriend = (friendId) => {
    // console.log("Add episode to seen")
    axios.delete(process.env.REACT_APP_API_LINK + '/friends/friend?key=' + process.env.REACT_APP_API_KEY + '&id=' + friendId + '&token=' + auth.token)
      .then(res => {
        axios.get(process.env.REACT_APP_API_LINK + '/friends/list?key=' + process.env.REACT_APP_API_KEY + '&token=' + auth.token)
          .then(res => {
            setFriends(res.data.users)
          })
      })
  }

  const blockFriend = (friendId) => {
    // console.log("Add episode to seen")
    axios.post(process.env.REACT_APP_API_LINK + '/friends/block?key=' + process.env.REACT_APP_API_KEY + '&id=' + friendId + '&token=' + auth.token)
      .then(res => {
        axios.get(process.env.REACT_APP_API_LINK + '/friends/list?key=' + process.env.REACT_APP_API_KEY + '&token=' + auth.token)
          .then(res => {
            setFriends(res.data.users)
          })
      })
  }

  return (
    <>
      <div className="container card p-2">
      
        {friends ?
          friends.map((friend, key) => {
            return (
              <div key={key} className="card p-2 col-2">
                <span>{friend.login}</span>
                <span>{friend.in_account ? <>Online</> : <>Offline</>}</span>
                <span>Experience points: {friend.xp}</span>
                <p className="btn btn-success btn-sm m-1" onClick={() => removeFriend(friend.id)}>Remove</p>
                <p className="btn btn-success btn-sm m-1" onClick={() => blockFriend(friend.id)}>Block</p>
              </div>
            )
          })
          :
          null
        }
      </div>
    </>
  )
}

Friends.propTypes = {
  auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(
  mapStateToProps
)(Friends)