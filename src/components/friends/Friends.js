import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";

const Friends = ({ auth }) => {
  const [friends, setFriends] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (auth.isAuthenticated) {
      console.log("null");
      axios
        .get(
          process.env.REACT_APP_API_LINK +
            "/friends/list?key=" +
            process.env.REACT_APP_API_KEY +
            "&token=" +
            auth.token
        )
        .then((res) => {
          console.log(res.data.users);
          setFriends(res.data.users);
        });
    } else if (auth.isAuthenticated === null) {
    } else {
      window.location.replace("http://" + process.env.REACT_APP_LINK);
    }
  }, [auth]);

  const updateFriends = () => {
    axios
      .get(
        process.env.REACT_APP_API_LINK +
          "/friends/list?key=" +
          process.env.REACT_APP_API_KEY +
          "&token=" +
          auth.token
      )
      .then((res) => {
        setFriends(res.data.users);
      });
  };

  const removeFriend = (friendId) => {
    axios
      .delete(
        process.env.REACT_APP_API_LINK +
          "/friends/friend?key=" +
          process.env.REACT_APP_API_KEY +
          "&id=" +
          friendId +
          "&token=" +
          auth.token
      )
      .then((res) => {
        updateFriends();
      });
  };

  const blockFriend = (friendId) => {
    axios
      .post(
        process.env.REACT_APP_API_LINK +
          "/friends/block?key=" +
          process.env.REACT_APP_API_KEY +
          "&id=" +
          friendId +
          "&token=" +
          auth.token
      )
      .then((res) => {
        updateFriends();
      });
  };

  const addFriend = (e) => {
    e.preventDefault();
    if (email === "") return false;

    axios
      .get(
        process.env.REACT_APP_API_LINK +
          "/friends/find?key=" +
          process.env.REACT_APP_API_KEY +
          "&emails=" +
          email +
          "&token=" +
          auth.token
      )
      .then((res) => {
        if (res.data.users.length) {
          axios
            .post(
              process.env.REACT_APP_API_LINK +
                "/friends/friend?key=" +
                process.env.REACT_APP_API_KEY +
                "&token=" +
                auth.token +
                "&id=" +
                res.data.users[0].id
            )
            .then((res) => {
              updateFriends();
            })
            .catch((error) => {
              toast("Please enter a valid email");
            });
        } else {
          toast("This user does not exist");
        }
      })
      .catch((error) => {
        toast("Please enter a valid email");
      });
  };

  return (
    <>
      <Container className="p-5 mt-5 bloc">
        <h3>My Friends</h3>
        <Row className="pt-3">
          <Col sm="6">
            <Form onSubmit={addFriend}>
              <FormGroup controlId="exampleForm.ControlInput1">
                <Label>Add friend:</Label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button className="mt-1">Submit</Button>
              </FormGroup>
            </Form>
          </Col>
        </Row>
        <Row>
          {friends
            ? friends.map((friend, key) => {
                return (
                  <Col key={key} className="card p-3 m-2" sm="3">
                    <h5>{friend.login}</h5>
                    <span>
                      Status : {friend.in_account ? "Online" : "Offline"}
                    </span>
                    <span>Experience points : {friend.xp}</span>
                    <Button
                      className="btn-sm m-1 mt-3"
                      onClick={() => removeFriend(friend.id)}
                      color="secondary"
                    >
                      Remove
                    </Button>
                    <Button
                      className="btn-sm m-1"
                      onClick={() => blockFriend(friend.id)}
                      color="danger"
                    >
                      Block
                    </Button>
                  </Col>
                );
              })
            : null}
        </Row>
        <ToastContainer />
      </Container>
    </>
  );
};

Friends.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(Friends);
