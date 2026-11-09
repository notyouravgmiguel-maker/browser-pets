# Browser Companion Pet 🐾

A customizable virtual browser companion extension built with Chrome Manifest V3. Your pet walks across web pages, reacts to cuddles, follows your cursor, or takes cozy naps.

---

## ✨ Features

1. **The Screen Wanderer (Desktop Companion)**
   - Walks back and forth across the bottom of any active website.
   - Smooth animations, turning behaviors, and boundary handling.
   - Draggable: Pick up and place your pet anywhere on the page so it never obstructs your workflow.

2. **Interactive Cuddles & Treats**
   - Click your pet anytime to cuddle and trigger floating hearts and happiness boosts.
   - Give treats via the extension toolbar popup to boost pet happiness and show celebration emotes.

3. **Behavior Modes**
   - **🐾 Screen Wanderer**: Free-roaming walking companion.
   - **🎯 Cursor Chase**: Follows your mouse pointer around the page.
   - **💤 Nap & Relax**: Pet rests in place with gentle breathing and "zzz" bubbles.

4. **Multiple Companions**
   - Switch anytime between **Cat**, **Dog**, and **Dino** companions!

---

## 📁 Project Structure

```
browser-pets/
├── manifest.json         # Manifest V3 extension configuration
├── content.js            # Content script for pet physics, walking, dragging & reactions
├── pet.css               # Styling and CSS animations for the pet and emotes
├── pet.png               # Default companion sprite
├── popup.html            # Extension popup settings UI
├── popup.css             # Extension popup styling
├── popup.js              # Extension popup controller
├── assets/               # Pet sprites (SVG & PNG for Cat, Dog, Dino)
│   ├── cat.png
│   ├── cat.svg
│   ├── dog.png
│   ├── dog.svg
│   ├── dino.png
│   └── dino.svg
├── icons/                # Extension action icons (16px, 48px, 128px)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── tests/                # Automated unit tests
    └── pet.test.js
```

---

## 🚀 How to Install and Run

1. Clone or download this repository.
2. Open Google Chrome (or any Chromium browser like Brave, Edge, or Arc).
3. Navigate to `chrome://extensions`.
4. Turn on **Developer mode** using the toggle switch in the top-right corner.
5. Click **Load unpacked** in the top-left corner.
6. Select the repository root folder (`browser-pets`).
7. Open any webpage (e.g. `https://en.wikipedia.org`) to meet your browser pet companion!

---

## 🧪 Testing

To run the automated tests:
```bash
node tests/pet.test.js
```
