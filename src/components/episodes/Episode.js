import React, { useEffect, useState } from "react"
import axios from 'axios'
import PropTypes from "prop-types"
import { useRouteMatch } from "react-router-dom"
import { connect } from 'react-redux'
import Rating from '@material-ui/lab/Rating'
import Image from 'react-bootstrap/Image'
import 'react-toastify/dist/ReactToastify.css'
import ItemsCarousel from 'react-items-carousel'

const Episode = ({ auth }) => {
  const [episode, setEpisode] = useState(false)
  const [activeItemIndex, setActiveItemIndex] = useState(0)
  const chevronWidth = 40

  let episodeid = useRouteMatch("/episode/:episodeid").params.episodeid

  useEffect(() => {
    axios.get(process.env.REACT_APP_API_LINK + '/episodes/display?key=' + process.env.REACT_APP_API_KEY + '&id=' + episodeid)
      .then(res => {
        console.log(res.data.episode)
        setEpisode(res.data.episode)
      })
  }, [])

  return (
    <div className="container card">
      {episode ?
        <div className="m-2">
          <h2 className="text-center">
            {episode.original_title}
          </h2>
          <div className="row m-2">
            <Image
              src={process.env.REACT_APP_API_LINK + '/pictures/episodes?key=' + process.env.REACT_APP_API_KEY + '&id=' + episodeid + '&width=100&height=150'}
              className="col-sm-12 col-md-6 col-lg-3 col-xl-3"
            />
            <div className="col-sm-12 col-md-6 col-lg-9 col-xl-9">
              <p>
                {episode.code}
              </p>
              <p>
                Episode: {episode.title}
              </p>
              <p>
                Release date: {episode.date}
              </p>
              <p>
                <Rating name="half-rating-read" defaultValue={episode.note.mean} precision={0.1} readOnly />
              </p>
              <p>
                Synopsis: {episode.description}
              </p>
            </div>
          </div>
          <h3 className="pt-3">
            Actors
          </h3>
          <ItemsCarousel
            requestToChangeActive={setActiveItemIndex}
            activeItemIndex={activeItemIndex}
            numberOfCards={5}
            gutter={20}
            leftChevron={<span>{'<'}</span>}
            rightChevron={<span>{'>'}</span>}
            outsideChevron
            chevronWidth={chevronWidth}
          >
            {episode.characters.map((character, key) => {
              return (
                <div key={key} className='col-sm-12'>
                  {character.picture === null ?
                    <img height='100px' width='75px' src='https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg' className="" />
                    :
                    <img height='100px' width='75px' src={character.picture} className="" />
                  }
                  <p>
                    Name: {character.actor}
                  </p>
                  <p>
                    {character.name !== '' ? <span>Playing as: {character.name}</span> : null}
                  </p>
                </div>
              )
            })}
          </ItemsCarousel>
        </div>
        :
        null
      }
    </div>
  )
}

Episode.propTypes = {
  auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(
  mapStateToProps
)(Episode)