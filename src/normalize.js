import camelCase from 'lodash/camelCase';
import isArray from 'lodash/isArray';
import cloneDeep from 'lodash/cloneDeep';
import keys from 'lodash/keys';
import merge from 'lodash/merge';

/* eslint no-underscore-dangle: ["error", { "allow": ["_links", "_embedded"] }] */

function sortQueryParams(uri) {
  const queryStart = uri.indexOf('?');
  if (queryStart === -1) return uri;
  const prefix = uri.substring(0, queryStart);
  const query = new URLSearchParams(uri.substring(queryStart + 1));
  const modifiedQuery = new URLSearchParams();

  [...new Set(query.keys())].sort().forEach((key) => {
    query.getAll(key).forEach((value) => {
      modifiedQuery.append(key, value);
    });
  });

  if ([...modifiedQuery.keys()].length) {
    return `${prefix}?${modifiedQuery.toString()}`;
  }
  return prefix;
}

function normalizeUri(uri, baseUrl) {
  return sortQueryParams(uri).replace(new RegExp(`^(${baseUrl})`), '');
}

function normalizeLink(link, baseUrl) {
  if (!link || !link.href) return link;
  return { ...link, href: normalizeUri(link.href, baseUrl) };
}

function camelizeNestedKeys(attributeValue) {
  if (attributeValue === null || typeof attributeValue !== 'object') {
    return attributeValue;
  }

  if (isArray(attributeValue)) {
    return attributeValue.map(camelizeNestedKeys);
  }

  const copy = {};

  keys(attributeValue).forEach((key) => {
    copy[camelCase(key)] = camelizeNestedKeys(attributeValue[key]);
  });

  return copy;
}

function isResource(value) {
  return value && value._links && value._links.self && value._links.self.href;
}

function hasSingleKey(object, key) {
  const objectKeys = Object.keys(object);
  return objectKeys.length === 1 && objectKeys[0] === key;
}

function isReference(value) {
  return hasSingleKey(value, '_links') && hasSingleKey(value._links, 'self');
}

let extractResource;

function extractSingleEmbed(embed, ret, opts) {
  if (!(opts.filterReferences && isReference(embed))) {
    merge(ret, extractResource(embed, opts));
  }
  return normalizeLink(cloneDeep(((embed || {})._links || {}).self) || null, opts.baseUrl);
}

function extractEmbeds(embeds, ret, opts) {
  if (!isArray(embeds)) {
    return extractSingleEmbed(embeds, ret, opts);
  }
  return embeds.map((embed) => extractSingleEmbed(embed, ret, opts));
}

function extractAllEmbedded(json, uri, opts) {
  const { camelizeKeys } = opts;
  const ret = { [uri]: {} };

  keys(json._embedded).forEach((key) => {
    if (camelizeKeys) {
      ret[uri][camelCase(key)] = camelizeNestedKeys(
        extractEmbeds(json._embedded[key], ret, opts),
      );
    } else {
      ret[uri][key] = extractEmbeds(json._embedded[key], ret, opts);
    }
  });

  return ret;
}

function extractAllLinks(json, uri, opts) {
  const { camelizeKeys, baseUrl } = opts;
  const ret = { [uri]: {} };

  keys(json._links).forEach((key) => {
    if (key === 'self') return;
    if (camelizeKeys) {
      ret[uri][camelCase(key)] = normalizeLink(cloneDeep(json._links[key]), baseUrl);
    } else {
      ret[uri][key] = normalizeLink(cloneDeep(json._links[key]), baseUrl);
    }
  });

  return ret;
}

extractResource = (json, opts) => {
  const { camelizeKeys, baseUrl, metaKey } = opts;

  if (!isResource(json)) {
    return json;
  }

  const uri = normalizeUri(json._links.self.href, baseUrl);
  const ret = { [uri]: {} };

  keys(json).filter((key) => key !== '_embedded' && key !== '_links').forEach((key) => {
    if (camelizeKeys) {
      if (key === metaKey) {
        ret[uri][metaKey] = camelizeNestedKeys(cloneDeep(json[key]));
      } else {
        ret[uri][camelCase(key)] = camelizeNestedKeys(cloneDeep(json[key]));
      }
    } else {
      ret[uri][key] = cloneDeep(json[key]);
    }
  });

  merge(ret, extractAllEmbedded(json, uri, opts));
  merge(ret, extractAllLinks(json, uri, opts));

  ret[uri][metaKey] = ret[uri][metaKey] || {};
  ret[uri][metaKey].self = uri;

  return ret;
};

export default function normalize(json, opts = {}) {
  const optsWithDefaults = {
    camelizeKeys: true,
    baseUrl: '',
    metaKey: '_meta',
    filterReferences: false,
    ...opts,
  };

  if (optsWithDefaults.filterReferences && isReference(json)) {
    // TODO is this really the most useful way of handling this edge case?
    return {};
  }

  return extractResource(json, optsWithDefaults);
}
