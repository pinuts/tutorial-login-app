See [Using the Login App](https://pinutswiki.atlassian.net/wiki/x/cgAXw) on this topic.

## Quick start
Copy your development license file to `um/env/devel/cmsbs-conf`:
```bash
cp cmsbs.license um/env/devel/cmsbs-conf/
```

Install and run Universal Messenger:
```bash
cd um && gradle setup run
```

Login: http://localhost:8080/cmsbs (`admin` / `admin`)

Deploy Web App in a second console:
```bash
cd my-app
yarn
yarn dev
```
