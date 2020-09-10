import React, { useEffect, useState } from "react";
import axios from "axios";
import { Redirect, Link } from "react-router-dom";
import Image from "react-bootstrap/Image";
import ClickNHold from "react-click-n-hold";
import "./myshows.css";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button, Container, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ListGroupItemText } from "reactstrap";
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import DeleteIcon from "@material-ui/icons/Delete";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

const MyShows = ({ auth }) => {
  const [shows, setShows] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(16);
  const [page, setPage] = useState(0);
  const [redirect, setRedirect] = useState(false);
  const [id_redirect, setIdRedirect] = useState(null);
  const [loading, setLoading] = useState(false);
  const key = process.env.REACT_APP_API_KEY;
  const api_link = process.env.REACT_APP_API_LINK;
  const config = {
    headers: {
      "Content-type": "application/json",
    },
  };

  useEffect(() => {
    console.log(auth);
  }, [auth]);

  useEffect(() => {
    loadShows();
  }, [page, auth]);

  const loadShows = async () => {
    if (auth.user) {
      console.log(auth.user);
      let url =
        api_link +
        "/shows/member?key=" +
        key +
        `&id=${auth.user.id}&token=${auth.token}`;
      console.log(url);

      console.log("useEffect Page = " + page + " and Offset = " + offset);
      axios.get(url).then(async (res) => {
        console.log(res);
        res.data.shows === [] ? move(-offset) : setShows(res.data.shows); //
      });
    }
  };

  const move = async (amount) => {
    let p = amount + page;
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
    await setIdRedirect(id);
    await setRedirect(true);
  };

  // add show to favourites list
  const addFavorites = async (id) => {
    console.log(
      "this is the addFavorite, adding to the users favorite shows list",
      auth.isAuthenticated
    );

    console.log(auth);
    const body = {
      id: id,
      key: key,
      token: auth.token,
    };

    console.log("Body sent", body);

    axios.post(api_link + "/shows/favorite", body, config).then(async (res) => {
      console.log(res, "THE FAVORITE IS DONE");
      if (res.data.errors == []) {
        toast.error("An error has occured", { position: "top-center" });
      } else {
        toast.success("Tv Show Added To Favourites", {
          position: "top-center",
        });
        await loadShows();
      }
    });
  };

  // delete show from favourites list
  const delFavorites = async (id) => {
    console.log("this is the delFavorites", auth.isAuthenticated);

    console.log("Body sent", auth);

    axios
      .delete(
        api_link + `/shows/favorite?key=${key}&id=${id}&token=${auth.token}`
      )
      .then(async (res) => {
        console.log(res, "THE FAVORITE IS DONE");
        if (res.data.errors == []) {
          toast.error("An error has occured", { position: "top-center" });
        } else {
          toast.info("Tv Show Removed From Favourites", {
            position: "top-center",
          });
          await loadShows();
        }
      });
  };

  // delete show from my account
  const delShow = async (id) => {
    console.log(
      "this is the delShow, deleting from the users shows list",
      auth.isAuthenticated
    );

    console.log("Body sent", auth);

    axios
      .delete(api_link + `/shows/show?key=${key}&id=${id}&token=${auth.token}`)
      .then(async (res) => {
        if (res.data.errors == []) {
          toast.error("An error has occured", { position: "top-center" });
        } else {
          toast.info("Tv Show Removed From You Account", {
            position: "top-center",
          });
          await loadShows();
        }
      })
      .catch((err) => {
        toast.error("An error has occured", { position: "top-center" });
      });
  };

  const ClickNHoldButton = ({ id, user }) => {
    return (
      <ClickNHold
        time={2} // Time to keep pressing. Default is 2
        onStart={start} // Start callback
        onClickNHold={() => clickNHold(id)} //Timeout callback
        onEnd={() => (user.favorited ? delFavorites(id) : addFavorites(id))}
      >
        <Button
          variant="success"
          className="simpleButtons"
          disabled={loading}
          style={{ margin: 0 }}
        >
          {user.favorited ? (
            <FavoriteIcon fontSize="small" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </Button>
      </ClickNHold>
    );
  };

  const ArchiveButton = ({ id, user }) => {
    if (auth.isAuthenticated)
      return (
        <Button
          className="simpleButtons"
          // variant="secondary"
          variant="info"
          onClick={() => (user.archived ? unarchive(id) : archive(id))}
          style={{ margin: 0 }}
          disabled={loading}
        >
          {user.archived ? (
            <ArrowUpwardIcon fontSize="small" />
          ) : (
            <ArrowDownwardIcon fontSize="small" />
          )}
        </Button>
      );
  };

  const DelShowButton = ({ id, user }) => {
    return (
      <Button
        className="simpleButtons"
        variant="secondary"
        onClick={() =>
          confirmAlert({
            title: "Confirm to remove this show",
            message:
              "Are you sure ? It will erase it from your favorites and archived.",
            buttons: [
              {
                label: "Yes",
                onClick: () => delShow(id),
              },
              {
                label: "No",
              },
            ],
          })
        }
        style={{ margin: 0 }}
        disabled={loading}
      >
        <DeleteIcon fontSize="small" />
      </Button>
    );
  };

  const archive = async (id) => {
    const body = {
      id: id,
      key: key,
      token: auth.token,
    };

    axios.post(api_link + "/shows/archive", body, config).then(async (res) => {
      console.log(res, "THE ARCHIVE IS DONE");
      if (res.data.errors == []) {
        toast.error("An error has occured", { position: "top-center" });
      } else {
        toast.success("Tv Show Archived", {
          position: "top-center",
        });
        await loadShows();
      }
    });
  };

  const unarchive = async (id) => {
    const body = {
      id: id,
      key: key,
      token: auth.token,
    };

    axios
      .delete(
        api_link + `/shows/archive?key=${key}&id=${id}&token=${auth.token}`
      )
      .then(async (res) => {
        console.log(res, "THE ARCHIVE IS DONE");
        if (res.data.errors == []) {
          toast.error("An error has occured", { position: "top-center" });
        } else {
          toast.info("Tv Show Unarchived", {
            position: "top-center",
          });
          await loadShows();
        }
      });
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
                      <span style={{ margin: "2px" }}>
                        {ClickNHoldButton(show)}
                      </span>
                      <span style={{ margin: "2px" }}>
                        {ArchiveButton(show)}
                      </span>
                      <span style={{ margin: "2px" }}>
                        {DelShowButton(show)}
                      </span>
                    </Row>
                  </span>
                );
              })
            : null}
        </Row>
      </Container>
      {/* <Container fluid>
        <Row className={center + " mt-5"}>
          <Button
            variant="primary"
            className="mr-2"
            onClick={() => move(-1)}
            disabled={page !== 0 ? loading : true}
          >
            Back
          </Button>
          <Button
            className="ml-2"
            variant="primary"
            onClick={() => move(1)}
            disabled={loading}
          >
            Forward
          </Button>
        </Row>
      </Container> */}
    </>
  );
};

MyShows.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(MyShows);
