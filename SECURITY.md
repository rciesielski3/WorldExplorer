# Security Guidelines

## API Keys Management

### CRITICAL: Never commit API keys to version control

All API keys and secrets must be stored in `.env` files that are:
1. **Listed in .gitignore** - Prevents accidental commits
2. **Never shared** - Keep local only
3. **Rotated regularly** - Especially if exposed

### Environment Variables Setup

This project requires the following environment variables to run:

#### 1. Create `.env` file locally (not in git)
```bash
cp .env.example .env
```

#### 2. Add your API keys to `.env`
Each section has specific instructions for generating keys:

**Google Maps API:**
- Visit: https://console.cloud.google.com/
- Create a project and enable Maps SDK
- Generate an API key in credentials
- Restrict it to Android/iOS apps with your app packages

**Firebase Configuration:**
- Visit: https://console.firebase.google.com/
- Create a new project
- Add Android and iOS apps
- Download/copy configuration values

**AdMob:**
- Visit: https://admob.google.com/
- Link your AdSense account
- Create app and ad units
- Copy the IDs

**RevenueCat (Premium Features):**
- Visit: https://www.revenuecat.com/
- Create project for your app
- Generate API keys for Android and iOS
- Configure entitlements

#### 3. Verify .env is in .gitignore
Check `.gitignore` contains:
```
.env
.env.*
!.env.example
```

### Environment Variable References in Code

The app uses environment variables in the following places:

1. **App.tsx**: AdMob initialization (indirectly through app.json)
2. **context/PremiumContext.js**: RevenueCat API keys
3. **react-native-maps**: Google Maps API (via native configuration)
4. **Firebase initialization**: Project credentials

### Code Examples

Correct way to use environment variables:
```typescript
// GOOD: Use environment variables
const API_KEY = process.env.REACT_APP_MY_API_KEY || '';
if (!API_KEY) {
  console.warn('API key not configured');
}

// BAD: Never hardcode
const API_KEY = 'AIzaSyBszkaLmegtG6WUAc8FNgx4CuOFlmMGsc8'; // NEVER DO THIS
```

### What to do if API Keys are Exposed

1. **Immediately rotate the keys** in their respective consoles
2. **Check git history** for any commits containing keys
   ```bash
   git log --all --full-history -p | grep -i "api_key\|secret" 
   ```
3. **Clean git history** if keys were committed using:
   ```bash
   git filter-branch --tree-filter 'rm -f .env' --prune-empty HEAD
   git push origin --force-with-lease
   ```
4. **Update CI/CD secrets** in GitHub Actions, deployment platforms, etc.
5. **Audit access logs** to check if keys were used maliciously

### Production Deployment

For production releases:

1. Use platform-specific secret management:
   - **iOS**: Use App-Specific environment variables through build tools
   - **Android**: Use secure storage or environment variables in build system
   - **Web**: Never expose secrets; use backend API instead

2. Implement runtime checks:
   ```typescript
   if (!REQUIRED_API_KEYS) {
     throw new Error('Required API keys not configured');
   }
   ```

3. Monitor API usage:
   - Set up billing alerts
   - Enable API quotas/rate limiting
   - Monitor for unusual activity

### References

- [12 Factor App - Config](https://12factor.net/config)
- [OWASP - Secrets Management](https://owasp.org/www-project-devsecops-guideline/)
- [GitHub - Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
