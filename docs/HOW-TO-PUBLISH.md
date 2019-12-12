### Run linter
```bash
npm run lint
```

### Run tests
```bash
npm run test
```

### Publish to npm
```bash
npx np
```

### Publish to npm without having npm installed (using Docker)
> Note: This does not work as easily on Mac, because the SSH agent socket cannot be forwarded there.
```bash
# Only necessary the first time (copy user name and email to repo-specific git config):
git config user.name "$(git config user.name)" && git config user.email "$(git config user.email)"

# For publishing a new version:
git pull  # make sure the SSH private key is unlocked
d node bash
npm login # use spam email address
npx np
```
