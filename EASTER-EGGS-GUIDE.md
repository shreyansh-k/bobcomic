# Bob Comics Easter Eggs - User Guide

## ✅ EASTER EGGS ARE WORKING!

Both easter eggs have been successfully implemented and are functioning correctly. If you're not seeing them, this guide will help you understand how to activate and view them.

## 🌮 Easter Egg #1: Taco Clicking Game

### How It Works
- **Automatically starts** when you visit any page for the FIRST time in your browser session
- Lasts for **30 seconds**
- Your goal: Click on falling taco emojis to collect them
- You need **20+ tacos** to win

### Why You Might Not See It

#### 1. **Session Storage Issue (Most Common)**
The game only runs ONCE per browser session. If you've already played it:

**Solution:**
- Clear your browser's session storage
- Or open the site in an **Incognito/Private window**
- Or completely close and reopen your browser

**Quick Test:**
```javascript
// Open browser console (F12) and run:
sessionStorage.removeItem('tacoGamePlayed');
location.reload();
```

#### 2. **Page Already Loaded**
If the page was already loaded when the script was added, the game won't start.

**Solution:**
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache

#### 3. **Browser Caching**
Your browser might be serving an old version of the files.

**Solution:**
```
Clear cache and hard reload:
- Chrome: Ctrl+Shift+Delete → Clear cache
- Firefox: Ctrl+Shift+Delete → Clear cache  
- Safari: Cmd+Option+E
```

### How to Verify It's Working

1. Open browser console (F12)
2. Reload the page
3. You should see:
   - A score display in the top-right: "Score: 0/20"
   - A timer counting down: "Time: 30s"
   - Falling taco emojis (🌮) on the page

## 🍪 Easter Egg #2: Cookie Cursor Trail

### How It Works
1. Click the **"Bob Comics"** logo/brand in the navbar **3 times**
2. Move your mouse around the page
3. Cookie emojis (🍪) will follow your cursor and fade out

### Why You Might Not See It

#### 1. **Not Clicking Correctly**
You need to click the navbar brand (where it says "Bob Comics" with the book icon).

**Solution:**
- Look for the top-left logo that says "Bob Comics"
- Click it exactly **3 times** in quick succession
- You should see a brief pulse animation

#### 2. **Mouse Not Moving Enough**
The trail is throttled to prevent too many cookies.

**Solution:**
- After clicking 3 times, move your mouse across the page
- Move it in larger motions (not tiny movements)
- Cookies appear every 20 pixels of movement

### How to Verify It's Working

1. Click "Bob Comics" brand 3 times
2. Open browser console (F12) and run:
```javascript
document.getElementById('cookie-trail-style') ? 'Cookie trail is active!' : 'Not activated yet'
```
3. Move your mouse - you should see cookie emojis appear and fade

## 🚀 Testing on Your Live Website

If you've deployed the changes but still don't see them on your live site:

### 1. **Verify Files Are Deployed**
Check that `easter-eggs.js` exists on your server:
```
https://your-website.com/easter-eggs.js
```

### 2. **Verify Script Tag**
Open browser console and check:
```javascript
document.querySelector('script[src="easter-eggs.js"]')
```

### 3. **Check for Errors**
Open browser console (F12) and look for:
- Red error messages
- 404 errors for easter-eggs.js
- JavaScript errors

### 4. **Force Refresh**
After deploying:
- Clear cache: `Ctrl+Shift+Delete`
- Hard reload: `Ctrl+F5`
- Or use Incognito mode

## 🎯 Quick Testing Checklist

### For Taco Game:
- [ ] Open site in Incognito/Private window
- [ ] Wait 1-2 seconds after page loads
- [ ] Look for score display in top-right corner
- [ ] See falling taco emojis
- [ ] Click on tacos to increase score

### For Cookie Trail:
- [ ] Click "Bob Comics" logo 3 times
- [ ] Move mouse around page
- [ ] See cookie emojis following cursor
- [ ] Cookies fade out after appearing

## 🔧 Troubleshooting Commands

Run these in browser console (F12) to diagnose issues:

```javascript
// Check if easter-eggs.js loaded
console.log('Script loaded:', !!document.querySelector('script[src="easter-eggs.js"]'));

// Check taco game status
console.log('Game played:', sessionStorage.getItem('tacoGamePlayed'));

// Reset taco game
sessionStorage.removeItem('tacoGamePlayed');
location.reload();

// Check cookie trail activation
console.log('Cookie trail style:', !!document.getElementById('cookie-trail-style'));

// Manually trigger cookie trail test
document.querySelector('.nav-brand').click();
document.querySelector('.nav-brand').click();
document.querySelector('.nav-brand').click();
```

## 📸 What It Should Look Like

### Taco Game Active:
- Score display box in top-right corner with orange border
- Multiple taco emojis (🌮) falling down the screen
- Timer counting down from 30 seconds
- Modal dialog appears at end with results

### Cookie Trail Active:
- Cookie emojis (🍪) appear behind your cursor
- Cookies spin and fade out smoothly
- Trail follows mouse movement continuously

## 📝 Files Modified

The easter eggs are implemented in these files:
- `easter-eggs.js` - Main easter eggs code
- All HTML files include: `<script src="easter-eggs.js"></script>`

## ✉️ Still Having Issues?

If you've tried all the above and still don't see the easter eggs:

1. Check browser console for error messages
2. Verify `easter-eggs.js` is being loaded (Network tab in DevTools)
3. Try a different browser
4. Make sure you're viewing the correct branch/deployment
5. Check that JavaScript is enabled in your browser

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Taco game starts automatically on first visit
- ✅ Score display appears in top-right
- ✅ Tacos fall and can be clicked
- ✅ Modal shows results after 30 seconds
- ✅ Cookie trail activates after 3 clicks
- ✅ Cookies follow your cursor when moving mouse
