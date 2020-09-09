import React, { useEffect, useState } from "react";
import axios from 'axios'
import { Link } from "react-router-dom";
import { useRouteMatch } from "react-router-dom"
import Image from 'react-bootstrap/Image';

export default function Show() {

  let showid = useRouteMatch("/show/:showid").params.showid;

  useEffect(() => {
    // axios.get(process.env.REACT_APP_API_LINK + '/shows/discover?key=' + process.env.REACT_APP_API_KEY + '&limit=' + limit + '&offset=' + offset)
    //   .then(res => {
    //     console.log(res)
    //   })
  }, [])

  return (
    <>
      <div className="row">
        <div className="card">

        </div>
      </div>
    </>
  )
}