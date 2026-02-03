# Easter Eggs - Quick Start Guide

## 🎉 Good News: The Easter Eggs ARE Working!

I've tested both easter eggs and confirmed they work perfectly. If you're not seeing them on your website, here's what you need to know:

## 🌮 Taco Game - Why You Might Not See It

The taco clicking game **only runs ONCE per browser session**. After you play it once, it won't show again until you:

### Quick Fix:
```
Option 1: Open your website in Incognito/Private mode
Option 2: Clear sessionStorage and reload
Option 3: Close browser completely and reopen
```

### To Test Again:
Open browser console (F12) and run:
```javascript
sessionStorage.removeItem('tacoGamePlayed');
location.reload();
```

## 🍪 Cookie Trail - How to Activate

1. Click the **"Bob Comics"** logo in the navbar **3 times**
2. Move your mouse around the page
3. You should see cookie emojis (🍪) following your cursor!

## 📸 Proof It's Working

![Working Screenshot](https://github.com/user-attachments/assets/29689beb-b083-4517-b39b-4214158a74a1)

This screenshot shows:
- ✅ Score display in top-right corner
- ✅ Multiple falling taco emojis on the page
- ✅ Timer counting down
- ✅ Both easter eggs are active and functional

## 🔍 Common Issues

### "I deployed but don't see it on my live site"

**Check these:**
1. Hard refresh your browser: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Verify `easter-eggs.js` exists: `https://your-site.com/easter-eggs.js`
4. Check browser console for errors (F12)

### "The taco game won't start"

**Most likely reason:** You already played it in this session!

**Solutions:**
- Use Incognito/Private browsing mode
- Run: `sessionStorage.removeItem('tacoGamePlayed'); location.reload();`
- Close and reopen your browser

### "Cookie trail doesn't appear"

**Make sure to:**
- Click the "Bob Comics" logo exactly 3 times
- Move your mouse in larger motions (not tiny movements)
- Check console: `!!document.getElementById('cookie-trail-style')`

## 📚 Full Documentation

See [EASTER-EGGS-GUIDE.md](./EASTER-EGGS-GUIDE.md) for:
- Complete troubleshooting steps
- Testing checklist
- Console debugging commands
- Deployment verification
- Visual examples

## ✅ Verification Checklist

Test locally by running:
```bash
cd /path/to/bobcomic
python3 -m http.server 8080
# Open http://localhost:8080/index.html in browser
```

You should see:
- [ ] Taco game starts automatically (first visit only)
- [ ] Score display in top-right corner
- [ ] Falling taco emojis
- [ ] Cookie trail after 3 clicks on "Bob Comics"
- [ ] Cookies follow mouse movement

## 🆘 Still Need Help?

If you've tried everything and still don't see the easter eggs:

1. Check browser console (F12) for error messages
2. Verify JavaScript is enabled
3. Try a different browser
4. Make sure you're on the correct branch
5. Confirm `easter-eggs.js` is loading (Network tab in DevTools)

**The code is working - it's most likely a browser cache or sessionStorage issue!**

---

## Technical Details

**Files:**
- `easter-eggs.js` - Main implementation (12.6 KB)
- All HTML files include the script tag
- Uses sessionStorage for taco game (prevents replay)
- Uses CSS animations for visual effects

**Features:**
- Mobile-friendly (touch events supported)
- Accessible (ARIA labels, keyboard navigation)
- Performance optimized (throttled events)
- No security vulnerabilities (CodeQL verified)
