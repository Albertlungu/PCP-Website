# Admin Password Setup

The admin area is protected with a password when accessed on Vercel (not localhost).

## Setting the Password

1. Choose your password
2. Generate SHA-256 hash using this command:
   ```bash
   echo -n "YourPasswordHere" | shasum -a 256
   ```
3. Copy the hash (first part before the dash)
4. Edit `admin/password-protection.js`
5. Replace the `ADMIN_PASSWORD_HASH` value with your hash

## Example

For password "myAdminPass123":
```bash
echo -n "myAdminPass123" | shasum -a 256
# Output: a1b2c3d4e5f6... (copy this)
```

Then in `password-protection.js`:
```javascript
const ADMIN_PASSWORD_HASH = 'a1b2c3d4e5f6...';  // Your hash here
```

## How It Works

- **Localhost**: No password required (for easy local editing)
- **Vercel**: Password prompt appears on first visit
- **Session**: Password valid for browser session only
- **Security**: Password stored as SHA-256 hash, not plain text

## Disabling Password Protection

To disable password protection entirely:
1. Remove `<script src="password-protection.js"></script>` from admin HTML files
2. Or delete `admin/password-protection.js`
