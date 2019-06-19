import React from "react";
import axios from "axios";
import server from "../config/server";

class Redirect extends React.Component {
  render() {
    // Nothing is shown on screen while redirecting
    return null;

    // Or would you prefer a message or something ... ?
    //return <div>Redirecting ...</div>;
  }

  async componentDidMount() {
    try {
      const hash = this.props.location.pathname.substr(1);
      const response = await axios.get(`${server}link/?hash=${hash}`);
      if (response.data !== null) {
        const _id = response.data._id;
        let url = response.data.original;

        try {
          // update the visits count in database
          const response = await axios.post(`${server}visit`, {
            id: _id
          });
          if (response.data.link) {
            // add "http://" to urls whithout it but not on ftps urls, in order for the redirection to work properly
            // ( this case should never happen as we have already added it before storing in database, so it's just in case of something went wrong with the datas stored )
            if (url.indexOf("http") !== 0 && url.indexOf("ftp") !== 0) {
              url = "http://" + url;
            }
            // url redirection
            window.location.replace(url);
          } else {
            // This case won't happen unless the link has disapeared from database in a blink of an eye
            alert(
              "Sorry, this short url doesn't exist anymore in our database ..."
            );
          }
        } catch (e) {
          alert("error:" + e.message);
        }
      } else {
        alert("This short url doesn't exist in our database.");
      }
    } catch (e) {
      alert("error:" + e.message);
    }
  }
}

export default Redirect;
