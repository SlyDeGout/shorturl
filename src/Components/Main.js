import React from "react";
import { Link } from "react-router-dom";
import uid2 from "uid2";
import axios from "axios";
import server from "../config/server";

class Main extends React.Component {
  state = {
    input: "http://www.google.fr",
    links: [],
    // links: [
    //   {
    //     _id: uid2(10),
    //     original: "https://www.lereacteur.io",
    //     hash: "akfa",
    //     visits: 42
    //   }
    // ],
    message: false
  };

  errTimeout = null;

  // handle the url input change
  handleChange = e => {
    this.setState({ input: e.target.value });
  };

  // to hide the message shown to the user
  hideMessage = () => {
    this.setState({ message: false });
  };

  // return true if url is valid
  validURL = url => {
    if (url.indexOf(".") === -1) return false;
    let pattern = new RegExp(
      "^(http:\\/\\/www.|https:\\/\\/www.|http:\\/\\/|https:\\/\\/|ftp:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + //port
      "(\\?[;&amp;a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    );
    // pattern = new RegExp(
    //   "^(?: (https | http | ftp) ?: //)?[w.-](?:.[w.-]+)[w-._~:/?#[]@!$&'()*+,;=.]$",
    //   "i"
    // );
    return pattern.test(url);
  };

  // handle the "shorten url" button click
  handleClick = async e => {
    e.preventDefault();

    clearTimeout(this.errTimeout);
    this.errTimeout = setTimeout(this.hideMessage, 3000);

    // 1. Input validation
    if (!this.validURL(this.state.input)) {
      this.setState({
        message: "Unable to shorten that link. It is not a valid url."
      });
    } else {
      // this.setState({
      //   message: "PERFECT URL."
      // });
      // 2. Hash and new link creation
      let url = this.state.input;
      // adding "http://" at the beginning of urls which doesn't have it and are are not ftps
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
        newLink._id = response.data.id;
        // 4. Update of links state
        let links = [...this.state.links];
        links.unshift(newLink);
        this.setState({ input: "", links });
      } catch (e) {
        //??????
        //??????
        //   ???? NE SEMBLE PAS MARCHER SI LE SERVEUR NE REPOND PAS
        //????
        //????
        // if the server answer ?????
        if (e.response) {
          this.setState({ message: e.response.data.message });
          //console.log({ error: e.response.data.message });
        } else {
          this.setState({ message: e.message });
          //console.log({ error: e.message.message });
        }
      }
    }
  };

  shorturlClick = async linkId => {
    try {
      const response = await axios.post(`${server}update`, { id: linkId });

      // update the visits count for this short link in the state
      const visits = response.data.link.visits;
      const links = [...this.state.links];
      links.forEach(link => {
        if (link._id === linkId) {
          link.visits = visits;
        }
      });
      this.setState({ links });
    } catch (e) {
      this.setState({ message: e.message });
      //console.log({ error: e.message });
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
            onClick={() => this.shorturlClick(link._id)}
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
        <div>(Main location.pathname : {this.props.location.pathname})</div>
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
                <button type="submit" onClick={this.handleClick}>
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
