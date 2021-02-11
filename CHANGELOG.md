### Unreleased

### v 4.0.1 (11 Feb 2021)
- Update all dependencies to their latest versions.

### v 4.0.0 (10 Jan 2021)
- **Breaking**: Drop support for Node.js versions earlier than 10.13.
- Update all dependencies to their latest major versions.

### v 3.0.5 (10 Jan 2021)
- Update all dependencies to the latest versions. This is the last release before dropping support for node v8.

### v 3.0.3 (09 Dec 2020)
- Handle embedded `null` values [#6](https://github.com/carlobeltrame/hal-json-normalizer/pull/6) (thanks to @westende)

### v 3.0.1 (31 Mar 2020)
- Document the support for templated links according to the HAL JSON specification
- Do not normalize templated links (thanks to @pmattmann)

### v 3.0.0 (27 Feb 2020)
- When a relation name is present in both embedded and links, embedded will take precedence, because it may contain more information.
- Remove embeddedListName option again because it is currently unused, incomplete and creates many corner cases
- Add embeddedStandaloneListKey option to enable embedded collections to have a self link

### v 2.1.2 (30 Jan 2020)
- Fix standalone lists when embeddedListName is set

### v 2.1.0 (30 Jan 2020)
- Add embeddedListName option

### v 2.0.0 (12 Dec 2019)
- Update dependencies to the latest versions to fix security issues

### v 1.0.3 (29 Oct 2019)
- Clean up NPM package so it only includes the minimal files necessary

### v 1.0.2 (29 Oct 2019)
- Fix a bug that occurred when passing in an empty string as an URI

### v 1.0.0 (26 Aug 2019)
- Exchange baseUrl option for more flexible normalizeUri callback option

### v 0.0.1 (21 Aug 2019)
- Created the library by adapting https://github.com/yury-dymov/json-api-normalizer
