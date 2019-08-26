import 'url-search-params-polyfill';

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

export default function normalizeUri(uri, baseUrl = '') {
  return sortQueryParams(uri).replace(new RegExp(`^(${baseUrl})`), '');
}
