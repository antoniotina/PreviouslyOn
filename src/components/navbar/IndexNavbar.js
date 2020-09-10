import React, { Component, Fragment } from "react"
import RegisterModal from "../auth/RegisterModal"
import LoginModal from "../auth/LoginModal"
import Logout from "../auth/Logout"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { searchPost } from "../../actions/postActions"
import { BrowserRouter as Router, Link, Redirect, NavLink } from "react-router-dom"
import "./IndexNavbar.css"
import {
  Navbar,
  Nav,
  NavItem,
} from "react-bootstrap"

class IndexNavbar extends Component {
  constructor() {
    super()
    this.state = {
      isOpen: false,
      productsCart: [],
      prixTotal: 0,
      nombreTotal: 0,
    }
  }
  static propTypes = {
    auth: PropTypes.object.isRequired,
  }

  operation() {
    this.setState({
      isOpen: !this.state.isOpen,
    })
  }

  render() {
    const { isAuthenticated, isLoading } = this.props.auth

    const authLinks = (
      <Fragment>
        <NavItem>
          <NavLink to='/friends'>Manage friends</NavLink>
        </NavItem>
        <NavItem>
          <Logout />
        </NavItem>
      </Fragment>
    )

    const guestLinks = (
      <Fragment>
        <NavItem>
          <LoginModal />
        </NavItem>
        <NavItem>
          <RegisterModal />
        </NavItem>
      </Fragment>
    )

    return (
      <div id="navbarholder">
        <Navbar color="light" light="true" expand="lg" id="navbar">
          {/* <Navbar.Brand href="/" id="brandName">
            Previously On
          </Navbar.Brand> */}
          <Navbar.Brand>
            <Link to="/">Previously On</Link>
          </Navbar.Brand>
        </Navbar>
        <Navbar id="underline">
          <Nav>
            {!isLoading ? (isAuthenticated ? authLinks : guestLinks) : null}
          </Nav>
        </Navbar>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  post: state.post,
  auth: state.auth,
})

export default connect(mapStateToProps, { searchPost })(IndexNavbar)
