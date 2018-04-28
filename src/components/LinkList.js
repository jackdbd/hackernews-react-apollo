import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Link from "./Link";

class LinkList extends Component {
  render() {
    console.log(this.props.feedQuery.loading);
    if (this.props.feedQuery && this.props.feedQuery.loading) {
      return <div>Loading feed...</div>;
    }
    if (this.props.feedQuery && this.props.feedQuery.error) {
      return <div>Error</div>;
    }
    const linksToRender = this.props.feedQuery.feed.links;
    return (
      <div>{linksToRender.map(link => <Link key={link.id} link={link} />)}</div>
    );
  }
}

// Use the parser function gql on a GraphQL query to obtain a Javascript object.
const FEED_QUERY = gql`
  # This is a GraphQL comment
  query FeedQuery {
    feed {
      links {
        id
        url
        description
      }
    }
  }
`;

// Use graphql to wrap the LinkList component with the query. Pass some options.
// Apollo will inject a new prop called feedQuery into the graphql component.
export default graphql(FEED_QUERY, { name: "feedQuery" })(LinkList);
