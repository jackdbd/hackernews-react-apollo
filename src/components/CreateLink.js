import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

class CreateLink extends Component {
  state = {
    description: "",
    url: ""
  };

  render() {
    return (
      <div>
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={this.state.description}
            onChange={e => this.setState({ description: e.target.value })}
            type="text"
            placeholder="A description for the link"
          />
          <input
            className="mb2"
            value={this.state.url}
            onChange={e => this.setState({ url: e.target.value })}
            type="text"
            placeholder="The URL for the link"
          />
        </div>
        <button onClick={() => this._createLink()}>Submit</button>
      </div>
    );
  }

  _createLink = async () => {
    const { description, url } = this.state;
    await this.props.postMutation({
      variables: {
        description,
        url
      }
    });
    // automatic redirect to the '/' route
    this.props.history.push("/");
  };
}

// The JavaScript constant called POST_MUTATION stores the mutation
const POST_MUTATION = gql`
  # The actual GraphQL mutation
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      url
      description
    }
  }
`;

// Apollo will use the mutation function "postMutation" that gets injected into
// the graphql component's props
export default graphql(POST_MUTATION, { name: "postMutation" })(CreateLink);
