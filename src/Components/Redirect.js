import React from "react";
import axios from "axios";
import server from "../config/server";

class Redirect extends React.Component {
  render() {
    // NOTHING ON SCREEN WHILE
    //return null;

    // OR SOME MESSAGE
    return (
      <div>
        <div>
          (Redirect this.props.location : {this.props.location.pathname})
        </div>
        <div>Redirecting ...</div>
      </div>
    );
  }

  async componentDidMount() {
    try {
      const hash = this.props.location.pathname.substr(1);
      const response = await axios.get(`${server}link/?hash=${hash}`);
      if (response.data !== null) {
        // url redirection
        // add "http://" to urls whithout it but not on ftps urls ( in order for the redirection to work properly )
        let url = response.data.original;
        if (url.indexOf("http") !== 0 && url.indexOf("ftp") !== 0) {
          url = "http://" + url;
        }
        //window.location.href = url;
        window.location.replace(url);
        alert("redirecting to " + url);
      } else {
        alert("URL not valid");
      }
    } catch (e) {
      alert("error:" + e.message);
      console.log({ error: e.message });
    }
  }
}

export default Redirect;
