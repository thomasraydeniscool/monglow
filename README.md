# monglow

A simple MongoDB wrapper that doesn't get in your way.

- Easy & flexible database setup
- Command buffering (query without waiting for connection)
- Customizable ObjectId casting and auto-casting of `_id`
- Recording of `_created` & `_updated`
- Promises built-in
- Direct access to native MongoDB driver; and
- Access to internal Monglow utils
- Serverless friendly

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

const Cast = new Model('casts', {
  castOptions: {
    schema: {
      user_id: true, // This will cast to ObjectId
      test: value => value + 'hello!'
    }
  }
});

/**
 * You can activate and use your models at any point in the code and
 * Monglow will automatically handle the connection process
 */
monglow.activate(User);

User.find().then(users => {
  console.log(users);
});

// Direct access to MongoDB driver
User.collection.then(c =>
  c.updateOne(
    { _id: new ObjectId() },
    { $set: { hello: 'world!' } },
    { upsert: true }
  )
);

// You can also activate models with connectAndActivate so
// you don't need to run connect at the start of the code.
monglow.connectAndActivate(Cast);
// Note: this function can be called many times without
// any problems, the database will only connect once per instance of Monglow

async function setup() {
  const nativeClient = await monglow.connect();
  return nativeClient;
}

async function destroy() {
  await monglow.close();
}

setup()
  .then(() => {
    return destroy();
  })
  .then(() => {
    console.log('Done!');
  });
```

## Coming soon

- Relationships
