# GameNexus 3D

A futuristic Ultimate Game Database website with an animated Three.js/WebGL background.

## Features
- Animated 3D starfield, wireframe planet and perspective grid
- Responsive gaming UI
- Search and filters
- Game cards and details modal
- LocalStorage wishlist/library
- Game comparison
- "Can My PC Run It?" compatibility demo
- RAWG API integration
- No build step required

## Run
1. Extract the ZIP.
2. Open `index.html` in a browser.
3. For the best local-development experience, use VS Code Live Server.

## Live RAWG data
Open `app.js` and set:
```js
const API_KEY = "YOUR_RAWG_API_KEY";
```
RAWG requires an API key for API requests. See the official API documentation:
https://rawg.io/apidocs

The site includes demo data so it works even without an API key.

## Credits / attribution
When using RAWG data or images, follow RAWG's current API terms and attribution requirements:
https://rawg.io/apidocs


## Official store links
With a RAWG API key configured, View Details fetches store listings from RAWG's game stores endpoint and displays legitimate storefront links. RAWG documents this endpoint as providing links to stores that sell the game.
