# Design System Specification: Editorial Purity

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Hydro-Architect."** It moves away from the cluttered, grid-heavy patterns typical of e-commerce and adopts an editorial, high-end architectural approach. The goal is to evoke the fluidity of water through generous whitespace and the stability of a premium institution through bold, authoritative typography.

By prioritizing **intentional asymmetry** and **tonal depth** over rigid structural lines, we create an experience that feels curated rather than generated. We replace the "boxed-in" feel with layered surfaces, allowing the user to navigate through a series of sophisticated visual planes that emphasize purity, trust, and professionalism.

---

### 2. Colors
The palette is a sophisticated study in blues and slate grays, designed to feel cool, refreshing, and official.

*   **Primary (`#024569`):** Our "Deep Sea" anchor. Used for high-emphasis actions and primary brand touchpoints.
*   **Secondary (`#505f76`):** "Slate Mist." Used for supporting elements and balancing the visual weight of the primary blue.
*   **Surface Hierarchy (`#f7f9fb` to `#ffffff`):** Our canvas. We utilize the Material surface-container tokens to create depth.

#### The "No-Line" Rule
To maintain a premium, editorial feel, **1px solid borders are strictly prohibited** for sectioning content. Boundaries must be defined exclusively through:
*   **Background Color Shifts:** Placing a `surface-container-low` (`#f2f4f6`) card on a `surface` (`#f7f9fb`) background.
*   **Tonal Transitions:** Using subtle shifts in the neutral scale to indicate where one content group ends and another begins.

#### Surface Hierarchy & Nesting
Treat the UI as physical layers. An information card (using `surface-container-lowest` / `#ffffff`) should sit on top of a section background (`surface-container-low`). This "stacking" creates a natural hierarchy that feels more organic than forced borders.

#### The "Glass & Gradient" Rule
For floating elements like navigation bars or high-priority overlays, use **Glassmorphism**. Apply a semi-transparent `surface` color with a `backdrop-blur` (12px-20px). For hero sections and primary CTAs, utilize a subtle gradient transitioning from `primary` (`#024569`) to `primary-container` (`#285d82`) at a 135-degree angle to add "soul" and depth.

---

### 3. Typography
The typography scale establishes an official, trustworthy tone. We pair **Plus Jakarta Sans** for expressive, modern English headings with **Inter** for functional body text. Arabic equivalents should mirror this: a modern, high-contrast Kufi for headlines and a clean, legible Naskh for body.

*   **Display (L/M/S):** Large, bold, and authoritative. Used for hero statements where the brand’s "official" voice is loudest.
*   **Headline (L/M/S):** High-end editorial feel. Use these to break up long-form content with significant whitespace above.
*   **Title (L/M/S):** Reserved for product names and section headers within cards.
*   **Body (L/M/S):** Optimized for clarity. Use `body-lg` for introductory paragraphs and `body-md` for standard descriptions.

The contrast between the geometric Plus Jakarta Sans and the neutral Inter creates a "professional-yet-modern" tension that defines the brand's premium status.

---

### 4. Elevation & Depth
Depth is not an afterthought; it is a structural tool. We move away from the "shadow-everything" approach in favor of **Tonal Layering**.

*   **The Layering Principle:** Place `surface-container-highest` elements underneath primary content to act as a soft "tray," then lift the active content using `surface-container-lowest`.
*   **Ambient Shadows:** If a shadow is required for a floating state (e.g., a modal or a primary floating button), it must be a "Deep Ambient Shadow":
    *   **Blur:** 24px - 40px
    *   **Opacity:** 4% - 6%
    *   **Color:** Use a tinted version of `on-surface` (`#191c1e`) rather than pure black.
*   **The "Ghost Border" Fallback:** If a layout requires a container edge for accessibility, use the `outline-variant` token (`#c2c6d4`) at **15% opacity**. This creates a "suggestion" of a line rather than a hard boundary.

---

### 5. Components

#### Buttons
*   **Primary:** Solid `primary` (`#024569`) with `on-primary` text. Use `xl` (0.75rem) roundedness. Apply a subtle 1px inner highlight (white at 10% opacity) on the top edge to give it a "pressed" premium feel.
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Tertiary:** Ghost style. No background, `primary` text.

#### Input Fields
*   **Style:** Background-filled using `surface-container`. 
*   **Interaction:** On focus, the background shifts to `surface-container-lowest` and a "Ghost Border" of 1px `primary` (at 40% opacity) appears. Avoid the heavy default focus rings.

#### Cards & Lists
*   **Constraint:** **Forbid divider lines.** 
*   **Solution:** Use the Spacing Scale (minimum 24px) to separate list items. For product grids, use a `surface-container-low` background on the card with a `0.75rem` (xl) corner radius.

#### High-End Iconography
Icons must be **bespoke, thin-stroke (1.5px)**. Avoid filled "solid" icons unless in an active/selected state. The thin strokes echo the "purity" of the water theme.

---

### 6. Do’s and Don’ts

**Do:**
*   **Do** use asymmetrical layouts where text is offset from images to create an editorial feel.
*   **Do** allow at least 64px of whitespace between major sections to let the design "breathe."
*   **Do** use `primary-fixed` (`#cbe6ff`) for subtle badges or "In Stock" indicators to keep the palette cohesive.

**Don’t:**
*   **Don't** use pure black (`#000000`) for text; always use `on-surface` (`#191c1e`) for a softer, more professional look.
*   **Don't** use standard 4px "card shadows." Use tonal shifts first.
*   **Don't** use aggressive, saturated blues. Stick to the sophisticated, slate-leaning tones provided in the palette to maintain the "official" brand tone.
*   **Don't** crowd the interface. If a screen feels "busy," remove a container background rather than adding a divider.