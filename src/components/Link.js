import React, { Component } from "react";
import { DIRECTIVE } from "graphql/language/kinds";

class Link extends Component {
  render() {
    return (
      <div>
        <div>
          {this.props.link.description} ({this.props.link.url})
        </div>
      </div>
    );
  }

  _voteForLink = async () => {
    // TODO
  };
}

export default Link;
