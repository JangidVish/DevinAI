# CSS Architecture Documentation

## Overview

The CSS has been restructured from a single monolithic file into a modular architecture for better maintainability, organization, and scalability.

## Directory Structure

```
src/
├── styles/
│   ├── base.css                    # Base styles, CSS variables, global settings
│   ├── animations.css              # All keyframe animations and animation classes
│   ├── components/                 # Component-specific styles
│   │   ├── AddUserPopUp.css
│   │   ├── ChatPanel.css
│   │   ├── CodeEditor.css
│   │   ├── FileExplorer.css
│   │   ├── FileVersionList.css
│   │   ├── SidePanel.css
│   │   ├── SyntaxHighlightedCode.css
│   │   └── VersionSelector.css
│   └── pages/                      # Page-specific styles
│       ├── forget-password.css
│       ├── home.css
│       ├── Landing.css
│       ├── login.css
│       ├── Project.css
│       ├── resetpassword.css
│       └── signup.css
├── index.css                       # Main CSS file that imports all modules
└── index.css.backup               # Backup of original monolithic CSS
```

## File Descriptions

### Core Files

- **`base.css`**: Contains root CSS variables, global styles, and Tailwind imports
- **`animations.css`**: All @keyframes definitions and animation utility classes
- **`index.css`**: Main entry point that imports all modular CSS files

### Component Files

Each component has its own CSS file for component-specific styles:

- Component files are currently placeholder files ready for future custom styles
- Most components currently use Tailwind utility classes
- As components grow, custom styles should be added to their respective CSS files

### Page Files

Each page has its own CSS file for page-specific styles:

- **`home.css`**: Contains Huly.io-inspired effects, glow buttons, code reveal effects
- **`Project.css`**: Project page header improvements
- Other page files are placeholders ready for page-specific customizations

## Key Features Preserved

- ✅ Huly.io-style glowing buttons
- ✅ Code reveal effects with hover interactions
- ✅ File explorer horizontal scroll fixes
- ✅ Ethereal particles and floating animations
- ✅ Custom scrollbar styling
- ✅ Glassmorphism effects
- ✅ All existing animations and transitions

## Benefits of New Architecture

1. **Maintainability**: Each component/page has isolated styles
2. **Scalability**: Easy to add new component styles without affecting others
3. **Organization**: Clear separation of concerns
4. **Performance**: Better caching and loading optimization
5. **Collaboration**: Multiple developers can work on different components without conflicts

## Usage Guidelines

1. **Adding Component Styles**: Add custom styles to the respective component CSS file
2. **Adding Page Styles**: Add page-specific styles to the respective page CSS file
3. **Global Styles**: Add to `base.css` for truly global styles
4. **Animations**: Add new animations to `animations.css`
5. **Import Order**: The import order in `index.css` matters - base styles first, then components

## Migration Notes

- Original CSS has been backed up as `index.css.backup`
- All existing functionality and styling is preserved
- No breaking changes to the UI
- Future development should follow the modular approach

## Future Enhancements

- Consider CSS modules or styled-components for even better component isolation
- Add CSS custom properties for theming
- Implement CSS-in-JS solutions for dynamic styling
- Add CSS linting rules for consistency
