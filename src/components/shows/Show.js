import React, { useEffect, useState } from "react"
import axios from 'axios'
import PropTypes from "prop-types"
import { useRouteMatch, Redirect } from "react-router-dom"
import { connect } from 'react-redux'
import Image from 'react-bootstrap/Image'
import Rating from '@material-ui/lab/Rating'
import SlideToggle from "react-slide-toggle"
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ClickNHold from "react-click-n-hold"

const Show = ({ auth }) => {
  const [show, setShow] = useState(null)
  const [episodes, setEpisodes] = useState(false)
  const [comment, setComment] = useState(false)
  const [commentId, setCommentId] = useState(false)
  const [modal, setModal] = useState(false)
  const [redirect, setRedirect] = useState(false)
  const [id_redirect, setIdRedirect] = useState(null)

  const toggleModal = (episodeId) => {
    setModal(!modal)
    setCommentId(episodeId)
  }

  let showid = useRouteMatch("/show/:showid").params.showid

  useEffect(() => {
    axios.get(process.env.REACT_APP_API_LINK + '/shows/display?key=' + process.env.REACT_APP_API_KEY + '&id=' + showid)
      .then(res => {
        // console.log(res.data.show)
        setShow(res.data.show)
      })
  }, [])

  useEffect(() => {
    if (auth.isAuthenticated !== null && !auth.isAuthenticated) {
      axios.get(process.env.REACT_APP_API_LINK + '/shows/episodes?key=' + process.env.REACT_APP_API_KEY + '&id=' + showid)
        .then(res => {
          // console.log(auth, res, "episodes logged out")
          setEpisodes(res.data.episodes)
        })
    }
    else {
      axios.get(process.env.REACT_APP_API_LINK + '/shows/episodes?key=' + process.env.REACT_APP_API_KEY + '&id=' + showid + '&token=' + auth.token)
        .then(res => {
          // console.log(auth, res.data.episodes, "episodes logged in")
          setEpisodes(res.data.episodes)
        })
    }
  }, [auth])

  const addEpisodeToSeen = (episodeId, previous) => {
    // console.log("Add episode to seen")
    axios.post(process.env.REACT_APP_API_LINK + '/episodes/watched?key=' + process.env.REACT_APP_API_KEY + '&id=' + episodeId + '&token=' + auth.token + '&bulk=' + previous)
      .then(res => {
        axios.get(process.env.REACT_APP_API_LINK + '/shows/episodes?key=' + process.env.REACT_APP_API_KEY + '&id=' + showid + '&token=' + auth.token)
          .then(res => {
            setEpisodes(res.data.episodes)
          })
      })
  }

  const removeEpisodeFromSeen = (episodeId) => {
    // console.log("Remove episode from seen")
    axios.delete(process.env.REACT_APP_API_LINK + '/episodes/watched?key=' + process.env.REACT_APP_API_KEY + '&id=' + episodeId + '&token=' + auth.token)
      .then(res => {
        axios.get(process.env.REACT_APP_API_LINK + '/shows/episodes?key=' + process.env.REACT_APP_API_KEY + '&id=' + showid + '&token=' + auth.token)
          .then(res => {
            setEpisodes(res.data.episodes)
          })
      })
  }

  const addCommentToEpisode = () => {
    console.log("button")
    const config = {
      headers: {
        "Content-type": "application/json"
      }
    }

    const body = JSON.stringify({ 'text': comment })

    axios.post(process.env.REACT_APP_API_LINK + '/comments/comment?key=' + process.env.REACT_APP_API_KEY + '&id=' + commentId + '&token=' + auth.token + '&type=episode', body, config)
      .then(res => {
        setModal(!modal)
        toast("Comment added !");
      })
  }

  // redirect to episode
  const clickNHold = async (id) => {
    await setIdRedirect(id);
    await setRedirect(true);
  };

  const ClickNHoldButton = (id) => {
    return (
      <ClickNHold
        time={1} // Time to keep pressing. Default is 2
        onClickNHold={() => clickNHold(id)} //Timeout callback
      >
        <button className="btn btn-success">+</button>
      </ClickNHold>
    )
  }

  if (redirect) return <Redirect to={"/episode/" + id_redirect} />;

  return (
    <>
      <div className="container">
        <ToastContainer />
        <div className="card">
          {show ?
            <div className="m-2">
              <h2 className="text-center">
                {show.original_title}
              </h2>
              <div className="row m-2">
                <Image src={show.images.poster} className="col-sm-12 col-md-6 col-lg-3 col-xl-3" />
                <div className="col-sm-12 col-md-6 col-lg-9 col-xl-9">
                  <p>
                    Seasons: {show.seasons}
                  </p>
                  <p>
                    Episodes: {show.episodes}
                  </p>
                  <p>
                    Episode length: {show.length} minutes
                  </p>
                  <p>
                    <Rating name="half-rating-read" defaultValue={show.notes.mean} precision={0.1} readOnly />
                  </p>
                  <p>
                    Synopsis: {show.description}
                  </p>
                  <p>
                    Genres:
                    {
                      Object.keys(show.genres).map((genre, key) => {
                        return (
                          <span key={key}> {genre}.</span>
                        )
                      })
                    }
                  </p>
                </div>
                <h3 className="pt-3">
                  Episodes
                </h3>
                <div className="row m-2">
                  {episodes ?
                    episodes.map((episode) => {
                      return (
                        <div key={episode.id} className="col-sm-12 col-md-12 col-lg-6 col-xl-6 my-collapsible p-2">
                          {auth.isAuthenticated ?
                            <SlideToggle
                              render={({ toggle, setCollapsibleElement }) => (
                                <div >

                                  <ClickNHold
                                    time={1} // Time to keep pressing. Default is 2
                                    onClickNHold={() => clickNHold(episode.id)} //Timeout callback
                                  >
                                    <div className="my-collapsible__toggle" onClick={toggle}>
                                      <span>Season {episode.season}: Episode {episode.episode} </span>
                                    </div>
                                  </ClickNHold>
                                  <div className="my-collapsible__content" ref={setCollapsibleElement}>
                                    <div className="my-collapsible__content-inner">
                                      <span>
                                        {
                                          episode.user.seen ?
                                            <div>
                                              <span>Seen</span>
                                              <p className="btn btn-danger" onClick={() => removeEpisodeFromSeen(episode.id)}>Remove seen</p>
                                            </div>
                                            :
                                            <div>
                                              <span>Not seen</span><br />
                                              <p className="btn btn-success btn-sm m-1" onClick={() => addEpisodeToSeen(episode.id, false)}>add to seen</p>
                                              <p className="btn btn-success btn-sm m-1" onClick={() => addEpisodeToSeen(episode.id, true)}>add to seen + all the previous episodes</p>
                                            </div>
                                        }
                                      </span>
                                      <Button color="danger" onClick={() => toggleModal(episode.id)}>Add a comment</Button>
                                      <Modal isOpen={modal} toggle={toggleModal} className="stuff">
                                        <ModalHeader toggle={toggleModal}>Modal title</ModalHeader>
                                        <ModalBody>
                                          put the textarea here
                                          <Input type="textarea" name="text" id="exampleText" onChange={(e) => setComment(e.target.value)} />
                                        </ModalBody>
                                        <ModalFooter>
                                          <Button color="primary" onClick={addCommentToEpisode}>Add Comment</Button>
                                          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                                        </ModalFooter>
                                      </Modal>
                                    </div>
                                  </div>
                                </div>
                              )}
                              collapsed
                            />
                            :
                            <div >
                              <span>Season {episode.season}: Episode {episode.episode} </span>
                            </div>
                          }
                        </div>
                      )
                    })
                    :
                    null
                  }
                </div>
              </div>
            </div>
            :
            null
          }
        </div>
      </div>
    </>
  )
}

Show.propTypes = {
  auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(
  mapStateToProps
)(Show)