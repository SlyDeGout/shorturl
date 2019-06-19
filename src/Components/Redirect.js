import React from "react";
import axios from "axios";
import server from "../config/server";

class Redirect extends React.Component {
  render() {
    // Nothing is shown on screen while the redirection
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
        const url = response.data.original;

        try {
          // update the visits count in database
          const response = await axios.post(`${server}update`, { id: _id });
          if (response.data.link) {
            // add "http://" to urls whithout it but not on ftps urls ( in order for the redirection to work properly )
            // this case should never happen as we have already added it before storing in database, so it's just in case of something went wrong with the datas stored
            if (url.indexOf("http") !== 0 && url.indexOf("ftp") !== 0) {
              url = "http://" + url;
            }
            // url redirection
            window.location.replace(url);
          } else {
            alert("This short url doesn't exist anymore in database ...");
          }
        } catch (e) {
          this.setState({ message: e.message });
        }
      } else {
        alert("This url doesn't exist in our database");
      }
    } catch (e) {
      alert("error:" + e.message);
      console.log({ error: e.message });
    }
  }
}

export default Redirect;
