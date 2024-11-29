- get list of all 3rd party libraries from package.json (starting from root and including nested folders, but NOT node_modules)
- get docs for all 3rd party libraries
    - maybe we can do a google search for "docs for [library name]" and get the first result url as a starting point
    - then we can use playwright to scrape the documentation

- lets make sure we don't have any duplicate packages / urls
- lets make sure we don't refetch the same docs too ofter (maybe can check once a month if something has changed)
- we can have a postinstall script to check if we need to update the docs
- lets have some configuration to exclude certain packages from being fetched