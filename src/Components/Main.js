import React from "react";
import { Link } from "react-router-dom";
import uid2 from "uid2";
import axios from "axios";
import server from "../config/server";

//
// Possible improvement notes for a further version :
//
// - Adding auto-refresh in order to maintain the visits counts on screen up-to-date if a short link is visited from outside the app
//

class Main extends React.Component {
  state = {
    input: "",
    // the format of the link format used is : { _id, original, hash, visits }
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
    let url = this.state.input;

    // clear the timeout of the timed message and hide it
    clearTimeout(this.errTimeout);
    this.hideMessage();

    // 1. Check if input is not empty
    if (url === "") {
      this.timedMessage("Please fill out the field.");
    } else {
      // 2. Hash generation and new link object creation
      const hash = uid2(5);
      let newLink = {
        original: url,
        hash,
        visits: 0
      };

      // 3. Api request to validate original url, format it and store datas
      try {
        const response = await axios.post(`${server}add`, {
          original: newLink.original,
          hash: newLink.hash,
          visits: newLink.visits
        });

        if (response.data._id) {
          // OK : Creation successfully done by the api
          // update newLink with fresh data ( original url is now validated and formated by the api )
          newLink = response.data;
          // 4. Update of links state
          let links = [...this.state.links];
          links.unshift(newLink);
          this.setState({ input: "", links });
        } else {
          // NOK : Creation not done by the api, display message
          this.timedMessage(response.data.error);
        }
      } catch (e) {
        this.setState({ message: e.message });
      }
    }
  };

  // handle the click on a short url link
  handleShorturlClick = async linkId => {
    // update the visits count for this short link in the state
    const links = [...this.state.links];
    links.forEach(link => {
      if (link._id === linkId) {
        link.visits++;
      }
    });
    this.setState({ links });
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
                  type="url"
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
      this.setState({ links });
    } catch (e) {
      this.setState({ message: e.message });
    }
  }
}

export default Main;
