## JSON schema validator for `koa-router`

It's middleware for `koa-router` that allows to use json schema validation
for a request query and body and a response body.

### Example

```javascript

import Router from 'koa-router';
import createValidationMdw from 'koa-router-json-schema';
import { getSomeObject } from './someController';

const router = new Router();

router.get(
  '/reverse-geocode',
  createValidationMdw({
    query: {
      type: 'object',
      properties: {
        place_id: {
          type: 'string',
        },
      },
      required: [ 'place_id' ],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string', pattern: 'OK' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: true,
            },
          },
        },
        required: [ 'status', 'data' ],
      },
    },
  }),
  getSomeObject,
);

```