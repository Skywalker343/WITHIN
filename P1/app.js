(() => {
  const STORAGE_KEY = "within-mobile-v1";
  const appRoot = document.getElementById("appRoot");
  const shell = document.getElementById("deviceShell");
  const toastNode = document.getElementById("toast");

  const initialState = {
    screen: "welcome",
    locale: "en",
    stack: [],
    returnTo: "home",
    userName: "Junzhe",
    userEmail: "",
    saved: [],
    visitedHotspots: [],
    chosenValues: [],
    completedStages: [],
    reflections: [],
    reflectionDraft: "",
    searchQuery: "",
    searchFilter: "All",
    selectedStoryId: "future-self",
    activeHotspot: "",
    selectedChoice: "",
    cameraStream: null,
    cameraLive: false,
    screenLight: false,
    paused: false,
    soundOn: false,
    motionOn: false,
    toastTimer: null,
    audioContext: null,
    audioNodes: [],
    vrStartedAt: 0,
    vrTimer: null,
  };

  function readSavedState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { ...initialState, ...saved, stack: [], cameraStream: null, audioContext: null, audioNodes: [], toastTimer: null, vrTimer: null };
    } catch {
      return { ...initialState };
    }
  }
  const state = readSavedState();
  state.screen = "welcome";

  const stories = [
    { id: "future-self", title: "A Room for Becoming", subtitle: "Meet the person you are becoming.", category: "Identity", minutes: 8, art: "", label: "Guided journey", description: "A quiet, spatial reflection on the roles you carry and the qualities that remain yours underneath them. Move through a room of memories, notice what feels true, and leave with one intention for the week ahead.", prompt: "Which part of you feels most like home, even when everything else changes?" },
    { id: "quiet-room", title: "The Quiet Room", subtitle: "Make space for your own voice.", category: "Self-acceptance", minutes: 6, art: "mirror", label: "Mindful space", description: "Step away from the noise of other people's expectations. A slow, gentle experience invites you to notice your inner voice with curiosity instead of judgment.", prompt: "What would you say to yourself if you spoke with the kindness you offer a friend?" },
    { id: "values-motion", title: "Values in Motion", subtitle: "Discover what guides your choices.", category: "Autonomy", minutes: 7, art: "ripple", label: "Interactive story", description: "Follow a trail of small decisions and notice the values hidden inside them. Choose what matters to you, then see how those values connect to your next step.", prompt: "Which value would you like your next decision to make room for?" },
    { id: "listening-space", title: "A Listening Space", subtitle: "Feel the strength of being seen.", category: "Connection", minutes: 5, art: "sunrise", label: "Community reflection", description: "A soft shared space about the people who help you feel understood. Explore how connection can support self-worth without defining it for you.", prompt: "Who helps you remember the person you want to be?" },
    { id: "body-memory", title: "Body of Memory", subtitle: "Notice where your story lives.", category: "Reflection", minutes: 9, art: "", label: "Somatic exercise", description: "Use a series of grounded prompts to notice how work, family, and daily life shape the way you feel in your body. There is no right answer and no need to rush.", prompt: "What does your body notice before your thoughts find the words?" },
  ];

  const values = [
    { id: "curiosity", title: "Curiosity", description: "Space to ask, explore, and keep learning.", icon: "✦", strength: 88 },
    { id: "autonomy", title: "Autonomy", description: "Freedom to choose a direction that feels yours.", icon: "⌁", strength: 74 },
    { id: "connection", title: "Connection", description: "Feeling seen while staying true to yourself.", icon: "◌", strength: 64 },
    { id: "creativity", title: "Creativity", description: "Turning inner ideas into something real.", icon: "✳", strength: 53 },
    { id: "care", title: "Care", description: "Making room for others and for yourself.", icon: "♡", strength: 45 },
  ];

  const hotspots = {
    roles: { eyebrow: "01 · YOUR ROLES", title: "More than a title", body: "The roles you carry matter. They are part of your story, but they do not have to contain all of it. Look for a quality that has stayed with you through every change.", choices: ["Curiosity", "Kindness", "Courage", "Imagination"] },
    values: { eyebrow: "02 · YOUR VALUES", title: "A quiet yes", body: "Think of a recent moment that felt quietly right. What value was present there? Choose the word that feels closest, or simply notice what comes up.", choices: ["Autonomy", "Connection", "Growth", "Calm"] },
    future: { eyebrow: "03 · YOUR NEXT STEP", title: "A direction, not a finish line", body: "You do not need to solve everything today. A small action that honors one of your values is enough to begin moving toward a life that feels more like your own.", choices: ["Make space", "Ask for help", "Try something", "Rest first"] },
  };

  const iconPaths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.5 5.1-5.1 2.5 2.5-5.1z"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15m6-12v15"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1z"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    back: '<path d="m15 18-6-6 6-6"/><path d="M9 12h11"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    play: '<path d="m8 5 12 7-12 7z"/>',
    bookmark: '<path d="M6 4h12v17l-6-4-6 4z"/>',
    heart: '<path d="M20.8 8.8c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7z"/>',
    headset: '<path d="M3 12a9 9 0 0 1 18 0"/><path d="M3 12v5a2 2 0 0 0 2 2h2v-7H5a2 2 0 0 0-2 2zm18 0v5a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.4"/>',
    sound: '<path d="M4 10v4h4l5 4V6l-5 4z"/><path d="M17 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"/>',
    motion: '<path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="8"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9H2v-9a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="3.5"/>',
    flash: '<path d="m13 2-3 8h7l-6 12 2-9H6z"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
    spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    pause: '<path d="M8 5h3v14H8zm5 0h3v14h-3z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4L7.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1L11 7.3h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2z"/>',
    logout: '<path d="M10 17l5-5-5-5m5 5H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
  };

  function icon(name, size = 18) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.spark}</svg>`;
  }
  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }
  function persist() {
    const snapshot = {};
    ["locale", "userName", "userEmail", "saved", "visitedHotspots", "chosenValues", "completedStages", "reflections", "reflectionDraft"].forEach((key) => { snapshot[key] = state[key]; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* Private browsing can disable storage. */ }
  }
  function toast(message) {
    toastNode.textContent = window.withinI18n?.translateText(message, state.locale) || message;
    toastNode.classList.add("visible");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toastNode.classList.remove("visible"), 2500);
  }
  function navBar(active) {
    const tabs = [["home", "Explore", "compass"], ["journey", "Journey", "map"], ["value", "My values", "spark"], ["profile", "Profile", "user"]];
    return `<nav class="bottom-nav" aria-label="Main navigation">${tabs.map(([route, label, glyph]) => `<button class="nav-item ${active === route ? "active" : ""}" data-action="nav" data-route="${route}" aria-label="${label}" ${active === route ? 'aria-current="page"' : ""}>${icon(glyph)}<span>${label}</span></button>`).join("")}</nav>`;
  }
  function shellScreen(content, active = "home", showNav = true, screenClass = "") {
    return `<section class="screen ${screenClass}">${content}${showNav ? navBar(active) : ""}</section>`;
  }
  function welcomeView() {
    return `<section class="screen welcome">
      <div class="welcome-brand"><span class="logo-mark"><svg viewBox="0 0 28 28" fill="none"><path d="M3 14c4.4-7.1 8.4-7.1 11 0s6.6 7.1 11 0" stroke="white" stroke-width="2.6" stroke-linecap="round"/><path d="M3 19c4.4-7.1 8.4-7.1 11 0s6.6 7.1 11 0" stroke="white" stroke-width="1.2" stroke-linecap="round" opacity=".6"/></svg></span>WITHIN</div>
      <div class="welcome-art" aria-hidden="true"><div class="orb-art"><div class="orb-core"></div><div class="orb-orbit"></div><div class="orb-orbit two"></div><i class="orb-star one"></i><i class="orb-star two"></i><i class="orb-star three"></i></div></div>
      <div class="welcome-copy"><span class="eyebrow">A space to hear yourself</span><h1>Find your<br />own center.</h1><p>Explore what matters, notice what feels like you, and carry that clarity into everyday life.</p></div>
      <div class="welcome-actions"><button class="primary-btn" data-action="begin">Begin your journey ${icon("arrow", 16)}</button><button class="text-button" data-action="open-login">I already have an account</button><span class="permission-note" style="color:#998ba2">A gentle, private space. Move at your own pace.</span></div>
    </section>`;
  }
  function loginView() {
    return `<section class="screen login-screen">
      <button class="icon-btn login-back" data-action="back" aria-label="Go back">${icon("back")}</button>
      <div class="login-logo"><span class="logo-mark">${icon("spark", 22)}</span>WITHIN</div>
      <div class="login-copy"><h1>Welcome back</h1><p>Return to the space you are creating for yourself.</p></div>
      <form id="login-form">
        <div class="form-field"><label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></div>
        <div class="form-field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" minlength="4" placeholder="At least 4 characters" required /></div>
        <button class="primary-btn" type="submit">Continue ${icon("arrow", 16)}</button>
      </form>
      <p class="login-terms">This portfolio prototype keeps your demo profile on this device only. No account is sent to a server.</p>
      <button class="text-button" data-action="guest" style="align-self:center;margin-top:11px">Continue as a guest</button>
    </section>`;
  }
  function storyCard(story) {
    return `<button class="story-card" data-action="open-story" data-id="${story.id}">
      <span class="story-art ${story.art}"></span><span class="story-meta"><strong>${escapeHtml(story.title)}</strong><span>${escapeHtml(story.subtitle)}</span><em>${escapeHtml(story.category)} · ${story.minutes} min</em></span><span class="story-arrow">${icon("chevron", 16)}</span>
    </button>`;
  }
  function exploreView() {
    const recent = stories.slice(0, 3).map(storyCard).join("");
    return shellScreen(`<div class="screen-content">
      <header class="app-header"><span class="app-brand"><span class="logo-mark">${icon("spark", 17)}</span>WITHIN</span><span class="header-actions"><button class="icon-btn" data-action="search" aria-label="Search experiences">${icon("search")}</button><button class="icon-btn" data-action="profile" aria-label="Open profile">${icon("user")}</button></span></header>
      <div class="pad" style="padding-top:5px">
        <div class="greeting"><div class="eyebrow">A moment for yourself</div><h1>Good evening, ${escapeHtml(state.userName.split(" ")[0])}.</h1><p>What would you like to understand a little better?</p></div>
        <article class="hero-card"><div class="hero-glow"></div><div class="hero-topline"><span></span>YOUR INNER SPACE · 8 MIN</div><h2>Meet the person<br />you are becoming.</h2><p>A guided journey through the values that make a life feel like your own.</p><button class="hero-cta" data-action="open-story" data-id="future-self">Enter the experience ${icon("arrow", 13)}</button></article>
        <div class="section-heading"><h2>Start with a feeling</h2><button data-action="nav" data-route="journey">Your journey</button></div>
        <div class="quick-actions">
          <button class="quick-card" data-action="scan"><span class="round-icon">${icon("camera")}</span><span>Scan a space</span></button>
          <button class="quick-card" data-action="nav" data-route="value"><span class="round-icon">${icon("spark")}</span><span>My values</span></button>
          <button class="quick-card" data-action="nav" data-route="journey"><span class="round-icon">${icon("map")}</span><span>My journey</span></button>
        </div>
        <div class="section-heading"><h2>Spaces to explore</h2><button data-action="search">See all</button></div>
        <div class="story-list">${recent}</div>
        <div class="section-heading"><h2>Continue reflecting</h2><button data-action="nav" data-route="value">Open map</button></div>
        <button class="story-card" style="width:100%;grid-template-columns:42px 1fr 25px" data-action="nav" data-route="value"><span class="round-icon">${icon("heart")}</span><span class="story-meta"><strong>Your personal value map</strong><span>Notice what is already growing in you.</span><em>${state.chosenValues.length || 2} values · updated today</em></span><span class="story-arrow">${icon("chevron", 16)}</span></button>
      </div>
    </div>`, "home");
  }
  function filteredStories() {
    const query = state.searchQuery.trim().toLowerCase();
    return stories.filter((story) => (state.searchFilter === "All" || story.category === state.searchFilter) && (!query || `${story.title} ${story.subtitle} ${story.category} ${story.description}`.toLowerCase().includes(query)));
  }
  function searchResults() {
    const results = filteredStories();
    const node = document.getElementById("search-results");
    if (!node) return;
    node.innerHTML = results.length ? results.map(storyCard).join("") : `<div class="empty-state">No spaces found yet.<br />Try another word or category.</div>`;
    window.withinI18n?.translateTree(node, state.locale);
  }
  function searchView() {
    const filters = ["All", "Identity", "Self-acceptance", "Autonomy", "Connection", "Reflection"];
    return shellScreen(`<div class="screen-content">
      <header class="sub-header"><button class="icon-btn" data-action="back" aria-label="Go back">${icon("back")}</button><h1>Explore spaces</h1><button class="icon-btn" data-action="scan" aria-label="Scan a space">${icon("camera")}</button></header>
      <label class="search-box">${icon("search")}<input id="search-input" class="search-input" type="search" value="${escapeHtml(state.searchQuery)}" placeholder="Search a feeling, value, or story" /></label>
      <div class="filter-chips" role="group" aria-label="Filter experiences">${filters.map((filter) => `<button class="filter-chip ${state.searchFilter === filter ? "selected" : ""}" data-action="filter" data-filter="${filter}">${filter}</button>`).join("")}</div>
      <div class="pad" style="padding-top:12px"><div class="section-heading" style="margin-top:4px"><h2>For your next pause</h2><span class="muted small" id="result-count"></span></div><div class="story-list" id="search-results"></div></div>
    </div>`, "home");
  }
  function detailView() {
    const story = stories.find((item) => item.id === state.selectedStoryId) || stories[0];
    const saved = state.saved.includes(story.id);
    return shellScreen(`<div class="screen-content">
      <header class="sub-header"><button class="icon-btn" data-action="back" aria-label="Go back">${icon("back")}</button><h1>Experience</h1><button class="icon-btn" data-action="save-story" data-id="${story.id}" aria-label="${saved ? "Remove from saved" : "Save experience"}">${icon("bookmark")}</button></header>
      <div class="detail-hero"><span class="detail-orb"></span><span class="detail-label">${escapeHtml(story.label)}</span></div>
      <div class="detail-title"><div class="title-copy"><h1>${escapeHtml(story.title)}</h1><p>${escapeHtml(story.subtitle)}</p></div><button class="icon-btn" data-action="share-story" data-id="${story.id}" aria-label="Share this experience">${icon("share")}</button></div>
      <div class="detail-stats"><span>${icon("clock")} ${story.minutes} min</span><span>${icon("headset")} Phone or headset</span><span>${icon("spark")} ${escapeHtml(story.category)}</span></div>
      <p class="detail-copy">${escapeHtml(story.description)}</p>
      <div class="detail-prompt"><strong>Take this question with you</strong><p>${escapeHtml(story.prompt)}</p></div>
      <div class="detail-actions"><button class="primary-btn" data-action="start-vr">Begin in your space ${icon("arrow", 15)}</button><button class="secondary-btn" data-action="save-story" data-id="${story.id}" aria-label="${saved ? "Unsave" : "Save"}">${icon(saved ? "check" : "bookmark", 17)}</button></div>
    </div>`, "home", false);
  }

  function journeyView() {
    const stages = [
      ["Arrive", "Leave a little room for yourself."],
      ["Notice your roles", "Separate who you are from what you do."],
      ["Name what matters", "Recognize the values already guiding you."],
      ["Choose a direction", "Turn a feeling into one gentle next step."],
      ["Carry it forward", "Bring what you noticed into daily life."],
    ];
    const currentStage = Math.min(state.completedStages.length + 1, stages.length);
    const progress = Math.min(100, Math.round(state.completedStages.length / stages.length * 100));
    return shellScreen(`<div class="screen-content">
      <div class="page-title"><div class="eyebrow">A path at your pace</div><h1>Your journey</h1><p>Small moments of noticing can change how you move through the day.</p></div>
      <div class="journey-banner"><div class="eyebrow">CURRENT CHAPTER</div><h2>${state.completedStages.length ? "Keep following what feels true" : "Begin with a little curiosity"}</h2><p>${state.completedStages.length ? "Your reflections are adding shape to your personal value map." : "There is nothing to get right. Start wherever you are."}</p><div class="progress-track"><span style="width:${progress}%"></span></div><div class="progress-caption"><span>${state.completedStages.length} of ${stages.length} moments</span><span>${progress}%</span></div></div>
      <div class="timeline">${stages.map(([title, desc], index) => { const done = state.completedStages.includes(index); const current = !done && index === currentStage - 1; return `<button class="timeline-item ${done ? "complete" : current ? "current" : ""}" data-action="journey-stage" data-index="${index}"><span class="timeline-dot">${done ? icon("check", 13) : String(index + 1).padStart(2, "0")}</span><span class="timeline-copy"><strong>${title}</strong><span>${desc}</span></span><span class="timeline-chevron">${icon("chevron", 15)}</span></button>`; }).join("")}</div>
      <div class="pad" style="padding-top:0"><button class="primary-btn" style="width:100%" data-action="open-story" data-id="future-self">${state.completedStages.length ? "Continue your journey" : "Start your first experience"} ${icon("arrow", 15)}</button></div>
    </div>`, "journey");
  }

  function valueView() {
    const savedReflection = state.reflections[state.reflections.length - 1] || "";
    const ranked = [...values].sort((a, b) => (state.chosenValues.includes(b.title) ? 1000 : b.strength) - (state.chosenValues.includes(a.title) ? 1000 : a.strength));
    return shellScreen(`<div class="screen-content">
      <div class="page-title"><div class="eyebrow">A clearer picture of you</div><h1>My value map</h1><p>Your values are not a score. They are signals that help you recognize what feels meaningful.</p></div>
      <div class="value-overview"><div class="value-orbit"><span>YOU</span></div><div class="value-score"><h2>Personal insight</h2><strong>${state.chosenValues.length ? `${state.chosenValues.length} noticed` : "Growing"}</strong><p>${state.chosenValues.length ? "Your choices are beginning to form a pattern." : "Explore a space to start naming what matters."}</p></div></div>
      <div class="section-heading" style="margin:18px 22px 11px"><h2>Values you may recognize</h2><button data-action="open-story" data-id="values-motion">Explore</button></div>
      <div class="value-list">${ranked.map((value) => { const chosen = state.chosenValues.includes(value.title); return `<button class="value-row" data-action="value-detail" data-id="${value.id}"><span class="value-icon">${value.icon}</span><span><strong>${value.title}${chosen ? " · noticed" : ""}</strong><span>${value.description}</span></span><span class="value-bar"><i style="width:${value.strength}%"></i></span></button>`; }).join("")}</div>
      <div class="reflection-card"><h3>A thought to keep</h3><p>What feels important to remember from what you explored?</p><textarea class="reflection-input" id="value-reflection" placeholder="Write a few words, or leave this for later…">${escapeHtml(savedReflection || state.reflectionDraft)}</textarea><button class="primary-btn" data-action="save-reflection">Save this reflection ${icon("check", 14)}</button></div>
      <div class="pad" style="padding-top:0"><button class="secondary-btn" style="width:100%" data-action="share-map">${icon("share", 15)} Share a value map</button></div>
    </div>`, "value");
  }

  function profileView() {
    const initials = (state.userName || "J").split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
    const days = [["M", false, "一"], ["T", true, "二"], ["W", false, "三"], ["T", true, "四"], ["F", false, "五"], ["S", true, "六"], ["S", false, "日"]];
    return shellScreen(`<div class="screen-content">
      <div class="page-title"><div class="eyebrow">A little more about you</div><h1>Your space</h1></div>
      <div class="profile-top"><div class="avatar">${escapeHtml(initials)}</div><div class="profile-info"><h1>${escapeHtml(state.userName)}</h1><p>${escapeHtml(state.userEmail || "Your private reflection space")}</p></div><button class="profile-edit" data-action="edit-profile">${icon("edit", 14)} Edit</button></div>
      <div class="stat-grid"><div class="stat-cell"><strong>${state.completedStages.length}</strong><span>moments explored</span></div><div class="stat-cell"><strong>${state.chosenValues.length || 2}</strong><span>values noticed</span></div><div class="stat-cell"><strong>${state.reflections.length}</strong><span>reflections</span></div></div>
      <div class="profile-card"><div class="profile-card-head"><strong>Your gentle rhythm</strong><span class="muted small">This week</span></div><div class="week-row">${days.map(([day, active, dayZh]) => `<span class="day-cell ${active ? "done" : ""}"><i>${active ? icon("check", 12) : "·"}</i><span class="day-name" data-en-day="${day}" data-zh-day="${dayZh}">${day}</span></span>`).join("")}</div></div>
      <div class="section-heading" style="margin:23px 22px 10px"><h2>Your collection</h2><button data-action="collection">See all</button></div>
      <div class="menu-list">
        <button class="menu-row" data-action="collection"><span class="round-icon">${icon("bookmark", 16)}</span><strong>Saved experiences</strong><span class="muted small">${state.saved.length}</span>${icon("chevron", 15)}</button>
        <button class="menu-row" data-action="nav" data-route="value"><span class="round-icon">${icon("spark", 16)}</span><strong>My reflections</strong><span class="muted small">${state.reflections.length}</span>${icon("chevron", 15)}</button>
        <button class="menu-row" data-action="privacy"><span class="round-icon">${icon("lock", 16)}</span><strong>Privacy and data</strong>${icon("chevron", 15)}</button>
        <button class="menu-row" data-action="about"><span class="round-icon">${icon("info", 16)}</span><strong>About WITHIN</strong>${icon("chevron", 15)}</button>
        <button class="menu-row" data-action="open-login"><span class="round-icon">${icon("user", 16)}</span><strong>${state.userEmail ? "Switch demo account" : "Sign in or create a profile"}</strong>${icon("chevron", 15)}</button>
      </div>
    </div>`, "profile");
  }

  function scanView() {
    return shellScreen(`<div class="screen-content" style="display:flex;flex-direction:column">
      <header class="sub-header"><button class="icon-btn" data-action="back" aria-label="Go back">${icon("back")}</button><h1>Scan a space</h1><button class="icon-btn" data-action="scan-help" aria-label="Scan help">${icon("info")}</button></header>
      <div class="scan-stage ${state.cameraLive ? "camera-live scanning" : ""} ${state.screenLight ? "screen-lit" : ""}" id="scan-stage">
        <video class="scan-video" id="scan-video" playsinline muted></video><span class="scan-orb"></span><div class="scan-overlay"><span class="scan-message" id="scan-message">Point your camera toward a WITHIN installation,<br />or explore the demo space.</span><div class="scan-guide"></div><div class="scan-controls"><button class="scan-control" data-action="start-camera"><span class="round-icon">${icon("camera", 18)}</span>Camera</button><button class="scan-control" data-action="screen-light"><span class="round-icon">${icon("flash", 18)}</span>Screen light</button><button class="scan-control" data-action="scan-help"><span class="round-icon">${icon("info", 18)}</span>How it works</button></div></div>
      </div>
      <div class="scan-description"><h2>Find an installation nearby</h2><p>Scan a project marker to open its reflection. Camera permission is only used for this moment.</p></div>
      <div class="scan-bottom"><button class="primary-btn" data-action="scan-demo">Explore the demo space ${icon("arrow", 15)}</button><button class="secondary-btn" data-action="start-camera">Use my camera</button></div>
    </div>`, "home", false);
  }

  function sceneMarkup() {
    const positions = [[-2.2, 2.7, -7], [2.5, 2.45, -7], [.1, 1.9, -9]];
    const names = ["roles", "values", "future"];
    const labels = ["YOUR ROLES", "YOUR VALUES", "NEXT STEP"];
    const stars = Array.from({ length: 34 }, (_, i) => {
      const x = ((i * 37) % 100) / 12 - 4.15;
      const y = ((i * 19 + 13) % 100) / 17 + .3;
      const z = -3.5 - ((i * 23) % 110) / 13;
      const radius = i % 8 === 0 ? .035 : .018;
      return `<a-sphere position="${x.toFixed(2)} ${y.toFixed(2)} ${z.toFixed(2)}" radius="${radius}" material="color:#ead6ff; emissive:#b98ad4; emissiveIntensity:.7; transparent:true; opacity:.85"></a-sphere>`;
    }).join("");
    const marks = names.map((name, index) => `<a-entity class="hotspot-node" data-hotspot="${name}" position="${positions[index].join(" ")}"><a-sphere class="hotspot" data-hotspot="${name}" radius=".28" material="color:#d8b2ec; emissive:#b77bd8; emissiveIntensity:1; transparent:true; opacity:.82" animation="property:scale; dir:alternate; dur:${1500 + index * 260}; easing:easeInOutSine; loop:true; to:1.16 1.16 1.16"></a-sphere><a-torus radius=".43" radius-tubular=".012" rotation="90 0 0" material="color:#e8d2f6; emissive:#a873c5; emissiveIntensity:.8; transparent:true; opacity:.72"></a-torus><a-text value="${labels[index]}" align="center" color="#f8efff" width="3.2" position="0 .62 0" shader="msdf" opacity=".9"></a-text></a-entity>`).join("");
    return `<a-scene id="vrScene" class="vr-scene" embedded="true" vr-mode-ui="enabled:false" device-orientation-permission-ui="enabled:false" renderer="antialias:true; colorManagement:true; physicallyCorrectLights:false" loading-screen="enabled:false" background="color:#16111e">
      <a-assets></a-assets><a-sky color="#17111f"></a-sky>
      <a-entity light="type:ambient; color:#9d81b5; intensity:.76"></a-entity><a-entity light="type:point; color:#d6a7ef; intensity:1.9; distance:20" position="0 3 -4"></a-entity>
      <a-entity position="0 0 -5"><a-torus radius="3.1" radius-tubular=".018" rotation="72 0 0" material="color:#aa80c7; emissive:#714b8c; emissiveIntensity:.8; transparent:true; opacity:.7"></a-torus><a-torus radius="4.15" radius-tubular=".012" rotation="78 0 13" material="color:#d3b5e5; emissive:#9a71af; emissiveIntensity:.65; transparent:true; opacity:.44"></a-torus></a-entity>
      <a-entity position="0 -1.4 -5" rotation="-90 0 0"><a-circle radius="5.5" segments="80" material="color:#56406b; emissive:#30233c; emissiveIntensity:.24; transparent:true; opacity:.55"></a-circle><a-torus radius="3.4" radius-tubular=".015" material="color:#bd9ccc; emissive:#926ca7; emissiveIntensity:.7; transparent:true; opacity:.8"></a-torus></a-entity>
      ${stars}${marks}
      <a-camera id="vrCamera" position="0 1.6 0" look-controls="touchEnabled:true; magicWindowTrackingEnabled:true; pointerLockEnabled:false" wasd-controls-enabled="false" cursor="rayOrigin:mouse; fuse:false" raycaster="objects:.hotspot; far:20; interval:100"></a-camera>
    </a-scene>`;
  }
  function vrSheetMarkup() {
    if (!state.activeHotspot) return "";
    const data = hotspots[state.activeHotspot];
    if (!data) return "";
    return `<div class="vr-sheet-backdrop" data-action="close-sheet"><section class="vr-sheet" role="dialog" aria-modal="true" aria-label="Reflection prompt" data-sheet-body><div class="sheet-grab"></div><div class="eyebrow">${data.eyebrow}</div><h2>${data.title}</h2><p>${data.body}</p><div class="choice-grid">${data.choices.map((choice) => `<button class="choice-btn ${state.selectedChoice === choice ? "selected" : ""}" data-action="choose-value" data-choice="${choice}">${choice}</button>`).join("")}</div><button class="primary-btn" data-action="confirm-hotspot">Keep this thought ${icon("arrow", 14)}</button></section></div>`;
  }
  function updateVrCounter() {
    const counter = document.getElementById("vr-counter");
    if (counter) counter.textContent = `${state.visitedHotspots.length} / 3 MOMENTS`;
    document.querySelectorAll(".hotspot-chip").forEach((chip) => chip.classList.toggle("visited", state.visitedHotspots.includes(chip.dataset.hotspot)));
    const finish = document.getElementById("finish-vr");
    if (finish) {
      finish.disabled = state.visitedHotspots.length < 2;
      finish.textContent = state.visitedHotspots.length >= 2 ? "Finish this reflection" : "Notice two lights to continue";
      if (state.visitedHotspots.length >= 2) finish.innerHTML = `Finish this reflection ${icon("arrow", 14)}`;
    }
    window.withinI18n?.translateTree(appRoot, state.locale);
  }
  function vrView() {
    const visited = state.visitedHotspots.length;
    return `<section class="screen immersive-screen"><div class="vr-screen">
      <div class="vr-fallback" id="vr-fallback" aria-hidden="true"><div class="vr-rays"></div><div class="vr-horizon"></div><div class="vr-stars"></div></div>
      <div class="vr-scene" id="vr-scene-host">${sceneMarkup()}</div>
      <div class="vr-topbar"><button class="icon-btn" data-action="leave-vr" aria-label="Leave experience">${icon("close")}</button><span class="vr-counter" id="vr-counter">${visited} / 3 MOMENTS</span><span class="vr-top-actions"><button class="language-toggle vr-language" data-action="toggle-language" aria-label="Switch language">中文</button><button class="icon-btn" data-action="reset-view" aria-label="Reset view">${icon("refresh")}</button></span></div>
      <div class="vr-intro"><div class="eyebrow">WITHIN · AN INNER SPACE</div><h1>Notice what stays.</h1><p>Look around, then choose a light to explore a part of yourself.</p></div>
      <div class="hotspot-dock">${Object.keys(hotspots).map((key) => `<button class="hotspot-chip ${state.visitedHotspots.includes(key) ? "visited" : ""}" data-action="hotspot" data-hotspot="${key}">${hotspots[key].title}</button>`).join("")}</div>
      <div class="vr-bottom"><button id="finish-vr" class="primary-btn" data-action="finish-vr" ${visited < 2 ? "disabled" : ""}>${visited >= 2 ? `Finish this reflection ${icon("arrow", 14)}` : "Notice two lights to continue"}</button><div class="vr-tools"><button class="vr-tool" data-action="enter-xr">${icon("headset", 14)} Headset mode</button><button class="vr-tool" data-action="motion">${icon("motion", 14)} ${state.motionOn ? "Motion on" : "Enable motion"}</button><button class="vr-tool" data-action="sound">${icon("sound", 14)} ${state.soundOn ? "Sound on" : "Soundscape"}</button></div></div>
      <div id="vr-sheet-slot">${vrSheetMarkup()}</div>
    </div></section>`;
  }
  function completeView() {
    const labels = state.chosenValues.slice(-4);
    const summary = labels.length ? labels : ["Curiosity", "Self-acceptance"];
    const savedReflection = state.reflectionDraft;
    return `<section class="screen complete-screen"><div class="screen-content" style="display:flex;flex-direction:column;align-items:center;justify-content:center;overflow-y:auto;padding:12px 0 30px;width:100%">
      <div class="complete-orb"><span>${icon("check", 24)}</span></div><div class="eyebrow">A MOMENT WELL SPENT</div><h1>You made a little room.</h1><p>What you noticed belongs to you. Carry just one small part of it into the rest of your day.</p>
      <div class="completed-values">${summary.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</div>
      <div class="reflection-card"><h3>One thing I want to remember…</h3><p>This stays in your personal space on this device.</p><textarea class="reflection-input" id="complete-reflection" placeholder="A word, a feeling, or a next step…">${escapeHtml(savedReflection)}</textarea></div>
      <button class="primary-btn" data-action="save-completion">Save and return ${icon("arrow", 15)}</button><button class="text-button" data-action="nav" data-route="value">See my value map</button>
    </div></section>`;
  }

  function render() {
    document.body.classList.toggle("is-immersive", state.screen === "vr");
    shell.classList.toggle("is-immersive", state.screen === "vr");
    switch (state.screen) {
      case "welcome": appRoot.innerHTML = welcomeView(); break;
      case "login": appRoot.innerHTML = loginView(); break;
      case "home": appRoot.innerHTML = exploreView(); break;
      case "search": appRoot.innerHTML = searchView(); searchResults(); break;
      case "detail": appRoot.innerHTML = detailView(); break;
      case "journey": appRoot.innerHTML = journeyView(); break;
      case "value": appRoot.innerHTML = valueView(); break;
      case "profile": appRoot.innerHTML = profileView(); break;
      case "scan": appRoot.innerHTML = scanView(); break;
      case "vr": appRoot.innerHTML = vrView(); attachSceneEvents(); break;
      case "complete": appRoot.innerHTML = completeView(); break;
      default: state.screen = "home"; appRoot.innerHTML = exploreView();
    }
    if (state.screen === "search") {
      const count = document.getElementById("result-count");
      if (count) count.textContent = `${filteredStories().length} spaces`;
    }
    applyLanguage();
  }

  function applyLanguage() {
    document.documentElement.lang = state.locale === "zh" ? "zh-CN" : "en";
    document.title = state.locale === "zh" ? "WITHIN — 找到内心的中心" : "WITHIN — Find your own center";
    window.withinI18n?.translateTree(appRoot, state.locale);
    window.withinI18n?.translateTree(document.querySelector(".status-bar"), state.locale);
    document.querySelectorAll("[data-action='toggle-language']").forEach((button) => {
      button.textContent = state.locale === "zh" ? "EN" : "中文";
      button.setAttribute("aria-label", state.locale === "zh" ? "切换到英文" : "Switch to Chinese");
      button.title = state.locale === "zh" ? "切换语言" : "Switch language";
    });
    document.querySelectorAll(".day-name").forEach((node) => { node.textContent = state.locale === "zh" ? node.dataset.zhDay : node.dataset.enDay; });
  }

  function toggleLanguage() {
    state.locale = state.locale === "en" ? "zh" : "en";
    persist();
    applyLanguage();
    toast(state.locale === "zh" ? "已切换为简体中文。" : "Language set to English.");
  }

  function navigate(route, { push = true, keepDraft = true } = {}) {
    if (push && state.screen !== route) state.stack.push(state.screen);
    if (state.screen === "scan" && route !== "scan") stopCamera();
    if (state.screen === "vr" && route !== "vr") stopSoundscape();
    state.screen = route;
    state.activeHotspot = "";
    state.selectedChoice = "";
    if (!keepDraft) state.reflectionDraft = "";
    persist();
    render();
    if (route === "vr") setTimeout(initializeScene, 350);
    if (route === "scan" && state.cameraLive) setTimeout(startCamera, 100);
  }
  function goBack() {
    const previous = state.stack.pop();
    if (previous) {
      navigate(previous, { push: false });
    } else {
      navigate("home", { push: false });
    }
  }
  function openStory(id) {
    if (id) state.selectedStoryId = id;
    state.returnTo = state.screen;
    navigate("detail");
  }
  function startExperience() {
    state.returnTo = state.screen === "detail" ? "detail" : "home";
    state.vrStartedAt = Date.now();
    navigate("vr");
  }
  function openHotspot(key) {
    if (!hotspots[key]) return;
    state.activeHotspot = key;
    state.selectedChoice = "";
    const slot = document.getElementById("vr-sheet-slot");
    if (slot) { slot.innerHTML = vrSheetMarkup(); window.withinI18n?.translateTree(slot, state.locale); }
  }
  function confirmHotspot() {
    if (!state.activeHotspot) return;
    const value = state.selectedChoice || hotspots[state.activeHotspot].choices[0];
    if (!state.visitedHotspots.includes(state.activeHotspot)) state.visitedHotspots.push(state.activeHotspot);
    if (!state.chosenValues.includes(value)) state.chosenValues.push(value);
    state.completedStages = [...new Set([...state.completedStages, Object.keys(hotspots).indexOf(state.activeHotspot) + 1])];
    persist();
    state.activeHotspot = "";
    const slot = document.getElementById("vr-sheet-slot");
    if (slot) slot.innerHTML = "";
    updateVrCounter();
    toast(`You kept “${value}” in view.`);
  }

  function attachSceneEvents() {
    setTimeout(() => {
      const scene = document.getElementById("vrScene");
      if (!scene || !window.AFRAME) return;
      const attach = () => {
        scene.querySelectorAll(".hotspot").forEach((node) => {
          if (node.dataset.bound) return;
          node.dataset.bound = "true";
          node.addEventListener("click", () => openHotspot(node.dataset.hotspot));
        });
        const fallback = document.getElementById("vr-fallback");
        if (fallback) fallback.style.opacity = ".32";
      };
      if (scene.hasLoaded) attach(); else scene.addEventListener("loaded", attach, { once: true });
    }, 120);
  }
  function initializeScene() {
    if (state.screen !== "vr") return;
    const scene = document.getElementById("vrScene");
    if (!scene) return;
    if (window.AFRAME) {
      attachSceneEvents();
      if (scene.resize) scene.resize();
      window.dispatchEvent(new Event("resize"));
    } else {
      const fallback = document.getElementById("vr-fallback");
      if (fallback) fallback.style.opacity = "1";
      toast("Touch and drag to look around this demo space.");
    }
    updateVrCounter();
  }
  function resetView() {
    const camera = document.getElementById("vrCamera");
    if (camera && camera.components["look-controls"]) {
      const controls = camera.components["look-controls"];
      if (controls.pitchObject) controls.pitchObject.rotation.set(0, 0, 0);
      if (controls.yawObject) controls.yawObject.rotation.set(0, 0, 0);
      if (camera.object3D) camera.object3D.rotation.set(0, 0, 0);
    }
    const fallback = document.getElementById("vr-fallback");
    if (fallback) fallback.style.setProperty("--look-x", "0deg");
    toast("View reset to the center.");
  }
  async function enterXr() {
    const scene = document.getElementById("vrScene");
    if (!scene || !window.AFRAME) {
      toast("Headset mode needs a WebXR-compatible browser and a secure connection.");
      return;
    }
    try {
      if (navigator.xr && !(await navigator.xr.isSessionSupported("immersive-vr"))) {
        toast("This browser does not support immersive VR. Touch exploration is ready here.");
        return;
      }
      await scene.enterVR();
    } catch (error) {
      toast("Headset mode is unavailable here. You can still explore by touch.");
    }
  }
  async function enableMotion() {
    try {
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") { toast("Motion access was not enabled. Touch controls are still available."); return; }
      }
      state.motionOn = true;
      toast("Motion controls enabled. Move your phone gently to look around.");
      render();
      initializeScene();
    } catch {
      toast("Motion controls are unavailable. Drag the scene to look around.");
    }
  }
  function stopSoundscape() {
    state.soundOn = false;
    state.audioNodes.forEach((node) => { try { node.stop(); } catch { /* Already stopped. */ } });
    state.audioNodes = [];
    if (state.audioContext) { state.audioContext.close().catch(() => {}); state.audioContext = null; }
  }
  async function toggleSoundscape() {
    if (state.soundOn) {
      stopSoundscape(); render(); toast("Soundscape paused."); return;
    }
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) { toast("This browser does not support ambient sound."); return; }
      const context = new AudioContextClass();
      await context.resume();
      const master = context.createGain(); master.gain.value = .018; master.connect(context.destination);
      const nodes = [110, 164.81, 220].map((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = index === 1 ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        gain.gain.value = index === 2 ? .17 : .35;
        oscillator.connect(gain); gain.connect(master); oscillator.start();
        return oscillator;
      });
      state.audioContext = context; state.audioNodes = nodes; state.soundOn = true;
      render(); initializeScene(); toast("A soft ambient tone is playing.");
    } catch {
      toast("Sound could not start on this device.");
    }
  }

  async function startCamera() {
    const stage = document.getElementById("scan-stage");
    const message = document.getElementById("scan-message");
    const video = document.getElementById("scan-video");
    if (!navigator.mediaDevices?.getUserMedia) {
      toast("Camera access needs a secure browser connection. Try the demo space instead.");
      if (message) message.innerHTML = "Camera access is unavailable here.<br />The demo space is ready below.";
      window.withinI18n?.translateTree(stage, state.locale);
      return;
    }
    try {
      if (state.cameraStream) stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      state.cameraStream = stream; state.cameraLive = true;
      if (video) { video.srcObject = stream; await video.play(); }
      if (stage) stage.classList.add("camera-live", "scanning");
      if (message) message.textContent = "Slowly look around for a WITHIN installation marker.";
      window.withinI18n?.translateTree(stage, state.locale);
      toast("Camera is ready. Your video stays in this tab.");
      watchForCode(video);
    } catch (error) {
      if (message) message.innerHTML = "Camera permission was not available.<br />You can still explore the demo space.";
      window.withinI18n?.translateTree(stage, state.locale);
      toast(error?.name === "NotAllowedError" ? "Camera permission was declined." : "Could not open the camera on this device.");
    }
  }
  async function watchForCode(video) {
    if (!video || !("BarcodeDetector" in window)) return;
    try {
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      let active = true;
      const stopWatch = () => { active = false; };
      state.stopCodeWatch = stopWatch;
      while (active && state.cameraLive && video.readyState >= 2) {
        const codes = await detector.detect(video);
        if (codes.length) {
          const label = (codes[0].rawValue || "WITHIN installation").slice(0, 34);
          toast(`Marker found: ${label}`);
          const message = document.getElementById("scan-message");
          if (message) message.textContent = "Marker found. Choose the demo space below to continue.";
          window.withinI18n?.translateTree(message, state.locale);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    } catch { /* QR detection is optional and browser-dependent. */ }
  }
  function stopCamera() {
    if (state.stopCodeWatch) { state.stopCodeWatch(); state.stopCodeWatch = null; }
    if (state.cameraStream) state.cameraStream.getTracks().forEach((track) => track.stop());
    state.cameraStream = null; state.cameraLive = false;
  }
  function setScreenLight() {
    state.screenLight = !state.screenLight;
    const stage = document.getElementById("scan-stage");
    if (stage) stage.style.filter = state.screenLight ? "brightness(1.35)" : "";
    toast(state.screenLight ? "Screen fill light is on." : "Screen fill light is off.");
  }

  function openModal(title, body, actions = []) {
    const existing = document.querySelector(".modal-backdrop");
    if (existing) existing.remove();
    const node = document.createElement("div");
    node.className = "modal-backdrop";
    node.innerHTML = `<section class="modal" role="dialog" aria-modal="true"><button class="icon-btn modal-close" data-action="close-modal" aria-label="Close">${icon("close", 16)}</button><h2>${title}</h2><p>${body}</p>${actions.map((action) => `<button class="${action.className || "primary-btn"}" data-action="${action.action}">${action.label}</button>`).join("")}</section>`;
    appRoot.appendChild(node);
    window.withinI18n?.translateTree(node, state.locale);
  }
  function shareText(text) {
    let sharedText = text;
    if (state.locale === "zh") {
      const story = stories.find((item) => text.startsWith(`${item.title} — `));
      if (story) sharedText = `${window.withinI18n.translateText(story.title, "zh")} — ${window.withinI18n.translateText(story.subtitle, "zh")}\n和 WITHIN 一起探索。`;
      else if (text.startsWith("My WITHIN value map: ")) {
        const selected = (state.chosenValues.length ? state.chosenValues : ["Curiosity", "Self-acceptance"])
          .map((value) => window.withinI18n.translateText(value, "zh")).join("、");
        sharedText = `我的 WITHIN 价值地图：${selected}。`;
      }
    }
    if (navigator.share) return navigator.share({ title: "WITHIN", text: sharedText }).catch(() => {});
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(sharedText).then(() => toast("Reflection copied to clipboard."), () => toast("Sharing is not available in this browser."));
    toast("Sharing is not available in this browser.");
  }
  function saveReflection(text) {
    const clean = text.trim();
    if (!clean) { toast("Write a thought first, or leave it for another time."); return; }
    state.reflectionDraft = clean;
    if (state.reflections[state.reflections.length - 1] !== clean) state.reflections.push(clean);
    persist(); toast("Reflection saved on this device.");
  }
  function finishExperience() {
    state.completedStages = [...new Set([...state.completedStages, 0])];
    navigate("complete");
  }

  appRoot.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const { action, route, id, hotspot, choice, filter, index } = target.dataset;
    switch (action) {
      case "begin": state.stack = []; navigate("home", { push: false }); break;
      case "toggle-language": toggleLanguage(); break;
      case "open-login": navigate("login"); break;
      case "guest": state.stack = []; navigate("home", { push: false }); toast("Welcome in. Your reflections stay on this device."); break;
      case "back": goBack(); break;
      case "nav": state.stack = []; navigate(route, { push: false }); break;
      case "profile": state.stack = []; navigate("profile", { push: false }); break;
      case "search": state.searchQuery = ""; state.searchFilter = "All"; navigate("search"); break;
      case "filter": state.searchFilter = filter; document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("selected", chip.dataset.filter === filter)); searchResults(); { const count = document.getElementById("result-count"); if (count) { count.textContent = `${filteredStories().length} spaces`; window.withinI18n?.translateTree(count, state.locale); } } break;
      case "open-story": openStory(id); break;
      case "save-story": {
        if (state.saved.includes(id)) state.saved = state.saved.filter((savedId) => savedId !== id); else state.saved.push(id);
        persist(); render(); toast(state.saved.includes(id) ? "Experience saved to your collection." : "Removed from your collection."); break;
      }
      case "share-story": { const story = stories.find((item) => item.id === id); if (story) await shareText(`${story.title} — ${story.subtitle}\nExplore with WITHIN.`); break; }
      case "share-map": await shareText(`My WITHIN value map: ${(state.chosenValues.length ? state.chosenValues : ["Curiosity", "Self-acceptance"]).join(", ")}.`); break;
      case "start-vr": startExperience(); break;
      case "scan": state.stack = [...state.stack, state.screen]; navigate("scan", { push: false }); break;
      case "scan-demo": startExperience(); break;
      case "start-camera": await startCamera(); break;
      case "screen-light": setScreenLight(); break;
      case "scan-help": openModal("Scan an installation", "Allow camera access to look for a WITHIN marker in a gallery or exhibition. If you are exploring from home, continue into the demo space without a camera.", [{ action: "scan-demo", label: "Explore demo space" }, { action: "close-modal", label: "Got it", className: "secondary-btn" }]); break;
      case "journey-stage": {
        const stageIndex = Number(index);
        if (stageIndex === 0) openStory("future-self");
        else if (stageIndex === 1) openStory("quiet-room");
        else if (stageIndex === 2) openStory("values-motion");
        else if (stageIndex === 3) startExperience();
        else navigate("value");
        break;
      }
      case "value-detail": {
        const value = values.find((item) => item.id === id);
        if (value) openModal(value.title, `${value.description}<br /><br />Notice a moment from today that feels connected to this value. You can explore a guided prompt whenever you are ready.`, [{ action: "open-story", label: "Explore a related space" }, { action: "close-modal", label: "Close", className: "secondary-btn" }]);
        break;
      }
      case "save-reflection": saveReflection(document.getElementById("value-reflection")?.value || ""); break;
      case "edit-profile": openModal("Edit your name", "Choose the name you would like to see in your personal space.", [{ action: "edit-name", label: "Save name" }, { action: "close-modal", label: "Cancel", className: "secondary-btn" }]); { const modal = document.querySelector(".modal"); if (modal) modal.insertAdjacentHTML("afterbegin", `<label class="form-field"><span class="muted small">Your name</span><input id="edit-name-input" class="search-input" style="padding:0 12px" value="${escapeHtml(state.userName)}" maxlength="32" /></label>`); } break;
      case "collection": {
        const savedStories = stories.filter((story) => state.saved.includes(story.id));
        if (savedStories.length) openModal("Saved experiences", savedStories.map((story) => `• ${story.title}`).join("<br />"), [{ action: "open-story", label: "Open first saved experience" }, { action: "close-modal", label: "Close", className: "secondary-btn" }]);
        else openModal("Your collection is waiting", "Save a space that you would like to return to. It will appear here on this device.", [{ action: "search", label: "Explore spaces" }, { action: "close-modal", label: "Close", className: "secondary-btn" }]);
        break;
      }
      case "privacy": openModal("Your private space", "Your demo profile, saved experiences, and reflections are stored in this browser on this device. This prototype does not send them to a server. Clear this browser's site data to remove them.", [{ action: "close-modal", label: "Understood" }]); break;
      case "about": openModal("WITHIN", "A mobile extension of a spatial experience about personal value, self-acceptance, and identity. Pause, notice, and choose what you want to carry with you.", [{ action: "close-modal", label: "Close" }]); break;
      case "hotspot": openHotspot(hotspot); break;
      case "close-sheet": if (event.target === target) { state.activeHotspot = ""; document.getElementById("vr-sheet-slot").innerHTML = ""; } break;
      case "choose-value": state.selectedChoice = choice; document.querySelectorAll(".choice-btn").forEach((button) => button.classList.toggle("selected", button.dataset.choice === choice)); break;
      case "confirm-hotspot": confirmHotspot(); break;
      case "finish-vr": if (state.visitedHotspots.length >= 2) finishExperience(); break;
      case "leave-vr": {
        const scene = document.getElementById("vrScene");
        if (scene?.is?.("vr-mode")) scene.exitVR();
        stopSoundscape(); state.activeHotspot = "";
        const destination = state.returnTo || "home";
        state.stack = []; navigate(destination, { push: false }); break;
      }
      case "enter-xr": await enterXr(); break;
      case "motion": await enableMotion(); break;
      case "sound": await toggleSoundscape(); break;
      case "reset-view": resetView(); break;
      case "save-completion": {
        const text = document.getElementById("complete-reflection")?.value || "";
        if (text.trim()) saveReflection(text);
        state.visitedHotspots = [];
        state.activeHotspot = "";
        state.stack = [];
        navigate("home", { push: false });
        toast("Your moment is saved. Take it with you."); break;
      }
      case "close-modal": target.closest(".modal-backdrop")?.remove(); break;
      case "edit-name": {
        const value = document.getElementById("edit-name-input")?.value.trim();
        if (value) { state.userName = value; persist(); render(); toast("Your profile name has been updated."); }
        else toast("Enter a name to continue."); break;
      }
      default: break;
    }
  });

  document.getElementById("languageToggle")?.addEventListener("click", toggleLanguage);

  appRoot.addEventListener("submit", (event) => {
    if (event.target.id === "login-form") {
      event.preventDefault();
      const data = new FormData(event.target);
      const email = String(data.get("email") || "").trim();
      state.userEmail = email;
      if (email.includes("@")) {
        const localName = email.split("@")[0].replace(/[._-]+/g, " ").trim();
        if (localName) state.userName = localName.replace(/\b\w/g, (letter) => letter.toUpperCase());
      }
      persist(); state.stack = []; navigate("home", { push: false }); toast("Your local demo profile is ready.");
    }
  });
  appRoot.addEventListener("input", (event) => {
    if (event.target.id === "search-input") { state.searchQuery = event.target.value; searchResults(); const count = document.getElementById("result-count"); if (count) { count.textContent = `${filteredStories().length} spaces`; window.withinI18n?.translateTree(count, state.locale); } }
    if (event.target.id === "value-reflection" || event.target.id === "complete-reflection") { state.reflectionDraft = event.target.value; }
  });
  appRoot.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const modal = document.querySelector(".modal-backdrop");
      if (modal) modal.remove();
      else if (state.screen === "vr") { state.activeHotspot = ""; const slot = document.getElementById("vr-sheet-slot"); if (slot) slot.innerHTML = ""; }
      else goBack();
    }
  });

  // Drag interaction for the no-library and desktop fallback scene.
  let dragOrigin = null;
  appRoot.addEventListener("pointerdown", (event) => {
    if (state.screen !== "vr" || event.target.closest("button, .vr-sheet")) return;
    dragOrigin = { x: event.clientX, y: event.clientY };
  });
  appRoot.addEventListener("pointerup", (event) => {
    if (!dragOrigin || state.screen !== "vr") return;
    const dx = event.clientX - dragOrigin.x;
    const dy = event.clientY - dragOrigin.y;
    const fallback = document.getElementById("vr-fallback");
    if (fallback && Math.abs(dx) + Math.abs(dy) > 12) {
      const x = Math.max(-22, Math.min(22, dx * .18));
      const y = Math.max(-10, Math.min(10, dy * .12));
      fallback.style.setProperty("--look-x", `${x}deg`);
      fallback.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.08)`;
    }
    dragOrigin = null;
  });

  document.addEventListener("visibilitychange", () => { if (document.hidden && state.screen === "scan") stopCamera(); });
  window.addEventListener("beforeunload", () => { stopCamera(); stopSoundscape(); });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
  }
  render();
})();
