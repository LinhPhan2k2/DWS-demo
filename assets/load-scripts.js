// ========== Register execution functions ==========
function loadCSS(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;

    link.onload = () => resolve(url);
    link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));

    document.head.appendChild(link);
  });
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;

    script.onload = () => resolve(url);
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));

    document.body.appendChild(script);
  });
}

// ========== Register scripts ==========
const cssFiles = [
  "assets/bootstrap/css/bootstrap.min.css", // load bootstrap classes
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css", // load bootstrap icons
  "assets/css/custom.css", // define new classes
  "assets/css/fonts.css", // define fonts
  "assets/css/colors.css", // define colors
  "assets/css/grid.css", // define grid system
  "assets/css/line-clamp.css", // define line-clamp system
  "assets/css/reset.css", // re-define some bootstrap classes
  "assets/css/style.css", // style pages, components
  "assets/css/responsive.css", // responsive pages, components
  "assets/css/darkmode.css", // enable darkmode
  "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css", // style datetime picker
];

const jsFiles = [
  "https://unpkg.com/embla-carousel/embla-carousel.umd.js",
  "https://unpkg.com/embla-carousel-autoplay/embla-carousel-autoplay.umd.js",
  "https://cdn.jsdelivr.net/npm/flatpickr",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js",
  "assets/bootstrap/js/bootstrap.bundle.min.js",
  "assets/js/embla-carousel.js",
  "assets/js/dragdrop.js",
  "assets/js/chart.js",
  "assets/js/fullcalendar.js",
  "assets/js/script.js",
];

const promises = [...cssFiles.map(loadCSS), ...jsFiles.map(loadScript)];

// ========== Execute scripts ==========
Promise.all(promises)
  .then(() => {
    console.log(
      "%c All CSS and JS files have been loaded",
      "background-color:green"
    );
    createEmblaCarousel();
    createDragDrop();
    toggleEyePassword();
    attachToList();
    createDatePicker();
    checkAllBoxes();
    selectMultipleOptions();
    createChart();
    initToggleBootstrapDropdown();
    initOverflowSidebar();
    initDarkMode();
    initDualRangeSlider();
    createCalendar();
    createCalendarMini();
  })
  .catch((error) => {
    console.error("Error loading files:", error);
  });
