# hal-json-normalizer

Utility to normalize HAL JSON data for Vuex applications.

[![npm version](https://img.shields.io/npm/v/hal-json-normalizer.svg?style=flat)](https://www.npmjs.com/package/hal-json-normalizer)
[![Downloads](http://img.shields.io/npm/dm/hal-json-normalizer.svg?style=flat-square)](https://npmjs.org/package/hal-json-normalizer)
[![CI](https://github.com/carlobeltrame/hal-json-normalizer/workflows/CI/badge.svg)](https://github.com/carlobeltrame/hal-json-normalizer/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/carlobeltrame/hal-json-normalizer/badge.svg?branch=master)](https://coveralls.io/github/carlobeltrame/hal-json-normalizer?branch=master)

# Description

hal-json-normalizer helps [HAL JSON](https://tools.ietf.org/html/draft-kelly-json-hal-08) APIs and [Vuex](https://vuex.vuejs.org/) work together.
Unlike [normalizr](https://github.com/paularmstrong/normalizr), hal-json-normalizer supports the HAL+JSON specification, which means that you don't have to care about schemas.
This library also supports [templated links](https://tools.ietf.org/html/draft-kelly-json-hal-00#section-5).

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
    questions: {
      href: 'https://my.api.com/questions{/id}',
      templated: true,
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
    questions: {
      href: 'https://my.api.com/questions{/id}',
      templated: true,
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

> Note: [Templated links](https://tools.ietf.org/html/draft-kelly-json-hal-08#section-5.1) are excluded from normalization, because the URIs inside are actually [URI templates](https://tools.ietf.org/html/rfc6570), not normal URIs. Templated links look like this: `{ href: 'https://so.me/where{/id}', templated: true }`

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


## Embedded lists with a self link

In some cases your API might need to embed a list (for performance reasons), but still communicate a self link under which the list can be separately re-fetched. This is supported by doing the following:
* In the API, embed the list normally under some relation key (e.g. `comments`) and also add a link with the same relation key to `_links`
* Set the `embeddedStandaloneListKey` option to some string, e.g. `'items'`

The list will then be normalized as a separate (standalone) object, containing just the list under the key from the option (`items`).

> Note: If you don't specify the `embeddedStandaloneListKey` option and the API sends the same relation key in `_embedded` and in `_links`, the data from `_embedded` will take preference, since that can potentially contain more information.

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
    comments: {
      href: 'https://my.api.com/comments?someEntity=1',
    },
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

console.log(normalize(json, { embeddedStandaloneListKey: 'items' }));
/* Output:
{
  'https://my.api.com/someEntity/1': {
    id: 1,
    comments: {
      href: 'https://my.api.com/comments?someEntity=1',
    },
    _meta: {
      self: 'https://my.api.com/someEntity/1',
    },
  },
  'https://my.api.com/comments?someEntity=1': {
    items: [
      {
        href: 'https://my.api.com/comments/53204',
      },
      {
        href: 'https://my.api.com/comments/1395',
      },
    ],
    _meta: {
      self: 'https://my.api.com/comments?someEntity=1',
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
