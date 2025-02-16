const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
require('dotenv').config();
console.log( process.env)
const { authMiddleware } = require('./utils/auth');
const stripe = require('stripe')(process.env.SECRET_STRIPE);

const striperoutes = require('./routes/stripe-route');
const { typeDefs, resolvers } = require('./schemas');
const MoviesAPI = require('./schemas/movies-api')
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();
// app.use(cors());
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  dataSources: () => {
    return {
      MoviesAPI: new MoviesAPI()
    }
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/stripe', striperoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
})

// app.post('/create-checkout-session', async (req, res) => {
//   const session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         quantity: 1,
//       },
//     ],
//     payment_method_types: ['card'],
//     mode: 'payment',
//     success_url: `${process.env.CLIENT_URL}/success`,
//     cancel_url: `${process.env.CLIENT_URL}/profile`,
//   });

//   res.redirect(303, session.url);
// });

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });
  
  // app.use(routes);

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
  };
  
// Call the async function to start the server
  startApolloServer(typeDefs, resolvers);
 

