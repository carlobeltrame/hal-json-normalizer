### Unreleased
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
