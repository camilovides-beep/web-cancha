/** COMFASUCRE · Tailwind preset (Manual de Marca 2025)
 *  tailwind.config.js:  module.exports = { presets: [require('./brand/comfasucre.preset')], ... }
 *  Cargar Poppins desde Google Fonts en index.html.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#19559B', 50: '#F0F4FA', 100: '#DCE6F3', 300: '#6F93C2', 500: '#19559B', 700: '#14447C', 900: '#0F3461' },
        sky:   { DEFAULT: '#1FB5E5', 50: '#EDF9FE', 100: '#D6F1FB', 300: '#7AD3F0', 500: '#1FB5E5', 700: '#1690B8' },
        brandgreen: { DEFAULT: '#94BD1F', 50: '#F7FAEB', 100: '#EDF4D4', 300: '#BBD56F', 500: '#94BD1F', 700: '#789A19' },
        primary: '#19559B',
        secondary: '#1FB5E5',
        accent: '#94BD1F',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      borderRadius: { brand: '1rem', 'brand-lg': '1.5rem' },
      boxShadow: {
        brand: '0 4px 12px rgba(15, 52, 97, .10)',
        'brand-lg': '0 12px 32px rgba(15, 52, 97, .16)',
      },
      backgroundImage: {
        'cs-gradient': 'linear-gradient(90deg, #19559B 0%, #1FB5E5 40%, #1FB5E5 70%, #94BD1F 100%)',
        'cs-gradient-diagonal': 'linear-gradient(135deg, #19559B 0%, #1FB5E5 45%, #94BD1F 100%)',
        'cs-gradient-blue': 'linear-gradient(135deg, #19559B 0%, #1FB5E5 100%)',
      },
    },
  },
};
