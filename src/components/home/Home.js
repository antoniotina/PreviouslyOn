import React, { useEffect, useState } from "react";
import axios from "axios";
import { Redirect, Link } from "react-router-dom";
import Image from "react-bootstrap/Image";
import ClickNHold from "react-click-n-hold";
import "./home.css";
import { connect } from "react-redux";
import PropTypes from "prop-types";

const Home = ({ auth }) => {
  const [shows, setShows] = useState(null);
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(1);
  const [redirect, setRedirect] = useState(false);
  const [id_redirect, setIdRedirect] = useState(null);

  useEffect(() => {
    axios
      .get(
        process.env.REACT_APP_API_LINK +
          "/shows/discover?key=" +
          process.env.REACT_APP_API_KEY +
          "&limit=" +
          limit +
          "&offset=" +
          offset
      )
      .then((res) => {
        console.log(res);
        res.data.shows === [] ? move(-offset) : setShows(res.data.shows);
      });
  }, [page]);

  const move = (amount) => {
    setPage(page + amount);
    setOffset(page * 5);
  };

  const start = () => {
    console.log("this is the start");
  };

  // redirect to show's
  const clickNHold = async (id) => {
    console.log(
      "this is the holding, showing details",
      id,
      auth.isAuthenticated
    );
    // return <Link to={"/show/" + id} />;
    await setIdRedirect(id);
    await setRedirect(true);
  };

  // add show to follow list
  const end = (id) => {
    console.log(
      "this is the end, adding to the users shows list",
      auth.isAuthenticated
    );

    console.log(auth);

    const config = {
      headers: {
        "Content-type": "application/json",
      },
    };

    const body = {
      id: id,
      key: process.env.REACT_APP_API_KEY,
      token: auth.token,
    };

    console.log("Body sent", body);

    axios
      .post(process.env.REACT_APP_API_LINK + "/shows/favorite", body, config)
      .then((res) => {
        console.log(res);
      });
  };

  const ClickNHoldButton = (id) => {
    return (
      <ClickNHold
        time={2} // Time to keep pressing. Default is 2
        onStart={start} // Start callback
        onClickNHold={() => clickNHold(id)} //Timeout callback
        onEnd={() => (auth.isAuthenticated ? end(id) : clickNHold(id))}
      >
        <button className="btn btn-success">+</button>
      </ClickNHold>
    );
  };

  if (redirect) return <Redirect to={"/show/" + id_redirect} />;

  return (
    <>
      <div className="row">
        <div className="card">
          {shows
            ? shows.map((show) => {
                return (
                  <div key={show.id} className="row card p-2 m-1">
                    <li>
                      <h3>{show.original_title}</h3>
                      <h2>
                        <Image src={show.images.poster} />
                      </h2>
                      <p>Seasons: {show.seasons}</p>
                      <p>Episodes: {show.episodes}</p>
                      <p>Episode length: {show.length} minutes</p>
                      <p>Score: {show.notes.mean.toFixed(1)}</p>
                      <p>Synopsis: {show.description}</p>
                      <p>
                        Genres:
                        {Object.keys(show.genres).map((genre, key) => {
                          return <span key={key}> {genre}.</span>;
                        })}
                      </p>
                      {ClickNHoldButton(show.id)}
                    </li>
                  </div>
                );
              })
            : null}
        </div>
      </div>
      {page !== 1 ? (
        <button className="btn btn-primary m-2" onClick={() => move(-1)}>
          Back
        </button>
      ) : null}
      <button className="btn btn-primary m-2" onClick={() => move(1)}>
        Forward
      </button>
    </>
  );
};

Home.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(Home);
