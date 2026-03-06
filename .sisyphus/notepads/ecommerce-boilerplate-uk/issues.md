# Issues — ecommerce-boilerplate-uk

## [2026-03-06] Ongoing Issues

### Windows Shell Issue
- `export CI=true...` prefix causes commands to fail in Windows cmd
- WORKAROUND: Use `false || ACTUAL_COMMAND` pattern after the export prefix
- Status: RESOLVED with workaround
