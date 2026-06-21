# SignPath Foundation — free code signing for PRISM (open source)

PRISM desktop is eligible for [SignPath Foundation](https://signpath.org/) free code signing because the app shell is open source on GitHub.

## 1. Apply for SignPath Foundation

1. Go to https://signpath.org/ and click **Apply**
2. Link your GitHub repo: `ProfessionalQwerty/ProjectRuby`
3. Describe the project: open-source Electron desktop shell (`prism-app/`)
4. Wait for approval (SignPath verifies builds come from your repo)

## 2. Configure SignPath project

After approval, in the SignPath portal:

1. Install the [SignPath GitHub App](https://docs.signpath.io/trusted-build-systems/github) on `ProfessionalQwerty/ProjectRuby`
2. Create a signing policy (e.g. `release-signing`) for tag builds
3. Upload a sample `PRISM-Setup-x64.exe` from a release and create artifact configuration (e.g. slug `exe-installer` for a single `.exe`)
4. Create an API token with **submitter** permission on the project

## 3. Add GitHub secrets

In **ProjectRuby → Settings → Secrets → Actions**, add:

| Secret | Value |
|--------|--------|
| `SIGNPATH_API_TOKEN` | API token from SignPath |
| `SIGNPATH_ORGANIZATION_ID` | Organization UUID from SignPath |
| `SIGNPATH_PROJECT_SLUG` | e.g. `projectruby` |
| `SIGNPATH_SIGNING_POLICY_SLUG` | e.g. `release-signing` |
| `SIGNPATH_ARTIFACT_CONFIG_SLUG` | e.g. `exe-installer` |

## 4. How CI works

[`.github/workflows/release.yml`](.github/workflows/release.yml):

- Builds unsigned Windows installer as today
- If `SIGNPATH_API_TOKEN` is set → uploads `.exe` to GitHub Actions artifacts → submits to SignPath → replaces release asset with **signed** `.exe`
- If secrets are missing → ships unsigned (npm install path still works)

Re-tag to sign an existing release:

```powershell
git tag -d v0.1.2
git push origin :refs/tags/v0.1.2
git tag v0.1.2
git push origin v0.1.2
```

## Notes

- SignPath signs the **NSIS installer** (`.exe`), not the zip used by `npx github:...`
- Signed installers reduce SmartScreen warnings; reputation still builds over time
- Mac notarization is separate (Apple Developer Program, $99/yr)
