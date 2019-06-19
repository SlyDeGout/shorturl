import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Redirect from "./Components/Redirect";
import Main from "./Components/Main";

class App extends React.Component {
  render() {
    return (
      <Router>
        <Route path="/:id" exact={true} component={Redirect} />
        <Route path="/" exact={true} component={Main} />
      </Router>
    );
  }
}

export default App;
