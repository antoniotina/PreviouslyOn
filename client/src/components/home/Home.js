import React, { useEffect, useState } from "react";
import ReactHtmlParser, {
  processNodes,
  convertNodeToElement,
  htmlparser2,
} from "react-html-parser";
import ReactPaginate from "react-paginate";
import axios from 'axios'
import { Link } from "react-router-dom";

export default function Home() {
  const [shows, setShows] = useState(null);
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);

  useEffect(() => {
    axios.get(process.env.REACT_APP_API_LINK + '/shows/discover?key=' + process.env.REACT_APP_API_KEY + '&limit=' + limit + '&offset=' + offset)
      .then(res => {
        res.data.shows === [] ?
          move(-offset) :
          setShows(res.data.shows)
        console.log(res.data.shows)
      })
  }, [page])

  function move(amount) {
    setPage(page + amount)
    setOffset(page * 5)
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
                      PUT IMAGE HERE
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
                        {Object.values(show.genres).forEach((genre) => {
                          console.log(genre)
                          return (
                            <span>{genre}</span>
                          )
                        })}
                    </p>
                    <br />
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