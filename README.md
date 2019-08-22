# hal-json-normalizer

Utility to normalize HAL JSON data for Vuex applications

[![npm version](https://img.shields.io/npm/v/hal-json-normalizer.svg?style=flat)](https://www.npmjs.com/package/hal-json-normalizer)
[![Downloads](http://img.shields.io/npm/dm/hal-json-normalizer.svg?style=flat-square)](https://npmjs.org/package/hal-json-normalizer)
[![Build Status](https://img.shields.io/travis/carlobeltrame/hal-json-normalizer/master.svg?style=flat)](https://travis-ci.org/carlobeltrame/hal-json-normalizer)
[![Coverage Status](https://coveralls.io/repos/github/carlobeltrame/hal-json-normalizer/badge.svg?branch=master)](https://coveralls.io/github/carlobeltrame/hal-json-normalizer?branch=master)

# Description

hal-json-normalizer helps [HAL JSON](https://tools.ietf.org/html/draft-kelly-json-hal-08) and [Vuex](https://vuex.vuejs.org/) work together.
Unlike [normalizr](https://github.com/paularmstrong/normalizr) hal-json-normalizer supports HAL+JSON specification, which means that you don't have to care about schemas. It also converts collections into maps, which is a lot more suitable for Vuex.

# Install

```shell
$ npm install hal-json-normalizer
```

# Example

```JavaScript
import normalize from 'hal-json-normalizer';

const json = {
  "id": "2620",
  "text": "I am great!",
  "_embedded": {
    "question": {
      "id": "295",
      "text": "How are you?",
      "_links": {
        "self": {
          "href": "https://my.api.com/questions/295"
        }
      }
    }
  },
  "_links": {
    "self": {
      "href": "https://my.api.com/answers/2620"
    },
    "author": {
      "href": "https://my.api.com/users/1024"
    }
  }
};

console.log(normalize(json));
/* Output:
{
  "https://my.api.com/questions/295": {
    id: 295,
    text: "How are you?"
  },
  "https://my.api.com/answers/2620": {
    id: 2620,
    text: "I am great!"
    question: {
      href: "https://my.api.com/questions/295"
    },
    author: {
      href: "https://my.api.com/users/1024"
    }
  }
}
*/
```

# Options

## Camelize Keys

By default all object keys are converted to camel case, however, you can disable this with `camelizeKeys` option.

```JavaScript
const json = {
  "camel-me": 1,
  "_links": {
    "self": {
      "href": "https://my.api.com/someEntity/1"
    }
  }
}

console.log(normalize(json));
/* Output:
{
  "https://my.api.com/someEntity/1": {
    camelMe: 1
  }
}
*/

console.log(normalize(json, { camelizeKeys: false }));
/* Output:
{
  "https://my.api.com/someEntity/1": {
    "camel-me": 1
  }
}
*/
```
