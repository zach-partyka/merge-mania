# Pre-GitHub Push Checklist

## ✅ Completed

- [x] **README.md created** - Comprehensive project documentation
- [x] **LICENSE added** - MIT license
- [x] **Package.json updated** - Changed name from "rest-express" to "merge-mania"
- [x] **.gitignore updated** - Added `.local/`, `.env` files
- [x] **Error boundaries** - Production-ready error handling
- [x] **Schema versioning** - Saves won't break on updates
- [x] **LocalStorage protection** - Handles quota errors gracefully
- [x] **Grid validation** - Prevents corrupted state loads
- [x] **Timeout cleanup** - No memory leaks

## 🔍 Review Before Push

### 1. Update Repository URL
**File:** `package.json:9`

Change:
```json
"url": "https://github.com/YOUR_USERNAME/merge-mania.git"
```

To your actual GitHub username.

### 2. Update README Screenshot Path
**File:** `README.md:5`

If you want a different screenshot or move images, update:
```markdown
![Game Preview](./attached_assets/IMG_3349_1765335388480.png)
```

### 3. Review Attached Assets
**Directory:** `/attached_assets/`

Consider:
- Renaming files to something more descriptive (e.g., `game-screenshot.png`)
- Compressing images for faster repo clones
- Moving to `/client/public/` if they're used in the app

### 4. Remove Personal/Test Data
```bash
# Check for any personal data
cd /Users/zachpa/Desktop/Merge-Mania
git rm --cached .local/ -r 2>/dev/null
rm -rf .local/
```

### 5. Check for Sensitive Files

Run this before first push:
```bash
# Scan for potential secrets
grep -r "password\|secret\|api_key" --include="*.ts" --include="*.tsx" --include="*.env" .

# Make sure .env files aren't tracked
git status | grep ".env"
```

If anything shows up, add to `.gitignore` and remove from git:
```bash
git rm --cached .env
```

## 🧹 Optional Cleanup (Nice to Have)

### 6. Clean Up Unused Dependencies

Your `package.json` imports **50+ shadcn/ui components**. You likely only use ~10.

**Quick audit:**
```bash
# Find which UI components are actually imported
grep -r "@/components/ui/" client/src --include="*.tsx" --include="*.ts" | \
  sed 's/.*from "\(.*\)".*/\1/' | sort -u
```

**How to remove unused:**
1. Identify unused components (any in `/client/src/components/ui/` not in grep results)
2. Delete the unused `.tsx` files
3. Run `npm run build` to verify nothing breaks

**Estimated savings:** 100-200KB in bundle size

### 7. Add .env.example (If Using Environment Variables)

If you add backend features later that need config:

```bash
# Create template
cat > .env.example << 'EOF'
# Database (optional - only if you use the server)
DATABASE_URL=postgresql://user:password@localhost:5432/mergemania

# Session secret (optional)
SESSION_SECRET=your-secret-here-change-me

# Analytics (optional)
# ANALYTICS_ID=
EOF
```

### 8. Organize Documentation Files

Consider moving internal docs to a `/docs` folder:
```bash
mkdir -p docs
mv PRODUCTION_CHECKLIST.md docs/
mv FIXES_APPLIED.md docs/
mv design_guidelines.md docs/
mv replit.md docs/ # (if you're not using Replit anymore)
```

Then update README links to point to `/docs/`.

### 9. Add GitHub-Specific Files (Optional)

**`.github/ISSUE_TEMPLATE.md`:**
```markdown
## Bug Report

**Describe the bug:**
A clear description of what the bug is.

**To Reproduce:**
Steps to reproduce the behavior.

**Expected behavior:**
What you expected to happen.

**Device (please complete):**
- Device: [e.g. iPhone 12]
- OS: [e.g. iOS 15.1]
- Browser: [e.g. Safari]
```

**`.github/PULL_REQUEST_TEMPLATE.md`:**
```markdown
## Changes
Brief description of what this PR does.

## Testing
How to test these changes.

## Checklist
- [ ] Code follows project style
- [ ] Tested on mobile device
- [ ] No console errors
```

### 10. Update Commit History (Optional)

If your git history has messy commits, consider squashing:
```bash
# Interactive rebase to clean up last N commits
git rebase -i HEAD~5
```

Or start fresh:
```bash
# Nuclear option - clean slate
rm -rf .git
git init
git add .
git commit -m "Initial commit: Merge Mania puzzle game"
```

## 📦 Final Pre-Push Commands

```bash
# 1. Stage all changes
git add .

# 2. Review what will be committed
git status

# 3. Check for large files (>1MB)
find . -type f -size +1M | grep -v node_modules | grep -v .git

# 4. Make sure build works
npm run build

# 5. Type check passes
npm run check

# 6. Commit
git commit -m "chore: production-ready release

- Add error boundaries and schema versioning
- Add localStorage quota protection
- Add comprehensive README and LICENSE
- Fix timeout cleanup and grid validation
- Update package metadata"

# 7. Create GitHub repo, then:
git remote add origin https://github.com/YOUR_USERNAME/merge-mania.git
git branch -M main
git push -u origin main
```

## 🚨 Critical Warnings

**DO NOT PUSH:**
- `.env` files with real credentials
- `node_modules/` (should be gitignored)
- Large binary files (>50MB) - use Git LFS
- Personal data or test accounts

## ✨ Post-Push Enhancements

After pushing, consider:
1. **GitHub Pages**: Deploy to `gh-pages` for free hosting
2. **GitHub Actions**: Auto-deploy on push
3. **Dependabot**: Auto-update dependencies
4. **Code coverage**: Add test coverage badges
5. **Social preview**: Add a nice image for link sharing

---

## Current File Sizes (Approximate)

```
Total repo size: ~15MB (mostly node_modules - not pushed)
Pushed size: ~500KB (without node_modules)
  - Source code: ~350KB
  - Assets: ~150KB
```

All set for GitHub! 🚀
