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
import { ApolloLink } from "apollo-link";
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

const client = new ApolloClient({
  link: httpLinkWithAuthToken,
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
