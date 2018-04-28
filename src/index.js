import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./components/App";
import registerServiceWorker from "./registerServiceWorker";

import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-memory";

// Create the HttpLink that will connect your ApolloClient instance with the 
// GraphQL API; your GraphQL server will be running on http://localhost:4000.
const httpLink = new HttpLink({ uri: "http://localhost:4000" });

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

// Wrap App with the higher-order component ApolloProvider.
// ApolloProvider gets passed the client as a prop.
ReactDOM.render(
  <ApolloProvider>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
registerServiceWorker();
