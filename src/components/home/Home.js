import React, { useEffect, useState } from "react";
import axios from 'axios'
import { Link } from "react-router-dom";
import Image from 'react-bootstrap/Image';
import ClickNHold from 'react-click-n-hold';
import './home.css'

export default function Home() {
  const [shows, setShows] = useState(null);
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios.get(process.env.REACT_APP_API_LINK + '/shows/discover?key=' + process.env.REACT_APP_API_KEY + '&limit=' + limit + '&offset=' + offset)
      .then(res => {
        console.log(res)
        res.data.shows === [] ?
          move(-offset) :
          setShows(res.data.shows)
      })
  }, [page])

  const move = (amount) => {
    setPage(page + amount)
    setOffset(page * 5)
  }

  const start = () => {
    console.log("this is the start")
  }

  // redirect to show's
  const clickNHold = () => {
    console.log("this is the holding")
  }

  // add show to follow list
  const end = () => {
    console.log("this is the end")

  }

  return (
    <>
      <div className="row">
        <div className="card">
          {shows ?
            shows.map((show) => {
              return (
                <div key={show.id} className="row card p-2 m-1">
                  <li>
                    <h3>
                      {show.original_title}
                    </h3>
                    <h2>
                      <Image src={show.images.poster} />
                    </h2>
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
                      Score: {show.notes.mean.toFixed(1)}
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
                        })}
                    </p>
                    <ClickNHold
                      time={2} // Time to keep pressing. Default is 2
                      onStart={start} // Start callback
                      onClickNHold={clickNHold} //Timeout callback
                      onEnd={end} >
                      <button className="btn btn-success">+</button>
                    </ClickNHold>
                  </li>
                </div>
              )
            }) : null
          }
        </div>
      </div>
      {page !== 1 ? <button className="btn btn-primary m-2" onClick={() => move(-1)}>Back</button> : null}
      <button className="btn btn-primary m-2" onClick={() => move(1)}>Forward</button>
    </>
  )
}