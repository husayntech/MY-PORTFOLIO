/* ============================================================
   Shared Style Editor (landing page + projects page)
   Injected UI + style/content editing, RGB picker, drag-to-move,
   arrow-key nudging, and per-element styles.
   Pages must define window.PAGE_CONTENT_FIELDS before loading this.
   ============================================================ */

const EDITOR_HTML = `    <!-- Style Editor Toggle -->
    <div id="editor-toggle" onclick="toggleEditor()">
        <span class="material-symbols-outlined">palette</span>
        <span class="mt-2 text-sm font-medium">Style</span>
    </div>
    
    <!-- Style Editor Panel -->
    <div id="style-editor">
        <div class="p-4">
            <div id="style-editor-header" class="flex items-center justify-between mb-3" title="Drag to move the panel">
                <h2 class="text-lg font-bold text-gray-800 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-base text-gray-400">drag_indicator</span>
                    Style Editor
                </h2>
                <button onclick="toggleEditor()" class="text-gray-500 hover:text-gray-700">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <!-- Colors -->
            <div class="mb-3 border-b border-gray-100 pb-2">
                <button type="button" onclick="toggleSection('sec-colors', this)" class="w-full flex items-center justify-between mb-2 cursor-pointer">
                    <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Colors</h3>
                    <span class="section-chevron material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                </button>
                <div id="sec-colors" class="hidden grid grid-cols-2 gap-2.5">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Primary</label>
                        <button type="button" id="editor-primary-swatch" onclick="openRgbPicker('editor-primary', 'primary')" class="w-full h-7 rounded cursor-pointer border border-gray-200" style="background:#3C1B69" title="Choose color"></button>
                        <input type="hidden" id="editor-primary" value="#3C1B69">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Gold</label>
                        <button type="button" id="editor-gold-swatch" onclick="openRgbPicker('editor-gold', 'gold')" class="w-full h-7 rounded cursor-pointer border border-gray-200" style="background:#C9A96E" title="Choose color"></button>
                        <input type="hidden" id="editor-gold" value="#C9A96E">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Background</label>
                        <button type="button" id="editor-background-swatch" onclick="openRgbPicker('editor-background', 'background')" class="w-full h-7 rounded cursor-pointer border border-gray-200" style="background:#3C1B69" title="Choose color"></button>
                        <input type="hidden" id="editor-background" value="#3C1B69">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Text</label>
                        <button type="button" id="editor-text-swatch" onclick="openRgbPicker('editor-text', 'text')" class="w-full h-7 rounded cursor-pointer border border-gray-200" style="background:#11071F" title="Choose color"></button>
                        <input type="hidden" id="editor-text" value="#11071F">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Hero Title</label>
                        <button type="button" id="editor-hero-title-color-swatch" onclick="openRgbPicker('editor-hero-title-color', 'hero-title-color')" class="w-full h-7 rounded cursor-pointer border border-gray-200" style="background:#FFFFFF" title="Choose color"></button>
                        <input type="hidden" id="editor-hero-title-color" value="#FFFFFF">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Hero Accent</label>
                        <button type="button" id="editor-hero-accent-color-swatch" onclick="openRgbPicker('editor-hero-accent-color', 'hero-accent-color')" class="w-full h-7 rounded cursor-pointer border border-gray-200" style="background:#C9A96E" title="Choose color"></button>
                        <input type="hidden" id="editor-hero-accent-color" value="#C9A96E">
                    </div>
                </div>
            </div>
            
            <!-- Typography -->
            <div class="mb-3 border-b border-gray-100 pb-2">
                <button type="button" onclick="toggleSection('sec-typography', this)" class="w-full flex items-center justify-between mb-2 cursor-pointer">
                    <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Typography</h3>
                    <span class="section-chevron material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                </button>
                <div id="sec-typography" class="hidden space-y-2.5">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Heading Font</label>
                        <select id="editor-heading-font" class="w-full p-1 border rounded text-sm" onchange="updateFont('heading', this.value)">
                            <option value="Playfair Display">Playfair Display</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Arial">Arial</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Body Font</label>
                        <select id="editor-body-font" class="w-full p-1 border rounded text-sm" onchange="updateFont('body', this.value)">
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Base Font Size: <span id="font-size-value">16</span>px</label>
                        <input type="range" id="editor-font-size" min="12" max="20" value="16" class="w-full" onchange="updateFontSize(this.value)">
                    </div>
                </div>
            </div>
            
            <!-- Layout -->
            <div class="mb-3 border-b border-gray-100 pb-2">
                <button type="button" onclick="toggleSection('sec-layout', this)" class="w-full flex items-center justify-between mb-2 cursor-pointer">
                    <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Layout</h3>
                    <span class="section-chevron material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                </button>
                <div id="sec-layout" class="space-y-2.5 hidden">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Container Width: <span id="container-width-value">1200</span>px</label>
                        <input type="range" id="editor-container-width" min="960" max="1440" value="1200" class="w-full" onchange="updateContainerWidth(this.value)">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Section Padding: <span id="section-padding-value">120</span>px</label>
                        <input type="range" id="editor-section-padding" min="60" max="180" value="120" class="w-full" onchange="updateSectionPadding(this.value)">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Border Radius: <span id="border-radius-value">12</span>px</label>
                        <input type="range" id="editor-border-radius" min="0" max="24" value="12" class="w-full" onchange="updateBorderRadius(this.value)">
                    </div>
                </div>
            </div>
            
            <!-- Theme -->
            <div class="mb-3 border-b border-gray-100 pb-2">
                <button type="button" onclick="toggleSection('sec-theme', this)" class="w-full flex items-center justify-between mb-2 cursor-pointer">
                    <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Theme</h3>
                    <span class="section-chevron material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                </button>
                <div id="sec-theme" class="flex items-center gap-3 hidden">
                    <button onclick="setTheme('light')" class="flex-1 py-1 px-3 border-2 border-primary rounded-lg text-sm font-medium transition hover:bg-primary hover:text-white">Light</button>
                    <button onclick="setTheme('dark')" class="flex-1 py-1 px-3 border-2 border-gray-300 rounded-lg text-sm font-medium transition hover:bg-gray-800 hover:text-white">Dark</button>
                </div>
            </div>
            
            <!-- Animations -->
            <div class="mb-3 border-b border-gray-100 pb-2">
                <button type="button" onclick="toggleSection('sec-animations', this)" class="w-full flex items-center justify-between mb-2 cursor-pointer">
                    <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Animations</h3>
                    <span class="section-chevron material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                </button>
                <div id="sec-animations" class="flex items-center justify-between hidden">
                    <span class="text-sm text-gray-600">Enable Animations</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="editor-animations" checked class="sr-only peer" onchange="toggleAnimations(this.checked)">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
            
            <!-- Islamic Skills Manager -->
            <div class="mb-3 border-b border-gray-100 pb-2">
                <button type="button" onclick="toggleSection('sec-skills', this)" class="w-full flex items-center justify-between mb-2 cursor-pointer">
                    <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Islamic Skills</h3>
                    <span class="section-chevron material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                </button>
                <div id="sec-skills" class="hidden space-y-2.5">
                    <p class="text-[11px] text-gray-400 leading-snug">Edit the tags under <b>Islamic Sciences</b> — reorder with ↑/↓, rename with ✏️, remove with 🗑, or add new ones.</p>
                    <div id="editor-skills-list" class="space-y-1.5 max-h-56 overflow-y-auto pr-1"></div>
                    <button type="button" onclick="addSkillTag()" class="w-full py-1.5 border border-dashed border-primary/40 text-primary text-xs font-semibold rounded-lg hover:bg-primary/5 transition cursor-pointer">+ Add skill tag</button>
                    <p class="text-[11px] text-gray-400">Changes save to the database automatically.</p>
                </div>
            </div>
            
            <!-- Education Manager -->
            <div class="mb-3 border-b border-gray-100 pb-2">
                <button type="button" onclick="toggleSection('sec-education', this)" class="w-full flex items-center justify-between mb-2 cursor-pointer">
                    <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Education</h3>
                    <span class="section-chevron material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                </button>
                <div id="sec-education" class="hidden space-y-2.5">
                    <p class="text-[11px] text-gray-400 leading-snug">Edit the timeline under <b>Education</b> — reorder with ↑/↓, edit with ✏️, remove with 🗑, or add new items.</p>
                    <div id="editor-education-list" class="space-y-1.5 max-h-56 overflow-y-auto pr-1"></div>
                    <button type="button" onclick="addListItem('education')" class="w-full py-1.5 border border-dashed border-primary/40 text-primary text-xs font-semibold rounded-lg hover:bg-primary/5 transition cursor-pointer">+ Add education item</button>
                    <p class="text-[11px] text-gray-400">Changes save to the database automatically.</p>
                </div>
            </div>
            
            <!-- Core Competencies Manager -->
            <div class="mb-3 border-b border-gray-100 pb-2">
                <button type="button" onclick="toggleSection('sec-competencies', this)" class="w-full flex items-center justify-between mb-2 cursor-pointer">
                    <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Core Competencies</h3>
                    <span class="section-chevron material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                </button>
                <div id="sec-competencies" class="hidden space-y-2.5">
                    <p class="text-[11px] text-gray-400 leading-snug">Edit the chips under <b>Core Competencies</b> — reorder with ↑/↓, edit with ✏️, remove with 🗑, or add new ones.</p>
                    <div id="editor-competency-list" class="space-y-1.5 max-h-56 overflow-y-auto pr-1"></div>
                    <button type="button" onclick="addListItem('competency')" class="w-full py-1.5 border border-dashed border-primary/40 text-primary text-xs font-semibold rounded-lg hover:bg-primary/5 transition cursor-pointer">+ Add competency</button>
                    <p class="text-[11px] text-gray-400">Changes save to the database automatically.</p>
                </div>
            </div>
            
            <!-- Services Manager -->
            <div class="mb-3 border-b border-gray-100 pb-2">
                <button type="button" onclick="toggleSection('sec-services', this)" class="w-full flex items-center justify-between mb-2 cursor-pointer">
                    <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Services</h3>
                    <span class="section-chevron material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                </button>
                <div id="sec-services" class="hidden space-y-2.5">
                    <p class="text-[11px] text-gray-400 leading-snug">Edit the grid under <b>Services</b> — reorder with ↑/↓, edit with ✏️, remove with 🗑, or add new ones.</p>
                    <div id="editor-service-list" class="space-y-1.5 max-h-56 overflow-y-auto pr-1"></div>
                    <button type="button" onclick="addListItem('service')" class="w-full py-1.5 border border-dashed border-primary/40 text-primary text-xs font-semibold rounded-lg hover:bg-primary/5 transition cursor-pointer">+ Add service</button>
                    <p class="text-[11px] text-gray-400">Changes save to the database automatically.</p>
                </div>
            </div>
            
            <!-- Testimonials Manager -->
            <div class="mb-3 border-b border-gray-100 pb-2">
                <button type="button" onclick="toggleSection('sec-testimonials', this)" class="w-full flex items-center justify-between mb-2 cursor-pointer">
                    <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Testimonials</h3>
                    <span class="section-chevron material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                </button>
                <div id="sec-testimonials" class="hidden space-y-2.5">
                    <p class="text-[11px] text-gray-400 leading-snug">Edit the cards under <b>Testimonials</b> — reorder with ↑/↓, edit with ✏️, remove with 🗑, or add new ones.</p>
                    <div id="editor-testimonial-list" class="space-y-1.5 max-h-56 overflow-y-auto pr-1"></div>
                    <button type="button" onclick="addListItem('testimonial')" class="w-full py-1.5 border border-dashed border-primary/40 text-primary text-xs font-semibold rounded-lg hover:bg-primary/5 transition cursor-pointer">+ Add testimonial</button>
                    <p class="text-[11px] text-gray-400">Changes save to the database automatically.</p>
                </div>
            </div>
            
            <!-- Technical Skills Manager -->
            <div class="mb-3 border-b border-gray-100 pb-2">
                <button type="button" onclick="toggleSection('sec-techskills', this)" class="w-full flex items-center justify-between mb-2 cursor-pointer">
                    <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Technical Skills</h3>
                    <span class="section-chevron material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                </button>
                <div id="sec-techskills" class="hidden space-y-2.5">
                    <p class="text-[11px] text-gray-400 leading-snug">Edit the progress bars under <b>Technical Arsenal</b> — reorder with ↑/↓, edit with ✏️, remove with 🗑, or add new ones.</p>
                    <div id="editor-techskill-list" class="space-y-1.5 max-h-56 overflow-y-auto pr-1"></div>
                    <button type="button" onclick="addListItem('techskill')" class="w-full py-1.5 border border-dashed border-primary/40 text-primary text-xs font-semibold rounded-lg hover:bg-primary/5 transition cursor-pointer">+ Add technical skill</button>
                    <p class="text-[11px] text-gray-400">Changes save to the database automatically.</p>
                </div>
            </div>
            
            <!-- Projects Manager -->
            <div class="mb-3 border-b border-gray-100 pb-2">
                <button type="button" onclick="toggleSection('sec-projects', this)" class="w-full flex items-center justify-between mb-2 cursor-pointer">
                    <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Projects</h3>
                    <span class="section-chevron material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                </button>
                <div id="sec-projects" class="hidden space-y-2.5">
                    <p class="text-[11px] text-gray-400 leading-snug">Edit the grid under <b>Featured Projects</b> — reorder with ↑/↓, edit with ✏️, remove with 🗑, or add new ones.</p>
                    <div id="editor-project-list" class="space-y-1.5 max-h-56 overflow-y-auto pr-1"></div>
                    <button type="button" onclick="addListItem('project')" class="w-full py-1.5 border border-dashed border-primary/40 text-primary text-xs font-semibold rounded-lg hover:bg-primary/5 transition cursor-pointer">+ Add project</button>
                    <p class="text-[11px] text-gray-400">Changes save to the database automatically.</p>
                </div>
            </div>
            
            <!-- Content -->
            <div class="mb-4">
                <button id="content-edit-toggle" onclick="toggleContentEdit()" class="w-full py-2 rounded-lg font-medium border-2 border-primary text-primary hover:bg-primary hover:text-white transition">
                    ✏️ Edit Content on Page
                </button>
                <p class="text-[11px] text-gray-400 mt-2 leading-snug">Hover any text, click <b>Edit</b>, then change the text or open <b>Element Styles</b> for font, color, size, margin &amp; padding.</p>
            </div>
            
            <!-- Save Button -->
            <button onclick="editorSaveStyles()" class="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition">
                Save Changes
            </button>
            
            <!-- Reset Button -->
            <button onclick="editorResetStyles()" class="w-full py-2.5 mt-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition">
                Reset to Default
            </button>
            
            <!-- Show photo block again (hidden via the photo editor) -->
            <button id="editor-show-photo" onclick="showHeroPhotoBlock()" class="hidden w-full py-2 mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer">
                👤 Show photo &amp; badges
            </button>
        </div>
    </div>
    
    <!-- RGB Color Picker -->
    <div id="rgb-picker" class="hidden fixed inset-0 z-[10006] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="w-full max-w-xs bg-white rounded-xl shadow-2xl p-4">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-bold text-gray-800">Choose Color</h3>
                <button type="button" onclick="closeRgbPicker()" class="p-1 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-500" aria-label="Close">
                    <span class="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
            <!-- Preset palette: click a swatch to pick a color -->
            <div class="mb-4">
                <p class="text-xs font-semibold text-gray-600 mb-2">Pick a color</p>
                <div id="rgb-palette"></div>
            </div>
            <div class="flex items-center gap-3 mb-4">
                <div id="rgb-preview" class="w-12 h-12 rounded-lg border border-gray-200 shrink-0"></div>
                <div class="flex-1 space-y-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-semibold text-gray-600 w-4">R</span>
                        <input type="range" id="rgb-r" min="0" max="255" value="0" class="flex-1" oninput="onRgbSlider()">
                        <input type="number" id="rgb-r-num" min="0" max="255" value="0" class="w-14 p-1 border rounded text-xs text-center" oninput="onRgbNum('rgb-r-num','rgb-r')">
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-semibold text-gray-600 w-4">G</span>
                        <input type="range" id="rgb-g" min="0" max="255" value="0" class="flex-1" oninput="onRgbSlider()">
                        <input type="number" id="rgb-g-num" min="0" max="255" value="0" class="w-14 p-1 border rounded text-xs text-center" oninput="onRgbNum('rgb-g-num','rgb-g')">
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-semibold text-gray-600 w-4">B</span>
                        <input type="range" id="rgb-b" min="0" max="255" value="0" class="flex-1" oninput="onRgbSlider()">
                        <input type="number" id="rgb-b-num" min="0" max="255" value="0" class="w-14 p-1 border rounded text-xs text-center" oninput="onRgbNum('rgb-b-num','rgb-b')">
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2 mb-4">
                <span class="text-xs font-semibold text-gray-600">Hex</span>
                <input type="text" id="rgb-hex" value="#000000" class="flex-1 p-1.5 border rounded text-xs font-mono uppercase" oninput="onRgbHex()">
            </div>
            <div class="flex justify-end gap-2">
                <button type="button" onclick="closeRgbPicker()" class="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="button" onclick="applyRgbPicker()" class="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark cursor-pointer">Apply</button>
            </div>
        </div>
    </div>
    
    <!-- Content Edit Bar -->
    <div id="content-edit-bar" class="hidden fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9999] glass rounded-full pl-5 pr-3 py-2.5 flex items-center gap-3 shadow-xl">
        <span class="material-symbols-outlined text-primary">edit</span>
        <span class="text-sm font-medium text-gray-700">Click Edit, or drag / use arrow keys to move · Esc to exit</span>
        <button onclick="toggleContentEdit()" class="bg-primary text-white text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-primary-dark transition">Done</button>
    </div>
    
    <!-- Edit Pill (floating, shown in content edit mode) -->
    <button id="edit-pill" type="button" class="hidden fixed z-[10002] flex items-center gap-1.5 bg-black/70 hover:bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/25 shadow-lg transition-all cursor-pointer hover:scale-105">
        <span class="material-symbols-outlined text-xs">edit</span> Edit
    </button>
    
    <!-- Content Edit Modal -->
    <div id="content-modal" class="hidden fixed inset-0 z-[10005] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 bg-primary text-white">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                        <span class="material-symbols-outlined text-gold">edit</span>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold font-heading leading-tight">Edit Content</h3>
                        <p id="content-modal-key" class="text-[10px] text-white/70"></p>
                    </div>
                </div>
                <button type="button" onclick="closeContentModal()" class="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer" aria-label="Close">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="p-5 max-h-[70vh] overflow-y-auto">
                <div class="flex gap-1 mb-4 border-b border-gray-200">
                    <button id="tab-content" type="button" onclick="showModalTab('content')" class="px-4 py-2 text-sm font-semibold border-b-2 border-primary text-primary">Content</button>
                    <button id="tab-styles" type="button" onclick="showModalTab('styles')" class="px-4 py-2 text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-primary">Element Styles</button>
                </div>
                <div id="modal-pane-content">
                    <textarea id="content-modal-textarea" rows="5" class="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white resize-y"></textarea>
                    <p class="text-xs text-gray-400 mt-1.5">Tip: Enter saves · Shift+Enter for a new line · Esc cancels</p>
                </div>
                <div id="modal-pane-badge" class="hidden">
                    <div class="grid grid-cols-2 gap-3">
                        <div class="col-span-2">
                            <label class="block text-xs text-gray-500 mb-1">Badge title</label>
                            <input type="text" id="badge-title" class="w-full p-2 border rounded text-sm">
                        </div>
                        <div class="col-span-2">
                            <label class="block text-xs text-gray-500 mb-1">Subtitle (small text)</label>
                            <input type="text" id="badge-subtitle" class="w-full p-2 border rounded text-sm">
                        </div>
                        <div class="col-span-2">
                            <label class="block text-xs text-gray-500 mb-1">Position (or drag the badge on the page)</label>
                            <select id="badge-pos" class="w-full p-2 border rounded text-sm bg-white">
                                <option value="-right-6 top-12">Top right</option>
                                <option value="-left-6 top-12">Top left</option>
                                <option value="-right-10 top-40">Middle right</option>
                                <option value="-right-2 bottom-4">Bottom right</option>
                                <option value="-left-6 bottom-24">Bottom left</option>
                            </select>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-xs text-gray-500 mb-1">Icon</label>
                            <select id="badge-icon" class="w-full p-2 border rounded text-sm bg-white">
                                <option value="school">school</option>
                                <option value="code">code</option>
                                <option value="translate">translate</option>
                                <option value="menu_book">menu_book</option>
                                <option value="psychology">psychology</option>
                                <option value="language">language</option>
                                <option value="rocket_launch">rocket_launch</option>
                                <option value="mosque">mosque</option>
                                <option value="auto_stories">auto_stories</option>
                                <option value="devices">devices</option>
                                <option value="people">people</option>
                                <option value="favorite">favorite</option>
                                <option value="emoji_objects">emoji_objects</option>
                                <option value="thumb_up">thumb_up</option>
                                <option value="group">group</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex items-center justify-between mt-4">
                        <button type="button" onclick="removeBadge()" class="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">Remove this badge</button>
                        <button type="button" onclick="addBadge()" class="bg-primary/10 text-primary text-xs font-semibold px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer">+ Add another badge</button>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">Tip: drag a badge on the page to reposition it, or use the arrow keys to nudge it.</p>
                </div>
                <div id="modal-pane-highlight" class="hidden">
                    <div class="grid grid-cols-2 gap-3">
                        <div class="col-span-2">
                            <label class="block text-xs text-gray-500 mb-1">Label</label>
                            <input type="text" id="highlight-label" class="w-full p-2 border rounded text-sm">
                        </div>
                        <div class="col-span-2">
                            <label class="block text-xs text-gray-500 mb-1">Icon</label>
                            <select id="highlight-icon" class="w-full p-2 border rounded text-sm bg-white">
                                <option value="mosque">mosque</option>
                                <option value="translate">translate</option>
                                <option value="school">school</option>
                                <option value="devices">devices</option>
                                <option value="code">code</option>
                                <option value="menu_book">menu_book</option>
                                <option value="psychology">psychology</option>
                                <option value="language">language</option>
                                <option value="auto_stories">auto_stories</option>
                                <option value="rocket_launch">rocket_launch</option>
                                <option value="education">education</option>
                                <option value="workspace_premium">workspace_premium</option>
                                <option value="lightbulb">lightbulb</option>
                                <option value="handyman">handyman</option>
                                <option value="people">people</option>
                                <option value="group">group</option>
                                <option value="favorite">favorite</option>
                                <option value="emoji_objects">emoji_objects</option>
                                <option value="thumb_up">thumb_up</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex items-center justify-between mt-4">
                        <div class="flex gap-2">
                            <button type="button" onclick="moveHighlight(-1)" class="bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">↑ Move up</button>
                            <button type="button" onclick="moveHighlight(1)" class="bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">↓ Move down</button>
                        </div>
                        <button type="button" onclick="removeHighlight()" class="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">Remove</button>
                    </div>
                    <div class="mt-3">
                        <button type="button" onclick="addHighlight()" class="bg-primary/10 text-primary text-xs font-semibold px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer">+ Add another highlight</button>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">Tip: drag a chip on the page to reorder it, or use the arrows.</p>
                </div>
                <div id="modal-pane-photo" class="hidden">
                    <div class="flex flex-wrap gap-2 mb-4">
                        <button type="button" onclick="document.getElementById('hero-upload').click()" class="bg-primary/10 text-primary text-xs font-semibold px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">add_a_photo</span> Change photo
                        </button>
                        <button type="button" onclick="removeHeroPhoto(); closeContentModal();" class="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-100 transition-colors cursor-pointer flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">delete</span> Remove photo
                        </button>
                        <button type="button" onclick="hideHeroPhotoBlock()" class="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-100 transition-colors cursor-pointer flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">visibility_off</span> Hide photo &amp; badges
                        </button>
                    </div>
                    <p class="text-xs text-gray-400 mb-3">Resize the frame in the <b>Element Styles</b> tab → <b>Transform &amp; Size</b> (Width / Height). Drag the photo on the page to move it. <b>Hide</b> removes the whole photo block (photo + badges) from the page — bring it back with <b>👤 Show photo &amp; badges</b> in the style editor panel.</p>
                </div>
                <div id="modal-pane-styles" class="hidden">
                    <p class="text-xs text-gray-400 mb-3">These styles apply to this element only.</p>
                    
                    <!-- Text -->
                    <div class="border border-gray-200 rounded-lg mb-2 overflow-hidden">
                        <button type="button" onclick="toggleSection('elem-group-text', this)" class="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 cursor-pointer">
                            Text
                            <span class="section-chevron material-symbols-outlined text-gray-400 text-base">expand_more</span>
                        </button>
                        <div id="elem-group-text" class="hidden p-3 grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Font family</label>
                                <select id="elem-font-family" class="w-full p-2 border rounded text-sm bg-white">
                                    <option value="">Default</option>
                                    <option value="Playfair Display">Playfair Display</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Arial">Arial</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Font size</label>
                                <input type="text" id="elem-font-size" placeholder="e.g. 18px" class="w-full p-2 border rounded text-sm">
                            </div>
                            <div class="col-span-2">
                                <label class="block text-xs text-gray-500 mb-1">Format</label>
                                <div class="flex items-center gap-1.5">
                                    <button type="button" id="elem-bold" onclick="toggleElemFormat(this)" class="elem-format-btn font-bold" title="Bold">B</button>
                                    <button type="button" id="elem-italic" onclick="toggleElemFormat(this)" class="elem-format-btn italic" title="Italic">I</button>
                                    <button type="button" id="elem-underline" onclick="toggleElemFormat(this)" class="elem-format-btn underline" title="Underline">U</button>
                                    <button type="button" id="elem-strike" onclick="toggleElemFormat(this)" class="elem-format-btn line-through" title="Strikethrough">S</button>
                                </div>
                            </div>
                            <div class="col-span-2">
                                <label class="block text-xs text-gray-500 mb-1">Text align</label>
                                <div class="flex items-center gap-1.5">
                                    <button type="button" id="elem-align-left" onclick="toggleElemAlign(this, 'left')" class="elem-format-btn" title="Align left">⇤</button>
                                    <button type="button" id="elem-align-center" onclick="toggleElemAlign(this, 'center')" class="elem-format-btn" title="Align center">⧉</button>
                                    <button type="button" id="elem-align-right" onclick="toggleElemAlign(this, 'right')" class="elem-format-btn" title="Align right">⇥</button>
                                    <button type="button" id="elem-align-justify" onclick="toggleElemAlign(this, 'justify')" class="elem-format-btn" title="Justify">☰</button>
                                    <span class="text-xs text-gray-400 ml-1">Left · Center · Right · Justify</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Line height</label>
                                <input type="text" id="elem-line-height" placeholder="e.g. 1.6" class="w-full p-2 border rounded text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Letter spacing</label>
                                <input type="text" id="elem-letter-spacing" placeholder="e.g. 0.05em" class="w-full p-2 border rounded text-sm">
                            </div>
                            <div class="col-span-2">
                                <label class="block text-xs text-gray-500 mb-1">Color</label>
                                <div class="flex items-center gap-2">
                                    <button type="button" id="elem-color-swatch" onclick="openElemColorPicker('elem-color', 'color')" class="w-9 h-9 shrink-0 rounded-lg border border-gray-300 bg-white cursor-pointer" title="Choose color"></button>
                                    <input type="text" id="elem-color" placeholder="e.g. #00543B" onclick="openElemColorPicker('elem-color', 'color')" class="w-full p-2 border rounded text-sm cursor-pointer" title="Click to open the color picker">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Spacing -->
                    <div class="border border-gray-200 rounded-lg mb-2 overflow-hidden">
                        <button type="button" onclick="toggleSection('elem-group-spacing', this)" class="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 cursor-pointer">
                            Spacing
                            <span class="section-chevron material-symbols-outlined text-gray-400 text-base">expand_more</span>
                        </button>
                        <div id="elem-group-spacing" class="hidden p-3 grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Margin</label>
                                <input type="text" id="elem-margin" placeholder="e.g. 24px auto" class="w-full p-2 border rounded text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Padding</label>
                                <input type="text" id="elem-padding" placeholder="e.g. 16px 24px" class="w-full p-2 border rounded text-sm">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Background & Border -->
                    <div class="border border-gray-200 rounded-lg mb-2 overflow-hidden">
                        <button type="button" onclick="toggleSection('elem-group-bg', this)" class="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 cursor-pointer">
                            Background &amp; Border
                            <span class="section-chevron material-symbols-outlined text-gray-400 text-base">expand_more</span>
                        </button>
                        <div id="elem-group-bg" class="hidden p-3 grid grid-cols-2 gap-3">
                            <div class="col-span-2">
                                <label class="block text-xs text-gray-500 mb-1">Background</label>
                                <div class="flex items-center gap-2">
                                    <button type="button" id="elem-bg-swatch" onclick="openElemColorPicker('elem-bg', 'backgroundColor')" class="w-9 h-9 shrink-0 rounded-lg border border-gray-300 bg-white cursor-pointer" title="Choose color"></button>
                                    <input type="text" id="elem-bg" placeholder="e.g. #EAD9B4" onclick="openElemColorPicker('elem-bg', 'backgroundColor')" class="w-full p-2 border rounded text-sm cursor-pointer" title="Click to open the color picker">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Border radius</label>
                                <input type="text" id="elem-radius" placeholder="e.g. 12px" class="w-full p-2 border rounded text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Border width</label>
                                <input type="text" id="elem-border-width" placeholder="e.g. 1px" class="w-full p-2 border rounded text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Border style</label>
                                <select id="elem-border-style" class="w-full p-2 border rounded text-sm bg-white">
                                    <option value="">Default</option>
                                    <option value="solid">Solid</option>
                                    <option value="dashed">Dashed</option>
                                    <option value="dotted">Dotted</option>
                                    <option value="double">Double</option>
                                </select>
                            </div>
                            <div class="col-span-2">
                                <label class="block text-xs text-gray-500 mb-1">Border color</label>
                                <div class="flex items-center gap-2">
                                    <button type="button" id="elem-border-color-swatch" onclick="openElemColorPicker('elem-border-color', 'borderColor')" class="w-9 h-9 shrink-0 rounded-lg border border-gray-300 bg-white cursor-pointer" title="Choose color"></button>
                                    <input type="text" id="elem-border-color" placeholder="e.g. #D4AF37" onclick="openElemColorPicker('elem-border-color', 'borderColor')" class="w-full p-2 border rounded text-sm cursor-pointer" title="Click to open the color picker">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Box shadow</label>
                                <input type="text" id="elem-shadow" placeholder="e.g. 0 4px 12px rgba(0,0,0,0.15)" class="w-full p-2 border rounded text-sm">
                            </div>
                            <div class="col-span-2">
                                <label class="block text-xs text-gray-500 mb-1">Opacity: <span id="elem-opacity-value">100</span>%</label>
                                <input type="range" id="elem-opacity" min="0" max="100" value="100" class="w-full" oninput="document.getElementById('elem-opacity-value').textContent = this.value">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Transform & Size -->
                    <div class="border border-gray-200 rounded-lg mb-2 overflow-hidden">
                        <button type="button" onclick="toggleSection('elem-group-size', this)" class="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 cursor-pointer">
                            Transform &amp; Size
                            <span class="section-chevron material-symbols-outlined text-gray-400 text-base">expand_more</span>
                        </button>
                        <div id="elem-group-size" class="hidden p-3 grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Rotation: <span id="elem-rotation-value">0°</span></label>
                                <input type="range" id="elem-rotation" min="-180" max="180" value="0" class="w-full" oninput="document.getElementById('elem-rotation-value').textContent = this.value + '°'">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Scale: <span id="elem-scale-value">1</span></label>
                                <input type="range" id="elem-scale" min="0.5" max="2" step="0.05" value="1" class="w-full" oninput="document.getElementById('elem-scale-value').textContent = this.value">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Width</label>
                                <input type="text" id="elem-width" placeholder="e.g. 300px or 50%" class="w-full p-2 border rounded text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Height</label>
                                <input type="text" id="elem-height" placeholder="e.g. 120px" class="w-full p-2 border rounded text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Move X</label>
                                <input type="text" id="elem-move-x" placeholder="e.g. 40px or -20px" class="w-full p-2 border rounded text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Move Y</label>
                                <input type="text" id="elem-move-y" placeholder="e.g. 30px or -10px" class="w-full p-2 border rounded text-sm">
                            </div>
                        </div>
                    </div>
                    
                    <button type="button" onclick="clearElementStyles()" class="mt-3 text-xs text-red-600 font-semibold hover:underline cursor-pointer">Clear element styles</button>
                </div>
                <div class="flex items-center justify-end gap-2 mt-5">
                    <button type="button" onclick="closeContentModal()" class="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                    <button type="button" onclick="saveModal()" class="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors cursor-pointer flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">check</span> Save
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- List Item Editor Modal (Education / Core Competencies / Services / Testimonials) -->
    <div id="list-item-modal" class="hidden fixed inset-0 z-[10006] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 bg-primary text-white">
                <h3 id="list-item-modal-title" class="text-sm font-bold font-heading">Edit item</h3>
                <button type="button" onclick="closeListItemEditor()" class="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer" aria-label="Close">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div id="list-item-modal-fields" class="p-5 space-y-3 max-h-[70vh] overflow-y-auto"></div>
            <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
                <button type="button" onclick="closeListItemEditor()" class="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                <button type="button" onclick="saveListItemEditor()" class="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors cursor-pointer flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm">check</span> Save
                </button>
            </div>
        </div>
    </div>
    
`;


        // Use an existing toast implementation if the page already has one (e.g. admin.html)
        if (typeof window.showToast !== 'function') {
            window.showToast = function showToast(message, type = 'success') {
                const container = document.createElement('div');
                const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-primary';
                container.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-[10000] flex items-center gap-2 animate-[slideIn_0.3s_ease]`;
                container.innerHTML = `<span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span><span class="font-medium">${message}</span>`;
                document.body.appendChild(container);
                setTimeout(() => { container.style.opacity = '0'; container.style.transition = 'opacity 0.3s'; setTimeout(() => container.remove(), 300); }, 3000);
            };
        }
        
        // ============ DATA LOADING ============
        
        // Load portfolio data from API


        // ============ STYLE EDITOR ============
        
        function toggleEditor() {
            const editor = document.getElementById('style-editor');
            const opening = !editor.classList.contains('open');
            if (opening) {
                // Reopen at the position the user dragged it to (if any)
                try {
                    const pos = JSON.parse(localStorage.getItem('style-editor-pos'));
                    if (pos && pos.left) {
                        editor.style.left = pos.left;
                        editor.style.top = pos.top;
                        editor.style.right = 'auto';
                    }
                } catch (e) {}
            } else {
                // Clear inline position so the panel can slide off-screen again
                editor.style.left = '';
                editor.style.top = '';
                editor.style.right = '';
            }
            editor.classList.toggle('open');
        }
        
        // Drag the style editor panel by its header.
        // NOTE: this must run AFTER the editor HTML is injected (see the bootstrap),
        // so it's exposed as a named function and called there.
        let editorDragState = null;
        function initEditorDrag() {
            const panel = document.getElementById('style-editor');
            const header = document.getElementById('style-editor-header');
            if (!panel || !header) return;
            header.addEventListener('mousedown', (e) => {
                if (e.target.closest('button')) return;
                editorDragState = { startX: e.clientX, startY: e.clientY, left: panel.offsetLeft, top: panel.offsetTop };
                e.preventDefault();
            });
            document.addEventListener('mousemove', (e) => {
                if (!editorDragState) return;
                const dx = e.clientX - editorDragState.startX;
                const dy = e.clientY - editorDragState.startY;
                const left = Math.min(Math.max(editorDragState.left + dx, 0), window.innerWidth - 420);
                const top = Math.max(editorDragState.top + dy, 0);
                panel.style.left = left + 'px';
                panel.style.top = top + 'px';
                panel.style.right = 'auto';
            });
            document.addEventListener('mouseup', () => {
                if (!editorDragState) return;
                editorDragState = null;
                try { localStorage.setItem('style-editor-pos', JSON.stringify({ left: panel.style.left, top: panel.style.top })); } catch (e) {}
            });
        }
        
        function toggleSection(id, btn) {
            const el = document.getElementById(id);
            if (!el) return;
            const collapsed = el.classList.toggle('hidden');
            const chev = btn.querySelector('.section-chevron');
            if (chev) chev.textContent = collapsed ? 'expand_more' : 'expand_less';
        }
        
        function collectStyles() {
            return {
                primary_color: document.getElementById('editor-primary').value,
                gold_color: document.getElementById('editor-gold').value,
                background_color: document.getElementById('editor-background').value,
                text_color: document.getElementById('editor-text').value,
                hero_title_color: document.getElementById('editor-hero-title-color').value,
                hero_accent_color: document.getElementById('editor-hero-accent-color').value,
                heading_font: document.getElementById('editor-heading-font').value,
                body_font: document.getElementById('editor-body-font').value,
                base_font_size: document.getElementById('editor-font-size').value,
                container_width: document.getElementById('editor-container-width').value,
                section_padding: document.getElementById('editor-section-padding').value,
                card_border_radius: document.getElementById('editor-border-radius').value,
                enable_animations: document.getElementById('editor-animations').checked.toString()
            };
        }
        
        // Style changes auto-save (debounced) so nothing is lost on refresh
        let styleSaveTimer = null;
        function persistStyles() {
            const styles = collectStyles();
            // Keep a local mirror so edits survive even if the server is unreachable
            try { localStorage.setItem('portfolio-styles', JSON.stringify(styles)); } catch (e) {}
            fetch('/api/styles', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(styles)
            })
            .then(res => res.json())
            .then(data => { if (!data.success) throw new Error('Save rejected'); })
            .catch(() => showToast('Could not auto-save styles — server unavailable', 'error'));
        }
        function scheduleStyleSave() {
            if (styleSaveTimer) clearTimeout(styleSaveTimer);
            styleSaveTimer = setTimeout(persistStyles, 500);
        }
        // Pressing Enter in any style-editor field saves immediately (no debounce wait)
        function flushStyleSave() {
            if (styleSaveTimer) { clearTimeout(styleSaveTimer); styleSaveTimer = null; }
            persistStyles();
        }
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            const t = e.target;
            if (!t || !t.closest || !t.closest('#style-editor')) return;
            if (t.tagName === 'BUTTON' || t.tagName === 'TEXTAREA') return;
            e.preventDefault();
            flushStyleSave();
            showToast('Styles saved');
        });
        
        function updateStyle(type, value) {
            document.documentElement.style.setProperty(`--${type}`, value);
            scheduleStyleSave();
        }
        
        function updateFont(type, value) {
            if (type === 'heading') {
                document.querySelectorAll('.font-heading').forEach(el => {
                    el.style.fontFamily = `'${value}', serif`;
                });
            } else {
                document.body.style.fontFamily = `'${value}', sans-serif`;
            }
            scheduleStyleSave();
        }
        
        function updateFontSize(value) {
            document.getElementById('font-size-value').textContent = value;
            document.body.style.fontSize = `${value}px`;
            scheduleStyleSave();
        }
        
        function updateContainerWidth(value) {
            document.getElementById('container-width-value').textContent = value;
            document.querySelectorAll('.max-w-7xl').forEach(el => {
                el.style.maxWidth = `${value}px`;
            });
            scheduleStyleSave();
        }
        
        function updateSectionPadding(value) {
            document.getElementById('section-padding-value').textContent = value;
            document.querySelectorAll('section').forEach(el => {
                el.style.paddingTop = `${value}px`;
                el.style.paddingBottom = `${value}px`;
            });
            scheduleStyleSave();
        }
        
        function updateBorderRadius(value) {
            document.getElementById('border-radius-value').textContent = value;
            document.querySelectorAll('.rounded-xl, .rounded-lg').forEach(el => {
                el.style.borderRadius = `${value}px`;
            });
            scheduleStyleSave();
        }
        
        function setTheme(theme) {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        
        function toggleAnimations(enabled) {
            document.querySelectorAll('.fade-in, .float-animation').forEach(el => {
                if (enabled) {
                    el.style.animation = '';
                } else {
                    el.style.animation = 'none';
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                }
            });
            scheduleStyleSave();
        }
        
        function editorSaveStyles() {
            const styles = collectStyles();
            
            fetch('/api/styles', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(styles)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast('Styles saved successfully!');
                } else {
                    throw new Error('Save rejected');
                }
            })
            .catch(err => {
                console.error('Error saving styles:', err);
                localStorage.setItem('portfolio-styles', JSON.stringify(styles));
                showToast('Saved locally — server unavailable', 'error');
            });
        }
        
        // ============ RGB COLOR PICKER ============
        
        let rgbTarget = null; // { inputId, styleKey }
        
        // Sets a color input's value AND its swatch background
        function setColorInput(inputId, hex) {
            const input = document.getElementById(inputId);
            if (input) input.value = hex;
            const swatch = document.getElementById(inputId + '-swatch');
            if (swatch) swatch.style.background = hex;
        }
        
        function hexToRgb(hex) {
            let h = String(hex || '').replace('#', '').trim();
            if (h.length === 3) h = h.split('').map(c => c + c).join('');
            const n = parseInt(h, 16);
            if (isNaN(n) || h.length !== 6) return { r: 0, g: 0, b: 0 };
            return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
        }
        
        function rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
        }
        
        function updateRgbPreview() {
            const r = parseInt(document.getElementById('rgb-r').value, 10);
            const g = parseInt(document.getElementById('rgb-g').value, 10);
            const b = parseInt(document.getElementById('rgb-b').value, 10);
            const hex = rgbToHex(r, g, b);
            document.getElementById('rgb-preview').style.background = hex;
            document.getElementById('rgb-hex').value = hex;
            document.getElementById('rgb-r-num').value = r;
            document.getElementById('rgb-g-num').value = g;
            document.getElementById('rgb-b-num').value = b;
        }
        
        function onRgbSlider() { updateRgbPreview(); }
        
        // ---- Preset color palette (click a swatch to pick) ----
        
        const RGB_PRESETS = [
            '#3C1B69', '#5B3A8F', '#C9A96E', '#11071F', '#FFFFFF', '#000000',
            '#6B21A8', '#9333EA', '#A855F7', '#C084FC', '#D8B4FE', '#EDE9FE',
            '#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE',
            '#0E7490', '#14B8A6', '#166534', '#22C55E', '#4ADE80', '#86EFAC',
            '#CA8A04', '#FACC15', '#EA580C', '#FB923C', '#DC2626', '#F87171',
            '#DB2777', '#EC4899', '#F472B6', '#374151', '#9CA3AF', '#E5E7EB'
        ];
        
        // Render the preset swatches (runs after the editor UI is injected)
        function initRgbPicker() {
            const palette = document.getElementById('rgb-palette');
            if (!palette) return;
            palette.innerHTML = RGB_PRESETS.map(hex => `
                <button type="button" onclick="pickPresetColor('${hex}')" class="rgb-preset" style="background:${hex}" title="${hex}" aria-label="Pick ${hex}"></button>
            `).join('');
        }
        
        // Clicking a preset fills the picker selection (Apply commits it)
        function pickPresetColor(hex) {
            const rgb = hexToRgb(hex);
            document.getElementById('rgb-r').value = rgb.r;
            document.getElementById('rgb-g').value = rgb.g;
            document.getElementById('rgb-b').value = rgb.b;
            document.getElementById('rgb-hex').value = hex.toUpperCase();
            updateRgbPreview();
        }
        
        function onRgbNum(numId, sliderId) {
            const v = parseInt(document.getElementById(numId).value, 10);
            const clamped = Math.max(0, Math.min(255, isNaN(v) ? 0 : v));
            document.getElementById(sliderId).value = clamped;
            updateRgbPreview();
        }
        
        function onRgbHex() {
            const hex = document.getElementById('rgb-hex').value;
            if (/^#?[0-9a-fA-F]{6}$/.test(hex) || /^#?[0-9a-fA-F]{3}$/.test(hex)) {
                const rgb = hexToRgb(hex);
                document.getElementById('rgb-r').value = rgb.r;
                document.getElementById('rgb-g').value = rgb.g;
                document.getElementById('rgb-b').value = rgb.b;
                updateRgbPreview();
            }
        }
        
        function openRgbPicker(inputId, styleKey) {
            const hex = document.getElementById(inputId).value || '#000000';
            const rgb = hexToRgb(hex);
            rgbTarget = { inputId, styleKey };
            document.getElementById('rgb-r').value = rgb.r;
            document.getElementById('rgb-g').value = rgb.g;
            document.getElementById('rgb-b').value = rgb.b;
            document.getElementById('rgb-hex').value = hex.toUpperCase();
            updateRgbPreview();
            document.getElementById('rgb-picker').classList.remove('hidden');
        }
        
        // Open the shared RGB picker for an element color field in the Edit Content modal.
        // styleKey is the element CSS property name (color / backgroundColor / borderColor).
        function openElemColorPicker(inputId, propName) {
            const hex = document.getElementById(inputId).value || '#000000';
            const rgb = hexToRgb(hex);
            rgbTarget = { inputId, styleKey: propName, elementMode: true };
            document.getElementById('rgb-r').value = rgb.r;
            document.getElementById('rgb-g').value = rgb.g;
            document.getElementById('rgb-b').value = rgb.b;
            document.getElementById('rgb-hex').value = hex.toUpperCase();
            updateRgbPreview();
            document.getElementById('rgb-picker').classList.remove('hidden');
        }
        
        // Apply a picked color to the element currently being edited (live preview only;
        // mergeElementStylesInto persists it when the modal's Save button is clicked).
        function applyElemColorToModalElement(inputId, hex) {
            if (!modalElementId) return;
            const prop = ELEM_FIELDS[inputId];
            if (!prop) return;
            const sel = '#' + modalElementId;
            const props = customStyles[sel] || (customStyles[sel] = {});
            props[prop] = hex;
            applyCustomStyles(customStyles);
        }
        
        // Keep an element color swatch in sync with its text input.
        function updateElemColorSwatch(inputId) {
            const swatch = document.getElementById(inputId + '-swatch');
            const input = document.getElementById(inputId);
            if (!swatch || !input) return;
            const v = String(input.value || '').trim();
            swatch.style.background = /^#?[0-9a-fA-F]{6}$/.test(v) || /^#?[0-9a-fA-F]{3}$/.test(v) ? v : 'transparent';
        }
        
        function applyRgbPicker() {
            if (!rgbTarget) return;
            const hexInput = document.getElementById('rgb-hex');
            let hex = String(hexInput.value || '').trim().toUpperCase();
            if (!/^#?[0-9A-F]{6}$/.test(hex)) {
                const rgb = hexToRgb(hexInput.value);
                hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            }
            if (hex.charAt(0) !== '#') hex = '#' + hex;
            setColorInput(rgbTarget.inputId, hex);
            if (rgbTarget.elementMode) {
                // Element style color (Edit Content modal): live-preview on the element.
                // It is persisted when the modal's Save button is clicked.
                applyElemColorToModalElement(rgbTarget.inputId, hex);
            } else {
                updateStyle(rgbTarget.styleKey, hex);
            }
            showToast('Color applied');
            closeRgbPicker();
        }
        
        function closeRgbPicker() {
            document.getElementById('rgb-picker').classList.add('hidden');
            rgbTarget = null;
        }
        
        document.addEventListener('keydown', (e) => {
            const picker = document.getElementById('rgb-picker');
            if (!picker || picker.classList.contains('hidden')) return;
            if (e.key === 'Escape') { closeRgbPicker(); return; }
            if (e.key === 'Enter') { e.preventDefault(); applyRgbPicker(); }
        });
        
        function editorResetStyles() {
            if (confirm('Reset all styles to default?')) {
                setColorInput('editor-primary', '#3C1B69');
                setColorInput('editor-gold', '#C9A96E');
                setColorInput('editor-background', '#3C1B69');
                setColorInput('editor-text', '#11071F');
                setColorInput('editor-hero-title-color', '#FFFFFF');
                setColorInput('editor-hero-accent-color', '#C9A96E');
                updateStyle('primary', '#3C1B69');
                updateStyle('gold', '#C9A96E');
                updateStyle('background', '#3C1B69');
                updateStyle('text', '#11071F');
                updateStyle('hero-title-color', '#FFFFFF');
                updateStyle('hero-accent-color', '#C9A96E');
                localStorage.removeItem('portfolio-styles');
                localStorage.removeItem('portfolio-content');
                fetch('/api/config').then(r => r.json()).then(applyContent).catch(() => {});
                showToast('Styles and content reset to default');
            }
        }
        
        function applyStyles(styles) {
            if (styles.primary_color) {
                document.documentElement.style.setProperty('--primary', styles.primary_color);
                setColorInput('editor-primary', styles.primary_color);
            }
            if (styles.gold_color) {
                document.documentElement.style.setProperty('--gold', styles.gold_color);
                setColorInput('editor-gold', styles.gold_color);
            }
            if (styles.background_color) {
                document.documentElement.style.setProperty('--background', styles.background_color);
                setColorInput('editor-background', styles.background_color);
            }
            if (styles.text_color) {
                document.documentElement.style.setProperty('--text', styles.text_color);
                setColorInput('editor-text', styles.text_color);
            }
            if (styles.hero_title_color) {
                document.documentElement.style.setProperty('--hero-title-color', styles.hero_title_color);
                setColorInput('editor-hero-title-color', styles.hero_title_color);
            }
            if (styles.hero_accent_color) {
                document.documentElement.style.setProperty('--hero-accent-color', styles.hero_accent_color);
                setColorInput('editor-hero-accent-color', styles.hero_accent_color);
            }
        }
        
        // ============ CONTENT EDITOR ============
        
        // Editable landing page fields. key = site_config key, ids = elements updated via textContent
        const CONTENT_FIELDS = window.PAGE_CONTENT_FIELDS || [];

        
        function escapeHtml(str) {
            return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        }
        
        function escapeHtml(str) {
            return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        }
        
        // Map element id -> config key (used by click-to-edit)
        const ID_TO_KEY = {};
        CONTENT_FIELDS.forEach(field => (field.ids || []).forEach(id => { ID_TO_KEY[id] = field.key; }));
        
        // Card containers that hold their own text inside — draggable and
        // style-editable (Element Styles tab only, no single text value to save).
        const STYLE_ONLY_IDS = new Set(['about-education-card', 'about-approach-card', 'about-mission-card']);
        STYLE_ONLY_IDS.forEach(id => { ID_TO_KEY[id] = id; });
        
        let contentEditMode = false;
        let contentAccent = 'Modern Educational Innovation';
        let modalKey = null;        // config key being edited
        let modalElementId = null;  // element id being edited
        let customStyles = {};      // CSS selector -> { camelCase prop: value }
        
        // ---- Floating hero badges (icon, title, subtitle, pos) ----
        const DEFAULT_BADGES = [
            { icon: 'school', title: 'Educator', subtitle: 'Islamic Studies', pos: '-right-6 top-12' },
            { icon: 'code', title: 'Developer', subtitle: 'Web Design', pos: '-left-6 bottom-24' },
            { icon: 'translate', title: 'Arabic', subtitle: 'Language Specialist', pos: '-right-2 bottom-4' }
        ];
        let badgesData = null;      // array loaded from config
        let modalBadgeIndex = null; // badge being edited in the modal (or null)
        let modalPhotoMode = false; // photo/frame editor mode
        
        function getBadges() {
            return (badgesData && badgesData.length) ? badgesData : DEFAULT_BADGES;
        }
        
        function renderBadges(list) {
            badgesData = (Array.isArray(list) && list.length) ? list : DEFAULT_BADGES;
            const containers = document.querySelectorAll('.hero-badges-container');
            if (!containers.length) return;
            containers.forEach(container => {
                container.innerHTML = badgesData.map((b, i) => `
                    <div id="hero-badge-${i}" data-badge-index="${i}" class="hero-badge absolute ${escapeHtml(b.pos || '-right-6 top-12')} bg-white rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3">
                        <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <span class="material-symbols-outlined text-primary">${escapeHtml(b.icon || 'school')}</span>
                        </div>
                        <div>
                            <span class="text-sm font-bold text-gray-900 block">${escapeHtml(b.title || '')}</span>
                            <span class="text-xs text-gray-500">${escapeHtml(b.subtitle || '')}</span>
                        </div>
                    </div>
                `).join('');
                if (contentEditMode) {
                    container.querySelectorAll('.hero-badge').forEach(el => el.classList.add('editable-hint'));
                }
            });
        }
        
        function saveBadges(badges) {
            const payload = { hero_badges: JSON.stringify(badges) };
            fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    try {
                        let local = {};
                        try { local = JSON.parse(localStorage.getItem('portfolio-content')) || {}; } catch (err) {}
                        local.hero_badges = payload.hero_badges;
                        localStorage.setItem('portfolio-content', JSON.stringify(local));
                    } catch (err) {}
                }
            })
            .catch(() => {});
        }
        
        // ---- About section highlight chips (icon, label) ----
        
        const DEFAULT_HIGHLIGHTS = [
            { icon: 'mosque', label: 'Islamic Education' },
            { icon: 'translate', label: 'Arabic Language' },
            { icon: 'school', label: 'Curriculum Development' },
            { icon: 'devices', label: 'Web Design' }
        ];
        let highlightsData = null;      // array loaded from config
        let modalHighlightIndex = null; // highlight being edited in the modal (or null)
        
        function getHighlights() {
            return (highlightsData && highlightsData.length) ? highlightsData : DEFAULT_HIGHLIGHTS;
        }
        
        function renderHighlights(list) {
            highlightsData = (Array.isArray(list) && list.length) ? list : DEFAULT_HIGHLIGHTS;
            const container = document.getElementById('about-highlights');
            if (!container) return;
            container.innerHTML = highlightsData.map((h, i) => `
                <div id="about-highlight-${i}" data-highlight-index="${i}" class="about-highlight flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span class="material-symbols-outlined text-primary">${escapeHtml(h.icon || 'school')}</span>
                    <span class="text-sm font-medium">${escapeHtml(h.label || '')}</span>
                </div>
            `).join('');
            if (contentEditMode) {
                container.querySelectorAll('.about-highlight').forEach(el => el.classList.add('editable-hint'));
            }
        }
        
        function saveHighlights(highlights) {
            const payload = { about_highlights: JSON.stringify(highlights) };
            fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    try {
                        let local = {};
                        try { local = JSON.parse(localStorage.getItem('portfolio-content')) || {}; } catch (err) {}
                        local.about_highlights = payload.about_highlights;
                        localStorage.setItem('portfolio-content', JSON.stringify(local));
                    } catch (err) {}
                }
            })
            .catch(() => {});
        }
        
        // Default value for a field = the text currently rendered on the page
        function defaultForField(field) {
            const first = (field.ids || []).map(id => document.getElementById(id)).find(Boolean);
            return first ? first.textContent.replace(/\s+/g, ' ').trim() : '';
        }
        
        function setContentValue(key, value) {
            const field = CONTENT_FIELDS.find(f => f.key === key);
            if (!field || value == null) return;
            if (field.heroTitle) { renderHeroTitle(value); return; }
            (field.ids || []).forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                el.textContent = value;
                if (field.email && el.tagName === 'A') el.setAttribute('href', 'mailto:' + value);
            });
        }
        
        function renderHeroTitle(title) {
            const el = document.getElementById('content-hero-title');
            if (!el) return;
            let safe = escapeHtml(title || '');
            // Normalize the accent phrase (trim + drop trailing punctuation) so a
            // phrase like "Modern Educational Technology." still matches the title.
            const accentNorm = String(contentAccent || '').replace(/\s+/g, ' ').replace(/[.,!?;:]+$/, '').trim();
            const accentEsc = escapeHtml(accentNorm);
            if (accentNorm && safe.includes(accentEsc)) {
                safe = safe.replace(accentEsc, `<span id="content-hero-accent" style="color:var(--hero-accent-color)">${accentEsc}</span>`);
            }
            el.innerHTML = safe;
        }
        
        function applyContent(config) {
            // Per-element custom styles (selector -> props), applied as real CSS
            if (config && config.custom_styles) {
                try { customStyles = JSON.parse(config.custom_styles) || {}; } catch (err) { customStyles = {}; }
                applyCustomStyles(customStyles);
            }
            // Apply the uploaded hero photo from config (the static HTML only has a placeholder src)
            if (config && config.hero_image_url) {
                const heroImg = document.getElementById('hero-image');
                if (heroImg) heroImg.src = config.hero_image_url;
            }
            // Floating badges around the hero photo
            let parsedBadges = null;
            if (config && config.hero_badges) {
                try { parsedBadges = JSON.parse(config.hero_badges); } catch (err) { parsedBadges = null; }
            }
            renderBadges(parsedBadges);
            // Entire photo block (photo + badges) can be hidden via the photo editor
            const photoHidden = !!(config && config.hero_photo_hidden === 'true');
            const block = document.getElementById('hero-photo-block');
            if (block) block.classList.toggle('hidden', photoHidden);
            const showBtn = document.getElementById('editor-show-photo');
            if (showBtn) showBtn.classList.toggle('hidden', !photoHidden);
            // Education timeline + core competencies (JSON arrays in site config)
            let parsedEducation = null;
            if (config && config.education_items) {
                try { parsedEducation = JSON.parse(config.education_items); } catch (err) { parsedEducation = null; }
            }
            renderEducationItems(parsedEducation);
            let parsedCompetencies = null;
            if (config && config.core_competencies) {
                try { parsedCompetencies = JSON.parse(config.core_competencies); } catch (err) { parsedCompetencies = null; }
            }
            renderCompetencies(parsedCompetencies);
            CONTENT_FIELDS.forEach(field => {
                const value = config && config[field.key] != null ? config[field.key] : defaultForField(field);
                if (field.key === 'hero_title_accent') { contentAccent = value || contentAccent; return; }
                setContentValue(field.key, value);
            });
        }
        
        // ---- Click-to-edit mode ----
        
        function toggleContentEdit() {
            if (contentEditMode) exitContentEdit();
            else enterContentEdit();
        }
        
        function enterContentEdit() {
            contentEditMode = true;
            document.body.classList.add('content-edit-mode');
            const btn = document.getElementById('content-edit-toggle');
            if (btn) btn.textContent = '✏️ Stop Editing';
            const bar = document.getElementById('content-edit-bar');
            if (bar) bar.classList.remove('hidden');
            CONTENT_FIELDS.forEach(field => (field.ids || []).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('editable-hint');
            }));
            document.querySelectorAll('.hero-badges-container .hero-badge').forEach(el => el.classList.add('editable-hint'));
            STYLE_ONLY_IDS.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('editable-hint');
            });
            refreshEditableHints();
            showToast('Hover any text and click Edit', 'info');
        }
        
        function exitContentEdit() {
            closeContentModal();
            contentEditMode = false;
            document.body.classList.remove('content-edit-mode');
            const btn = document.getElementById('content-edit-toggle');
            if (btn) btn.textContent = '✏️ Edit Content on Page';
            const bar = document.getElementById('content-edit-bar');
            if (bar) bar.classList.add('hidden');
            hideEditPill();
            document.querySelectorAll('.editable-hint').forEach(el => el.classList.remove('editable-hint'));
        }
        
        // ---------- Drag to move elements ----------
        
        let dragState = null;
        let suppressNextClick = false;
        
        function getPersistedTranslate(elId) {
            const p = customStyles['#' + elId] || {};
            return { tx: parseFloat(p.translateX) || 0, ty: parseFloat(p.translateY) || 0 };
        }
        
        function applyDragTransform(el, dx, dy) {
            const props = customStyles['#' + el.id] || {};
            const parts = [];
            if (dx !== 0 || dy !== 0) parts.push('translate(' + dx + 'px, ' + dy + 'px)');
            if (props.rotation) parts.push('rotate(' + props.rotation + 'deg)');
            if (props.scale) parts.push('scale(' + props.scale + ')');
            el.style.transform = parts.join(' ') || '';
        }
        
        // ---------- Arrow-key nudge for the active element ----------
        
        let activeMoveElementId = null;
        let moveKeyTimer = null;
        
        function setActiveMoveElement(id) {
            if (activeMoveElementId) {
                const old = document.getElementById(activeMoveElementId);
                if (old) old.classList.remove('move-active');
            }
            activeMoveElementId = id;
            const el = document.getElementById(id);
            if (el) el.classList.add('move-active');
        }
        
        function moveActiveElement(dx, dy) {
            if (!activeMoveElementId) return;
            const sel = '#' + activeMoveElementId;
            const props = customStyles[sel] || (customStyles[sel] = {});
            const curX = parseFloat(props.translateX) || 0;
            const curY = parseFloat(props.translateY) || 0;
            const nx = curX + dx;
            const ny = curY + dy;
            if (nx === 0) delete props.translateX; else props.translateX = nx + 'px';
            if (ny === 0) delete props.translateY; else props.translateY = ny + 'px';
            if (!Object.keys(props).length) delete customStyles[sel];
            applyCustomStyles(customStyles);
            if (moveKeyTimer) clearTimeout(moveKeyTimer);
            moveKeyTimer = setTimeout(saveCustomStyles, 350);
        }
        
        document.addEventListener('keydown', (e) => {
            if (!contentEditMode || !activeMoveElementId) return;
            const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
            if (!arrows[e.key]) return;
            const t = e.target;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
            if (!document.getElementById('content-modal').classList.contains('hidden')) return;
            if (!document.getElementById('rgb-picker').classList.contains('hidden')) return;
            e.preventDefault();
            const step = e.shiftKey ? 20 : 5;
            moveActiveElement(arrows[e.key][0] * step, arrows[e.key][1] * step);
        });
        
        function saveCustomStyles() {
            fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ custom_styles: JSON.stringify(customStyles) })
            })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    try {
                        let local = {};
                        try { local = JSON.parse(localStorage.getItem('portfolio-content')) || {}; } catch (err) {}
                        local.custom_styles = JSON.stringify(customStyles);
                        localStorage.setItem('portfolio-content', JSON.stringify(local));
                    } catch (err) {}
                }
            })
            .catch(() => {});
        }
        
        document.addEventListener('mousedown', (e) => {
            if (!contentEditMode || dragState || e.button !== 0) return;
            if (e.target.closest('#edit-pill') || e.target.closest('#content-modal') || e.target.closest('#rgb-picker') || e.target.closest('#list-item-modal')) return;
            // Find the nearest movable ancestor (editable element or the hero image),
            // so overlays/child elements still let you drag what they cover.
            let node = e.target;
            let idEl = null;
            while (node && node !== document.body) {
                if (node.id && (ID_TO_KEY[node.id] || node.id === 'hero-image' || node.id === 'hero-frame' || node.id.indexOf('hero-badge-') === 0)) {
                    // Dragging the photo (or its frame) moves the whole photo block
                    idEl = (node.id === 'hero-image' || node.id === 'hero-frame') ? (document.getElementById('hero-photo-block') || node) : node;
                    break;
                }
                // The hero photo sits inside a frame with overlays on top — treat the
                // frame's direct container as the block itself.
                if (node.querySelector && node.querySelector(':scope > #hero-image')) {
                    idEl = document.getElementById('hero-photo-block') || document.getElementById('hero-image');
                    break;
                }
                node = node.parentElement;
            }
            if (!idEl) return;
            const base = getPersistedTranslate(idEl.id);
            dragState = { el: idEl, startX: e.clientX, startY: e.clientY, moved: false, base, lastDx: 0, lastDy: 0 };
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!dragState) return;
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;
            if (!dragState.moved && Math.abs(dx) + Math.abs(dy) > 5) {
                dragState.moved = true;
                document.body.classList.add('element-dragging');
                hideEditPill();
            }
            if (dragState.moved) {
                dragState.lastDx = dx;
                dragState.lastDy = dy;
                applyDragTransform(dragState.el, dragState.base.tx + dx, dragState.base.ty + dy);
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (!dragState) return;
            const st = dragState;
            dragState = null;
            document.body.classList.remove('element-dragging');
            if (!st.moved) return;
            suppressNextClick = true;
            const totalX = Math.round(st.base.tx + st.lastDx);
            const totalY = Math.round(st.base.ty + st.lastDy);
            const sel = '#' + st.el.id;
            const props = customStyles[sel] || (customStyles[sel] = {});
            if (totalX === 0) delete props.translateX; else props.translateX = totalX + 'px';
            if (totalY === 0) delete props.translateY; else props.translateY = totalY + 'px';
            if (!Object.keys(props).length) delete customStyles[sel];
            applyCustomStyles(customStyles);
            st.el.style.transform = '';
            saveCustomStyles();
            setActiveMoveElement(st.el.id);
            showToast('Element moved — saved');
        });
        
        // ---------- Drag highlight chips to reorder them (About section) ----------
        
        let chipDrag = null; // { el, index, startX, startY, moved }
        
        document.addEventListener('mousedown', (e) => {
            if (!contentEditMode || chipDrag || e.button !== 0) return;
            if (e.target.closest('#edit-pill') || e.target.closest('#content-modal') || e.target.closest('#rgb-picker') || e.target.closest('#list-item-modal')) return;
            const chip = e.target.closest('.about-highlight');
            if (!chip) return;
            chipDrag = { el: chip, index: parseInt(chip.dataset.highlightIndex, 10), startX: e.clientX, startY: e.clientY, moved: false };
            e.preventDefault();
        });
        
        // Index the dragged chip should land at: after every other chip whose
        // vertical center is above the dragged chip's center.
        function highlightDropIndex() {
            const container = document.getElementById('about-highlights');
            if (!container || !chipDrag) return chipDrag.index;
            const chips = Array.from(container.querySelectorAll('.about-highlight'));
            const rect = chipDrag.el.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            let idx = 0;
            chips.forEach(c => {
                if (c === chipDrag.el) return;
                const r = c.getBoundingClientRect();
                if (r.top + r.height / 2 < centerY) idx++;
            });
            return Math.min(idx, chips.length - 1);
        }
        
        document.addEventListener('mousemove', (e) => {
            if (!chipDrag) return;
            const dy = e.clientY - chipDrag.startY;
            if (!chipDrag.moved && Math.abs(e.clientX - chipDrag.startX) + Math.abs(dy) > 5) {
                chipDrag.moved = true;
                document.body.classList.add('element-dragging');
                chipDrag.el.classList.add('dragging');
                hideEditPill();
            }
            if (!chipDrag.moved) return;
            // Float the chip under the cursor while dragging
            chipDrag.el.style.transform = 'translateY(' + dy + 'px)';
            // Live-reorder as the chip crosses other chips' centers
            const target = highlightDropIndex();
            if (target !== chipDrag.index) {
                const list = highlightsData.slice();
                const [item] = list.splice(chipDrag.index, 1);
                list.splice(target, 0, item);
                renderHighlights(list);
                const chips = document.getElementById('about-highlights').querySelectorAll('.about-highlight');
                chipDrag.el = chips[target];
                chipDrag.index = target;
                chipDrag.el.classList.add('dragging');
                chipDrag.el.style.transform = 'translateY(' + dy + 'px)';
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (!chipDrag) return;
            const st = chipDrag;
            chipDrag = null;
            document.body.classList.remove('element-dragging');
            if (!st.moved) return;
            suppressNextClick = true;
            st.el.classList.remove('dragging');
            st.el.style.transform = '';
            saveHighlights(highlightsData);
            setActiveMoveElement(st.el.id);
            showToast('Highlight moved — saved');
        });
        
        // ---------- Drag to reorder project cards (grid-aware) ----------
        
        let projectDrag = null;
        
        document.addEventListener('mousedown', (e) => {
            if (!contentEditMode || projectDrag || e.button !== 0) return;
            if (e.target.closest('#edit-pill') || e.target.closest('#content-modal') || e.target.closest('#rgb-picker') || e.target.closest('#list-item-modal')) return;
            const card = e.target.closest('[id^="project-card-"]');
            if (!card) return;
            projectDrag = { el: card, index: parseInt(card.dataset.projectIndex, 10), startX: e.clientX, startY: e.clientY, moved: false };
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!projectDrag) return;
            const dx = e.clientX - projectDrag.startX;
            const dy = e.clientY - projectDrag.startY;
            if (!projectDrag.moved && Math.abs(dx) + Math.abs(dy) > 5) {
                projectDrag.moved = true;
                document.body.classList.add('element-dragging');
                hideEditPill();
            }
            if (projectDrag.moved) {
                projectDrag.el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
                projectDrag.el.style.zIndex = '100';
                projectDrag.el.style.opacity = '0.85';
            }
        });
        
        function projectCardDropIndex(draggedEl) {
            const container = document.getElementById('projects-grid');
            if (!container) return -1;
            const cards = Array.from(container.querySelectorAll('[id^="project-card-"]'));
            const dragRect = draggedEl.getBoundingClientRect();
            const dragY = dragRect.top + dragRect.height / 2;
            const dragX = dragRect.left + dragRect.width / 2;
            let idx = 0;
            cards.forEach(c => {
                if (c === draggedEl) return;
                const r = c.getBoundingClientRect();
                const cy = r.top + r.height / 2;
                const cx = r.left + r.width / 2;
                if (cy < dragY - 20 || (Math.abs(cy - dragY) < 20 && cx < dragX - 20)) idx++;
            });
            return Math.min(idx, cards.length - 1);
        }
        
        async function moveProjectCard(fromIdx, toIdx) {
            if (fromIdx === toIdx) return;
            if (!(await ensureEditorAuth())) { showToast('Not authorized — log in via /admin', 'error'); return; }
            const items = editorProjects.slice();
            const [item] = items.splice(fromIdx, 1);
            items.splice(toIdx, 0, item);
            for (let i = 0; i < items.length; i++) {
                if (items[i].sort_order !== i + 1) {
                    await fetch('/api/projects/' + items[i].id, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sort_order: i + 1 })
                    });
                }
            }
            editorProjects = items;
            refreshPageLists();
            refreshEditableHints();
            showToast('Project moved');
        }
        
        document.addEventListener('mouseup', (e) => {
            if (!projectDrag) return;
            const st = projectDrag;
            projectDrag = null;
            document.body.classList.remove('element-dragging');
            st.el.style.transform = '';
            st.el.style.zIndex = '';
            st.el.style.opacity = '';
            if (!st.moved) return;
            suppressNextClick = true;
            const dropIdx = projectCardDropIndex(st.el);
            if (dropIdx >= 0) moveProjectCard(st.index, dropIdx);
        });
        
        // Re-apply editable-hint to dynamically rendered project cards after re-renders
        function refreshEditableHints() {
            if (!contentEditMode) return;
            document.querySelectorAll('[id^="project-card-"]').forEach(el => el.classList.add('editable-hint'));
        }
        
        function handleContentClick(e) {
            if (!contentEditMode) return;
            if (suppressNextClick) { suppressNextClick = false; return; }
            // Floating badge: opens the badge editor
            const badge = e.target.closest('[id^="hero-badge-"]');
            if (badge) {
                e.preventDefault();
                const idx = parseInt(badge.dataset.badgeIndex, 10);
                if (!isNaN(idx)) {
                    setActiveMoveElement(badge.id);
                    openBadgeModal(idx);
                }
                return;
            }
            // About highlight chip: opens the highlight editor
            const hl = e.target.closest('[id^="about-highlight-"]');
            if (hl) {
                e.preventDefault();
                const idx = parseInt(hl.dataset.highlightIndex, 10);
                if (!isNaN(idx)) {
                    setActiveMoveElement(hl.id);
                    openHighlightModal(idx);
                }
                return;
            }
            // Project card: opens the list-item editor for that project
            const projectCard = e.target.closest('[id^="project-card-"]');
            if (projectCard && !e.target.closest('#list-item-modal')) {
                e.preventDefault();
                const idx = parseInt(projectCard.dataset.projectIndex, 10);
                if (!isNaN(idx)) {
                    setActiveMoveElement(projectCard.id);
                    openListItemEditor('project', idx);
                }
                return;
            }
            // Hero photo: clicking opens the photo & frame editor
            const img = e.target.closest('#hero-image');
            if (img) {
                e.preventDefault();
                setActiveMoveElement('hero-photo-block');
                openPhotoModal();
                return;
            }
            // "Edit" pill → open the modal for its element
            const pill = e.target.closest('#edit-pill');
            if (pill) {
                e.preventDefault();
                e.stopPropagation();
                const id = pill.dataset.for;
                if (id && ID_TO_KEY[id]) {
                    setActiveMoveElement(id);
                    openContentModal(id, ID_TO_KEY[id]);
                } else if (id && id.indexOf('hero-badge-') === 0) {
                    const idx = parseInt(document.getElementById(id) && document.getElementById(id).dataset.badgeIndex, 10);
                    if (!isNaN(idx)) {
                        setActiveMoveElement(id);
                        openBadgeModal(idx);
                    }
                } else if (id && id.indexOf('about-highlight-') === 0) {
                    const idx = parseInt(document.getElementById(id) && document.getElementById(id).dataset.highlightIndex, 10);
                    if (!isNaN(idx)) {
                        setActiveMoveElement(id);
                        openHighlightModal(idx);
                    }
                }
                return;
            }
            // Clicking an editable element opens the modal too
            const idEl = e.target.closest('[id]');
            if (idEl && ID_TO_KEY[idEl.id]) {
                e.preventDefault();
                setActiveMoveElement(idEl.id);
                openContentModal(idEl.id, ID_TO_KEY[idEl.id]);
            }
        }
        
        // ---------- Hover "Edit" pill ----------
        
        function hideEditPill() {
            const pill = document.getElementById('edit-pill');
            if (pill) pill.classList.add('hidden');
        }
        
        function positionEditPill(target) {
            const pill = document.getElementById('edit-pill');
            if (!pill) return;
            const rect = target.getBoundingClientRect();
            pill.style.top = Math.max(4, rect.top - 46) + 'px';
            pill.style.left = Math.max(4, rect.right - 92) + 'px';
            pill.dataset.for = target.id;
            pill.classList.remove('hidden');
        }
        
        document.addEventListener('mouseover', (e) => {
            if (!contentEditMode) return;
            const badge = e.target.closest('[id^="hero-badge-"]');
            if (badge) {
                positionEditPill(badge);
                return;
            }
            const hl = e.target.closest('[id^="about-highlight-"]');
            if (hl) {
                positionEditPill(hl);
                return;
            }
            const projCard = e.target.closest('[id^="project-card-"]');
            if (projCard) {
                positionEditPill(projCard);
                return;
            }
            const idEl = e.target.closest('[id]');
            if (idEl && ID_TO_KEY[idEl.id]) {
                positionEditPill(idEl);
            } else if (!e.target.closest('#edit-pill')) {
                hideEditPill();
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (!contentEditMode) return;
            const related = e.relatedTarget;
            if (related && related.closest && related.closest('#edit-pill')) return;
            hideEditPill();
        });
        
        // ---------- Modal editor ----------
        
        function prefillElementStyleInputs(elementId) {
            const props = customStyles['#' + elementId] || {};
            document.getElementById('elem-margin').value = props.margin || '';
            document.getElementById('elem-padding').value = props.padding || '';
            document.getElementById('elem-font-size').value = props.fontSize || '';
            document.getElementById('elem-bold').classList.toggle('elem-format-on', props.fontWeight === 'bold' || props.fontWeight === '700');
            document.getElementById('elem-italic').classList.toggle('elem-format-on', props.fontStyle === 'italic');
            const deco = props.textDecoration || '';
            document.getElementById('elem-underline').classList.toggle('elem-format-on', deco.includes('underline'));
            document.getElementById('elem-strike').classList.toggle('elem-format-on', deco.includes('line-through'));
            document.getElementById('elem-color').value = props.color || '';
            document.getElementById('elem-bg').value = props.backgroundColor || '';
            ['left', 'center', 'right', 'justify'].forEach(v => {
                document.getElementById('elem-align-' + v).classList.toggle('elem-format-on', props.textAlign === v);
            });
            document.getElementById('elem-radius').value = props.borderRadius || '';
            document.getElementById('elem-font-family').value = props.fontFamily || '';
            document.getElementById('elem-line-height').value = props.lineHeight || '';
            document.getElementById('elem-letter-spacing').value = props.letterSpacing || '';
            document.getElementById('elem-border-width').value = props.borderWidth || '';
            document.getElementById('elem-border-style').value = props.borderStyle || '';
            document.getElementById('elem-border-color').value = props.borderColor || '';
            document.getElementById('elem-shadow').value = props.boxShadow || '';
            const opacityPct = props.opacity != null ? String(Math.round(parseFloat(props.opacity) * 100)) : '100';
            document.getElementById('elem-opacity').value = opacityPct;
            document.getElementById('elem-opacity-value').textContent = opacityPct;
            const rot = props.rotation != null ? String(parseInt(props.rotation, 10)) : '0';
            document.getElementById('elem-rotation').value = rot;
            document.getElementById('elem-rotation-value').textContent = rot + '°';
            const scl = props.scale != null ? String(props.scale) : '1';
            document.getElementById('elem-scale').value = scl;
            document.getElementById('elem-scale-value').textContent = scl;
            document.getElementById('elem-width').value = props.width || '';
            document.getElementById('elem-height').value = props.height || '';
            document.getElementById('elem-move-x').value = props.translateX || '';
            document.getElementById('elem-move-y').value = props.translateY || '';
            ['elem-color', 'elem-bg', 'elem-border-color'].forEach(updateElemColorSwatch);
        }
        
        function openContentModal(elementId, key) {
            const el = document.getElementById(elementId);
            if (!el) return;
            const styleOnly = STYLE_ONLY_IDS.has(elementId);
            modalElementId = elementId;
            modalKey = key;
            document.getElementById('content-modal-key').textContent = styleOnly ? 'Card element styles' : key;
            document.getElementById('content-modal-textarea').value = el.textContent.replace(/\s+/g, ' ').trim();
            prefillElementStyleInputs(elementId);
            modalBadgeIndex = null;
            modalHighlightIndex = null;
            document.getElementById('content-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            const contentTab = document.getElementById('tab-content');
            if (contentTab) contentTab.classList.toggle('hidden', styleOnly);
            showModalTab(styleOnly ? 'styles' : 'content');
            hideEditPill();
            if (!styleOnly) document.getElementById('content-modal-textarea').focus();
        }
        
        // ---- Badge editor (floating badges around the hero photo) ----
        
        function openBadgeModal(index) {
            const badges = getBadges();
            if (!badges[index]) return;
            modalBadgeIndex = index;
            modalHighlightIndex = null;
            modalElementId = 'hero-badge-' + index;
            modalKey = 'hero_badges';
            document.getElementById('content-modal-key').textContent = 'Hero badge ' + (index + 1) + ' of ' + badges.length;
            document.getElementById('badge-title').value = badges[index].title || '';
            document.getElementById('badge-subtitle').value = badges[index].subtitle || '';
            document.getElementById('badge-icon').value = badges[index].icon || 'school';
            const posSelect = document.getElementById('badge-pos');
            const pos = badges[index].pos || '-right-6 top-12';
            if (!Array.from(posSelect.options).some(o => o.value === pos)) {
                const opt = document.createElement('option');
                opt.value = pos;
                opt.textContent = 'Custom (drag-set)';
                posSelect.appendChild(opt);
            }
            posSelect.value = pos;
            prefillElementStyleInputs('hero-badge-' + index);
            document.getElementById('content-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            showModalTab('content');
            hideEditPill();
            document.getElementById('badge-title').focus();
        }
        
        // ---- About highlight editor (chips in the About section) ----
        
        function openHighlightModal(index) {
            const highlights = getHighlights();
            if (!highlights[index]) return;
            modalHighlightIndex = index;
            modalBadgeIndex = null;
            modalPhotoMode = false;
            modalElementId = 'about-highlight-' + index;
            modalKey = 'about_highlights';
            document.getElementById('content-modal-key').textContent = 'About highlight ' + (index + 1) + ' of ' + highlights.length;
            document.getElementById('highlight-label').value = highlights[index].label || '';
            document.getElementById('highlight-icon').value = highlights[index].icon || 'school';
            prefillElementStyleInputs('about-highlight-' + index);
            document.getElementById('content-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            showModalTab('content');
            hideEditPill();
            document.getElementById('highlight-label').focus();
        }
        
        function saveModal() {
            if (modalPhotoMode) savePhotoModal();
            else if (modalBadgeIndex != null) saveBadgeModal();
            else if (modalHighlightIndex != null) saveHighlightModal();
            else saveContentModal();
        }
        
        function saveHighlightModal() {
            if (modalHighlightIndex == null) return;
            const highlights = getHighlights().slice();
            const label = document.getElementById('highlight-label').value.trim();
            if (!label) { showToast('Label cannot be empty', 'error'); return; }
            highlights[modalHighlightIndex] = Object.assign({}, highlights[modalHighlightIndex], {
                label: label,
                icon: document.getElementById('highlight-icon').value
            });
            renderHighlights(highlights);
            // Persist element styles too (font, colors…) alongside the highlight
            mergeElementStylesInto('#' + modalElementId);
            const payload = { about_highlights: JSON.stringify(highlights), custom_styles: JSON.stringify(customStyles) };
            fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    try {
                        let local = {};
                        try { local = JSON.parse(localStorage.getItem('portfolio-content')) || {}; } catch (err) {}
                        local.about_highlights = payload.about_highlights;
                        local.custom_styles = payload.custom_styles;
                        localStorage.setItem('portfolio-content', JSON.stringify(local));
                    } catch (err) {}
                }
            })
            .catch(() => {});
            showToast('Highlight saved');
            closeContentModal();
        }
        
        function removeHighlight() {
            if (modalHighlightIndex == null) return;
            const highlights = getHighlights().slice();
            const removedId = 'about-highlight-' + modalHighlightIndex;
            highlights.splice(modalHighlightIndex, 1);
            // Drop any custom styles tied to the removed chip
            if (customStyles[removedId] !== undefined) {
                delete customStyles[removedId];
                applyCustomStyles(customStyles);
                const payload = { custom_styles: JSON.stringify(customStyles) };
                fetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
            }
            renderHighlights(highlights);
            saveHighlights(highlights);
            showToast('Highlight removed');
            closeContentModal();
        }
        
        function addHighlight() {
            const highlights = getHighlights().slice();
            highlights.push({ icon: 'school', label: 'New Highlight' });
            renderHighlights(highlights);
            saveHighlights(highlights);
            openHighlightModal(highlights.length - 1);
        }
        
        function moveHighlight(dir) {
            if (modalHighlightIndex == null) return;
            const highlights = getHighlights().slice();
            const from = modalHighlightIndex;
            const to = from + dir;
            if (to < 0 || to >= highlights.length) return;
            const tmp = highlights[from];
            highlights[from] = highlights[to];
            highlights[to] = tmp;
            renderHighlights(highlights);
            saveHighlights(highlights);
            // Re-open the editor for the same chip at its new position
            openHighlightModal(to);
        }
        
        // ---- Photo & frame editor (hero photo block) ----
        
        function openPhotoModal() {
            modalPhotoMode = true;
            modalBadgeIndex = null;
            modalHighlightIndex = null;
            modalElementId = 'hero-frame';
            modalKey = 'hero_image_url';
            document.getElementById('content-modal-key').textContent = 'Hero photo & frame';
            prefillElementStyleInputs('hero-frame');
            document.getElementById('content-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            showModalTab('content');
            hideEditPill();
        }
        
        function savePhotoModal() {
            if (!modalPhotoMode) return;
            mergeElementStylesInto('#hero-frame');
            saveCustomStyles();
            showToast('Frame updated');
            closeContentModal();
        }
        
        async function hideHeroPhotoBlock() {
            const block = document.getElementById('hero-photo-block');
            if (block) block.classList.add('hidden');
            closeContentModal();
            const payload = { hero_photo_hidden: 'true' };
            try {
                await fetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                try {
                    let local = {};
                    try { local = JSON.parse(localStorage.getItem('portfolio-content')) || {}; } catch (err) {}
                    local.hero_photo_hidden = 'true';
                    localStorage.setItem('portfolio-content', JSON.stringify(local));
                } catch (err) {}
                showToast('Photo & badges hidden');
            } catch (err) {
                showToast('Hidden (server offline)', 'error');
            }
            const showBtn = document.getElementById('editor-show-photo');
            if (showBtn) showBtn.classList.remove('hidden');
        }
        
        async function showHeroPhotoBlock() {
            const block = document.getElementById('hero-photo-block');
            if (block) block.classList.remove('hidden');
            try {
                await fetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hero_photo_hidden: '' }) });
                try {
                    let local = {};
                    try { local = JSON.parse(localStorage.getItem('portfolio-content')) || {}; } catch (err) {}
                    local.hero_photo_hidden = '';
                    localStorage.setItem('portfolio-content', JSON.stringify(local));
                } catch (err) {}
            } catch (err) {}
            const showBtn = document.getElementById('editor-show-photo');
            if (showBtn) showBtn.classList.add('hidden');
            showToast('Photo & badges shown');
        }
        
        function saveBadgeModal() {
            if (modalBadgeIndex == null) return;
            const badges = getBadges().slice();
            const title = document.getElementById('badge-title').value.trim();
            if (!title) { showToast('Title cannot be empty', 'error'); return; }
            badges[modalBadgeIndex] = Object.assign({}, badges[modalBadgeIndex], {
                title: title,
                subtitle: document.getElementById('badge-subtitle').value.trim(),
                icon: document.getElementById('badge-icon').value,
                pos: document.getElementById('badge-pos').value
            });
            renderBadges(badges);
            // Persist element styles too (font, colors, drag offset…) alongside the badge
            mergeElementStylesInto('#' + modalElementId);
            const payload = { hero_badges: JSON.stringify(badges), custom_styles: JSON.stringify(customStyles) };
            fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    try {
                        let local = {};
                        try { local = JSON.parse(localStorage.getItem('portfolio-content')) || {}; } catch (err) {}
                        local.hero_badges = payload.hero_badges;
                        local.custom_styles = payload.custom_styles;
                        localStorage.setItem('portfolio-content', JSON.stringify(local));
                    } catch (err) {}
                }
            })
            .catch(() => {});
            showToast('Badge saved');
            closeContentModal();
        }
        
        function removeBadge() {
            if (modalBadgeIndex == null) return;
            const badges = getBadges().slice();
            const removedId = 'hero-badge-' + modalBadgeIndex;
            badges.splice(modalBadgeIndex, 1);
            // Drop any custom styles (drag offset, formatting) tied to the removed badge
            if (customStyles[removedId] !== undefined) {
                delete customStyles[removedId];
                applyCustomStyles(customStyles);
                const payload = { custom_styles: JSON.stringify(customStyles) };
                fetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
            }
            renderBadges(badges);
            saveBadges(badges);
            showToast('Badge removed');
            closeContentModal();
        }
        
        function addBadge() {
            const badges = getBadges().slice();
            badges.push({ icon: 'school', title: 'New Badge', subtitle: 'Add a tagline', pos: '-right-6 top-44' });
            renderBadges(badges);
            saveBadges(badges);
            openBadgeModal(badges.length - 1);
        }
        
        function closeContentModal() {
            document.getElementById('content-modal').classList.add('hidden');
            document.body.style.overflow = '';
            modalKey = null;
            modalElementId = null;
            modalBadgeIndex = null;
            modalHighlightIndex = null;
            modalPhotoMode = false;
            const contentTab = document.getElementById('tab-content');
            if (contentTab) contentTab.classList.remove('hidden');
        }
        
        function showModalTab(tab) {
            const active = 'px-4 py-2 text-sm font-semibold border-b-2 border-primary text-primary';
            const idle = 'px-4 py-2 text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-primary';
            document.getElementById('tab-content').className = tab === 'content' ? active : idle;
            document.getElementById('tab-styles').className = tab === 'styles' ? active : idle;
            const inBadgeMode = modalBadgeIndex != null;
            const inHighlightMode = modalHighlightIndex != null;
            document.getElementById('modal-pane-content').classList.toggle('hidden', tab !== 'content' || inBadgeMode || inHighlightMode || modalPhotoMode);
            document.getElementById('modal-pane-badge').classList.toggle('hidden', tab !== 'content' || !inBadgeMode || modalPhotoMode);
            document.getElementById('modal-pane-highlight').classList.toggle('hidden', tab !== 'content' || !inHighlightMode || modalPhotoMode);
            document.getElementById('modal-pane-photo').classList.toggle('hidden', tab !== 'content' || !modalPhotoMode);
            document.getElementById('modal-pane-styles').classList.toggle('hidden', tab !== 'styles');
            // Auto-expand the Text group so the alignment/format controls are immediately visible
            if (tab === 'styles') {
                const textGroup = document.getElementById('elem-group-text');
                if (textGroup && textGroup.classList.contains('hidden')) {
                    textGroup.classList.remove('hidden');
                    const chev = textGroup.previousElementSibling && textGroup.previousElementSibling.querySelector('.section-chevron');
                    if (chev) chev.textContent = 'expand_less';
                }
            }
        }
        
        // Element style inputs -> CSS property names (shared by collect + merge-on-save)
        const ELEM_FIELDS = {
            'elem-margin': 'margin',
            'elem-padding': 'padding',
            'elem-font-size': 'fontSize',
            'elem-color': 'color',
            'elem-bg': 'backgroundColor',
            'elem-radius': 'borderRadius',
            'elem-font-family': 'fontFamily',
            'elem-line-height': 'lineHeight',
            'elem-letter-spacing': 'letterSpacing',
            'elem-border-width': 'borderWidth',
            'elem-border-style': 'borderStyle',
            'elem-border-color': 'borderColor',
            'elem-shadow': 'boxShadow',
            'elem-width': 'width',
            'elem-height': 'height',
            'elem-move-x': 'translateX',
            'elem-move-y': 'translateY'
        };
        
        function collectElementStyleInputs() {
            const fields = ELEM_FIELDS;
            const props = {};
            for (const inputId in fields) {
                const v = document.getElementById(inputId).value.trim();
                if (v) props[fields[inputId]] = v;
            }
            // Text formatting toggles (Bold / Italic / Underline / Strikethrough)
            if (document.getElementById('elem-bold').classList.contains('elem-format-on')) props.fontWeight = 'bold';
            if (document.getElementById('elem-italic').classList.contains('elem-format-on')) props.fontStyle = 'italic';
            const deco = [];
            if (document.getElementById('elem-underline').classList.contains('elem-format-on')) deco.push('underline');
            if (document.getElementById('elem-strike').classList.contains('elem-format-on')) deco.push('line-through');
            if (deco.length) props.textDecoration = deco.join(' ');
            // Text alignment buttons (single-select)
            const align = ['left', 'center', 'right', 'justify'].find(v => document.getElementById('elem-align-' + v).classList.contains('elem-format-on'));
            if (align) props.textAlign = align;
            // Opacity is stored as 0-1 in CSS but edited as a 0-100 slider
            const opacityVal = document.getElementById('elem-opacity').value.trim();
            if (opacityVal !== '' && opacityVal !== '100') {
                props.opacity = String(parseInt(opacityVal, 10) / 100);
            }
            // Rotation/scale combine into one transform rule
            const rotVal = document.getElementById('elem-rotation').value.trim();
            if (rotVal !== '' && rotVal !== '0') props.rotation = String(parseInt(rotVal, 10));
            const scaleVal = document.getElementById('elem-scale').value.trim();
            if (scaleVal !== '' && scaleVal !== '1') props.scale = scaleVal;
            return props;
        }
        
        function clearElementStyles() {
            if (!modalElementId) return;
            delete customStyles['#' + modalElementId];
            applyCustomStyles(customStyles);
            ['elem-margin', 'elem-padding', 'elem-font-size', 'elem-color', 'elem-bg', 'elem-radius', 'elem-font-family', 'elem-line-height', 'elem-letter-spacing', 'elem-border-width', 'elem-border-style', 'elem-border-color', 'elem-shadow', 'elem-width', 'elem-height', 'elem-move-x', 'elem-move-y']
                .forEach(id => { document.getElementById(id).value = ''; });
            document.getElementById('elem-opacity').value = '100';
            document.getElementById('elem-opacity-value').textContent = '100';
            document.getElementById('elem-rotation').value = '0';
            document.getElementById('elem-rotation-value').textContent = '0°';
            document.getElementById('elem-scale').value = '1';
            document.getElementById('elem-scale-value').textContent = '1';
            ['elem-bold', 'elem-italic', 'elem-underline', 'elem-strike']
                .forEach(id => document.getElementById(id).classList.remove('elem-format-on'));
            ['left', 'center', 'right', 'justify']
                .forEach(v => document.getElementById('elem-align-' + v).classList.remove('elem-format-on'));
            ['elem-color', 'elem-bg', 'elem-border-color'].forEach(updateElemColorSwatch);
        }
        
        function toggleElemFormat(btn) {
            btn.classList.toggle('elem-format-on');
        }
        
        function toggleElemAlign(btn, value) {
            // Single-select: only the clicked alignment button stays on
            ['left', 'center', 'right', 'justify'].forEach(v => {
                document.getElementById('elem-align-' + v).classList.remove('elem-format-on');
            });
            btn.classList.add('elem-format-on');
        }
        
        // Merge the modal's element-style inputs into customStyles (keeps drag offsets
        // and other props, removes any field whose input was cleared). Returns the map.
        function mergeElementStylesInto(sel) {
            const props = collectElementStyleInputs();
            const merged = Object.assign({}, customStyles[sel] || {});
            for (const inputId in ELEM_FIELDS) {
                if (!document.getElementById(inputId).value.trim()) delete merged[ELEM_FIELDS[inputId]];
            }
            const opacityVal = document.getElementById('elem-opacity').value;
            if (!opacityVal || opacityVal === '100') delete merged.opacity;
            if (document.getElementById('elem-rotation').value === '0') delete merged.rotation;
            if (document.getElementById('elem-scale').value === '1') delete merged.scale;
            if (!document.getElementById('elem-bold').classList.contains('elem-format-on')) delete merged.fontWeight;
            if (!document.getElementById('elem-italic').classList.contains('elem-format-on')) delete merged.fontStyle;
            if (!document.getElementById('elem-underline').classList.contains('elem-format-on') && !document.getElementById('elem-strike').classList.contains('elem-format-on')) delete merged.textDecoration;
            if (!['left', 'center', 'right', 'justify'].some(v => document.getElementById('elem-align-' + v).classList.contains('elem-format-on'))) delete merged.textAlign;
            Object.assign(merged, props);
            if (Object.keys(merged).length) customStyles[sel] = merged;
            else delete customStyles[sel];
            applyCustomStyles(customStyles);
            return customStyles;
        }
        
        function saveContentModal() {
            if (!modalKey || !modalElementId) return;
            const styleOnly = STYLE_ONLY_IDS.has(modalElementId);
            const value = document.getElementById('content-modal-textarea').value.replace(/\s+/g, ' ').trim();
            if (!styleOnly && !value) { showToast('Text cannot be empty', 'error'); return; }
            
            const payload = {};
            if (!styleOnly) {
                payload[modalKey] = value;
                setContentValue(modalKey, value);
            }
            
            // Per-element styles: merge with existing (keeps drag offsets etc.),
            // but remove any field whose input was cleared
            mergeElementStylesInto('#' + modalElementId);
            payload.custom_styles = JSON.stringify(customStyles);
            
            fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Keep a local mirror so edits survive even if the server is unreachable
                    try {
                        let local = {};
                        try { local = JSON.parse(localStorage.getItem('portfolio-content')) || {}; } catch (e) {}
                        local[modalKey] = value;
                        local.custom_styles = JSON.stringify(customStyles);
                        localStorage.setItem('portfolio-content', JSON.stringify(local));
                    } catch (e) {}
                    showToast('Saved'); closeContentModal();
                }
                else throw new Error('Save rejected');
            })
            .catch(() => {
                let local = {};
                try { local = JSON.parse(localStorage.getItem('portfolio-content')) || {}; } catch (err) {}
                local[modalKey] = value;
                local.custom_styles = JSON.stringify(customStyles);
                localStorage.setItem('portfolio-content', JSON.stringify(local));
                showToast('Saved locally — server unavailable', 'error');
                closeContentModal();
            });
        }
        
        function applyCustomStyles(map) {
            let css = '';
            for (const sel in map) {
                const props = map[sel];
                if (!props || typeof props !== 'object') continue;
                let decl = '';
                for (const prop in props) {
                    if (prop === 'rotation' || prop === 'scale' || prop === 'translateX' || prop === 'translateY') continue; // combined into transform below
                    const v = String(props[prop]).trim();
                    if (!v) continue;
                    decl += prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) + ':' + v + ';';
                }
                const transformParts = [];
                if (props.translateX || props.translateY) {
                    transformParts.push('translate(' + (props.translateX || '0px') + ', ' + (props.translateY || '0px') + ')');
                }
                if (props.rotation) transformParts.push('rotate(' + props.rotation + 'deg)');
                if (props.scale) transformParts.push('scale(' + props.scale + ')');
                if (transformParts.length) decl += 'transform:' + transformParts.join(' ') + ';';
                if (decl) css += sel + '{' + decl + '}';
            }
            let el = document.getElementById('custom-styles');
            if (!el) { el = document.createElement('style'); el.id = 'custom-styles'; document.head.appendChild(el); }
            el.textContent = css;
        }
        
        // Click handling in edit mode (capture phase so it beats link navigation)
        document.addEventListener('click', handleContentClick, true);
        
        // Modal keyboard: Esc closes, Enter saves (Shift+Enter = new line in the textarea)
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('content-modal');
            if (!modal || modal.classList.contains('hidden')) return;
            // The color picker (opened from the Element Styles tab) handles its own keys
            const picker = document.getElementById('rgb-picker');
            if (picker && !picker.classList.contains('hidden')) return;
            if (e.key === 'Escape') { e.preventDefault(); closeContentModal(); return; }
            if (e.key !== 'Enter') return;
            const t = e.target;
            // Leave Enter on buttons alone — their own click handles the action
            if (t && t.tagName === 'BUTTON') return;
            // Shift+Enter inside the textarea inserts a new line instead of saving
            if (t && t.tagName === 'TEXTAREA' && e.shiftKey) return;
            e.preventDefault();
            saveModal();
        });
        


        async function uploadHeroPhoto(input) {
            const file = input.files[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append('image', file);
            
            try {
                // First try to authenticate (use default admin credentials)
                await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: 'admin', password: 'admin123' })
                });
                
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                if (result.success) {
                    // Update the image
                    const img = document.getElementById('hero-image');
                    img.src = result.url + '?t=' + Date.now();
                    showToast('Photo uploaded successfully!');
                    
                    // Save the URL to config
                    await fetch('/api/config', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ hero_image_url: result.url })
                    });
                } else {
                    showToast('Upload failed. Please try again.', 'error');
                }
            } catch (err) {
                console.error('Upload error:', err);
                showToast('Upload failed. Please try again.', 'error');
            }
            input.value = '';
        }
        
        async function removeHeroPhoto() {
            // Point the image at the nonexistent default so the onerror SVG fallback (initials) shows
            const img = document.getElementById('hero-image');
            if (img) img.src = '/uploads/hero-photo.jpg';
            try {
                await fetch('/api/config', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hero_image_url: '' })
                });
                try {
                    let local = {};
                    try { local = JSON.parse(localStorage.getItem('portfolio-content')) || {}; } catch (err) {}
                    local.hero_image_url = '';
                    localStorage.setItem('portfolio-content', JSON.stringify(local));
                } catch (err) {}
                showToast('Photo removed');
            } catch (err) {
                showToast('Photo removed (server offline)', 'error');
            }
        }
        
        // ============ ISLAMIC SKILLS MANAGER ============
        
        let editorSkills = [];
        const SKILL_ICONS = ['menu_book', 'school', 'people', 'mosque', 'translate', 'record_voice_over', 'code', 'devices', 'psychology', 'language', 'auto_stories', 'library_books', 'group', 'favorite', 'edit', 'workspace_premium', 'temple_hindu', 'book_2', 'campaign'];
        
        function escSkill(s) {
            return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }
        
        async function ensureEditorAuth() {
            try {
                const res = await fetch('/api/auth/check');
                const data = await res.json();
                if (data.authenticated) return true;
                const login = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: 'admin', password: 'admin123' })
                });
                const loginData = await login.json();
                return !!loginData.success;
            } catch (e) {
                return false;
            }
        }
        
        async function loadSkillTags() {
            const list = document.getElementById('editor-skills-list');
            if (!list) return;
            try {
                const res = await fetch('/api/skills?category=islamic');
                if (!res.ok) throw new Error('load failed');
                editorSkills = await res.json();
            } catch (e) {
                editorSkills = [];
                list.innerHTML = '<p class="text-[11px] text-gray-400">Could not load skills.</p>';
                return;
            }
            list.innerHTML = editorSkills.map(s => skillRowHtml(s)).join('');
        }
        
        function skillRowHtml(s) {
            const icon = s.icon || 'menu_book';
            return `
                <div class="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5" data-skill-id="${s.id}">
                    <div class="flex flex-col -my-1 shrink-0">
                        <button type="button" onclick="moveSkillTag(${s.id}, -1)" title="Move up" class="text-gray-400 hover:text-primary leading-none cursor-pointer text-xs">▲</button>
                        <button type="button" onclick="moveSkillTag(${s.id}, 1)" title="Move down" class="text-gray-400 hover:text-primary leading-none cursor-pointer text-xs">▼</button>
                    </div>
                    <span class="material-symbols-outlined text-base text-primary shrink-0">${escSkill(icon)}</span>
                    <span class="text-xs font-medium text-gray-700 flex-1 truncate">${escSkill(s.name)}</span>
                    <button type="button" onclick="editSkillTag(${s.id})" title="Edit" class="text-gray-400 hover:text-primary cursor-pointer text-sm shrink-0">✏️</button>
                    <button type="button" onclick="deleteSkillTag(${s.id})" title="Remove" class="text-gray-400 hover:text-red-600 cursor-pointer text-sm shrink-0">🗑</button>
                </div>`;
        }
        
        function editSkillTag(id) {
            const row = document.querySelector(`#editor-skills-list [data-skill-id="${id}"]`);
            const skill = editorSkills.find(s => s.id === id);
            if (!row || !skill) return;
            const iconOptions = SKILL_ICONS.map(ic => `<option value="${ic}" ${ic === (skill.icon || 'menu_book') ? 'selected' : ''}>${ic}</option>`).join('');
            row.innerHTML = `
                <input type="text" id="skill-name-${id}" value="${escSkill(skill.name)}" class="flex-1 min-w-0 text-xs p-1 border border-gray-300 rounded">
                <select id="skill-icon-${id}" class="text-xs p-1 border border-gray-300 rounded bg-white max-w-[7.5rem]">${iconOptions}</select>
                <button type="button" onclick="saveSkillTag(${id})" class="text-primary cursor-pointer text-xs font-semibold shrink-0">Save</button>
                <button type="button" onclick="loadSkillTags()" class="text-gray-400 cursor-pointer text-xs shrink-0">Cancel</button>`;
            document.getElementById('skill-name-' + id).focus();
        }
        
        async function saveSkillTag(id) {
            const nameEl = document.getElementById('skill-name-' + id);
            const iconEl = document.getElementById('skill-icon-' + id);
            if (!nameEl || !iconEl) return;
            const name = nameEl.value.trim();
            if (!name) { showToast('Name cannot be empty', 'error'); return; }
            if (!(await ensureEditorAuth())) { showToast('Not authorized — log in via /admin', 'error'); return; }
            const res = await fetch('/api/skills/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, icon: iconEl.value })
            });
            if (res.ok) { await refreshSkillTags(); showToast('Skill updated'); }
            else showToast('Could not save skill', 'error');
        }
        
        async function moveSkillTag(id, dir) {
            const idx = editorSkills.findIndex(s => s.id === id);
            const neighbor = editorSkills[idx + dir];
            if (idx < 0 || !neighbor) return;
            if (!(await ensureEditorAuth())) { showToast('Not authorized — log in via /admin', 'error'); return; }
            const a = editorSkills[idx], b = neighbor;
            await Promise.all([
                fetch('/api/skills/' + a.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: b.sort_order }) }),
                fetch('/api/skills/' + b.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: a.sort_order }) })
            ]);
            await refreshSkillTags();
        }
        
        async function deleteSkillTag(id) {
            const skill = editorSkills.find(s => s.id === id);
            if (!skill) return;
            if (!confirm('Remove "' + skill.name + '" from Islamic Sciences?')) return;
            if (!(await ensureEditorAuth())) { showToast('Not authorized — log in via /admin', 'error'); return; }
            const res = await fetch('/api/skills/' + id, { method: 'DELETE' });
            if (res.ok) { await refreshSkillTags(); showToast('Skill removed'); }
            else showToast('Could not remove skill', 'error');
        }
        
        function addSkillTag() {
            const list = document.getElementById('editor-skills-list');
            if (!list || document.getElementById('skill-add-row')) return;
            const iconOptions = SKILL_ICONS.map(ic => `<option value="${ic}">${ic}</option>`).join('');
            const row = document.createElement('div');
            row.id = 'skill-add-row';
            row.className = 'flex items-center gap-1.5 bg-primary/5 border border-primary/30 rounded-lg px-2 py-1.5';
            row.innerHTML = `
                <input type="text" id="skill-add-name" placeholder="New skill name" class="flex-1 min-w-0 text-xs p-1 border border-gray-300 rounded">
                <select id="skill-add-icon" class="text-xs p-1 border border-gray-300 rounded bg-white max-w-[7.5rem]">${iconOptions}</select>
                <button type="button" onclick="createSkillTag()" class="text-primary cursor-pointer text-xs font-semibold shrink-0">Add</button>
                <button type="button" onclick="document.getElementById('skill-add-row').remove()" class="text-gray-400 cursor-pointer text-xs shrink-0">Cancel</button>`;
            list.appendChild(row);
            document.getElementById('skill-add-name').focus();
        }
        
        async function createSkillTag() {
            const nameEl = document.getElementById('skill-add-name');
            const iconEl = document.getElementById('skill-add-icon');
            if (!nameEl || !iconEl) return;
            const name = nameEl.value.trim();
            if (!name) { showToast('Name cannot be empty', 'error'); return; }
            if (!(await ensureEditorAuth())) { showToast('Not authorized — log in via /admin', 'error'); return; }
            const maxOrder = editorSkills.reduce((m, s) => Math.max(m, s.sort_order || 0), 0);
            const res = await fetch('/api/skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, category: 'islamic', proficiency: 85, icon: iconEl.value, sort_order: maxOrder + 1 })
            });
            if (res.ok) { await refreshSkillTags(); showToast('Skill added'); }
            else showToast('Could not add skill', 'error');
        }
        
        async function refreshSkillTags() {
            await loadSkillTags();
            try {
                const res = await fetch('/api/skills');
                if (res.ok) {
                    const all = await res.json();
                    if (typeof renderSkills === 'function') renderSkills(all);
                }
            } catch (e) {}
        }
        
        // ============ EDUCATION / CORE COMPETENCIES / SERVICES / TESTIMONIALS MANAGERS ============
        
        // Field schemas for the list-item editor modal
        const LIST_ITEM_SCHEMAS = {
            education: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'institution', label: 'Institution', type: 'text' },
                { key: 'description', label: 'Description', type: 'textarea' }
            ],
            competency: [
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'icon', label: 'Icon', type: 'icon' }
            ],
            service: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'icon', label: 'Icon', type: 'icon' }
            ],
            testimonial: [
                { key: 'client_name', label: 'Client name', type: 'text' },
                { key: 'client_title', label: 'Client title', type: 'text' },
                { key: 'client_image', label: 'Image URL', type: 'text' },
                { key: 'content', label: 'Testimonial', type: 'textarea' },
                { key: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5, default: 5 }
            ],
            techskill: [
                { key: 'name', label: 'Skill name', type: 'text' },
                { key: 'proficiency', label: 'Proficiency %', type: 'number', min: 0, max: 100, default: 85 },
                { key: 'icon', label: 'Icon', type: 'icon' }
            ],
            project: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'technologies', label: 'Technologies (comma-separated)', type: 'text' },
                { key: 'project_url', label: 'Project URL (shows live preview)', type: 'text' }
            ]
        };
        
        const LIST_COLLECTION_LABELS = {
            education: 'Education item',
            competency: 'Core competency',
            service: 'Service',
            testimonial: 'Testimonial',
            techskill: 'Technical skill',
            project: 'Project'
        };
        
        // DB-backed collections: api endpoint (+ optional query filter / fixed fields to send on save)
        const LIST_DB_META = {
            service: { api: '/api/services' },
            testimonial: { api: '/api/testimonials' },
            techskill: { api: '/api/skills', query: '?category=technical', fixed: { category: 'technical' } },
            project: { api: '/api/projects' }
        };
        
        const LIST_ICONS = ['school', 'menu_book', 'people', 'mosque', 'translate', 'record_voice_over', 'code', 'devices', 'psychology', 'language', 'auto_stories', 'library_books', 'group', 'favorite', 'edit', 'workspace_premium', 'design_services', 'rocket_launch', 'campaign', 'handyman', 'lightbulb', 'thumb_up', 'emoji_objects', 'education', 'web', 'palette', 'temple_hindu', 'book_2', 'forum', 'monitor_heart', 'public'];
        
        // Defaults (used only when the saved config has no value yet)
        const DEFAULT_EDUCATION = [
            { title: 'Bachelor of Arts (Education) in Islamic Studies', institution: 'University of Ilorin', description: 'Studied Islamic Studies Education with a focus on Islamic scholarship, educational methodology, teaching practices, and the effective transmission of Islamic knowledge. Developed a strong foundation in Islamic sciences alongside modern approaches to education.' },
            { title: "I'dādiyyah & Thānawiyyah Certificates", institution: "Dārul-'Ulūm Isalekoto", description: "Completed structured studies in Islamic sciences and Arabic language at both the I'dādiyyah and Thānawiyyah levels, developing a foundation in Arabic, Islamic jurisprudence, theology, and classical Islamic disciplines." },
            { title: "Qur'anic Memorization & Tajwid", institution: "Dārul-'Ulūm Isalekoto", description: "Completed Qur'anic memorization alongside structured Tajwid training — mastering the rules of recitation, articulation points, and the qualities of letters — building a strong foundation in accurate recitation with continued review to preserve it." },
            { title: 'Desktop Publishing & Programming', institution: 'Self-taught', description: 'Developed practical skills in desktop publishing — layout design, typography, and print-ready document production — alongside programming and modern web technologies through self-directed study, applied to creating educational materials and digital platforms.' }
        ];
        
        const DEFAULT_COMPETENCIES = [
            { name: 'Islamic Studies', icon: 'mosque' },
            { name: "Qur'anic Memorization", icon: 'menu_book' },
            { name: 'Tajwid', icon: 'record_voice_over' },
            { name: 'Arabic Language', icon: 'translate' },
            { name: 'EdTech', icon: 'school' },
            { name: 'UI/UX Design', icon: 'design_services' },
            { name: 'Digital Learning', icon: 'devices' }
        ];
        
        // In-memory state (null = not loaded yet → use defaults)
        let educationItems = null;
        let competencyItems = null;
        let editorServices = [];
        let editorTestimonials = [];
        let editorTechskills = [];
        let editorProjects = [];
        let listModalState = null; // { collection, index, isNew }
        
        function getListItems(collection) {
            switch (collection) {
                case 'education': return educationItems == null ? DEFAULT_EDUCATION : educationItems;
                case 'competency': return competencyItems == null ? DEFAULT_COMPETENCIES : competencyItems;
                case 'service': return editorServices;
                case 'testimonial': return editorTestimonials;
                case 'techskill': return editorTechskills;
                case 'project': return editorProjects;
            }
            return [];
        }
        
        function setListItems(collection, arr) {
            switch (collection) {
                case 'education': educationItems = arr; break;
                case 'competency': competencyItems = arr; break;
                case 'service': editorServices = arr; break;
                case 'testimonial': editorTestimonials = arr; break;
                case 'techskill': editorTechskills = arr; break;
                case 'project': editorProjects = arr; break;
            }
        }
        
        function listItemLabel(collection, item) {
            switch (collection) {
                case 'education': return item.title || 'Untitled';
                case 'competency': return item.name || 'Untitled';
                case 'service': return item.title || 'Untitled';
                case 'testimonial': return item.client_name || 'Untitled';
                case 'techskill': return item.name || 'Untitled';
                case 'project': return item.title || 'Untitled';
            }
            return 'Untitled';
        }
        
        // ---- Render the education timeline + competencies on the page ----
        
        function renderEducationItems(list) {
            educationItems = Array.isArray(list) ? list : DEFAULT_EDUCATION;
            const container = document.getElementById('education-timeline');
            if (container) {
                if (!educationItems.length) {
                    container.innerHTML = '<p class="text-purple-100/70 text-center text-sm">No education items yet — add some in the Style Editor.</p>';
                } else {
                    container.innerHTML = educationItems.map(item => `
                        <div class="relative pl-8 pb-12 border-l-2 border-white/20 fade-in">
                            <div class="absolute left-0 top-0 w-4 h-4 bg-gold rounded-full transform -translate-x-[9px]"></div>
                            <div class="glass rounded-xl p-6 card-hover">
                                <h3 class="font-heading text-xl font-bold text-gray-900 mb-2">${escapeHtml(item.title || '')}</h3>
                                <p class="text-primary font-medium mb-3">${escapeHtml(item.institution || '')}</p>
                                <p class="text-gray-600 text-sm">${escapeHtml(item.description || '')}</p>
                            </div>
                        </div>
                    `).join('');
                    // Reveal timeline items already in the viewport (they carry .fade-in)
                    setTimeout(() => {
                        container.querySelectorAll('.fade-in').forEach(el => {
                            const rect = el.getBoundingClientRect();
                            if (rect.top < window.innerHeight - 150) el.classList.add('visible');
                        });
                    }, 60);
                }
            }
            renderEditorList('education');
        }
        
        function renderCompetencies(list) {
            competencyItems = Array.isArray(list) ? list : DEFAULT_COMPETENCIES;
            const container = document.getElementById('core-competencies');
            if (container) {
                if (!competencyItems.length) {
                    container.innerHTML = '<p class="text-gray-400 text-center text-sm col-span-full">No competencies yet — add some in the Style Editor.</p>';
                } else {
                    container.innerHTML = competencyItems.map(comp => `
                        <div class="bg-white rounded-xl p-6 text-center card-hover border border-gray-100">
                            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="material-symbols-outlined text-3xl text-primary">${escapeHtml(comp.icon || 'school')}</span>
                            </div>
                            <h4 class="font-medium text-gray-900">${escapeHtml(comp.name || '')}</h4>
                        </div>
                    `).join('');
                }
            }
            renderEditorList('competency');
        }
        
        // ---- Style-editor panel lists ----
        
        function listItemRowHtml(collection, item, index) {
            const label = listItemLabel(collection, item);
            const icon = collection === 'competency' || collection === 'service' || collection === 'techskill' ? (item.icon || '') : '';
            return `
                <div class="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                    <div class="flex flex-col -my-1 shrink-0">
                        <button type="button" onclick="moveListItem('${collection}', ${index}, -1)" title="Move up" class="text-gray-400 hover:text-primary leading-none cursor-pointer text-xs">▲</button>
                        <button type="button" onclick="moveListItem('${collection}', ${index}, 1)" title="Move down" class="text-gray-400 hover:text-primary leading-none cursor-pointer text-xs">▼</button>
                    </div>
                    ${icon ? `<span class="material-symbols-outlined text-base text-primary shrink-0">${escSkill(icon)}</span>` : ''}
                    <span class="text-xs font-medium text-gray-700 flex-1 truncate">${escSkill(label)}</span>
                    <button type="button" onclick="openListItemEditor('${collection}', ${index})" title="Edit" class="text-gray-400 hover:text-primary cursor-pointer text-sm shrink-0">✏️</button>
                    <button type="button" onclick="deleteListItem('${collection}', ${index})" title="Remove" class="text-gray-400 hover:text-red-600 cursor-pointer text-sm shrink-0">🗑</button>
                </div>`;
        }
        
        function renderEditorList(collection) {
            const listEl = document.getElementById('editor-' + collection + '-list');
            if (!listEl) return;
            const items = getListItems(collection);
            listEl.innerHTML = items.length
                ? items.map((item, i) => listItemRowHtml(collection, item, i)).join('')
                : '<p class="text-[11px] text-gray-400">No items yet — add one below.</p>';
        }
        
        async function loadDbList(collection) {
            const listEl = document.getElementById('editor-' + collection + '-list');
            if (!listEl) return;
            const meta = LIST_DB_META[collection];
            if (!meta) return;
            try {
                const res = await fetch(meta.api + (meta.query || ''));
                if (!res.ok) throw new Error('load failed');
                setListItems(collection, await res.json());
            } catch (e) {
                setListItems(collection, []);
                listEl.innerHTML = '<p class="text-[11px] text-gray-400">Could not load ' + collection + 's.</p>';
                return;
            }
            renderEditorList(collection);
        }
        
        function loadEditorLists() {
            renderEditorList('education');
            renderEditorList('competency');
            loadDbList('service');
            loadDbList('testimonial');
            loadDbList('techskill');
            loadDbList('project');
        }
        
        // Re-render the on-page lists after a change (guards for pages without them)
        function refreshPageLists() {
            if (document.getElementById('services-grid') && typeof renderServices === 'function') {
                fetch('/api/services').then(r => r.ok ? r.json() : null).then(list => list && renderServices(list)).catch(() => {});
            }
            if (document.getElementById('testimonials-grid') && typeof renderTestimonials === 'function') {
                fetch('/api/testimonials').then(r => r.ok ? r.json() : null).then(list => list && renderTestimonials(list)).catch(() => {});
            }
            if (document.getElementById('projects-grid') && typeof renderProjects === 'function') {
                fetch('/api/projects').then(r => r.ok ? r.json() : null).then(list => { renderProjects(list); refreshEditableHints(); }).catch(() => {});
            }
            if (document.getElementById('technical-skills') && typeof renderSkills === 'function') {
                fetch('/api/skills').then(r => r.ok ? r.json() : null).then(list => list && renderSkills(list)).catch(() => {});
            }
            renderEducationItems(educationItems);
            renderCompetencies(competencyItems);
        }
        
        // ---- Save config-backed collections (education / competencies) ----
        
        function saveConfigList(collection, items) {
            const key = collection === 'education' ? 'education_items' : 'core_competencies';
            const payload = {};
            payload[key] = JSON.stringify(items);
            setListItems(collection, items);
            renderEditorList(collection);
            if (collection === 'education') renderEducationItems(items); else renderCompetencies(items);
            fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    try {
                        let local = {};
                        try { local = JSON.parse(localStorage.getItem('portfolio-content')) || {}; } catch (err) {}
                        local[key] = payload[key];
                        localStorage.setItem('portfolio-content', JSON.stringify(local));
                    } catch (err) {}
                }
            })
            .catch(() => {});
        }
        
        // ---- Move / delete / add ----
        
        async function moveListItem(collection, index, dir) {
            const items = getListItems(collection).slice();
            const to = index + dir;
            if (index < 0 || to < 0 || to >= items.length) return;
            const meta = LIST_DB_META[collection];
            if (meta) {
                if (!(await ensureEditorAuth())) { showToast('Not authorized — log in via /admin', 'error'); return; }
                const a = items[index], b = items[to];
                await Promise.all([
                    fetch(meta.api + '/' + a.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: b.sort_order }) }),
                    fetch(meta.api + '/' + b.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: a.sort_order }) })
                ]);
                await loadDbList(collection);
                refreshPageLists();
            } else {
                const tmp = items[index]; items[index] = items[to]; items[to] = tmp;
                saveConfigList(collection, items);
            }
        }
        
        async function deleteListItem(collection, index) {
            const items = getListItems(collection);
            const item = items[index];
            if (!item) return;
            if (!confirm('Remove "' + listItemLabel(collection, item) + '"?')) return;
            const meta = LIST_DB_META[collection];
            if (meta) {
                if (!(await ensureEditorAuth())) { showToast('Not authorized — log in via /admin', 'error'); return; }
                const res = await fetch(meta.api + '/' + item.id, { method: 'DELETE' });
                if (res.ok) { await loadDbList(collection); refreshPageLists(); showToast('Removed'); }
                else showToast('Could not remove item', 'error');
            } else {
                const next = items.slice();
                next.splice(index, 1);
                saveConfigList(collection, next);
                showToast('Removed');
            }
        }
        
        function addListItem(collection) {
            openListItemEditor(collection, getListItems(collection).length, true);
        }
        
        // ---- List-item editor modal ----
        
        function listIconOptions(selected) {
            return LIST_ICONS.map(ic => `<option value="${ic}" ${ic === selected ? 'selected' : ''}>${ic}</option>`).join('');
        }
        
        function openListItemEditor(collection, index, isNew) {
            const schema = LIST_ITEM_SCHEMAS[collection];
            if (!schema) return;
            const items = getListItems(collection);
            const item = isNew ? {} : (items[index] || {});
            listModalState = { collection, index, isNew: !!isNew };
            document.getElementById('list-item-modal-title').textContent = (isNew ? 'Add ' : 'Edit ') + LIST_COLLECTION_LABELS[collection];
            document.getElementById('list-item-modal-fields').innerHTML = schema.map(f => {
                const v = item[f.key] != null ? item[f.key] : '';
                if (f.type === 'textarea') {
                    return `<div>
                        <label class="block text-xs text-gray-500 mb-1">${f.label}</label>
                        <textarea id="list-field-${f.key}" rows="3" class="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary resize-y">${escSkill(v)}</textarea>
                    </div>`;
                }
                if (f.type === 'icon') {
                    return `<div>
                        <label class="block text-xs text-gray-500 mb-1">${f.label}</label>
                        <select id="list-field-${f.key}" class="w-full p-2 border border-gray-300 rounded text-sm bg-white">${listIconOptions(String(v))}</select>
                    </div>`;
                }
                if (f.type === 'number') {
                    return `<div>
                        <label class="block text-xs text-gray-500 mb-1">${f.label}</label>
                        <input type="number" id="list-field-${f.key}" min="${f.min != null ? f.min : 1}" max="${f.max != null ? f.max : 5}" value="${escSkill(v)}" class="w-full p-2 border border-gray-300 rounded text-sm">
                    </div>`;
                }
                return `<div>
                    <label class="block text-xs text-gray-500 mb-1">${f.label}</label>
                    <input type="text" id="list-field-${f.key}" value="${escSkill(v)}" class="w-full p-2 border border-gray-300 rounded text-sm">
                </div>`;
            }).join('');
            document.getElementById('list-item-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            const firstInput = document.querySelector('#list-item-modal-fields input, #list-item-modal-fields textarea');
            if (firstInput) firstInput.focus();
        }
        
        function closeListItemEditor() {
            document.getElementById('list-item-modal').classList.add('hidden');
            document.body.style.overflow = '';
            listModalState = null;
        }
        
        async function saveListItemEditor() {
            if (!listModalState) return;
            const { collection, index, isNew } = listModalState;
            const schema = LIST_ITEM_SCHEMAS[collection];
            const values = {};
            for (const f of schema) {
                const el = document.getElementById('list-field-' + f.key);
                if (!el) continue;
                let v = el.value.trim();
                if (f.type === 'number') {
                    const n = parseInt(v, 10);
                    v = isNaN(n) ? (f.default != null ? f.default : 5) : n;
                    if (f.min != null) v = Math.max(f.min, v);
                    if (f.max != null) v = Math.min(f.max, v);
                }
                if (f.key === 'icon' && !v) v = 'school';
                values[f.key] = v;
            }
            const primaryKey = schema[0].key;
            if (!values[primaryKey]) { showToast(schema[0].label + ' cannot be empty', 'error'); return; }
            const meta = LIST_DB_META[collection];
            if (!meta) {
                const items = getListItems(collection).slice();
                if (isNew) items.push(values);
                else items[index] = Object.assign({}, items[index], values);
                saveConfigList(collection, items);
            } else {
                if (!(await ensureEditorAuth())) { showToast('Not authorized — log in via /admin', 'error'); return; }
                const current = getListItems(collection);
                const url = isNew ? meta.api : meta.api + '/' + current[index].id;
                const method = isNew ? 'POST' : 'PUT';
                const payload = Object.assign({}, meta.fixed || {}, values);
                const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (res.ok) { await loadDbList(collection); refreshPageLists(); }
                else { showToast('Could not save', 'error'); return; }
            }
            showToast('Saved');
            closeListItemEditor();
        }
        
        // Modal keyboard: Esc closes, Enter saves (Shift+Enter = new line in textareas)
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('list-item-modal');
            if (!modal || modal.classList.contains('hidden')) return;
            if (e.key === 'Escape') { e.preventDefault(); closeListItemEditor(); return; }
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'SELECT') {
                e.preventDefault();
                saveListItemEditor();
            }
        });
        
        
        
// ============ EDITOR BOOTSTRAP ============

// Inject the editor UI (panel, RGB picker, modals) into the page
if (document.body) {
    document.body.insertAdjacentHTML('beforeend', EDITOR_HTML);
}
// The panel must exist before its drag handler can bind
initEditorDrag();
// Render the preset color swatches in the color picker
initRgbPicker();

// On the admin panel, click-to-edit content isn't relevant — hide those controls
if (window.EDITOR_ON_ADMIN) {
    const ct = document.getElementById('content-edit-toggle');
    if (ct) ct.closest('div.mb-4').style.display = 'none';
    const bar = document.getElementById('content-edit-bar');
    if (bar) bar.classList.add('hidden');
}

// Load the Islamic skills manager list (no auth needed to read)
loadSkillTags();

// Load the Education / Core Competencies / Services / Testimonials manager lists
loadEditorLists();

// Load saved styles + content from the server so the editor works on any page.
// The server injects window.__INITIAL_DATA__ straight into the HTML, so the
// saved content is applied synchronously here — before the first paint — which
// eliminates the flash of default content on refresh.
(function loadEditorData() {
    const inline = window.__INITIAL_DATA__;
    if (inline && inline.styles && inline.config) {
        applyStyles(inline.styles);
        applyContent(inline.config);
        return;
    }
    Promise.all([
        fetch('/api/styles').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/config').then(r => r.ok ? r.json() : null).catch(() => null)
    ]).then(([styles, config]) => {
        if (styles) {
            applyStyles(styles);
        } else {
            try {
                const local = JSON.parse(localStorage.getItem('portfolio-styles'));
                if (local) applyStyles(local);
            } catch (e) {}
        }
        if (config) {
            applyContent(config);
        } else {
            try {
                const local = JSON.parse(localStorage.getItem('portfolio-content'));
                if (local) applyContent(local);
            } catch (e) {}
        }
    });
})();

