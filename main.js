// Use a self-invoking async function to handle all the logic
(async function () {
  const countrySelect = document.getElementById("country-select");
  const portSelect = document.getElementById("port-select");
  const terminalsContainer = document.getElementById("terminals-container");
  const loadingIndicator = document.createElement("p");
  loadingIndicator.className = "text-center text-gray-500";
  loadingIndicator.textContent = "Loading data...";
  terminalsContainer.appendChild(loadingIndicator);

  let data = {};
  const xlsxFilePath = "GISIS_all_world.xlsx";

  // Page elements
  const startPage = document.getElementById("start-page");
  const portInfoPage = document.getElementById("port-info-page");
  const etaCalculatorPage = document.getElementById("eta-calculator-page");
  const gyroCalculatorPage = document.getElementById("gyro-calculator-page");

  // Page navigation functions
  function showStartPage() {
    startPage.classList.remove("hidden");
    portInfoPage.classList.add("hidden");
    etaCalculatorPage.classList.add("hidden");
    gyroCalculatorPage.classList.add("hidden");
    // Force hide search button on start page
    searchBtn.classList.add("hidden");
    searchBtn.style.display = "none";
  }

  function showPortInfoPage() {
    startPage.classList.add("hidden");
    portInfoPage.classList.remove("hidden");
    etaCalculatorPage.classList.add("hidden");
    gyroCalculatorPage.classList.add("hidden");
    // Show search button on port info page
    searchBtn.classList.remove("hidden");
    searchBtn.style.display = "block";
  }

  function showETACalculatorPage() {
    startPage.classList.add("hidden");
    portInfoPage.classList.add("hidden");
    etaCalculatorPage.classList.remove("hidden");
    gyroCalculatorPage.classList.add("hidden");
    // Hide search button on ETA calculator page
    searchBtn.classList.add("hidden");
    searchBtn.style.display = "none";
  }

  function showMateProgramsPage() {
    startPage.classList.add("hidden");
    portInfoPage.classList.add("hidden");
    etaCalculatorPage.classList.add("hidden");
    gyroCalculatorPage.classList.remove("hidden");
    // Hide search button on mate programs page
    searchBtn.classList.add("hidden");
    searchBtn.style.display = "none";
  }

  // Clean text function - fix encoding issues (individual characters only)
  function cleanText(text) {
    if (!text || typeof text !== "string") return text;

    const charFixes = [
      ["ç§", "ç"],
      ["ç΄", "o"],
      ["Γ΅", "a"],
      ["Γ'", "o"],
      ["Γ΄", "o"],
      ["Γ­", "í"],
      ["Γ³", "ó"],
      ["Γ±", "ñ"],
      ["Γ©", "é"],
      ["Γ¡", "á"],
      ["Γº", "ú"],
      ["Γ¼", "ü"],
      ["Γ§", "ç"],
      ["Γ¨", "è"],
      ["Γ ", "à"],
      ["Γ¢", "â"],
      ["Γª", "ê"],
      ["Γ¹", "ù"],
      ["Γ«", "ë"],
      ["Γ¯", "ï"],
      ["Γ¶", "ö"],
      ["Γ¤", "ä"],
    ];

    let result = text;
    for (const [wrong, correct] of charFixes) {
      result = result.split(wrong).join(correct);
    }
    return result;
  }

  // Get flag filename for country name
  function getFlagFilename(countryName) {
    if (!countryName) return null;

    // Clean country name - remove content in parentheses and common abbreviations
    let cleanCountryName = countryName
      .replace(/\([^)]*\)/g, '')  // Remove anything in parentheses
      .replace(/\s*,.*$/g, '')    // Remove comma and everything after
      .replace(/\bRep\.\s*of\s*/gi, 'Republic of ')  // Expand "Rep. of" to "Republic of"
      .replace(/\bDem\.\s*Rep\.\s*/gi, 'Democratic Republic ')  // Expand "Dem. Rep." to "Democratic Republic"
      .replace(/\bSt\.\s*/gi, 'Saint ')  // Expand "St." to "Saint"
      .replace(/\bU\.S\.\s*/gi, 'United States ')  // Expand "U.S." to "United States"
      .replace(/\bU\.K\.\s*/gi, 'United Kingdom ')  // Expand "U.K." to "United Kingdom"
      .replace(/\bU\.A\.E\.\s*/gi, 'United Arab Emirates ')  // Expand "U.A.E." to "United Arab Emirates"
      .trim();

    // Map country names to flag filenames
    const countryFlagMap = {
      // Common mappings
      "United States": "united-states",
      "United States of America": "united-states",
      "USA": "united-states",
      "United Kingdom": "united-kingdom",
      "UK": "united-kingdom",
      "Great Britain": "united-kingdom",
      "Britain": "united-kingdom",
      "Alderney": "united-kingdom",
      "Guernsey": "guernsey",
      "Jersey": "jersey",
      "South Korea": "south-korea",
      "North Korea": "north-korea",
      "South Africa": "south-africa",
      "New Zealand": "new-zealand",
      "Saudi Arabia": "saudi-arabia",
      "United Arab Emirates": "uae",
      "UAE": "uae",
      "Czech Republic": "czech-republic",
      "Czechia": "czech-republic",
      "Dominican Republic": "dominican-republic",
      "Central African Republic": "central-african-republic",
      "Sri Lanka": "sri-lanka",
      "Papua New Guinea": "papua-new-guinea",
      "Trinidad and Tobago": "trinidad-and-tobago",
      "Bosnia and Herzegovina": "bosnia",
      "Bosnia": "bosnia",
      "Côte d'Ivoire": "ivory-coast",
      "Cote d'Ivoire": "ivory-coast",
      "Cote d Ivoire": "ivory-coast",
      "Ivory Coast": "ivory-coast",
      "Republic of Côte d'Ivoire": "ivory-coast",
      "Republic of Cote d'Ivoire": "ivory-coast",
      "Marshall Islands": "marshall-islands",
      "Solomon Islands": "solomon-islands",
      "Cayman Islands": "cayman-islands",
      "Virgin Islands": "virgin-islands",
      "Cook Islands": "cook-islands",
      "Faroe Islands": "faroe-islands",
      "Falkland Islands": "falkland-islands",
      "Turks and Caicos Islands": "turks-and-caicos-islands",
      "Northern Mariana Islands": "northern-mariana-islands",
      "British Virgin Islands": "british-virgin-islands",
      "American Samoa": "american-samoa",
      "French Polynesia": "french-polynesia",
      "New Caledonia": "new-caledonia",
      "Wallis and Futuna": "wallis-and-futuna",
      "French Guiana": "french-guiana",
      "Saint Kitts and Nevis": "saint-kitts-and-nevis",
      "Saint Vincent and the Grenadines": "saint-vincent",
      "Saint Lucia": "saint-lucia",
      "Saint Pierre and Miquelon": "saint-pierre-and-miquelon",
      "Saint Helena": "saint-helena",
      "Saint Barthélemy": "saint-barthelemy",
      "Saint Martin": "saint-martin",
      "Sint Maarten": "sint-maarten",
      "Antigua and Barbuda": "antigua-and-barbuda",
      "São Tomé and Príncipe": "sao-tome-and-principe",
      "Burkina Faso": "burkina-faso",
      "Cape Verde": "cape-verde",
      "Guinea-Bissau": "guinea-bissau",
      "Equatorial Guinea": "equatorial-guinea",
      "Sierra Leone": "sierra-leone",
      "Congo": "congo-brazzaville",
      "Republic of Congo": "congo-brazzaville",
      "Congo Republic": "congo-brazzaville",
      "Democratic Republic of Congo": "congo-kinshasa",
      "Democratic Republic of the Congo": "congo-kinshasa",
      "DRC": "congo-kinshasa",
      "DR Congo": "congo-kinshasa",
      "East Timor": "east-timor",
      "Timor-Leste": "east-timor",
      "El Salvador": "el-salvador",
      "Costa Rica": "costa-rica",
      "Puerto Rico": "puerto-rico",
      "Vatican City": "vatican-city",
      "Vatican": "vatican-city",
      "San Marino": "san-marino",
      "Isle of Man": "isle-of-man",
      "Hong Kong": "hong-kong",
      "Macau": "macau",
      "Macao": "macau",
      "Western Sahara": "western-sahara",
      "South Sudan": "south-sudan",
      "French Southern and Antarctic Lands": "french-southern-and-antarctic-lands",
      "British Indian Ocean Territory": "british-indian-ocean-territory",
      "Heard Island and McDonald Islands": "heard-island-and-macdonald-islands",
      "South Georgia and the South Sandwich Islands": "south-georgia-and-the-south-sandwich-islands",
      "Norfolk Island": "norfolk-island",
      "Christmas Island": "christmas-island",
      "Cocos Islands": "cocos-keeling-islands",
      "Cocos Keeling Islands": "cocos-keeling-islands",
      "Cocos (Keeling) Islands": "cocos-keeling-islands",
      "Territory of Cocos (Keeling) Islands": "cocos-keeling-islands",
      "Bouvet Island": "bouvet-island",
      "Jan Mayen": "jan-mayen",
      "Svalbard": "svalbard",
      "Wake Island": "wake-island",
      "Navassa Island": "navassa-island",
      "Clipperton Island": "clipperton-island",
      "Coral Sea Islands": "coral-sea-islands",
      "Ashmore and Cartier Islands": "ashmore-and-cartier-islands",
      "Pitcairn Islands": "pitcairn-islands",
      "Netherlands Antilles": "netherlands-antilles",
      "Curaçao": "curacao",
      "Aruba": "aruba",
      "Russia": "russia",
      "Russian Federation": "russia",
      "Iran": "iran",
      "Islamic Republic of Iran": "iran",
      "Korea": "south-korea",
      "Republic of Korea": "south-korea",
      "Korea Republic": "south-korea",
      "Democratic People's Republic of Korea": "north-korea",
      "DPRK": "north-korea",
      "China": "china",
      "People's Republic of China": "china",
      "PRC": "china",
      "Taiwan": "taiwan",
      "Republic of China": "taiwan",
      "ROC": "taiwan",
      "Vietnam": "vietnam",
      "Viet Nam": "vietnam",
      "Socialist Republic of Vietnam": "vietnam",
      "Myanmar": "myanmar",
      "Burma": "myanmar",
      "Republic of Myanmar": "myanmar",
      "Macedonia": "macedonia",
      "North Macedonia": "macedonia",
      "Former Yugoslav Republic of Macedonia": "macedonia",
      "FYROM": "macedonia",
      "Eswatini": "swaziland",
      "Swaziland": "swaziland",
      "Kingdom of Eswatini": "swaziland",
      // British territories and dependencies
      "Gibraltar": "gibraltar",
      "Bermuda": "bermuda",
      "Falkland Islands": "falkland-islands",
      "South Georgia and South Sandwich Islands": "south-georgia-and-the-south-sandwich-islands",
      "British Antarctic Territory": "united-kingdom",
      "Akrotiri and Dhekelia": "akrotiri",
      "Dhekelia": "dhekelia",
      "Akrotiri": "akrotiri",
      "Pitcairn": "pitcairn-islands",
      "Tristan da Cunha": "saint-helena",
      "Ascension Island": "saint-helena",
      // Other territories that might use parent country flags
      "Greenland": "greenland",
      "Faroe Islands": "faroe-islands",
      "Åland Islands": "finland",
      "Aland Islands": "finland"
    };

    // Check direct mapping first
    if (countryFlagMap[cleanCountryName]) {
      return countryFlagMap[cleanCountryName];
    }

    // Check original name if cleaning didn't help
    if (countryFlagMap[countryName]) {
      return countryFlagMap[countryName];
    }

    // Convert country name to filename format
    let filename = cleanCountryName.toLowerCase()
      .replace(/'/g, "")  // Remove apostrophes
      .replace(/[^a-z0-9]/g, "-")  // Replace non-alphanumeric with hyphens
      .replace(/-+/g, "-")  // Replace multiple hyphens with single
      .replace(/^-|-$/g, "");  // Remove leading/trailing hyphens

    return filename;
  }

  // Check if flag image exists
  function getFlagImagePath(countryName) {
    const filename = getFlagFilename(countryName);
    if (!filename) return null;
    return `img/flags/${filename}.png`;
  }

  // Parse coordinates
  function parseCoordinateString(coordStr, isLat) {
    if (!coordStr || coordStr === "N/A") return "N/A";

    if (typeof coordStr === "string") {
      if (!isLat && coordStr.length >= 7) {
        // Longitude: DDDMMSS[EW]
        const match = coordStr.match(/^(\d{3})(\d{2})(\d{2})([EW])$/);
        if (match) {
          const [, degrees, minutes, seconds, direction] = match;
          return `${degrees.padStart(3, "0")}°${minutes.padStart(
            2,
            "0"
          )}'${seconds.padStart(2, "0")}" ${direction}`;
        }
      } else if (isLat && coordStr.length >= 6) {
        // Latitude: DDMMSS[NS]
        const match = coordStr.match(/^(\d{2})(\d{2})(\d{2})([NS])$/);
        if (match) {
          const [, degrees, minutes, seconds, direction] = match;
          return `${degrees.padStart(2, "0")}°${minutes.padStart(
            2,
            "0"
          )}'${seconds.padStart(2, "0")}" ${direction}`;
        }
      }
    }

    // Fallback for numeric coordinates
    const num = parseFloat(coordStr);
    if (isNaN(num)) return coordStr;

    const absolute = Math.abs(num);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.round((minutesNotTruncated - minutes) * 60);
    const direction = isLat ? (num >= 0 ? "N" : "S") : num >= 0 ? "E" : "W";
    return `${degrees}°${minutes}'${seconds}" ${direction}`;
  }

  // Load and parse Excel file
  async function loadXLSX() {
    try {
      const response = await fetch(xlsxFilePath);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
        type: "array",
      });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      parseXLSX(rows);
    } catch (error) {
      console.error("Loading error:", error);
      terminalsContainer.innerHTML = `<p class="text-red-500 text-center">Loading error. Please make sure the file "${xlsxFilePath}" is in the same folder.</p>`;
    }
  }

  function parseXLSX(rows) {
    data = {};
    if (!rows || rows.length < 2) return;

    const headers = rows[0].map((h) => (h ? h.toString().trim() : ""));
    const indices = {
      country: headers.indexOf("Country Name"),
      port: headers.indexOf("Port Name"),
      facility: headers.indexOf("Facility Name"),
      imo: headers.indexOf("IMO Port Facility Number"),
      description: headers.indexOf("Description"),
      longitude: headers.indexOf("Longitude"),
      latitude: headers.indexOf("Latitude"),
    };

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      const countryName = cleanText(values[indices.country]);
      const portName = cleanText(values[indices.port]);

      if (!countryName || !portName) continue;

      if (!data[countryName]) data[countryName] = {};
      if (!data[countryName][portName]) data[countryName][portName] = [];

      data[countryName][portName].push({
        locode: cleanText(values[indices.facility]) || "N/A",
        gisisNumber: values[indices.imo] || "N/A",
        description:
          cleanText(values[indices.description]) || "No description provided.",
        longitude: values[indices.longitude] || "N/A",
        latitude: values[indices.latitude] || "N/A",
      });
    }

    populateCountryDropdown();
    terminalsContainer.innerHTML =
      '<p class="text-center text-gray-500">Select a port to see the terminals.</p>';
  }

  function populateCountryDropdown() {
    countrySelect.innerHTML =
      '<option value="" disabled selected>Select a country</option>';
    Object.keys(data)
      .sort()
      .forEach((country) => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
      });
    countrySelect.disabled = false;
  }

  function populatePortDropdown(country) {
    portSelect.innerHTML =
      '<option value="" disabled selected>Select a port</option>';
    if (data[country]) {
      Object.keys(data[country])
        .sort()
        .forEach((port) => {
          const option = document.createElement("option");
          option.value = port;
          option.textContent = port;
          portSelect.appendChild(option);
        });
      portSelect.disabled = false;
    } else {
      portSelect.disabled = true;
    }
  }

  function displayTerminals(country, port) {
    terminalsContainer.innerHTML = "";
    if (!data[country] || !data[country][port]) return;

    const terminals = data[country][port];
    if (terminals.length === 0) {
      terminalsContainer.innerHTML = `<p class="text-center text-gray-500">No terminals found for ${port}.</p>`;
      return;
    }

    // Get flag image path for the country
    const flagImagePath = getFlagImagePath(country);
    
    // Extract UN/LOCODE from first terminal's GISIS number
    let unLocode = "N/A";
    if (terminals.length > 0 && terminals[0].gisisNumber && terminals[0].gisisNumber !== "N/A") {
      const gisisNumber = terminals[0].gisisNumber.toString();
      const dashIndex = gisisNumber.indexOf('-');
      if (dashIndex > 0) {
        unLocode = gisisNumber.substring(0, dashIndex);
      }
    }
    
    // Add port and country info container
    const portInfoContainer = document.createElement("div");
    portInfoContainer.className = "bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-200 mb-6";
    portInfoContainer.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            ${flagImagePath ? `
              <img src="${flagImagePath}" alt="${country} flag" class="w-16 h-12 rounded shadow-md border border-gray-300" 
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: none;">
                <g stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none">
                  <line x1="12" y1="6" x2="12" y2="18"></line>
                  <circle cx="12" cy="4" r="2"></circle>
                  <line x1="8" y1="8" x2="16" y2="8"></line>
                  <path d="M12 18 L8 14"></path>
                  <path d="M12 18 L16 14"></path>
                  <path d="M8 14 Q6 14 6 16 Q6 18 8 18"></path>
                  <path d="M16 14 Q18 14 18 16 Q18 18 16 18"></path>
                </g>
              </svg>
            ` : `
              <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <g stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none">
                  <line x1="12" y1="6" x2="12" y2="18"></line>
                  <circle cx="12" cy="4" r="2"></circle>
                  <line x1="8" y1="8" x2="16" y2="8"></line>
                  <path d="M12 18 L8 14"></path>
                  <path d="M12 18 L16 14"></path>
                  <path d="M8 14 Q6 14 6 16 Q6 18 8 18"></path>
                  <path d="M16 14 Q18 14 18 16 Q18 18 16 18"></path>
                </g>
              </svg>
            `}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-1 truncate">${port}</h2>
            <p class="text-base md:text-lg text-gray-600 truncate">${country}</p>
          </div>
        </div>
        <div class="flex justify-between md:justify-end space-x-4 md:space-x-6">
          <div class="text-center">
            <p class="text-xs md:text-sm text-gray-500 mb-1">UN/LOCODE:</p>
            <p class="text-sm md:text-lg font-bold text-gray-800">${unLocode}</p>
          </div>
          <div class="text-center">
            <p class="text-xs md:text-sm text-gray-500 mb-1">Terminals found</p>
            <p class="text-xl md:text-2xl font-bold text-blue-600">${terminals.length}</p>
          </div>
        </div>
      </div>
    `;
    terminalsContainer.appendChild(portInfoContainer);

    terminals.forEach((terminal) => {
      const card = document.createElement("div");
      card.className =
        "bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-[1.01]";
      card.innerHTML = `
        <h3 class="text-xl font-bold text-gray-900 mb-2">${terminal.locode}</h3>
        <p class="text-sm text-gray-500 mb-4">${terminal.description}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-4">
          <div>
            <p class="text-sm font-medium text-gray-700">GISIS Number:</p>
            <p class="text-base font-semibold text-blue-600">${
              terminal.gisisNumber
            }</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">Coordinates:</p>
            <p class="text-base text-gray-800">${parseCoordinateString(
              terminal.latitude,
              true
            )}, ${parseCoordinateString(terminal.longitude, false)}</p>
          </div>
        </div>
        <button class="generate-info-btn w-full ${
          navigator.onLine
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        } text-white font-bold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                data-country="${country}" data-port="${port}" data-terminal="${
        terminal.locode
      }" data-description="${terminal.description}"
                ${
                  !navigator.onLine
                    ? 'title="Please connect to internet to continue"'
                    : ""
                }>
          ✨ Generate Port Info
        </button>
        <div class="generated-info mt-4 p-4 bg-gray-50 rounded-lg hidden"></div>
      `;
      terminalsContainer.appendChild(card);
    });

    // Add event listeners for AI generation
    document.querySelectorAll(".generate-info-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const btn = event.target;
        const generatedInfoDiv = btn.nextElementSibling;
        const { country, port, terminal, description } = btn.dataset;

        btn.disabled = true;
        btn.textContent = "Generating...";
        generatedInfoDiv.classList.remove("hidden");
        generatedInfoDiv.textContent = "Please wait, fetching information...";

        try {
          if (!navigator.onLine) throw new Error("No internet connection");

          const prompt = `Based on official sailing directions and eNP Publications, provide factual information about the ${terminal} terminal at the port of ${port} in ${country}. The terminal is described as: "${description}". Only include verified facts from nautical publications such as: port facilities, berth specifications, cargo handling capabilities, depths, restrictions, or operational details. Do not speculate or imagine information. If specific details are not available in sailing directions, state that clearly. Format as a single paragraph with only factual data.`;

          const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          };
          const apiKey = "AIzaSyCHjhK5M3ZM5RCf8ttZVNC7JDLEX9U4eOA";
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            generatedInfoDiv.textContent =
              result.candidates[0].content.parts[0].text;
          } else {
            generatedInfoDiv.textContent =
              "Could not generate information. Please try again.";
          }
        } catch (error) {
          console.error("API error:", error);
          generatedInfoDiv.textContent =
            error.message === "No internet connection"
              ? "Please connect to internet to continue."
              : "An error occurred while fetching information. Please try again.";
        } finally {
          btn.disabled = false;
          btn.textContent = "✨ Generate Port Info";
        }
      });
    });
  }

  function resetToInitialState() {
    const countrySelect = document.getElementById("country-select");
    const portSelect = document.getElementById("port-select");
    const terminalsContainer = document.getElementById("terminals-container");
    
    if (countrySelect) countrySelect.value = "";
    if (portSelect) {
      portSelect.innerHTML = '<option value="" disabled selected>Select a country first</option>';
      portSelect.disabled = true;
    }
    if (terminalsContainer) {
      terminalsContainer.innerHTML = '<p class="text-center text-gray-500">Select a port to see the terminals.</p>';
    }
  }

  // Event listeners
  countrySelect.addEventListener("change", (event) => {
    populatePortDropdown(event.target.value);
    terminalsContainer.innerHTML =
      '<p class="text-center text-gray-500">Select a port to see the terminals.</p>';
  });

  portSelect.addEventListener("change", (event) => {
    displayTerminals(countrySelect.value, event.target.value);
  });

  document.getElementById("home-link").addEventListener("click", (event) => {
    event.preventDefault();
    showStartPage();
    resetToInitialState();
  });

  // Menu functionality
  const menuBtn = document.getElementById("menu-btn");
  const asideMenu = document.getElementById("aside-menu");
  const closeMenu = document.getElementById("close-menu");
  const menuOverlay = document.getElementById("menu-overlay");

  // Search functionality
  const searchBtn = document.getElementById("search-btn");
  const searchModal = document.getElementById("search-modal");
  const closeSearch = document.getElementById("close-search");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  // Open menu
  menuBtn.addEventListener("click", () => {
    asideMenu.classList.remove("-translate-x-full");
    menuOverlay.classList.remove("opacity-0", "invisible");
    menuOverlay.classList.add("opacity-100", "visible");
  });

  // Close menu
  const closeMenuHandler = () => {
    asideMenu.classList.add("-translate-x-full");
    menuOverlay.classList.remove("opacity-100", "visible");
    menuOverlay.classList.add("opacity-0", "invisible");
  };

  closeMenu.addEventListener("click", closeMenuHandler);
  
  // Close menu when clicking on overlay
  menuOverlay.addEventListener("click", closeMenuHandler);

  // Close menu when pressing Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !asideMenu.classList.contains("-translate-x-full")) {
      closeMenuHandler();
    }
  });

  // Menu item handlers
  document.getElementById("port-info-link").addEventListener("click", (e) => {
    e.preventDefault();
    closeMenuHandler();
    showPortInfoPage();
    resetToInitialState();
  });

  document.getElementById("gyro-calculator-link").addEventListener("click", (e) => {
    e.preventDefault();
    closeMenuHandler();
    showMateProgramsPage();
  });

  document.getElementById("eta-calculator-link").addEventListener("click", (e) => {
    e.preventDefault();
    closeMenuHandler();
    showETACalculatorPage();
  });

  // Start page button handlers
  document.getElementById("start-port-info-btn").addEventListener("click", () => {
    showPortInfoPage();
  });

  document.getElementById("start-gyro-calculator-btn").addEventListener("click", () => {
    showMateProgramsPage();
  });

  document.getElementById("start-eta-calculator-btn").addEventListener("click", () => {
    showETACalculatorPage();
  });

  // Open search modal
  searchBtn.addEventListener("click", () => {
    searchModal.classList.remove("hidden");
    searchInput.focus();
  });

  // Close search modal
  closeSearch.addEventListener("click", () => {
    searchModal.classList.add("hidden");
    searchInput.value = "";
    searchResults.innerHTML = '<p class="text-gray-500 text-center">Start typing to search for ports...</p>';
  });

  // Close modal when clicking outside
  searchModal.addEventListener("click", (e) => {
    if (e.target === searchModal) {
      closeSearch.click();
    }
  });

  // Search functionality
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
      searchResults.innerHTML = '<p class="text-gray-500 text-center">Type at least 2 characters to search...</p>';
      return;
    }

    const matches = [];
    
    // Search through all countries and ports
    for (const [country, ports] of Object.entries(data)) {
      for (const [port, terminals] of Object.entries(ports)) {
        if (port.toLowerCase().includes(query)) {
          matches.push({ country, port, terminals: terminals.length });
        }
      }
    }

    if (matches.length === 0) {
      searchResults.innerHTML = '<p class="text-gray-500 text-center">No ports found matching your search.</p>';
      return;
    }

    // Display results
    searchResults.innerHTML = matches
      .slice(0, 20) // Limit to 20 results
      .map(({ country, port, terminals }) => `
        <div class="search-result-item p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-b border-gray-100 last:border-b-0" 
             data-country="${country}" data-port="${port}">
          <div class="font-semibold text-gray-900">${port}</div>
          <div class="text-sm text-gray-600">${country} • ${terminals} terminal${terminals !== 1 ? 's' : ''}</div>
        </div>
      `).join('');

    // Add click handlers to search results
    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const country = item.dataset.country;
        const port = item.dataset.port;
        
        // Close search modal
        closeSearch.click();
        
        // Set the dropdowns and display terminals
        countrySelect.value = country;
        populatePortDropdown(country);
        portSelect.value = port;
        displayTerminals(country, port);
      });
    });
  });

  // ETA Calculator functionality
  let voyages = [];
  let voyageCounter = 0;

  // Generate simple UTC timezone options from UTC-12:00 to UTC+14:00
  function generateTimezoneOptions() {
    let options = '';
    for (let i = -12; i <= 14; i++) {
      const sign = i >= 0 ? '+' : '-';
      const hours = Math.abs(i).toString().padStart(2, '0');
      const value = `UTC${sign}${hours}:00`;
      const label = `(UTC${sign}${hours}:00)`;
      const selected = i === 0 ? ' selected' : '';
      options += `<option value="${value}"${selected}>${label}</option>`;
    }
    return options;
  }

  // Convert timezone string to offset in hours
  function getTimezoneOffset(timezone) {
    const match = timezone.match(/UTC([+-])(\d{1,2}):(\d{2})/);
    if (match) {
      const sign = match[1] === '+' ? 1 : -1;
      const hours = parseInt(match[2]);
      const minutes = parseInt(match[3]);
      return sign * (hours + minutes / 60);
    }
    return 0; // Default to UTC if no match
  }

  // Convert time from one timezone to another
  function convertToTimezone(date, fromTimezone, toTimezone) {
    const fromOffset = getTimezoneOffset(fromTimezone);
    const toOffset = getTimezoneOffset(toTimezone);
    const offsetDiff = (toOffset - fromOffset) * 60 * 60 * 1000; // Convert to milliseconds
    return new Date(date.getTime() + offsetDiff);
  }

  // Format date with timezone
  function formatDateWithTimezone(date, timezone) {
    return `${date.toLocaleString()} ${timezone}`;
  }

  function createVoyage() {
    voyageCounter++;
    const voyage = {
      id: voyageCounter,
      name: '',
      points: [],
      departureDateTime: '',
      departureTimezone: 'UTC+00:00',
      destinationTimezone: 'UTC+00:00',
      totalDistance: 0,
      fuelOnBoard: [
        { type: 'HFO', amount: 0 },
        { type: 'MDO', amount: 0 }
      ]
    };
    voyages.push(voyage);
    renderVoyage(voyage);
    return voyage;
  }

  function renderVoyage(voyage) {
    const voyagesContainer = document.getElementById('voyages-container');
    const voyageDiv = document.createElement('div');
    voyageDiv.className = 'bg-white p-6 rounded-xl shadow-md border border-gray-200';
    voyageDiv.id = `voyage-${voyage.id}`;
    
    voyageDiv.innerHTML = `
      <div class="flex items-center justify-between mb-4 gap-3">
        <input type="text" id="voyage-name-${voyage.id}" placeholder="Enter voyage name..." 
               class="flex-1 px-3 py-2 text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
               onchange="updateVoyageName(${voyage.id}, this.value)" value="${voyage.name}">
        <button onclick="removeVoyage(${voyage.id})" class="text-red-500 hover:text-red-700 transition-colors flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Departure Date/Time & Timezone -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Departure Date & Time</label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="md:col-span-2">
            <input type="datetime-local" id="departure-${voyage.id}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   onchange="updateDeparture(${voyage.id}, this.value)">
          </div>
          <div>
            <select id="departure-timezone-${voyage.id}" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onchange="updateDepartureTimezone(${voyage.id}, this.value)">
              ${generateTimezoneOptions()}
            </select>
          </div>
        </div>
      </div>
      
      <!-- Destination Timezone -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Destination Timezone</label>
        <select id="destination-timezone-${voyage.id}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onchange="updateDestinationTimezone(${voyage.id}, this.value)">
          ${generateTimezoneOptions()}
        </select>
      </div>
      
      <!-- Fuel on Board -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Fuel on Board</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="flex items-center space-x-2">
            <select id="fuel-type-1-${voyage.id}" class="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onchange="updateFuelType(${voyage.id}, 0, this.value)">
              <option value="HFO">HFO</option>
              <option value="MDO">MDO</option>
              <option value="MGO">MGO</option>
              <option value="LSFO">LSFO</option>
            </select>
            <input type="number" step="0.1" min="0" placeholder="0.0" id="fuel-amount-1-${voyage.id}"
                   class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                   onchange="updateFuelAmount(${voyage.id}, 0, this.value)">
            <span class="text-xs text-gray-500">tons</span>
          </div>
          <div class="flex items-center space-x-2">
            <select id="fuel-type-2-${voyage.id}" class="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onchange="updateFuelType(${voyage.id}, 1, this.value)">
              <option value="HFO">HFO</option>
              <option value="MDO" selected>MDO</option>
              <option value="MGO">MGO</option>
              <option value="LSFO">LSFO</option>
            </select>
            <input type="number" step="0.1" min="0" placeholder="0.0" id="fuel-amount-2-${voyage.id}"
                   class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                   onchange="updateFuelAmount(${voyage.id}, 1, this.value)">
            <span class="text-xs text-gray-500">tons</span>
          </div>
        </div>
      </div>
      
      <!-- Voyage Points -->
      <div id="points-${voyage.id}" class="space-y-3 mb-4">
        <!-- Points will be added here -->
      </div>
      
      <!-- Add Point Button -->
      <button onclick="addVoyagePoint(${voyage.id})" 
              class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-4">
        + Add Voyage Point
      </button>
      
      <!-- ETA Results -->
      <div id="eta-results-${voyage.id}" class="mt-4">
        <!-- ETA calculations will appear here -->
      </div>
      
      <!-- Total Distance & Timezone Info -->
      <div class="bg-gray-50 p-3 rounded-lg mt-4">
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-gray-700">Total Distance:</span>
          <span id="total-distance-${voyage.id}" class="font-bold text-blue-600">0 nm</span>
        </div>
        <div class="text-xs text-gray-600 border-t pt-2">
          <div class="flex justify-between">
            <span>Departure TZ:</span>
            <span id="departure-tz-display-${voyage.id}" class="font-medium">UTC+00:00</span>
          </div>
          <div class="flex justify-between mt-1">
            <span>Destination TZ:</span>
            <span id="destination-tz-display-${voyage.id}" class="font-medium">UTC+00:00</span>
          </div>
        </div>
      </div>
    `;
    
    voyagesContainer.appendChild(voyageDiv);
  }

  function addVoyagePoint(voyageId) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (!voyage || voyage.points.length >= 10) return;
    
    const pointId = voyage.points.length + 1;
    const point = {
      id: pointId,
      name: '',
      distance: 0,
      speed: 0,
      fuelUsed: [
        { type: voyage.fuelOnBoard[0].type, amount: 0 },
        { type: voyage.fuelOnBoard[1].type, amount: 0 }
      ]
    };
    
    voyage.points.push(point);
    renderVoyagePoint(voyageId, point);
  }

  function renderVoyagePoint(voyageId, point) {
    const pointsContainer = document.getElementById(`points-${voyageId}`);
    const pointDiv = document.createElement('div');
    const isFirstPoint = point.id === 1;
    
    if (isFirstPoint) {
      // First point - only name, no distance/speed
      pointDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500';
      pointDiv.innerHTML = `
        <div>
          <label class="block text-xs font-medium text-blue-700 mb-1">Starting Point</label>
          <input type="text" placeholder="Departure Port/Location" 
                 class="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                 onchange="updatePointName(${voyageId}, ${point.id}, this.value)">
        </div>
        <div class="flex items-end">
          <button onclick="removeVoyagePoint(${voyageId}, ${point.id})" 
                  class="text-red-500 hover:text-red-700 transition-colors p-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      `;
    } else {
      // Subsequent points - with distance, speed, and fuel consumption from previous checkpoint
      pointDiv.className = 'space-y-3 p-3 bg-gray-50 rounded-lg';
      pointDiv.innerHTML = `
        <!-- Basic Info Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div class="flex flex-col">
            <label class="block text-xs font-medium text-gray-600 mb-1 h-8 flex items-end">Waypoint Name</label>
            <input type="text" placeholder="Port/Waypoint" 
                   class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                   onchange="updatePointName(${voyageId}, ${point.id}, this.value)">
          </div>
          <div class="flex flex-col">
            <label class="block text-xs font-medium text-gray-600 mb-1 h-8 flex items-end">Distance from previous waypoint (nm)</label>
            <input type="number" step="0.1" min="0" placeholder="0.0"
                   class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                   onchange="updatePointDistance(${voyageId}, ${point.id}, this.value)">
          </div>
          <div class="flex flex-col">
            <label class="block text-xs font-medium text-gray-600 mb-1 h-8 flex items-end">Speed from previous waypoint (knots)</label>
            <input type="number" step="0.1" min="0" placeholder="0.0"
                   class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                   onchange="updatePointSpeed(${voyageId}, ${point.id}, this.value)">
          </div>
          <div class="flex flex-col justify-end">
            <div class="h-8"></div>
            <button onclick="removeVoyagePoint(${voyageId}, ${point.id})" 
                    class="text-red-500 hover:text-red-700 transition-colors p-1 self-start">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Fuel Consumption Row -->
        <div class="border-t border-gray-200 pt-2">
          <label class="block text-xs font-medium text-gray-600 mb-2">Fuel used from previous waypoint</label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="fuel-consumption-${voyageId}-${point.id}">
            <!-- Fuel consumption fields will be populated based on voyage fuel types -->
          </div>
        </div>
      `;
    }
    
    pointDiv.id = `point-${voyageId}-${point.id}`;
    pointsContainer.appendChild(pointDiv);
    
    // Populate fuel consumption fields for non-starting points
    if (!isFirstPoint) {
      populateFuelConsumptionFields(voyageId, point.id);
    }
  }

  function populateFuelConsumptionFields(voyageId, pointId) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (!voyage) return;
    
    const fuelContainer = document.getElementById(`fuel-consumption-${voyageId}-${pointId}`);
    if (!fuelContainer) return;
    
    let fuelFieldsHTML = '';
    voyage.fuelOnBoard.forEach((fuel, index) => {
      if (fuel.type && fuel.amount > 0) {
        fuelFieldsHTML += `
          <div class="flex items-center space-x-2">
            <span class="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded min-w-12 text-center">${fuel.type}</span>
            <input type="number" step="0.1" min="0" placeholder="0.0"
                   class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                   onchange="updatePointFuelAmount(${voyageId}, ${pointId}, ${index}, this.value)">
            <span class="text-xs text-gray-500">tons</span>
          </div>
        `;
      }
    });
    
    if (fuelFieldsHTML === '') {
      fuelFieldsHTML = '<div class="text-xs text-gray-500 italic">Set fuel types at starting point first</div>';
    }
    
    fuelContainer.innerHTML = fuelFieldsHTML;
  }

  // Global functions for voyage management
  window.removeVoyage = function(voyageId) {
    voyages = voyages.filter(v => v.id !== voyageId);
    document.getElementById(`voyage-${voyageId}`).remove();
  };

  window.addVoyagePoint = addVoyagePoint;

  window.removeVoyagePoint = function(voyageId, pointId) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (voyage) {
      voyage.points = voyage.points.filter(p => p.id !== pointId);
      document.getElementById(`point-${voyageId}-${pointId}`).remove();
      calculateTotalDistance(voyageId);
      calculateETA(voyageId);
    }
  };

  window.updateDeparture = function(voyageId, dateTime) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (voyage) {
      voyage.departureDateTime = dateTime;
      calculateETA(voyageId);
    }
  };

  window.updateDepartureTimezone = function(voyageId, timezone) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (voyage) {
      voyage.departureTimezone = timezone;
      // Update timezone display
      const displayElement = document.getElementById(`departure-tz-display-${voyageId}`);
      if (displayElement) {
        displayElement.textContent = timezone;
      }
      calculateETA(voyageId);
    }
  };

  window.updateDestinationTimezone = function(voyageId, timezone) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (voyage) {
      voyage.destinationTimezone = timezone;
      // Update timezone display
      const displayElement = document.getElementById(`destination-tz-display-${voyageId}`);
      if (displayElement) {
        displayElement.textContent = timezone;
      }
      calculateETA(voyageId);
    }
  };

  window.updateVoyageName = function(voyageId, name) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (voyage) {
      voyage.name = name;
    }
  };

  window.updateFuelType = function(voyageId, fuelIndex, type) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (voyage && voyage.fuelOnBoard[fuelIndex]) {
      voyage.fuelOnBoard[fuelIndex].type = type;
      // Update fuel types for all waypoints
      voyage.points.forEach(point => {
        if (point.fuelUsed[fuelIndex]) {
          point.fuelUsed[fuelIndex].type = type;
        }
      });
      // Refresh fuel consumption fields for all waypoints
      refreshAllFuelConsumptionFields(voyageId);
      calculateETA(voyageId);
    }
  };

  window.updateFuelAmount = function(voyageId, fuelIndex, amount) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (voyage && voyage.fuelOnBoard[fuelIndex]) {
      voyage.fuelOnBoard[fuelIndex].amount = parseFloat(amount) || 0;
      // Refresh fuel consumption fields for all waypoints
      refreshAllFuelConsumptionFields(voyageId);
      calculateETA(voyageId);
    }
  };

  window.updatePointFuelAmount = function(voyageId, pointId, fuelIndex, amount) {
    const voyage = voyages.find(v => v.id === voyageId);
    const point = voyage?.points.find(p => p.id === pointId);
    if (point && point.fuelUsed[fuelIndex]) {
      point.fuelUsed[fuelIndex].amount = parseFloat(amount) || 0;
      // Ensure the fuel type matches the voyage fuel type
      if (voyage.fuelOnBoard[fuelIndex]) {
        point.fuelUsed[fuelIndex].type = voyage.fuelOnBoard[fuelIndex].type;
      }
      calculateETA(voyageId);
    }
  };

  function refreshAllFuelConsumptionFields(voyageId) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (!voyage) return;
    
    voyage.points.forEach(point => {
      if (point.id !== 1) { // Skip starting point
        populateFuelConsumptionFields(voyageId, point.id);
      }
    });
  }

  window.printCalculations = function(voyageId) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (!voyage || !voyage.departureDateTime) return;

    const voyageName = voyage.name || `Voyage #${voyage.id}`;
    const printWindow = window.open('', '_blank');
    
    // Generate detailed voyage calculation
    const departureTime = new Date(voyage.departureDateTime);
    let currentTime = new Date(departureTime);
    let cumulativeDistance = 0;
    let totalFuelUsed = {};
    
    // Initialize fuel remaining with fuel on board
    let fuelRemaining = {};
    voyage.fuelOnBoard.forEach(fuel => {
      if (fuel.amount > 0) {
        fuelRemaining[fuel.type] = (fuelRemaining[fuel.type] || 0) + fuel.amount;
        totalFuelUsed[fuel.type] = 0;
      }
    });
    
    let voyageLegs = '';
    let previousWaypoint = '';
    
    voyage.points.forEach((point, index) => {
      if (index === 0) {
        // Starting point
        previousWaypoint = point.name || 'Starting Point';
      } else if (point.distance > 0 && point.speed > 0) {
        const timeHours = point.distance / point.speed;
        const legTime = timeHours;
        currentTime = new Date(currentTime.getTime() + (timeHours * 60 * 60 * 1000));
        cumulativeDistance += point.distance;
        
        // Calculate fuel consumption for this leg
        let legFuelUsed = {};
        point.fuelUsed.forEach((fuel, fuelIndex) => {
          if (fuel.amount > 0) {
            const correctFuelType = voyage.fuelOnBoard[fuelIndex]?.type || fuel.type;
            fuelRemaining[correctFuelType] = (fuelRemaining[correctFuelType] || 0) - fuel.amount;
            totalFuelUsed[correctFuelType] = (totalFuelUsed[correctFuelType] || 0) + fuel.amount;
            legFuelUsed[correctFuelType] = fuel.amount;
          }
        });
        
        const currentWaypoint = point.name || `Waypoint ${index + 1}`;
        
        voyageLegs += `
          <div class="leg-block">
            <h3>${previousWaypoint} → ${currentWaypoint}</h3>
            <div class="leg-details">
              <div class="detail-row">
                <span class="label">Distance from previous waypoint:</span>
                <span class="value">${point.distance.toFixed(1)} nm</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Distance:</span>
                <span class="value">${cumulativeDistance.toFixed(1)} nm</span>
              </div>
              <div class="detail-row">
                <span class="label">Speed:</span>
                <span class="value">${point.speed.toFixed(1)} knots</span>
              </div>
              <div class="detail-row">
                <span class="label">Travel Time:</span>
                <span class="value">${Math.floor(legTime)}h ${Math.round((legTime % 1) * 60)}m</span>
              </div>
              <div class="detail-row">
                <span class="label">ETA:</span>
                <span class="value">${convertToTimezone(currentTime, voyage.departureTimezone, voyage.destinationTimezone).toLocaleString()} ${voyage.destinationTimezone}</span>
              </div>
              ${Object.keys(legFuelUsed).length > 0 ? `
                <div class="detail-row">
                  <span class="label">Fuel Used:</span>
                  <span class="value">${Object.entries(legFuelUsed).map(([type, amount]) => `${amount.toFixed(1)}t ${type}`).join(', ')}</span>
                </div>
              ` : ''}
              ${Object.keys(fuelRemaining).length > 0 ? `
                <div class="detail-row fuel-remaining">
                  <span class="label">Fuel Remaining:</span>
                  <span class="value">${Object.entries(fuelRemaining).filter(([type, amount]) => amount > 0).map(([type, amount]) => `${amount.toFixed(1)}t ${type}`).join(', ')}</span>
                </div>
              ` : ''}
            </div>
          </div>
        `;
        
        previousWaypoint = currentWaypoint;
      }
    });
    
    // Calculate total voyage time
    const totalVoyageTime = (currentTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voyage Plan - ${voyageName}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 0; 
            line-height: 1.3;
            color: #333;
            font-size: 12px;
          }
          
          .page-container {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            page-break-after: always;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 15px; 
            border-bottom: 3px solid #1e40af; 
            padding-bottom: 10px; 
            flex-shrink: 0;
          }
          .header h1 { 
            color: #1e40af; 
            margin: 0 0 5px 0; 
            font-size: 20px;
          }
          .header h2 { 
            color: #374151; 
            margin: 0 0 5px 0; 
            font-size: 16px;
          }
          .header p { 
            color: #6b7280; 
            margin: 0; 
            font-size: 11px;
          }
          
          .voyage-info {
            background: #f8fafc;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 15px;
            border-left: 4px solid #1e40af;
            flex-shrink: 0;
            font-size: 11px;
          }
          
          .content-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          
          .legs-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 10px;
            align-content: start;
          }
          
          .leg-block {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 12px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            height: fit-content;
          }
          
          .leg-block h3 {
            color: #1e40af;
            margin: 0 0 8px 0;
            font-size: 13px;
            font-weight: bold;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }
          
          .leg-details {
            display: grid;
            grid-template-columns: 1fr;
            gap: 3px;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
            font-size: 10px;
          }
          
          .label {
            font-weight: 600;
            color: #374151;
          }
          
          .value {
            color: #1f2937;
            font-weight: 500;
          }
          
          .fuel-remaining .value {
            color: #059669;
            font-weight: bold;
          }
          
          .summary {
            background: #1e40af !important;
            color: white !important;
            padding: 15px;
            border-radius: 6px;
            margin-top: auto;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .summary h3 {
            margin: 0 0 10px 0;
            font-size: 16px;
            text-align: center;
            color: white !important;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
          }
          
          .summary-item {
            text-align: center;
            padding: 8px;
            background: rgba(255,255,255,0.2) !important;
            border-radius: 4px;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .summary-label {
            font-size: 10px;
            opacity: 0.9;
            margin-bottom: 3px;
            color: white !important;
          }
          
          .summary-value {
            font-size: 12px;
            font-weight: bold;
            color: white !important;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 0; 
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .page-container { 
              height: auto; 
              min-height: 100vh;
            }
            .leg-block { 
              break-inside: avoid; 
            }
            .summary { 
              break-inside: avoid;
              background: #1e40af !important;
              color: white !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .summary * {
              color: white !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .summary-item {
              background: rgba(255,255,255,0.2) !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="header">
            <h1>⚓ SeaMate Buddy - Voyage Plan</h1>
            <h2>${voyageName}</h2>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="voyage-info">
            <strong>Departure:</strong> ${departureTime.toLocaleString()} ${voyage.departureTimezone} | 
            <strong>Departure TZ:</strong> ${voyage.departureTimezone} | 
            <strong>Destination TZ:</strong> ${voyage.destinationTimezone} | 
            <strong>Initial Fuel:</strong> ${Object.entries(fuelRemaining).map(([type, amount]) => `${(amount + (totalFuelUsed[type] || 0)).toFixed(1)}t ${type}`).join(', ')}
          </div>
          
          <div class="content-area">
            <div class="legs-container">
              ${voyageLegs}
            </div>
            
            <div class="summary">
              <h3>📊 Voyage Summary</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-label">Total Distance</div>
                  <div class="summary-value">${cumulativeDistance.toFixed(1)} nm</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Total Time</div>
                  <div class="summary-value">${Math.floor(totalVoyageTime)}h ${Math.round((totalVoyageTime % 1) * 60)}m</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Final ETA</div>
                  <div class="summary-value">${convertToTimezone(currentTime, voyage.departureTimezone, voyage.destinationTimezone).toLocaleString()} ${voyage.destinationTimezone}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Total Fuel Used</div>
                  <div class="summary-value">${Object.entries(totalFuelUsed).filter(([type, amount]) => amount > 0).map(([type, amount]) => `${amount.toFixed(1)}t ${type}`).join(', ') || 'None'}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Fuel Remaining</div>
                  <div class="summary-value">${Object.entries(fuelRemaining).filter(([type, amount]) => amount > 0).map(([type, amount]) => `${amount.toFixed(1)}t ${type}`).join(', ') || 'None'}</div>
                </div>
              </div>
              <div class="mt-3 text-center text-sm" style="color: #666;">
                <strong>Timezone Info:</strong> Departure ${voyage.departureTimezone} → Destination ${voyage.destinationTimezone}
              </div>
            </div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(() => window.print(), 500);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  window.updatePointName = function(voyageId, pointId, name) {
    const voyage = voyages.find(v => v.id === voyageId);
    const point = voyage?.points.find(p => p.id === pointId);
    if (point) {
      point.name = name;
    }
  };

  window.updatePointDistance = function(voyageId, pointId, distance) {
    const voyage = voyages.find(v => v.id === voyageId);
    const point = voyage?.points.find(p => p.id === pointId);
    if (point) {
      point.distance = parseFloat(distance) || 0;
      calculateTotalDistance(voyageId);
      calculateETA(voyageId);
    }
  };

  window.updatePointSpeed = function(voyageId, pointId, speed) {
    const voyage = voyages.find(v => v.id === voyageId);
    const point = voyage?.points.find(p => p.id === pointId);
    if (point) {
      point.speed = parseFloat(speed) || 0;
      calculateETA(voyageId);
    }
  };

  function calculateTotalDistance(voyageId) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (voyage) {
      voyage.totalDistance = voyage.points.reduce((total, point) => total + point.distance, 0);
      document.getElementById(`total-distance-${voyageId}`).textContent = `${voyage.totalDistance.toFixed(1)} nm`;
    }
  }

  function calculateETA(voyageId) {
    const voyage = voyages.find(v => v.id === voyageId);
    if (!voyage || !voyage.departureDateTime) return;

    const departureTime = new Date(voyage.departureDateTime);
    let currentTime = new Date(departureTime);
    let cumulativeDistance = 0;
    
    // Initialize fuel remaining with fuel on board
    let fuelRemaining = {};
    voyage.fuelOnBoard.forEach(fuel => {
      if (fuel.amount > 0) {
        fuelRemaining[fuel.type] = (fuelRemaining[fuel.type] || 0) + fuel.amount;
      }
    });
    
    const etaResults = document.getElementById(`eta-results-${voyageId}`);
    const voyageName = voyage.name || `Voyage #${voyage.id}`;
    let resultsHTML = `<div class="mt-4 p-3 bg-blue-50 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-semibold text-blue-900">ETA & Fuel Calculations - ${voyageName}</h4>
        <button onclick="printCalculations(${voyage.id})" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors">
          <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          Print
        </button>
      </div>
      <div class="space-y-2 text-sm">`;
    
    // Starting point fuel status
    const fuelOnBoardText = Object.entries(fuelRemaining)
      .filter(([type, amount]) => amount > 0)
      .map(([type, amount]) => `${amount.toFixed(1)}t ${type}`)
      .join(', ');
    
    if (fuelOnBoardText) {
      resultsHTML += `
        <div class="flex justify-between bg-green-50 p-2 rounded">
          <span class="font-medium">Starting Fuel:</span>
          <span class="text-green-700">${fuelOnBoardText}</span>
        </div>
      `;
    }
    
    voyage.points.forEach((point, index) => {
      if (index === 0) {
        // Starting point
        resultsHTML += `
          <div class="flex justify-between border-b border-blue-200 pb-1">
            <span class="font-medium">${point.name || 'Starting Point'}:</span>
            <span>Departure time: ${departureTime.toLocaleString()} ${voyage.departureTimezone}</span>
          </div>
        `;
      } else if (point.distance > 0 && point.speed > 0) {
        // Calculate travel time
        const timeHours = point.distance / point.speed;
        currentTime = new Date(currentTime.getTime() + (timeHours * 60 * 60 * 1000));
        cumulativeDistance += point.distance;
        
        // Calculate fuel consumption - ensure we use the correct fuel types
        point.fuelUsed.forEach((fuel, fuelIndex) => {
          if (fuel.amount > 0) {
            // Use the fuel type from voyage fuel on board to ensure consistency
            const correctFuelType = voyage.fuelOnBoard[fuelIndex]?.type || fuel.type;
            fuelRemaining[correctFuelType] = (fuelRemaining[correctFuelType] || 0) - fuel.amount;
          }
        });
        
        // Fuel used text
        const fuelUsedText = point.fuelUsed
          .filter(fuel => fuel.amount > 0)
          .map(fuel => `${fuel.amount.toFixed(1)}t ${fuel.type}`)
          .join(', ');
        
        // Fuel remaining text
        const fuelRemainingText = Object.entries(fuelRemaining)
          .filter(([type, amount]) => amount > 0)
          .map(([type, amount]) => `${amount.toFixed(1)}t ${type}`)
          .join(', ');
        
        resultsHTML += `
          <div class="border-b border-blue-200 pb-2 mb-2">
            <div class="flex justify-between">
              <span class="font-medium">${point.name || `Waypoint ${index + 1}`}:</span>
              <span>ETA: ${convertToTimezone(currentTime, voyage.departureTimezone, voyage.destinationTimezone).toLocaleString()} ${voyage.destinationTimezone}</span>
            </div>
            <div class="text-xs text-gray-600 mt-1">
              Distance from previous waypoint: ${point.distance.toFixed(1)} nm | Total Distance: ${cumulativeDistance.toFixed(1)} nm
              ${fuelUsedText ? ` | Used: ${fuelUsedText}` : ''}
            </div>
            ${fuelRemainingText ? `
              <div class="text-xs text-green-600 mt-1">
                Remaining: ${fuelRemainingText}
              </div>
            ` : ''}
          </div>
        `;
      }
    });
    
    // Add voyage summary with final arrival time if there are waypoints
    if (voyage.points.length > 1 && cumulativeDistance > 0) {
      const totalVoyageTime = (currentTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60);
      const finalArrivalTime = convertToTimezone(currentTime, voyage.departureTimezone, voyage.destinationTimezone);
      
      resultsHTML += `
        <div class="mt-4 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
          <h4 class="font-bold text-lg mb-3 text-center">🚢 Voyage Summary</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div class="bg-white bg-opacity-20 p-3 rounded-lg">
              <div class="text-xs opacity-90 mb-1">Total Distance</div>
              <div class="text-lg font-bold">${cumulativeDistance.toFixed(1)} nm</div>
            </div>
            <div class="bg-white bg-opacity-20 p-3 rounded-lg">
              <div class="text-xs opacity-90 mb-1">Total Time</div>
              <div class="text-lg font-bold">${Math.floor(totalVoyageTime)}h ${Math.round((totalVoyageTime % 1) * 60)}m</div>
            </div>
            <div class="bg-white bg-opacity-20 p-3 rounded-lg">
              <div class="text-xs opacity-90 mb-1">Departure</div>
              <div class="text-sm font-bold">${departureTime.toLocaleString()} ${voyage.departureTimezone}</div>
            </div>
            <div class="bg-white bg-opacity-20 p-3 rounded-lg">
              <div class="text-xs opacity-90 mb-1">Final Arrival</div>
              <div class="text-sm font-bold">${finalArrivalTime.toLocaleString()} ${voyage.destinationTimezone}</div>
            </div>
          </div>
          <div class="mt-3 text-center text-sm opacity-90">
            <strong>Timezone Info:</strong> Departure ${voyage.departureTimezone} → Destination ${voyage.destinationTimezone}
          </div>
        </div>
      `;
    }
    
    resultsHTML += '</div></div>';
    etaResults.innerHTML = resultsHTML;
  }

  // Add Voyage button handler
  document.getElementById('add-voyage-btn').addEventListener('click', () => {
    if (voyages.length < 5) {
      createVoyage();
    } else {
      alert('Maximum 5 voyages allowed');
    }
  });

  // Initialize
  await loadXLSX();
  
  // Start with the start page (search button hidden by default)
  showStartPage();
})();
  // Mate Programs functionality
  window.openSignalFlags = function() {
    // Open the Signal Flags page in a new window/tab
    window.open('flags_ABC.html', '_blank');
  };

  // Download Observation.xlsm functionality
  const downloadObservationBtn = document.getElementById('download-observation-btn');
  if (downloadObservationBtn) {
    downloadObservationBtn.addEventListener('click', async () => {
      try {
        // Fetch the Observation.xlsm file
        const response = await fetch('Observation.xlsm');
        if (!response.ok) {
          throw new Error('File not found');
        }
        
        // Create blob from response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Observation.xlsm';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Show success message
        const originalText = downloadObservationBtn.textContent;
        downloadObservationBtn.textContent = '✅ Downloaded!';
        downloadObservationBtn.classList.add('bg-green-800');
        downloadObservationBtn.classList.remove('bg-green-600');
        
        setTimeout(() => {
          downloadObservationBtn.textContent = originalText;
          downloadObservationBtn.classList.remove('bg-green-800');
          downloadObservationBtn.classList.add('bg-green-600');
        }, 2000);
        
      } catch (error) {
        console.error('Download failed:', error);
        
        // Show error message
        const originalText = downloadObservationBtn.textContent;
        downloadObservationBtn.textContent = '❌ Download Failed';
        downloadObservationBtn.classList.add('bg-red-600');
        downloadObservationBtn.classList.remove('bg-green-600');
        
        setTimeout(() => {
          downloadObservationBtn.textContent = originalText;
          downloadObservationBtn.classList.remove('bg-red-600');
          downloadObservationBtn.classList.add('bg-green-600');
        }, 2000);
      }
    });
  }
  
  // This section is reserved for future maritime tools