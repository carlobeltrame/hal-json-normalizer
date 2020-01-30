# hal-json-normalizer

Utility to normalize HAL JSON data for Vuex applications.

[![npm version](https://img.shields.io/npm/v/hal-json-normalizer.svg?style=flat)](https://www.npmjs.com/package/hal-json-normalizer)
[![Downloads](http://img.shields.io/npm/dm/hal-json-normalizer.svg?style=flat-square)](https://npmjs.org/package/hal-json-normalizer)
[![Build Status](https://img.shields.io/travis/carlobeltrame/hal-json-normalizer/master.svg?style=flat)](https://travis-ci.org/carlobeltrame/hal-json-normalizer)
[![Coverage Status](https://coveralls.io/repos/github/carlobeltrame/hal-json-normalizer/badge.svg?branch=master)](https://coveralls.io/github/carlobeltrame/hal-json-normalizer?branch=master)

# Description

hal-json-normalizer helps [HAL JSON](https://tools.ietf.org/html/draft-kelly-json-hal-08) APIs and [Vuex](https://vuex.vuejs.org/) work together.
Unlike [normalizr](https://github.com/paularmstrong/normalizr), hal-json-normalizer supports the HAL+JSON specification, which means that you don't have to care about schemas.

# Install

```shell
$ npm install hal-json-normalizer
```

# Example

```JavaScript
import normalize from 'hal-json-normalizer';

const json = {
  id: 2620,
  text: 'I am great!',
  _embedded: {
    question: {
      id: 295,
      text: 'How are you?',
      _links: {
        self: {
          href: 'https://my.api.com/questions/295',
        },
      },
    },
  },
  _links: {
    self: {
      href: 'https://my.api.com/answers/2620',
    },
    author: {
      href: 'https://my.api.com/users/1024',
    },
  },
};

console.log(normalize(json));
/* Output:
{
  'https://my.api.com/answers/2620': {
    id: 2620,
    text: 'I am great!'
    question: {
      href: 'https://my.api.com/questions/295',
    },
    author: {
      href: 'https://my.api.com/users/1024',
    },
    _meta: {
      self: 'https://my.api.com/answers/2620',
    },
  },
  'https://my.api.com/questions/295': {
    id: 295,
    text: 'How are you?',
    _meta: {
      self: 'https://my.api.com/questions/295',
    },
  },
}
*/
```

# Options

## Camelize Keys

By default all object keys are converted to camel case, however, you can disable this with `camelizeKeys` option.

```JavaScript
const json = {
  'camel-me': 1,
  _links: {
    self: {
      href: 'https://my.api.com/someEntity/1',
    },
  },
};

console.log(normalize(json));
/* Output:
{
  'https://my.api.com/someEntity/1': {
    camelMe: 1,
    _meta: {
      self: 'https://my.api.com/someEntity/1',
    },
  },
}
*/

console.log(normalize(json, { camelizeKeys: false }));
/* Output:
{
  'https://my.api.com/someEntity/1': {
    'camel-me': 1,
    _meta: {
      self: 'https://my.api.com/someEntity/1',
    },
  },
}
*/
```


## Normalizing URIs

In many cases, all API URIs will start with the same prefix, or you may want to treat different orderings of query parameters as the same endpoint, etc. You can specify a normalization strategy for all identifiers by passing a function to the `normalizeUri` option.

```JavaScript
const json = {
  id: 1,
  _links: {
    self: {
      href: 'https://my.api.com/api/v2/someEntity/1',
    },
    someApiInternalLink: {
      href: 'https://my.api.com/api/v2/related/20',
    },
    someExternalLink: {
      href: 'test.com/not-starting-with-the-same-prefix',
    },
  },
};

console.log(normalize(json));
/* Output:
{
  'https://my.api.com/api/v2/someEntity/1': {
    id: 1,
    someApiInternalLink: {
      href: 'https://my.api.com/api/v2/related/20',
    },
    someExternalLink: {
      href: 'test.com/not-starting-with-the-same-prefix',
    },
    _meta: {
      self: 'https://my.api.com/someEntity/1',
    },
  },
}
*/

console.log(normalize(json, { normalizeUri: (uri) => uri.replace(/^https:\/\/my.api.com\/api\/v2/, '') }));
/* Output:
{
  '/someEntity/1: {
    id: 1,
    someApiInternalLink: {
      href: '/related/20',
    },
    someExternalLink: {
      href: 'test.com/not-starting-with-the-same-prefix',
    },
    _meta: {
      self: '/someEntity/1',
    },
  },
}
*/
```


## Custom `_meta` key

This library adds the self link as a string property `self` to the `_meta` property of each resource. Depending on your API server framework, you might want to use a different key than `_meta`. You can change this using the `metaKey` option.

```JavaScript
const json = {
  id: 1,
  _meta: {
    expiresAt: 1513868982,
  },
  _links: {
    self: {
      href: 'https://my.api.com/someEntity/1',
    },
  },
};

console.log(normalize(json));
/* Output:
{
  'https://my.api.com/someEntity/1': {
    id: 1,
    _meta: {
      expiresAt: 1513868982,
      self: 'https://my.api.com/someEntity/1',
    },
  },
}
*/

console.log(normalize(json, { metaKey: '__metadata' }));
/* Output:
{
  'https://my.api.com/someEntity/1': {
    id: 1,
    // CAUTION: this key is now now special anymore and therefore is camelized by default
    meta: {
      expiresAt: 1513868982,
    },
    __metadata: {
      self: 'https://my.api.com/someEntity/1',
    },
  },
}
*/
```


## Name for embedded lists

In some applications, you might want to make standalone collections with their own URI indistinguishable from embedded collections. However, in HAL, standalone collections that are retrieved under a certain URI usually contain a property called `items` or similar, which holds the actual array of collection members. To imitate this in embedded collections, you can have them automatically be wrapped in a similar `items` property (if they aren't already) using the `embeddedCollectionName` option.
> Caution: The value of embeddedListName should be a reserved word in your API. In particular, this tool can not currently handle an embedded collection with the relation name `items` correctly when embeddedListName is also `items`.

```JavaScript
const json = {
  id: 1,
  _embedded: {
    comments: [
      {
        text: 'Hello World!',
        author: 'James',
        _links: {
          self: {
            href: 'https://my.api.com/comments/53204',
          },
        },
      },
      {
        text: 'Hi there',
        author: 'Joana',
        _links: {
          self: {
            href: 'https://my.api.com/comments/1395',
          },
        },
      },
    ],
  },
  _links: {
    self: {
      href: 'https://my.api.com/someEntity/1',
    },
  },
};

console.log(normalize(json));
/* Output:
{
  'https://my.api.com/someEntity/1': {
    id: 1,
    comments: [
      {
        href: 'https://my.api.com/comments/53204',
      },
      {
        href: 'https://my.api.com/comments/1395',
      },
    ],
    _meta: {
      self: 'https://my.api.com/someEntity/1',
    },
  },
  'https://my.api.com/comments/53204': {
    text: 'Hello World!',
    author: 'James',
    _meta: {
      self: 'https://my.api.com/comments/53204'
    },
  }
  'https://my.api.com/comments/1395': {
    text: 'Hi there',
    author: 'Joana',
    _meta: {
      self: 'https://my.api.com/comments/1395'
    },
  },
}
*/

console.log(normalize(json, { embeddedListName: 'items' }));
/* Output:
{
  'https://my.api.com/someEntity/1': {
    id: 1,
    comments: {
      items: [
        {
          href: 'https://my.api.com/comments/53204',
        },
        {
          href: 'https://my.api.com/comments/1395',
        },
      ],
      _meta: {
        self: 'https://my.api.com/someEntity/1',
      ],
    },
  },
  'https://my.api.com/comments/53204': {
    text: 'Hello World!',
    author: 'James',
    _meta: {
      self: 'https://my.api.com/comments/53204'
    },
  }
  'https://my.api.com/comments/1395': {
    text: 'Hi there',
    author: 'Joana',
    _meta: {
      self: 'https://my.api.com/comments/1395'
    },
  },
}
*/
```


## Filtering references

Even if the HAL JSON standard does not define it this way, some API server frameworks (like apigility in the Zend Framework 2) can sometimes send stripped down versions of deeply nested embedded resources. As you can see below (the `author` of the comment resource), such references contain nothing but a self link. You can prevent these incomplete resource representations from polluting your store using the `filterReferences` option.

```JavaScript
const json = {
  id: 1,
  text: 'hello, world!',
  _embedded: {
    comments: [
      {
        id: 203,
        text: 'good post!',
        _embedded: {
          // This is a reference: an embedded resource with nothing but a self link
          author: {
            _links: {
              self: {
                href: 'https://my.api.com/users/124',
              },
            },
          },
        },
        _links: {
          self: {
            href: 'https://my.api.com/comments/203',
          },
        },
      },
    ],
  },
  _links: {
    self: {
      href: 'https://my.api.com/posts/1',
    },
  },
};

console.log(normalize(json));
/* Output:
{
  'https://my.api.com/posts/1': {
    id: 1,
    text: 'hello, world!',
    comments: [
      {
        href: 'https://my.api.com/comments/203',
      },
    ],
    _meta: {
      self: 'https://my.api.com/posts/1',
    },
  },
  'https://my.api.com/comments/203': {
    id: 203,
    text: 'good post!',
    author: 'https://my.api.com/users/124',
    _meta: {
      self: 'https://my.api.com/comments/203',
    },
  },
  // This is an incomplete representation of the user, use filterResources: true if you don't want this:
  'https://my.api.com/users/124': {
    _meta: {
      self: 'https://my.api.com/users/124',
    },
  },
}
*/

console.log(normalize(json, { filterReferences: true }));
/* Output:
{
  'https://my.api.com/posts/1': {
    id: 1,
    text: 'hello, world!',
    comments: [
      {
        href: 'https://my.api.com/comments/203',
      },
    ],
    _meta: {
      self: 'https://my.api.com/posts/1',
    },
  },
  'https://my.api.com/comments/203': {
    id: 203,
    text: 'good post!',
    author: 'https://my.api.com/users/124',
    _meta: {
      self: 'https://my.api.com/comments/203',
    },
  },
}
*/
```
