# How to Run the App

## ⚠️ IMPORTANT: Use This Command

```bash
npx expo start --clear --no-dev --minify
```

## Why?

Running `npx expo start` (without flags) causes these errors:
- ❌ **Worklets version mismatch** error: `[WorkletsError: Mismatch between JavaScript part and native part of Worklets (0.7.1 vs 0.5.1)]`
- ❌ **Route detection issues**: Routes like "tournament" and "quick-choice" not found
- ❌ **Navigation breaks**: Gets "not found" screen when tapping template cards

## The Fix

Using `--clear --no-dev --minify` flags:
- ✅ Clears cache (fixes Worklets mismatch)
- ✅ Disables dev mode (avoids version conflicts)
- ✅ Minifies code (production-like build)
- ✅ Routes work correctly
- ✅ All screens navigate properly

## Quick Reference

```bash
# Navigate to project
cd flow-app

# Start the dev server (USE THIS COMMAND)
npx expo start --clear --no-dev --minify

# Scan QR code with Expo Go app on your phone
```

## Alternative (if the above doesn't work)

If you still get errors, try:
```bash
# Stop any running Metro bundler
# Then run:
npx expo start --clear --tunnel
```

## Troubleshooting

If you see route errors again:
1. Stop the server (Ctrl+C)
2. Clear cache: `npx expo start --clear`
3. Or delete: `rm -rf .expo node_modules/.cache`
4. Restart with the command above

## Notes

- **Don't use** `npx expo start` alone
- **Always use** the flags: `--clear --no-dev --minify`
- This avoids React Native Reanimated version conflicts
- Saves this setup for future reference
