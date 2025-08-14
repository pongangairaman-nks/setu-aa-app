# Fonts Directory

This directory contains custom fonts used in the Setu AA Mobile App.

## Structure

- `Inter/` - Inter font family
- `Roboto/` - Roboto font family
- `SF-Pro/` - SF Pro font family (iOS)

## Usage

Configure fonts in your app:

```typescript
// In app.json
{
  "expo": {
    "fonts": [
      {
        "asset": "./src/assets/fonts/Inter/Inter-Regular.ttf",
        "family": "Inter"
      }
    ]
  }
}
```

## Guidelines

- Use system fonts when possible for better performance
- Include font weights: Regular, Medium, Bold
- Optimize font files for mobile
- Test font rendering on different devices 