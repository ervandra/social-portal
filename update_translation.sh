#!/bin/bash

echo "Updating translations..."
tx pull --all --force
npm run createTranslation
echo "Translations updated"
git add src/locales/. src/translation.json
git commit -m "Updated translations"
echo "Commit made with 'Updated translations', rememeber to push to repository"