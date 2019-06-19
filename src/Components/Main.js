import React from "react";
import { Link } from "react-router-dom";
import uid2 from "uid2";
import axios from "axios";
import server from "../config/server";
import validator from "validator";
//
// Possible improvement note for a further version :
// the validator used here doesn't check extensions, so maybe check if extension exists ?
//

class Main extends React.Component {
  state = {
    input: "http://www.google.fr",
    // here is the link format used : { _id, original, hash, visits }
    links: [],
    message: false
  };

  errTimeout = null;

  // handle the url input change
  handleChange = e => {
    this.setState({ input: e.target.value });
  };

  // setting timeout for the message shown to the user
  timedMessage = message => {
    this.setState({ message });
    this.errTimeout = setTimeout(this.hideMessage, 3000);
  };

  // to hide the message shown to the user
  hideMessage = () => {
    this.setState({ message: false });
  };

  // handle the "shorten url" button click
  handleShortenClick = async e => {
    e.preventDefault();

    // clear the timeout of the timed message and hide it
    clearTimeout(this.errTimeout);
    this.hideMessage();

    // 1. Input validation
    if (this.state.input === "") {
      this.timedMessage("Please fill out the field.");
    } else if (validator.isURL(this.state.input)) {
      // if valid url or ipv4 address
      // 2. Hash and new link creation
      let url = this.state.input;
      // we add "http://" at the beginning of urls which doesn't have it and are are not ftps in order to have the same look and feel format for all urls in database
      if (url.indexOf("http") !== 0 && url.indexOf("ftp") !== 0) {
        url = "http://" + url;
      }
      let hash = uid2(5);
      let newLink = {
        id: uid2(10),
        original: url,
        hash,
        visits: 0
      };
      // 3. Axios request to store datas
      try {
        const response = await axios.post(`${server}add`, {
          original: newLink.original,
          hash: newLink.hash,
          visits: newLink.visits
        });
        if (response.data.id) {
          // creation OK
          newLink._id = response.data.id;
          // 4. Update of links state
          let links = [...this.state.links];
          links.unshift(newLink);
          this.setState({ input: "", links });
        } else {
          // creation NOK, display error message
          this.timedMessage(response.data.message);
        }
      } catch (e) {
        this.setState({ message: e.message });
      }
    } else {
      // else : the input is not a valid url or ipv4 address, so we show a timed message
      this.timedMessage("Unable to shorten that link. It is not a valid url.");
    }
  };

  // handle the click on a short url link
  handleShorturlClick = async linkId => {
    try {
      // update the visits count in database
      const response = await axios.post(`${server}update`, { id: linkId });
      if (response.data.link) {
        // update the visits count for this short link in the state
        const visits = response.data.link.visits;
        const links = [...this.state.links];
        links.forEach(link => {
          if (link._id === linkId) {
            link.visits = visits;
          }
        });
        this.setState({ links });
      } else {
        alert("This short url doesn't exist anymore in database ...");
      }
    } catch (e) {
      this.setState({ message: e.message });
    }
  };

  // render link row
  renderLink = link => {
    return (
      <tr key={link._id}>
        <td>
          <a href={link.original} target="_blank" rel="noopener noreferrer">
            {link.original}
          </a>
        </td>
        <td>
          <Link
            to={link.hash}
            target="_blank"
            onClick={() => this.handleShorturlClick(link._id)}
            // rel="noopener noreferrer"
          >
            {"https://short-url-sylvain-laborderie.herokuapp.com/" + link.hash}
          </Link>
        </td>
        <td>{link.visits}</td>
      </tr>
    );
  };

  render() {
    return (
      <>
        <header>
          <div className="container header-content">
            <h1>Simplify your links</h1>
            <div className="input-area">
              <form>
                <input
                  onChange={this.handleChange}
                  value={this.state.input}
                  placeholder="Your original URL here"
                />
                <button type="submit" onClick={this.handleShortenClick}>
                  Shorten URL
                </button>
              </form>
            </div>
          </div>
        </header>

        {this.state.message && (
          <p className="container error">{this.state.message}</p>
        )}

        {this.state.links.length === 0 ? (
          <div className="container emptyContent">Nothing yet ...</div>
        ) : (
          <table className="container">
            <thead>
              <tr>
                <th style={{ width: "42%" }}>Original URL</th>
                <th style={{ width: "46%" }}>Short URL</th>
                <th style={{ width: "12%" }}>Visits</th>
              </tr>
            </thead>
            <tbody>
              {this.state.links.map(link => {
                return this.renderLink(link);
              })}
            </tbody>
          </table>
        )}
      </>
    );
  }

  async componentDidMount() {
    // Axios request to fetch stored links
    try {
      const response = await axios.get(server);
      const links = response.data;
      links.reverse();
      //console.log(links);
      this.setState({ links });
    } catch (e) {
      //console.log({ error: e.message });
      this.setState({ message: e.message });
    }
  }
}

export default Main;
