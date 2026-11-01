# Figma Style Guide Reference

Source: Travellioo - Travel Companions Apps UI KIT

## Figma nodes

- Style Guide page: `4:2`
- Typography: `464:6185`
- Color Style: `441:6111`

## Typography

The Typography section documents Inter and Inter Display font families, heading styles, display styles, body styles, weights, font sizes, line heights, and letter spacing.

Observed examples from the Figma document:

- Display 1: 64px, Semi Bold, 100% line height, 0% letter spacing.
- Heading 1: 24px, Semi Bold, 124% line height.

Use the Figma nodes above as the source of truth for the complete scale. Do not hard-code new values before checking the relevant node in Figma.

## Color

The Color Style section is stored in node `441:6111`. Use it as the source of truth for semantic colors, fills, borders, text colors, and states.

## Implementation note

This file is a reference map, not final CSS. During implementation, convert the Figma values into reusable CSS variables or a token layer for the React application.