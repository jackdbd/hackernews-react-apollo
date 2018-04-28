import React, { Component } from "react";
import gql from "graphql-tag";
import { withApollo } from "react-apollo";
import Link from "./Link";

class Search extends Component {
  state = {
    links: [],
    filter: ""
  };

  render() {
    return (
      <div>
        <div>
          Search
          <input
            type="text"
            onChange={ev => this.setState({ filter: ev.target.value })}
          />
          <button onClick={() => this._executeSearch()}>OK</button>
        </div>
        {this.state.links.map((link, index) => (
          <Link key={link.id} link={link} index={index} />
        ))}
      </div>
    );
  }

  _executeSearch = async () => {
    const { filter } = this.state;
    // execute FEED_SEARCH_QUERY and retrieve links from the response that is
    // returned by the GraphQL server
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter }
    });
    const links = result.data.feed.links;
    // put these links into the component's state, so they can be rendered
    this.setState({ links });
  };
}

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

export default withApollo(Search);
