# monglow

A simple MongoDB wrapper that doesn't get in your way.

- Easy & flexible database setup
- Command buffering (query without waiting for connection)
- Customisable ObjectId casting and auto-casting of `_id`
- Recording of `_created` & `_updated`
- Promises built-in
- Direct access to native MongoDB driver; and
- Access to internal monglow utils

```
npm i --save monglow
```

## Usage

```typescript
import { Monglow, Model } from 'monglow';

const uri = 'localhost/test';
const monglow = new Monglow(uri);

const User = new Model('users');

const Cast = new Model('casts', {
  cast: {
    user_id: true, // This will cast to ObjectId
    test: value => value + 'hello!'
  }
});

monglow.connect();

monglow.activate(User);

User.find().then(users => {
  console.log(users);
});

// Direct access to MongoDB driver
User.collection(c =>
  c.updateOne(
    { _id: new ObjectId() },
    { $set: { hello: 'world!' } },
    { upsert: true }
  )
)
  .then(() => {})
  .catch(() => {});

monglow.disconnect();
```

## Coming soon

- Relationships
