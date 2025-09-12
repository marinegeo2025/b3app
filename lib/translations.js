// love peace and happiness
const translations = {
  en: {
    // --- Landing page ---
    titleLine1: "Brue & Barvas",
    titleLine2: "Bin Collection Dates",
    description:
      "Check bin collection dates for Brue and Barvas: black, blue, and green bins. Includes iCal download links.",
    villages: `
      BARVAS: Upper Barvas, Lower Barvas, Monard, Park Barvas, The Corners, Heatherhill, and Loch Street.
      <br/>
      BRUE: Am Baile-stigh (the inner village) and Pairc Bhrù (Park Brue).
    `,
    selectBin: "Select the bin type to view the latest collection dates:",
    calendarHeader:
      "📅 Open the Brue & Barvas Bin Collection Schedules in Your Calendar:",
    northSchedule: "Brue & Barvas Bin Schedule",
    northVillages:
      "(Brue: Am Baile-stigh, Pairc Bhrù — Barvas: Upper, Lower, Monard, Park Barvas, The Corners, Heatherhill, Loch Street)",
    southSchedule: "",
    southVillages: "",
    credit: `
      Created by Alex Barnard, <a href="https://docs.google.com/document/d/1yT_LiSagVfXqppdcbdL5_N0ZKIR_wmnusPOYgOJOwIc/edit?usp=sharing" target="_blank">
    Ness Bin App White Paper
  </a> for more details. 
  Each time this app loads, it collects data from the CNES website, meaning that it is up to date at the time the app is opened. 
  The data used are from 
  <a href="https://www.cne-siar.gov.uk/bins-and-recycling" target="_blank">
    CNES Bins and Recycling
  </a>.
  <br /><br />
  📰 Local information, including bin schedules and much more, are available in the award-winning 
  <a href="https://www.fiosnews.co.uk/" target="_blank">FIOS Community Newspaper</a>.
`,
    licence: `
      This free tool is shared under a 
      <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">
        Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
      </a> licence.
      <br /><br />
      This project is a community tool — if you spot any errors or have suggestions, 
      I’ll make corrections as quickly as possible.  
      Thank you for contributing and helping keep Brue & Barvas connected 💙
    `,
    cute: "💙 WE LOVE BRUE & BARVAS! 💙",

    // --- Bin pages ---
    blackTitle: "BLACK Bin Collection Dates (Brue & Barvas)",
    blueTitle: "BLUE Bin Collection Dates (Brue & Barvas)",
    greenTitle: "GREEN Bin Collection Dates (Brue & Barvas)",

    noData: "No bin collection dates found. Try refreshing later.",
    errorFetching: "Error fetching data:",

    // --- Bin button labels ---
    blackButton: "Black Bin (General Waste)",
    blueButton: "Blue Bin (Plastics and Paper)",
    greenButton: "Green Bin (Glass)",

    // --- Back button ---
    back: "← Back",

    brueSchedule: "Brue Bin Schedule",
    brueVillages: "Brue: Am Baile-stigh (the inner village), Pairc Bhrù (Park Brue)",

    barvasSchedule: "Barvas Bin Schedule",
    barvasVillages: "Barvas: Upper, Lower, Monard, Park Barvas, The Corners, Heatherhill, Loch Street",
  },

  gd: {
    // --- Landing page ---
    title: "Cinn-latha Cruinneachaidh Bhionaichean Brù & Barabhas",
    description:
      "Thoir sùil air cinn-latha cruinneachaidh bhionaichean ann am Brù is Barabhas: dubh, gorm, is uaine. A’ gabhail a-steach ceanglaichean iCal.",
    villages: `
      BARABHAS: Barabhas a Tuath, Barabhas a Deas, Monard, Pàirc Bharabhais, Na Corners, Heatherhill, agus Sràid na Locha.
      <br/>
      BRÙ: Am Baile-stigh (am baile a-staigh) agus Pàirc Bhrù.
    `,
    selectBin: "Tagh seòrsa a’ bhiona gus na cinn-latha as ùire fhaicinn:",
    calendarHeader:
      "📅 Fosgail na Clàran Bhionaichean Brù is Barabhais anns a’ Mhìosachan agad:",
    northSchedule: "Clàr Bhionaichean Brù & Barabhais",
    northVillages:
      "(Brù: Am Baile-stigh, Pàirc Bhrù — Barabhas: Tuath, Deas, Monard, Pàirc Bharabhais, Corners, Heatherhill, Sràid na Locha)",
    southSchedule: "",
    southVillages: "",
    credit: `
    Air a chruthachadh le Alex Barnard, leugh an 
  <a href="https://docs.google.com/document/d/1yT_LiSagVfXqppdcbdL5_N0ZKIR_wmnusPOYgOJOwIc/edit?usp=sharing" target="_blank">
    Geàrr-chunntas an Aplacaid Bhionaichean Brù & Barabhas
  </a> airson barrachd fiosrachaidh. 
  Gach turas a luchdaicheas an aplacaid seo, bidh e a’ sgrìobadh dàta bhon làrach-lìn ChNES, 
  agus mar sin tha e suas gu latha nuair a thèid fhosgladh. 
  Tha an dàta seo bho 
  <a href="https://www.cne-siar.gov.uk/bins-and-recycling" target="_blank">
    CNES Bionaichean is Ath-chuairteachadh
  </a>.
  <br /><br />
  📰 Tha barrachd fiosrachaidh ionadail, a’ gabhail a-steach clàran bhionaichean, 
  ri fhaighinn cuideachd anns an Iris Coimhearsnachd a Choisinn Duaisean 
  <a href="https://www.fiosnews.co.uk/" target="_blank">FIOS</a>.
`,
    licence: `
      Tha an inneal seo air a roinn fo 
      <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">
        Ceadachas Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
      </a>.
      <br /><br />
      ’S e pròiseact coimhearsnachd a tha seo — ma chì thu mearachdan no ma tha molaidhean agad, 
      nì mi ceartachaidhean cho luath ’s a ghabhas.  
      Tapadh leibh airson cur ris agus airson a bhith a’ cuideachadh Brù is Barabhais a chumail ceangailte 💙
    `,
    cute: "💙 GRÀDH MÒR AIR BRÙ IS BARABHAS! 💙",

    // --- Bin pages ---
    blackTitle: "BIONA DUBH – Cinn-latha Cruinneachaidh (Brù & Barabhais)",
    blueTitle: "BIONA GORM – Cinn-latha Cruinneachaidh (Brù & Barabhais)",
    greenTitle: "BIONA UAINE – Cinn-latha Cruinneachaidh (Brù & Barabhais)",

    noData:
      "Cha deach cinn-latha cruinneachaidh bhionaichean a lorg. Feuch ris ath-luchdachadh an duilleag nas fhaide air adhart.",
    errorFetching: "Mearachd a’ faighinn dàta:",

    // --- Bin button labels ---
    blackButton: "Biona Dubh (Sgudal Coitcheann)",
    blueButton: "Biona Gorm (Plastaig is Pàipear)",
    greenButton: "Biona Uaine (Glainne)",

    // --- Back button ---
    back: "← Air ais",

    brueSchedule: "Clàr Bhionaichean Bhrù",
    brueVillages: "Brù: Am Baile-stigh (am baile a-staigh), Pàirc Bhrù",

    barvasSchedule: "Clàr Bhionaichean Bharabhais",
    barvasVillages: "Barabhas: Barabhas a Tuath, Barabhas a Deas, Monard, Pàirc Bharabhais, Na Corners, Heatherhill, Sràid na Locha",
  },
};

export default translations;
