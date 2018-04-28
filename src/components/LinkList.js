import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Link from "./Link";

class LinkList extends Component {
  render() {
    if (this.props.feedQuery && this.props.feedQuery.loading) {
      return <div>Loading feed...</div>;
    }
    if (this.props.feedQuery && this.props.feedQuery.error) {
      return <div>Error</div>;
    }
    const linksToRender = this.props.feedQuery.feed.links;
    return (
      <div>
        {linksToRender.map((link, index) => (
          // inject _updateCacheAfterVote in child component
          <Link
            key={link.id}
            updateStoreAfterVote={this._updateCacheAfterVote}
            index={index}
            link={link}
          />
        ))}
      </div>
    );
  }

  _updateCacheAfterVote = (store, createVote, linkId) => {
    // read current state of the cache
    const data = store.readQuery({ query: FEED_QUERY });
    // retrieve the link that the user just voted
    const votedLink = data.feed.links.find(link => link.id === linkId);
    // reset votes to the votes that were just returned by the server
    votedLink.votes = createVote.link.votes;
    // update the cache with the modified data
    store.writeQuery({ query: FEED_QUERY, data });
  };
}

// Use the parser function gql on a GraphQL query to obtain a Javascript object.
export const FEED_QUERY = gql`
  # This is a GraphQL comment
  query FeedQuery {
    feed {
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

// Use graphql to wrap the LinkList component with the query. Pass some options.
// Apollo will inject a new prop called feedQuery into the graphql component.
export default graphql(FEED_QUERY, { name: "feedQuery" })(LinkList);
