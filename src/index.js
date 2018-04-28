import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./components/App";
import registerServiceWorker from "./registerServiceWorker";
import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { BrowserRouter } from "react-router-dom";
import { ApolloLink, split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { AUTH_TOKEN } from "./constants";

// Create the HttpLink that will connect your ApolloClient instance with the
// GraphQL API; your GraphQL server will be running on http://localhost:4000.
const httpLink = new HttpLink({ uri: "http://localhost:4000" });

// Use a middleware to authenticate all requests sent by the ApolloClient to
// the GraphQL server
const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  const authorizationHeader = token ? `Bearer ${token}` : null;
  operation.setContext({
    headers: {
      authorization: authorizationHeader
    }
  });
  return forward(operation);
});

const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink);

// Create the web socket link used by the GraphQL server to push data to the
// client. The client receives data when the events he subscribed to occurr.
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000`, // subscriptions endpoint
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN)
    }
  }
});

// Use split to route a request to a specific middleware link
const link = split(
  // 1st argument: a test function that returns a boolean. It is used to decide
  // whether to route the request to the websocket link, or to the HTTP link.
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  // 2nd argument: the web socket (authenticated) link (an ApolloLink)
  wsLink,
  // 3nd argument: the HTTP (authenticated) link (an ApolloLink)
  httpLinkWithAuthToken
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

// Wrap App with the component ApolloProvider.
// ApolloProvider gets passed the client as a prop.
// Wrap ApolloProvider with the component BrowserRouter.
// BrowserRouter shows the component that matches a path to a URL
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
registerServiceWorker();
