# 📦 BuiltByBit Release Action

Automatically publish a new version to BuiltByBit using a file from your workflow.

Works with:

* ✅ GitHub release assets (ZIP)
* ✅ Self-built files (ZIP/JAR/etc.)

---

## Features

* Upload any file via `file`
* Optional update post (changelog)
* No external dependencies (`jq`, `gh`, etc.)
* Simple and predictable

---

## Inputs

| Name          | Required | Description                     |
| ------------- | -------- | ------------------------------- |
| `api_token`   | ✅        | BuiltByBit API token            |
| `resource_id` | ✅        | Your resource ID                |
| `version`     | ✅        | Version name (e.g. `1.0.0`)     |
| `file`        | ✅        | Path to file to upload          |
| `api_url`     | ❌        | API endpoint (default provided) |
| `post_update` | ❌        | Post update (`true` / `false`)  |
| `title`       | ❌        | Update title                    |
| `message`     | ❌        | Update message / changelog      |

---

## Example 1 - Use GitHub Release ZIP

This downloads the ZIP attached to your release and uploads it.

```yaml
name: Publish to BuiltByBit

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest

    steps:
      - name: Download release asset
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          mkdir -p ./release
          gh release download "${{ github.event.release.tag_name }}" \
            --repo "${{ github.repository }}" \
            --pattern "*.zip" \
            --dir ./release

      - name: Get file path
        id: file
        run: echo "path=$(ls ./release/*.zip)" >> $GITHUB_OUTPUT

      - name: Upload to BuiltByBit
        uses: corwindev/builtbybit-release-action@v1
        with:
          api_token: ${{ secrets.BBB_API_TOKEN }}
          resource_id: 12345
          version: ${{ github.event.release.tag_name }}
          file: ${{ steps.file.outputs.path }}
          post_update: true
          title: ${{ github.event.release.name }}
          message: ${{ github.event.release.body }}
```

---

## Example 2 - Upload Self-Built ZIP

If you build your project in the workflow:

```yaml
name: Build & Publish

on:
  push:
    tags:
      - "v*"

jobs:
  publish:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Build project
        run: |
          mkdir build
          echo "example file" > build/file.txt
          zip -r release.zip build/

      - name: Upload to BuiltByBit
        uses: corwindev/builtbybit-release-action@v1
        with:
          api_token: ${{ secrets.BBB_API_TOKEN }}
          resource_id: 12345
          version: ${{ github.ref_name }}
          file: "./release.zip"
          post_update: true
          title: "New Release"
          message: "Automated build from CI"
```

---

## Minimal Example

```yaml
- uses: corwindev/builtbybit-release-action@v1
  with:
    api_token: ${{ secrets.BBB_API_TOKEN }}
    resource_id: 12345
    version: "1.0.0"
    file: "./release.zip"
```

---

## Setup

1. Get your BuiltByBit API token (https://builtbybit.com/resources/dashboard/api)
2. Add it to GitHub Secrets

