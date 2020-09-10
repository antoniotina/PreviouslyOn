import React, { useEffect, useState } from "react";
import axios from "axios";
import { Redirect, Link } from "react-router-dom";
import Image from "react-bootstrap/Image";
import ClickNHold from "react-click-n-hold";
import "./home.css";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button, Container, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = ({ auth }) => {
  const [shows, setShows] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(16);
  const [page, setPage] = useState(0);
  const [redirect, setRedirect] = useState(false);
  const [id_redirect, setIdRedirect] = useState(null);

  // useEffect(async () => {
  //   await setOffset(1 * limit); //
  //   await setPage(1); //
  //   console.log(
  //     "page = " + page,
  //     "limit = " + limit,
  //     "offset = " + offset,
  //     "SetOffset = " + page * limit,
  //     "setPage = " + (page + offset)
  //   );
  // }, []);

  useEffect(() => {
    console.log("useEffect Page = " + page + " and Offset = " + offset);
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
        res.data.shows === [] ? move(-offset) : setShows(res.data.shows); //
      });
  }, [page]);

  const move = async (amount) => {
    // await setPage(page + amount); //
    let p = amount + page;
    console.log("page = " + p, "limit = " + limit, "amount = " + amount);
    await setOffset(p * limit); //
    await setPage(p); //
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
        console.log(res, "THE FAVORITE IS DONE");
        if (res.data.errors == []) {
          toast.error("An error has occured", { position: "top-center" });
        } else {
          toast.success("Tv Show Added To favourites", {
            position: "top-center",
          });
        }
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
        <Button variant="success" className="ml-5 simpleButtons">
          +
        </Button>
      </ClickNHold>
    );
  };

  const ArchiveButton = () => {
    if (auth.isAuthenticated)
      return (
        <Button className="simpleButtons" variant="secondary">
          Archive
        </Button>
      );
  };

  const center = "justify-content-md-center";

  if (redirect) return <Redirect to={"/show/" + id_redirect} />;

  return (
    <>
      <ToastContainer />
      <Container className="mt-2" fluid>
        <Row className={center}>
          {shows
            ? shows.map((show) => {
                return (
                  <span key={show.id} id="tvShowsRow">
                    <Col xs>
                      <h5>
                        {show.original_title.length > 20
                          ? show.original_title.substring(0, 20) + "..."
                          : show.original_title}
                      </h5>
                    </Col>
                    <Col
                      style={{
                        marginLeft: 0,
                        marginRight: 0,
                      }}
                    >
                      <Image
                        src={show.images.poster}
                        id="tvShowImg"
                        // style={{ height: "20vw", width: "auto" }}
                        thumbnail
                      />
                    </Col>
                    <Row className={center + " mt-2"}>
                      <Col>{ClickNHoldButton(show.id)}</Col>
                      <Col>{ArchiveButton(show.id)}</Col>
                    </Row>
                  </span>
                );
              })
            : null}
        </Row>
      </Container>
      <Container fluid>
        <Row className={center + " mt-5"}>
          <Button
            variant="primary"
            className="mr-2"
            onClick={() => move(-1)}
            disabled={page !== 0 ? false : true}
          >
            Back
          </Button>
          <Button className="ml-2" variant="primary" onClick={() => move(1)}>
            Forward
          </Button>
        </Row>
      </Container>
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
