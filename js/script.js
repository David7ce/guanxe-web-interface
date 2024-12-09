document.addEventListener("DOMContentLoaded", () => {
  // Detect system theme preference
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Icons for theme
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");

  // Icons for contrast
  const highContrastIcon = document.getElementById("high-contrast-icon");
  const lowContrastIcon = document.getElementById("low-contrast-icon");

  // Font size buttons
  const increaseBtn = document.getElementById("increase-font-size");
  const decreaseBtn = document.getElementById("decrease-font-size");
  const resetBtn = document.getElementById("reset-font-size");

  // Root element
  const root = document.documentElement;

  // Font size configuration
  const defaultSize = parseFloat(getComputedStyle(root).getPropertyValue("--font-size-base")) || 1; // Default 1rem
  const scale = parseFloat(getComputedStyle(root).getPropertyValue("--font-size-step")) || 0.1; // Default 0.1rem
  let actualSize = parseFloat(localStorage.getItem('fontSize')) || defaultSize;
  const minSize = defaultSize - 3 * scale;
  const maxSize = defaultSize + 3 * scale;

  /**
   * Update font size
   * @param {number} newSize - New font size in rem
   */
  function updateSize(newSize) {
    actualSize = newSize;
    root.style.fontSize = `${actualSize}rem`;
    localStorage.setItem('fontSize', actualSize);
  }

  // Event listeners for font size buttons
  resetBtn.addEventListener("click", () => updateSize(defaultSize));
  increaseBtn.addEventListener("click", () => {
    if (actualSize < maxSize) updateSize(actualSize + scale);
  });
  decreaseBtn.addEventListener("click", () => {
    if (actualSize > minSize) updateSize(actualSize - scale);
  });

  /**
   * Apply a specific theme
   * @param {string} theme - Theme class name ('palette-light' or 'palette-dark')
   */
  function applyTheme(theme) {
    document.body.classList.remove("palette-light", "palette-dark");
    document.body.classList.add(theme);

    // Save theme to localStorage
    localStorage.setItem('theme', theme);

    // Toggle icons visibility
    sunIcon.style.display = theme === "palette-light" ? "block" : "none";
    moonIcon.style.display = theme === "palette-dark" ? "block" : "none";
  }

  /**
   * Apply contrast mode
   * @param {string} contrast - Contrast class name ('palette-light-contrast' or 'palette-dark-contrast')
   */
  function applyContrast(contrast) {
    const contrastClasses = ["palette-light-contrast", "palette-dark-contrast"];

    // Remove current contrast classes
    contrastClasses.forEach(cls => document.body.classList.remove(cls));

    // Add the new contrast class if specified
    if (contrast) {
      document.body.classList.add(contrast);
    }

    // Toggle icons visibility
    highContrastIcon.style.display = contrast ? "block" : "none";
    lowContrastIcon.style.display = contrast ? "none" : "block";
  }

  /**
   * Toggle the theme between light and dark
   */
  function toggleTheme() {
    const currentTheme = document.body.classList.contains("palette-dark") ? "palette-dark" : "palette-light";
    const newTheme = currentTheme === "palette-light" ? "palette-dark" : "palette-light";
    applyTheme(newTheme);
  }

  /**
   * Toggle the contrast mode
   */
  function toggleContrast() {
    const currentContrast = document.body.classList.contains("palette-light-contrast") || document.body.classList.contains("palette-dark-contrast");
    const newContrast = currentContrast
      ? "" // No contrast
      : document.body.classList.contains("palette-dark")
      ? "palette-dark-contrast"
      : "palette-light-contrast";

    applyContrast(newContrast);
  }

  // Initialize theme based on saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const initialTheme = savedTheme || (prefersDarkScheme ? "palette-dark" : "palette-light");
  applyTheme(initialTheme);

  // Initialize contrast icons
  const initialContrast = document.body.classList.contains("palette-light-contrast") || document.body.classList.contains("palette-dark-contrast");
  applyContrast(initialContrast ? (prefersDarkScheme ? "palette-dark-contrast" : "palette-light-contrast") : "");

  // Apply saved font size
  updateSize(actualSize);

  // Event listeners for theme toggle
  sunIcon.addEventListener("click", toggleTheme);
  moonIcon.addEventListener("click", toggleTheme);

  // Event listeners for contrast toggle
  highContrastIcon.addEventListener("click", toggleContrast);
  lowContrastIcon.addEventListener("click", toggleContrast);
});
