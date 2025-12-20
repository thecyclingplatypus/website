# The Cycling Platypus - Website Management Guide

This document explains how to manage your website's media assets using Cloudinary and how to use the new dynamic systems we've implemented for performance and ease of use.

---

## 🚀 Performance Optimization Highlights

1.  **Cloudinary Integration:** Replaced heavy local assets with Cloudinary URLs using `f_auto,q_auto`. This automatically serves the best format (WebP/AVIF) and quality for each user's browser.
2.  **GPU Acceleration:** Added `will-change: transform` to thumbnails and sliders to ensure smooth scrolling and hover effects.
3.  **Smart Preloading:** Images that are not yet on screen are quietly downloaded in the background *after* the initial page load, making navigation feel instant.
4.  **Intersection Observers:** Replaced expensive scroll events with modern observers to handle animations and banner visibility efficiently.

---

## 🎞️ How to Use Cloudinary URLs

When you upload an image or video to Cloudinary, you get a URL like this:
`https://res.cloudinary.com/dw5fixnr1/image/upload/v12345678/my_photo.jpg`

### Manual Optimization
To make it load fast, you should always ensure `f_auto,q_auto` is in the URL:
`https://res.cloudinary.com/dw5fixnr1/image/upload/f_auto,q_auto/v12345678/my_photo.jpg`

*Note: The system I built for your galleries will try to add these automatically if they are missing!*

---

## 📸 Adding Images to Photography Pages

The photography pages (like `photo-artists.html`) now use a **Dynamic Gallery System**. No more writing long blocks of HTML for every image.

1.  Open the HTML file (e.g., `photo-artists.html`).
2.  Scroll to the bottom to find the `galleryImages` list.
3.  Add a new line for your image:

```javascript
const galleryImages = [
    { 
        full: 'YOUR_CLOUDINARY_URL_HERE', 
        name: 'The Display Name' 
    },
    // ... add more entries here
];
```

**What happens next?**
- The site automatically creates the thumbnail.
- It resizes the thumbnail to 800px wide for speed.
- It adds a fade-in animation as the user scrolls.
- It sets up the "Click to Enlarge" lightbox.

---

## 🎬 Adding Stills to the Video Page

Each video can have its own "Behind the Scenes" or "High-Res Stills" section at the bottom of `video.html`.

1.  Open `video.html`.
2.  Scroll to the `videoStillsConfig` section at the bottom.
3.  Map a YouTube Video ID to a list of image URLs:

```javascript
const videoStillsConfig = {
    'YOUTUBE_ID_HERE': [
        'IMAGE_URL_1',
        'IMAGE_URL_2'
    ],
    'default': [
        'FALLBACK_IMAGE_URL'
    ]
};
```

---

## 💡 Pro Tips for Future Updates

-   **Video Posters:** For the main showreel, use a "poster" image from Cloudinary so the site looks loaded even before the video starts.
-   **YouTube Thumbnails:** Use `hqdefault.jpg` instead of `maxresdefault.jpg` for thumbnails on the homepage grid to keep the page light.
-   **New Pages:** To create a new photography category, simply copy `photo-artists.html`, rename it, and change the `galleryImages` list at the bottom!

---

## ⚡ Automated Caching (Service Worker)

We have added a **Service Worker** (`sw.js`) that automatically manages local storage for your visitors.

- **Images & Media:** Uses a "Cache First" approach. The first time a user sees an image, it's saved. On the next visit, it loads instantly from their device.
- **Site Logic (JS/CSS):** Uses "Stale-While-Revalidate". The site loads the saved version immediately, while silently checking for updates in the background.

### How to Force an Update (Cache Bursting)
If you make a major change and want to ensure everyone sees it immediately:
1.  Open `sw.js`.
2.  Change the `CACHE_NAME` at the top (e.g., from `v1` to `v2`).
3.  The next time users visit, their browser will detect the change and refresh the cache.

---

*Happy Coding!*
