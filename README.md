# monglow

A simple MongoDB wrapper that doesn't get in your way.

- Easy & flexible database setup
- Command buffering (query without waiting for connection)
- Auto-casting of `_id` in queries
- Recording of `createdAt` & `updatedAt`
- Promises built-in
- Direct access to native MongoDB driver; and
- Access to monglow utils

```
npm i --save monglow
```

## Usage

```typescript
import { Monglow, Model } from 'monglow';

const uri = 'localhost/test';
const monglow = new Monglow(uri);

const User = new Model('users');

monglow.connect();

monglow.activate(User);

User.find().then(users => {
  console.log(users);
});

monglow.disconnect();
```

## Coming soon

- Relationships
