# Strategic Tech Solutions Presentation Deck

A premium, highly interactive, web-based presentation deck designed for technical business proposals and strategic roadmaps. Built entirely with pure HTML, CSS, and vanilla JavaScript, this presentation engine replaces static PowerPoint files with dynamic, data-driven infographics, smooth CSS transitions, and SVG network diagrams.

## 🌟 Key Features

- **Dynamic Data-Driven Diagrams:** Complex layouts like Radial Nodes, Capability Trees, Ecosystem Networks, and Timelines are generated automatically via JavaScript from simple HTML `data-*` attributes.
- **Premium Tech Aesthetic:** A custom dark theme featuring cinematic technical grids, cyan/violet glowing accents, glassmorphic panels, and smooth micro-interactions.
- **Progressive Animations:** Elements reveal sequentially (e.g., SVG connection paths drawing themselves before nodes appear) to guide the viewer's attention and tell a compelling story.
- **Responsive Architecture:** Custom math automatically adapts diagrams (like calculating elliptical distributions and CSS absolute centering) to maintain perfect layouts on 16:9 widescreen formats and smaller laptops.
- **No Heavy Frameworks:** Lightning-fast rendering powered exclusively by vanilla JavaScript and native CSS `@keyframes`.

## 🏗️ Slide Architecture & Layouts

The deck is divided into two major strategic sections:

1. **What We Can Do (Slides 1–16):** Showcasing capabilities, technical integrations, cybersecurity hubs, team structures, and domain expertise.
2. **From Vision to Execution (Slides 17–24):** A highly infographic business proposal detailing the execution strategy, revenue engines, prioritized roadmaps, 90-day action plans, and the final business outcome equation.

## 🚀 How to Use

1. Clone or download the repository.
2. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
3. **Navigation:** 
   - Click the on-screen arrow controls at the bottom right.
   - Use the **Up/Down** or **Left/Right** arrow keys on your keyboard.
   - The presentation will automatically trigger animations as you transition between slides.

## 🛠️ Adding New Slides

You can easily expand the presentation by adding a new `<section class="slide" data-index="X">` block to `index.html`. 

To utilize the dynamic SVG engines, apply the `data-diagram="format"` attribute to a container. Available diagram formats include:
- `captree` (Capability Tree - In-house vs Specialist split)
- `radial` (Central hub with orbital nodes)
- `timeline` (Chronological progress bars)
- `pipeline` (Stage-by-stage progression)
- `dataflow` (Data architecture maps)

*(See `assets/js/script.js` for full configuration options for each diagram format).*

## 🎨 Tech Stack

- **Structure:** HTML5
- **Styling:** Vanilla CSS3 (Custom Properties, Grid, Flexbox, Keyframe Animations)
- **Logic:** Vanilla JavaScript (ES6+)
- **Icons:** Bootstrap Icons (CDN)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Designed & Developed by Harsh*
