# lifelearn-portal

> Ejected React.js project

Currently called Social Portal, web client to the LifeLearn GraphQL API.

This is still work in progress and it is considered demo.
This web apps can be served by nginx by serve the build version as SPA (Single Page Application) website.
Further development can extend this project to implement isomorphic react application which enabled server side rendering served by express and bundling the client version using React SPA.
Keep this in mind while developing.

The goal is to keep the server component of this service stateless.
Meaning it does not have its own database.

# Environment Variables.
You need to create first file `.env` or `.env.production` (if you want different development/production environment vars) on the root project folder. List of currently used variables are available on `/settings.txt`

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm start

# build for production and launch server
$ npm run build

For production deployment, you need to run `npm run build` and upload only the `/build` folder contents, or simply pointing the domain root folder into the build path directory.

For detailed explanation on how things work, checkout the [React.js docs](https://reactjs.org/).
```


## Translations
### Adding new strings
* `AREA` is the file/area where the translation is added
* `STRING` is the string identifier (should describe in camelCase what the string means)
* add localization to `locales/dev/[AREA].json`
  * add `"[STRING]": "[English text version here]"`
* `npm run createTranslation`
* Run `tx push -s` to push all strings and english translations to Transifex
* Notify people you added new strings that need translating

### Pulling translations from transifex
* Update translations (run `./update_translations.sh`) and `git push`.