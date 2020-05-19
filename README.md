# monglow

A simple MongoDB wrapper that doesn't get in your way.

- Easy & flexible database setup
- Command buffering (query without waiting for connection)
- Promises built-in
- Direct access to native MongoDB driver
- Serverless friendly
- Typescript support

```
npm i --save monglow
```

## Usage

```typescript
import { Monglow, Model } from 'monglow';

const uri = 'localhost/test';
const monglow = new Monglow(uri);

interface IUser {
  firstName: string;
  lastName: string;
}

const User = new Model<IUser>('users');

/**
 * You can activate and use your models at any point in the code and
 * Monglow will automatically handle the connection process
 */
monglow.activate(User);

User.find().then(users => {
  console.log(users);
});

// Direct access to MongoDB driver
User.collection.then(c => c.find({ hello: 'world!' }).count());

// You can also activate models with connectAndActivate so
// you don't need to run connect at the start of the code.
monglow.connectAndActivate(User);
// Note: this function can be called many times without
// any problems, the database will only connect once per instance of Monglow

monglow.connect();

//
//
// Do some things
//
//

monglow.close();
```
