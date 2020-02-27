import camelCase from 'lodash/camelCase';
import isArray from 'lodash/isArray';
import cloneDeep from 'lodash/cloneDeep';
import keys from 'lodash/keys';
import merge from 'lodash/merge';

/* eslint no-underscore-dangle: ["error", { "allow": ["_links", "_embedded"] }] */

function normalizeLink(link, normalizeUri) {
  if (!link || !link.href) return link;
  return { ...link, href: normalizeUri(link.href) };
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
  return value && value._links && value._links.self && (value._links.self.href != null);
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
  return normalizeLink(cloneDeep(((embed || {})._links || {}).self) || null, opts.normalizeUri);
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
  const { camelizeKeys, normalizeUri } = opts;
  const ret = { [uri]: {} };

  keys(json._links).forEach((key) => {
    if (key === 'self') return;
    if (camelizeKeys) {
      ret[uri][camelCase(key)] = normalizeLink(cloneDeep(json._links[key]), normalizeUri);
    } else {
      ret[uri][key] = normalizeLink(cloneDeep(json._links[key]), normalizeUri);
    }
  });

  return ret;
}

function mergeEmbeddedStandaloneCollections(embedded, links, opts) {
  const result = {};
  merge(result, links);
  merge(result, embedded);

  keys(embedded).forEach((uri) => {
    keys(embedded[uri]).forEach((rel) => {
      if (uri in links && rel in links[uri]) {
        result[uri][rel] = links[uri][rel];
        result[links[uri][rel].href] = {
          [opts.embeddedStandaloneListKey]: embedded[uri][rel],
          [opts.metaKey]: { self: links[uri][rel].href },
        };
      }
    });
  });

  return result;
}

extractResource = (json, opts) => {
  const { camelizeKeys, normalizeUri, metaKey } = opts;

  if (!isResource(json)) {
    return json;
  }

  const uri = normalizeUri(json._links.self.href);
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

  const embedded = extractAllEmbedded(json, uri, opts);
  const links = extractAllLinks(json, uri, opts);

  if (opts.embeddedStandaloneListKey) {
    merge(ret, mergeEmbeddedStandaloneCollections(embedded, links, opts));
  } else {
    merge(ret, extractAllLinks(json, uri, opts));
    merge(ret, extractAllEmbedded(json, uri, opts));
  }

  ret[uri][metaKey] = ret[uri][metaKey] || {};
  ret[uri][metaKey].self = uri;

  return ret;
};

export default function normalize(json, opts = {}) {
  const optsWithDefaults = {
    camelizeKeys: true,
    normalizeUri: (uri) => uri,
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
