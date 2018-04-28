import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Link from "./Link";
import { LINKS_PER_PAGE } from "../constants";

class LinkList extends Component {
  componentDidMount() {
    this._subscribeToNewLinks();
    this._subscribeToNewVotes();
  }

  render() {
    if (this.props.feedQuery && this.props.feedQuery.loading) {
      return <div>Loading feed...</div>;
    }
    if (this.props.feedQuery && this.props.feedQuery.error) {
      return <div>Error</div>;
    }

    const isNewPage = this.props.location.pathname.includes("new");
    const linksToRender = this._getLinksToRender(isNewPage);
    const page = parseInt(this.props.match.params.page, 10);

    return (
      <div>
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
        {isNewPage && (
          <div className="flex ml4 mv3 gray">
            <div className="pointer mr2" onClick={() => this._previousPage()}>
              Previous
            </div>
            <div className="pointer" onClick={() => this._nextPage()}>
              Next
            </div>
          </div>
        )}
      </div>
    );
  }

  _getLinksToRender = isNewPage => {
    if (isNewPage) {
      return this.props.feedQuery.feed.links;
    }
    const rankedLinks = this.props.feedQuery.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  };

  _nextPage = () => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page <= this.props.feedQuery.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      this.props.history.push(`/new/${nextPage}`);
    }
  };

  _previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page > 1) {
      const previousPage = page - 1;
      this.props.history.push(`/new/${previousPage}`);
    }
  };

  _updateCacheAfterVote = (store, createVote, linkId) => {
    const isNewPage = this.props.location.pathname.includes("new");
    const page = parseInt(this.props.match.params.page, 10);
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? "createdAt_DESC" : null;
    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    });

    const votedLink = data.feed.links.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;
    // update the cache with the modified data
    store.writeQuery({ query: FEED_QUERY, data });
  };

  _subscribeToNewLinks = () => {
    // open a websocket connection to the subscription server
    this.props.feedQuery.subscribeToMore({
      // 1st argument: the subscription query
      document: gql`
        # The actual GraphQL subscription
        subscription {
          newLink {
            node {
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
      `,
      // 2nd argument: function that controls how the store should be updated with
      // the data coming from the server after the event occurred.
      // It works as a Redux reducer.
      updateQuery: (previous, { subscriptionData }) => {
        // Retrieve the new link from the received subscriptionData, merge it into
        // the existing list of links and return the result of this operation.
        const newAllLinks = [
          subscriptionData.data.newLink.node,
          ...previous.feed.links
        ];
        const result = {
          ...previous,
          feed: {
            links: newAllLinks
          }
        };
        return result;
      }
    });
  };

  _subscribeToNewVotes = () => {
    this.props.feedQuery.subscribeToMore({
      document: gql`
        subscription {
          newVote {
            node {
              id
              link {
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
              user {
                id
              }
            }
          }
        }
      `
    });
  };
}

// Use the parser function gql on a GraphQL query to obtain a Javascript object.
export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      count
      links {
        id
        createdAt
        url
        description
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
      count
    }
  }
`;

// Use graphql to wrap the LinkList component with the query. Pass some options.
// Apollo will inject a new prop called feedQuery into the graphql component.
export default graphql(FEED_QUERY, {
  name: "feedQuery",
  options: ownProps => {
    const page = parseInt(ownProps.match.params.page, 10);
    const isNewPage = ownProps.location.pathname.includes("new");
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    // make sure the newest links are displayed first
    const orderBy = isNewPage ? "createdAt_DESC" : null;
    return {
      variables: { first, skip, orderBy }
    };
  }
})(LinkList);
