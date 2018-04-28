import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { AUTH_TOKEN } from "../constants";
import { timeDifferenceForDate } from "../utils";

class Link extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN);
    // console.log(`Link created at: ${this.props.link.createdAt}`);
    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">
          <span className="gray">{this.props.index + 1}.</span>
          {authToken && (
            <div className="ml1 gray f11" onClick={() => this._voteForLink()}>
              ▲
            </div>
          )}
        </div>
        <div className="ml1">
          <div>
            {this.props.link.description} ({this.props.link.url})
          </div>
          <div className="f6 lh-copy gray">
            {this.props.link.votes.length} votes | by{" "}
            {this.props.link.postedBy
              ? this.props.link.postedBy.name
              : "Unknown"}{" "}
            {timeDifferenceForDate(this.props.link.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  _voteForLink = async () => {
    const linkId = this.props.link.id;
    await this.props.voteMutation({
      variables: {
        linkId
      },
      // manually update the cache (Apollo's imperative store API)
      // 'store' is the current state of the cache
      // 'data' is the payload of the mutation. We only need to extract 'vote'
      // to set a new state of the cache (we can use destructuring)
      update: (store, { data: { vote } }) => {
        this.props.updateStoreAfterVote(store, vote, linkId);
      }
    });
  };
}

// store mutation in a JS object
const VOTE_MUTATION = gql`
  # actual GraphQL mutation
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
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
`;

// wrap Link component in graphql, so voteMutation is injected into the props
export default graphql(VOTE_MUTATION, { name: "voteMutation" })(Link);
