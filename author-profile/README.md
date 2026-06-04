# Author Profile Page — Local Usage

## Folder structure
```
author-profile/
├── index.html        ← open this in your browser
├── css/
│   └── style.css     ← all styles (design tokens, components, responsive)
├── js/
│   └── main.js       ← filter tabs, scroll animations, mobile menu
└── assets/
    └── (drop author photo here as priya-sharma.jpg)
```

## How to open locally
Double-click `index.html` — no server needed.

## Adding a real author photo
Replace the initials placeholder in `index.html`:
```html
<!-- Find this block and swap in your image -->
<div class="author-avatar" ...>
  <img src="assets/priya-sharma.jpg" alt="Priya Sharma">
</div>
```
Recommended size: **400 × 400 px**, square crop, JPEG or WebP.

## Customising
All colours live as CSS variables at the top of `css/style.css` under `:root { }`.
