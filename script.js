/* =========================================================================
   KASHI COMPASS — site script
   ========================================================================= */

/* ---------- Sticky nav shadow + scroll progress bar ---------- */
const navbar = document.getElementById('navbar');
const scrollProgress = document.getElementById('scrollProgress');
function onScroll(){
  if(navbar) navbar.classList.toggle('scrolled', window.scrollY > 12);
  const toTop = document.getElementById('toTop');
  if(toTop) toTop.classList.toggle('show', window.scrollY > 600);
  if(scrollProgress){
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

/* ---------- Mobile menu ---------- */
const burger = document.getElementById('burger');
const mobilePanel = document.getElementById('mobilePanel');
const mobileOverlay = document.getElementById('mobileOverlay');
function closeMobile(){
  mobilePanel && mobilePanel.classList.remove('open');
  mobileOverlay && mobileOverlay.classList.remove('open');
  burger && burger.setAttribute('aria-expanded','false');
}
if(burger){
  burger.addEventListener('click', ()=>{
    const open = mobilePanel.classList.toggle('open');
    mobileOverlay.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
mobileOverlay && mobileOverlay.addEventListener('click', closeMobile);
document.querySelectorAll('.mobile-panel a').forEach(a => a.addEventListener('click', closeMobile));

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
  revealEls.forEach(el=>io.observe(el));
} else {
  revealEls.forEach(el=>el.classList.add('in'));
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(message){
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), 2800);
}

/* ---------- Search ---------- */
function handleSearch(e){
  e.preventDefault();
  const input = e.target.querySelector('input');
  const q = (input.value || '').trim();
  if(!q){ showToast('Type something to search, like "ghat" or "silk".'); return false; }
  const map = {
    temple:'#explore', vishwanath:'#explore', ghat:'#nearby', food:'#food',
    lassi:'#food', kachori:'#food', silk:'#shopping', shopping:'#shopping',
    map:'#map-preview', emergency:'#emergency', hidden:'#hidden-gems', gem:'#hidden-gems'
  };
  const key = Object.keys(map).find(k => q.toLowerCase().includes(k));
  const target = document.querySelector(key ? map[key] : '#explore');
  if(target) target.scrollIntoView({behavior:'smooth'});
  showToast(`Showing results for "${q}"`);
  input.value = '';
  closeMobile();
  return false;
}

/* ---------- Bookmarks ---------- */
function toggleBookmark(btn, name){
  const active = btn.classList.toggle('active');
  showToast(active ? `Saved "${name}" to your trip` : `Removed "${name}" from your trip`);
}

/* ---------- Share ---------- */
function sharePage(){
  const url = window.location.href;
  const title = document.title;
  if(navigator.share){
    navigator.share({ title, url }).catch(()=>{});
  } else if(navigator.clipboard){
    navigator.clipboard.writeText(url).then(()=> showToast('Link copied to clipboard'));
  } else {
    showToast(url);
  }
}

/* ---------- Audio guide — real narration per place ---------- */
const audioGuides = {
  'Kashi Vishwanath Temple': `Welcome to Kashi Vishwanath Temple, the golden-spired shrine of Lord Shiva on the western bank of the Ganga. This is one of the twelve Jyotirlingas in India, sites believed to mark where Shiva manifested as a column of light. The temple you see today was built in seventeen eighty by Ahilyabai Holkar, the Maratha queen of Indore, after earlier structures were destroyed. In eighteen thirty nine, Maharaja Ranjit Singh of Punjab donated close to a tonne of gold to plate its two main domes, giving the temple its nickname, the Golden Temple of Varanasi. The temple is open from three A M to eleven P M. Entry is free through the general queue, and a paid Sugam Darshan ticket is available for a faster visit. Please dress modestly, with shoulders and knees covered, and note that photography is not permitted inside the inner sanctum. Budget around forty five minutes to an hour for your visit.`,

  'Dashashwamedh Ghat': `You're standing at Dashashwamedh Ghat, the oldest and busiest ghat in Varanasi, built in its current form in seventeen forty eight by the Peshwa Balaji Baji Rao. According to legend, the god Brahma performed ten horse sacrifices here to welcome Shiva back from exile, which is where the ghat gets its name. Every evening at dusk, seven young priests perform the Ganga Aarti, moving multi-tiered brass lamps in unison to the rhythm of chanted mantras and conch shells, while hundreds of people watch from the steps and from boats on the river. The ceremony runs for about forty five minutes, usually starting between six and seven in the evening depending on the season. Arrive at least twenty minutes early to find a good spot on the steps.`,

  'Sunrise Boat Ride': `A sunrise boat ride is one of the most treasured experiences in Varanasi. Boats typically launch between five thirty and seven in the morning from Dashashwamedh or Assi Ghat, gliding past all eighty four ghats as the city wakes. You'll see bathers performing their morning rituals, priests beginning their prayers, and the sandstone facades of temples and palaces glowing gold in the early light. The ride usually lasts sixty to ninety minutes. It's best enjoyed quietly, camera ready, as this stretch of the Ganga has looked much the same for centuries.`,

  'Vishwanath Gali': `Vishwanath Gali is the narrow market lane that connects Kashi Vishwanath Temple directly to the ghats. Along its stone-paved length you'll find generations-old shops selling Banarasi silk, brass puja items, sweets and rudraksha beads, all within a few footsteps of each other. It gets lively from mid-morning onward and stays busy until around nine at night. Give yourself thirty to forty minutes to browse, and don't be shy about asking shopkeepers to show you how Banarasi silk is woven, many are happy to explain the craft.`
};

function playAudio(placeName){
  const text = audioGuides[placeName] ||
    `Welcome to Kashi Compass. Scan a marker at any monument across Varanasi and this audio guide will narrate its full story, right where you're standing.`;

  if('speechSynthesis' in window){
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
    showToast(`Playing audio guide for ${placeName}`);
  } else {
    showToast(`Your browser doesn't support spoken audio. Here's the guide: ${text.slice(0,120)}…`);
  }
}

/* ---------- Directions — opens real Google Maps directions ---------- */
function openDirections(placeName){
  const destination = encodeURIComponent(`${placeName}, Varanasi, India`);
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  window.open(url, '_blank', 'noopener');
  showToast(`Opening directions to ${placeName}`);
}

/* ---------- View a shop / place on Google Maps ---------- */
function viewOnMap(query){
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  window.open(url, '_blank', 'noopener');
  showToast('Opening location on Google Maps');
}

/* ---------- Trip Planner (rule-based preview) ---------- */
function generatePlan(e){
  e.preventDefault();
  const hours = document.getElementById('planHours').value;
  const interest = document.getElementById('planInterest').value;
  const result = document.getElementById('planResult');

  const routes = {
    'Temples & spirituality': 'Kashi Vishwanath Temple → Annapurna Temple → Vishwanath Gali → Evening Ganga Aarti at Dashashwamedh Ghat',
    'Food & markets': 'Kachori Gali breakfast → Vishwanath Gali shopping → Blue Lassi Shop → Jyoti Cafe rooftop dinner',
    'Photography & ghats': 'Sunrise boat ride → Manikarnika Ghat (from a respectful distance) → Dashashwamedh Ghat → Mona Lisa Cafe terrace',
    'A bit of everything': 'Kashi Vishwanath Temple → Vishwanath Gali → Blue Lassi Shop → Sunrise or evening boat ride'
  };
  const timeNote = hours === '2 hours'
    ? 'Tight but doable — we\'ll keep it to the two closest highlights.'
    : hours === 'Full day'
      ? 'Plenty of time — we\'ve added a sunrise start and an evening Aarti finish.'
      : 'A comfortable half-day pace with time to linger.';

  result.innerHTML = `<strong>${hours} · ${interest}</strong><br>${timeNote}<br><br>Suggested route:<br>${routes[interest]}`;
  result.classList.add('show');
  showToast('Your Kashi route is ready');
  return false;
}

/* =========================================================================
   Google Translate integration
   -------------------------------------------------------------------------
   Kashi Compass ships ready to wire into the Google Translate Website
   widget. To activate live translation in production:
   1) Add this script tag once to the page:
      <script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async></script>
   2) Keep the hidden <div id="google_translate_element"></div> in index.html.
   3) The language <select> below calls changeLanguage(code), which drives
      the hidden Google Translate combo automatically.
   ========================================================================= */
function googleTranslateElementInit(){
  if(window.google && google.translate){
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,hi,ta,te,ml,kn,bn,mr,gu,pa,fr,es,ja,zh-CN,de,ar,ru',
      autoDisplay: false
    }, 'google_translate_element');
  }
}

function changeLanguage(code){
  document.querySelectorAll('.lang-select, .lang-select-standalone').forEach(sel => { sel.value = code; });
  const combo = document.querySelector('#google_translate_element select.goog-te-combo');
  if(combo){
    combo.value = code;
    combo.dispatchEvent(new Event('change'));
    showToast('Translating page…');
  } else {
    const names = {en:'English',hi:'Hindi',ta:'Tamil',te:'Telugu',ml:'Malayalam',kn:'Kannada',bn:'Bengali',mr:'Marathi',gu:'Gujarati',pa:'Punjabi',fr:'French',es:'Spanish',ja:'Japanese','zh-CN':'Chinese',de:'German',ar:'Arabic',ru:'Russian'};
    showToast(`Language set to ${names[code] || code}. Connect Google Translate to activate live translation.`);
  }
}

/* Lazily load the real Google Translate script only once, on first interaction,
   so the homepage stays fast for visitors who never open the language menu. */
let translateScriptLoaded = false;
document.querySelectorAll('#langSelect, .mobile-panel .lang-select, .lang-select-standalone').forEach(sel=>{
  sel.addEventListener('focus', ()=>{
    if(translateScriptLoaded) return;
    translateScriptLoaded = true;
    const s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.body.appendChild(s);
  }, {once:true});
});

/* ---------- Active nav link on scroll ---------- */
const sections = ['home','explore','nearby','food','shopping','language','emergency','about']
  .map(id => document.getElementById(id)).filter(Boolean);
const navAnchors = document.querySelectorAll('.nav-links a');
function highlightNav(){
  if(!sections.length) return;
  const y = window.scrollY + 120;
  let current = sections[0];
  sections.forEach(sec => { if(sec.offsetTop <= y) current = sec; });
  navAnchors.forEach(a=>{
    a.classList.toggle('active', a.getAttribute('href') === `#${current.id}`);
  });
}
window.addEventListener('scroll', highlightNav, {passive:true});
highlightNav();
