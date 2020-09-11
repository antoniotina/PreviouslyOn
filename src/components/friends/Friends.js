import React, { useEffect, useState } from "react"
import axios from 'axios'
import PropTypes from "prop-types"
import { connect } from 'react-redux'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Friends = ({ auth }) => {
  const [friends, setFriends] = useState(false)
  const [email, setEmail] = useState('')

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

  const updateFriends = () => {
    axios.get(process.env.REACT_APP_API_LINK + '/friends/list?key=' + process.env.REACT_APP_API_KEY + '&token=' + auth.token)
      .then(res => {
        setFriends(res.data.users)
      })
  }

  const removeFriend = (friendId) => {
    axios.delete(process.env.REACT_APP_API_LINK + '/friends/friend?key=' + process.env.REACT_APP_API_KEY + '&id=' + friendId + '&token=' + auth.token)
      .then(res => {
        updateFriends()
      })
  }

  const blockFriend = (friendId) => {
    axios.post(process.env.REACT_APP_API_LINK + '/friends/block?key=' + process.env.REACT_APP_API_KEY + '&id=' + friendId + '&token=' + auth.token)
      .then(res => {
        updateFriends()
      })
  }

  const addFriend = (e) => {
    e.preventDefault()
    axios.get(process.env.REACT_APP_API_LINK + '/friends/find?key=' + process.env.REACT_APP_API_KEY + '&emails=' + email + '&token=' + auth.token)
      .then(res => {
        if (res.data.users.length) {
          axios.post(process.env.REACT_APP_API_LINK + '/friends/friend?key=' + process.env.REACT_APP_API_KEY + '&token=' + auth.token + '&id=' + res.data.users[0].id)
            .then(res => {
              updateFriends()
            })
            .catch(error => {
              toast('There was an error')
            })
        }
        else {
          toast('This user does not exist')
        }
      })
      .catch(error => {
        toast('There was an error')
      })
  }

  return (
    <>
      <div className="container card p-2">
        <form onSubmit={addFriend} className='m-2 p-2'>
          <label>
            Add friend:
            <input type="email" name="email" onChange={(e) => setEmail(e.target.value)} />
          </label>
          <input type="submit" value="Submit" />
        </form>
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
        <ToastContainer />
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