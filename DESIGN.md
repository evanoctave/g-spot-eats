# Design System

## Overview

GSpot Eats is a light, high-contrast mobile product for quick use while walking into a busy dining hall. The design is restrained and utilitarian with a distinctive citrus-orange action color and deep evergreen confirmation color. Information is flat and scan-friendly; dividers and spacing do more work than decorative containers.

## Color Palette

- Canvas: `#F6F7F4`
- Surface: `#FFFFFF`
- Ink: `#18201C`
- Muted ink: `#536158`
- Divider: `#D8DED9`
- Primary/action: `#C95718`
- Primary pressed: `#A84312`
- Confirmation: `#176B4A`
- Confirmation surface: `#E3F2EA`
- Warning: `#805500`
- Warning surface: `#FFF0C7`
- Danger: `#A23131`

All combinations used for text meet WCAG AA contrast. Status is always communicated with text as well as color.

## Typography

Use the platform system sans-serif throughout. Screen titles are 30/36 semibold, section titles 20/25 semibold, body 16/23 regular, labels 14/19 medium, and supporting metadata 13/18 regular. Avoid display fonts, extreme tracking, and fluid type.

## Layout

- 20-point horizontal screen gutter.
- 8-point base spacing with 12, 16, 24, and 32 point rhythm steps.
- Full-width list rows separated by dividers; cards only for meaningful grouped state such as the active plate.
- Interactive targets are at least 44 points high.
- Content remains usable at narrow phone widths and with enlarged text.

## Components

- Goal chips: pill controls with explicit selected state.
- Meal period tabs: compact segmented controls with text labels.
- Food row: name, station/serving metadata, macro summary, and one clear action.
- Freshness banner: semantic status surface with source and retrieval time.
- Plate summary: grouped selection with adjustable whole-source servings and one log action.
- Empty/error state: plain explanation plus a relevant recovery action.

## Motion

Use only short 150–200ms state transitions supplied by native controls. Do not orchestrate page-load animation. Respect reduced-motion settings automatically by avoiding decorative animation.
