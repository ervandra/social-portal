// replace apollo-boost using more advanced apollo client as recommended by the apollographql.com
// import ApolloClient from 'apollo-boost';

import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink, Observable } from 'apollo-link';

// eslint-disable-next-line
import { API_URL } from '../../constant';

const request = async (operation) => {
  const token = localStorage.getItem('token');
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : null
    }
  });
};

const requestLink = new ApolloLink((operation, forward) =>
  new Observable(observer => {
    let handle;
    Promise.resolve(operation)
      .then(oper => request(oper))
      .then(() => {
        handle = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      })
      .catch(observer.error.bind(observer));

    return () => {
      if (handle) handle.unsubscribe();
    };
  })
);

const httpLlink = new HttpLink({
  uri: API_URL,
  credentials: 'same-origin',
});

const appClient = new ApolloClient({
  link: ApolloLink.from([
    requestLink,
    httpLlink
  ]),
  cache: new InMemoryCache({
    dataIdFromObject: object => object.key || null,
  }),
});

export default appClient;
