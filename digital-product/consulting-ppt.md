# Consulting PPT Skill — Product Architecture Blueprint

> **Purpose:** A comprehensive product, design, implementation, and evaluation blueprint for a consulting-style AI presentation system. This document is intended as source material for creating a future `SKILL.md` with Claude or another AI platform.
>
> **Important positioning:** This product is **consulting-inspired** and aims for executive-grade, structured, data-driven presentations. It must not claim to be an official McKinsey product, copy proprietary materials, redistribute McKinsey decks, use protected logos, or reproduce confidential/proprietary layouts.

---

## 1. Product Vision

### 1.1 Product name (working name)

**Consulting PPT Skill** — a reusable AI workflow and asset system that turns business inputs into board-ready, consulting-style presentation decks.

Potential customer-facing names:

- Consulting Deck OS
- Executive Strategy Deck System
- Board-Ready AI Presentation System
- Strategy Presentation Skill
- Consulting-Style PPT Engine

Avoid names containing `claude` or `anthropic` if the package will be used as a Claude skill name, because those prefixes are reserved in skill metadata.

### 1.2 Core promise

Transform an incomplete business brief, business memo, report, dataset, or existing deck into a presentation that:

1. Uses a clear, answer-first executive storyline.
2. Uses consulting-inspired reasoning patterns such as SCQA, Pyramid Principle, and MECE where appropriate.
3. Has action titles that state the slide conclusion, not merely its topic.
4. Converts evidence into decision-oriented visuals, charts, tables, and diagrams.
5. Looks clean, coherent, restrained, and professional.
6. Avoids “AI slop”: generic claims, decorative clutter, inconsistent visual language, unsupported facts, and over-designed output.
7. Requires materially fewer user iterations than generic prompting.

### 1.3 Price and positioning hypothesis

- Target price: **USD 40–60** for an initial digital-product tier.
- Market position: more affordable than premium consulting template packs, while offering an AI-first workflow rather than only static slides.
- Differentiator: not merely templates and not merely prompts; the product packages **consulting reasoning + visual standards + reusable assets + automation + QA**.

### 1.4 Product boundary

The product should be marketed as:

- “Consulting-style presentation system”
- “Executive strategy deck generator”
- “Board-ready AI presentation workflow”
- “Top-tier consulting-inspired storytelling and design system”

The product should not be marketed as:

- “Official McKinsey template”
- “McKinsey deck clone”
- “McKinsey PowerPoint pack”
- Any claim of affiliation, endorsement, or direct replication of McKinsey & Company

---

## 2. Target Users

### 2.1 Primary users

- Founders and small-to-medium business owners preparing strategy or investor materials
- Independent consultants, analysts, and freelancers
- Corporate strategy, operations, and transformation teams
- Agency teams producing client strategy decks
- MBA students and business students
- Product managers, growth teams, and business development teams
- Researchers converting reports into executive presentations

### 2.2 User pain points

- They have business knowledge but cannot turn it into a coherent executive narrative.
- Their slides look messy, text-heavy, generic, or “AI generated.”
- They do not know how to choose the right chart, layout, or slide type.
- They require too many prompt iterations to get a useful deck.
- They have a report or data but do not know what the decision-relevant takeaway is.
- They have an existing deck that lacks hierarchy, visual consistency, and a clear storyline.

### 2.3 Jobs to be done

1. Create a strategy deck from a business brief.
2. Turn a long memo, report, proposal, or research document into a presentation.
3. Redesign an existing cluttered deck into a clear executive deck.
4. Prepare an investor, board, leadership, or client update.
5. Translate data into insight-led slides and decision-oriented visuals.
6. Create a reusable company-specific deck style after applying brand assets and rules.

---

## 3. Product Tiers

### 3.1 Core tier: portable knowledge system

**Audience:** users of general AI tools, including free tiers where file generation or code execution may not be available.

**Includes:**

- Consulting storytelling workflow
- Slide taxonomy and layout guidance
- Design system documentation
- Action-title rules
- Anti-AI-slop rules
- Quality rubric
- Structured prompt templates and input brief template
- Examples for multiple business scenarios

**Expected output:**

- Slide-by-slide outline
- Action titles
- Content guidance
- Layout specification / pseudo-layout
- Chart recommendation
- Visual direction
- Speaker notes optional

**Limitation:** may require manual transfer into PowerPoint, Google Slides, Canva, or another presentation tool.

### 3.2 Power tier: file generation and QA

**Audience:** users with an AI environment that supports code execution, scripts, local setup, Claude Code, API workflows, or compatible presentation-generation tools.

**Includes everything in Core, plus:**

- Original editable PPTX templates
- PPTX generation scripts
- Template-analysis tools
- Slide rendering / thumbnail scripts
- Content and visual QA scripts
- Chart helpers
- Installation and environment documentation

**Expected output:**

- Final `.pptx` deck
- Rendered preview / thumbnails
- QA report
- Structured source data or deck specification

### 3.3 Connected tier: MCP-enhanced workflow

**Audience:** advanced users, consultants, teams, or enterprises with connected business systems.

**Includes everything in Power, plus:**

- MCP-enabled data gathering
- CRM / BI / spreadsheet data extraction
- Drive / SharePoint / Notion brand asset retrieval
- Automatic file save and sharing
- Slack / email / task-system delivery workflow
- Connector error handling and permission diagnostics

**Expected output:**

- Deck generated from actual connected data
- Approved brand assets pulled automatically
- Saved deck in organizational storage
- Share link and notification

### 3.4 Future SaaS tier

**Audience:** nontechnical users and teams.

**Concept:** web application with a guided brief form or chat interface, backend LLM orchestration, file rendering, and PPTX export.

**Potential capabilities:**

- Guided intake wizard
- Workspace for deck versions
- Brand kit management
- Team approval flows
- Data connectors
- Automated QA score
- API access

---

## 4. Architecture Overview

The product has four layers. The quality advantage comes from the combination, not from any one component alone.

| Layer             | Purpose                                                  | Example components                                                    |
| ----------------- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| Thinking layer    | Determines what the deck should say and in what sequence | SCQA, Pyramid Principle, MECE, governing question, executive summary  |
| Design layer      | Determines how the argument is visualized                | typography, grid, hierarchy, themes, chart standards, layout rules    |
| Automation layer  | Generates, inspects, and validates technical output      | PPTX generator, renderer, deck analyzer, overflow checker, QA scripts |
| Integration layer | Connects data and delivery tools                         | MCP, Drive, CRM, BI, Notion, Slack, API                               |

---

## 5. Skill Package Architecture

### 5.1 Proposed folder structure

```text
consulting-ppt/
├── SKILL.md
│
├── scripts/
│   ├── generate_pptx.py
│   ├── analyze_pptx.py
│   ├── render_slides.py
│   ├── validate_deck.py
│   ├── validate_visuals.py
│   ├── validate_content.py
│   ├── chart_helpers.py
│   └── office/
│       ├── unpack.py
│       └── pack.py
│
├── references/
│   ├── consulting-storytelling.md
│   ├── pyramid-scqa-mece.md
│   ├── slide-taxonomy.md
│   ├── action-title-rules.md
│   ├── chart-selection.md
│   ├── anti-ai-slop-rules.md
│   ├── redesign-workflow.md
│   ├── data-integrity-policy.md
│   ├── platform-compatibility.md
│   └── examples/
│       ├── strategy-deck-example.md
│       ├── board-update-example.md
│       ├── memo-to-deck-example.md
│       └── redesign-example.md
│
└── assets/
    ├── templates/
    │   ├── classic-executive.pptx
    │   ├── modern-strategy.pptx
    │   └── monochrome-minimal.pptx
    ├── layouts/
    │   ├── slide-layout-library.json
    │   └── slide-patterns.md
    ├── themes/
    │   ├── colors.json
    │   ├── typography.json
    │   └── spacing-grid.json
    ├── icons/
    │   ├── LICENSES.md
    │   └── approved-icons/
    └── qa/
        └── deck-quality-rubric.md
```

### 5.2 Role of each component

#### `SKILL.md`

The orchestration brain. It contains:

- YAML frontmatter for trigger behavior
- Scope and constraints
- End-to-end workflow
- Decision rules
- Important quality gates
- Script invocation instructions where available
- Error handling and fallbacks
- Short examples

Keep this file focused. Detailed explanations belong in `references/` and production assets belong in `assets/`.

#### `scripts/`

The deterministic technical layer. Use scripts where correctness must not rely only on language-model interpretation.

#### `references/`

The domain knowledge layer loaded only when needed. It contains detailed consulting and design standards.

#### `assets/`

Reusable output ingredients: original templates, layout definitions, themes, approved icons, and QA documents.

---

## 6. Consulting Intelligence System

### 6.1 Governing question

Every deck should begin with an explicit question the presentation needs to answer.

Examples:

- “How can the company restore profitability within the next 12 months?”
- “Which market-entry option offers the most attractive risk-adjusted return?”
- “What actions are required to improve conversion without increasing acquisition cost?”

The governing question prevents a deck from becoming a collection of disconnected slides.

### 6.2 Answer-first communication

The deck should lead with the decision-relevant conclusion whenever the evidence supports it.

Do not begin with generic background if the audience primarily needs an answer or decision. A strong executive deck typically presents:

1. The answer / recommendation.
2. The main reasons supporting it.
3. The evidence.
4. The implementation implications.

### 6.3 Pyramid Principle

Use a top-down argument structure:

```text
Executive answer / recommendation
├── Supporting reason 1
│   ├── Evidence
│   └── Evidence
├── Supporting reason 2
│   ├── Evidence
│   └── Evidence
└── Supporting reason 3
    ├── Evidence
    └── Evidence
```

Use it when the deck needs to persuade executives, recommend an action, or synthesize complex information.

### 6.4 SCQA

Use Situation–Complication–Question–Answer when the audience needs a narrative introduction.

- **Situation:** What is true today?
- **Complication:** What changed, deteriorated, or became difficult?
- **Question:** What decision or problem must now be addressed?
- **Answer:** What is the recommended response?

### 6.5 MECE

Use mutually exclusive, collectively exhaustive categorization where it improves clarity.

Rules:

- Categories should not overlap unless overlap is intentionally shown.
- Categories should cover the relevant decision space.
- Do not force MECE if it creates artificial complexity.

### 6.6 Action titles

Every substantive slide should have an action title that communicates its conclusion.

Bad:

- “Market Analysis”
- “Customer Insights”
- “Revenue Performance”

Better:

- “The priority market is growing twice as fast, but profitability requires a selective entry model.”
- “Low repeat purchase—not acquisition—is the main driver of the revenue gap.”
- “Three initiatives can recover most of the margin decline within 12 months.”

Action-title requirements:

- State one clear message.
- Be specific and evidence-led.
- Avoid vague labels.
- Match the body evidence.
- Do not claim certainty beyond supplied data.

---

## 7. Deck Structure Library

### 7.1 Standard strategy deck structure

1. Title / decision context
2. Executive summary
3. Situation and objective
4. Problem diagnosis
5. Key insight 1
6. Key insight 2
7. Key insight 3
8. Strategic options
9. Recommendation
10. Initiative portfolio
11. Implementation roadmap
12. Risks and mitigations
13. Decision required / next steps
14. Appendix

Not every deck needs every slide. Slide count should follow the question and evidence, not a fixed template.

### 7.2 Common deck types

#### Strategy / transformation deck

- Objective
- Baseline
- Diagnosis
- Strategic choices
- Recommendation
- Roadmap
- Governance
- KPI tracking

#### Board update

- Executive summary
- Performance against plan
- Key decisions required
- Major risks
- Strategic initiatives
- Outlook
- Next steps

#### Market-entry deck

- Market attractiveness
- Customer segments
- Competitive landscape
- Entry options
- Economics
- Risk assessment
- Recommended route to market
- Phased roadmap

#### Profit improvement deck

- Financial baseline
- Root-cause tree
- Value levers
- Initiative prioritization
- Financial impact
- Implementation roadmap
- Governance and tracking

#### Investor / fundraising deck

- Thesis / opportunity
- Problem
- Solution
- Market
- Traction
- Business model
- Go-to-market
- Financials
- Ask / use of funds

#### Existing deck redesign

- Audit current storyline
- Identify missing decision question
- Consolidate repetitive slides
- Rewrite titles as action titles
- Replace text-heavy slides with evidence-led visuals
- Apply design system
- Run QA and deliver redesigned deck

---

## 8. Slide Taxonomy and Layout Library

### 8.1 Opening slides

- Title slide
- Executive summary
- Decision slide
- Situation overview
- Agenda only when it adds navigational value

### 8.2 Diagnostic slides

- SCQA slide
- Issue tree
- Root-cause tree
- Customer segmentation
- Value chain
- Market landscape
- Competitive positioning

### 8.3 Insight slides

- Key finding with one chart
- Trend chart
- Waterfall / bridge
- Funnel
- Pareto
- Before-after comparison
- Benchmarking table
- Geographic map when geography is decision-relevant
- 2x2 matrix only when axes are clear and actionable

### 8.4 Recommendation slides

- Strategic options comparison
- Decision criteria
- Recommendation
- Initiative portfolio
- Impact vs effort prioritization
- Business case

### 8.5 Execution slides

- Roadmap
- Workplan
- Operating model
- Governance model
- KPI dashboard
- Risks and mitigations
- Next steps

### 8.6 Appendix slides

- Detailed data tables
- Methodology
- Source list
- Definitions
- Backup analysis

---

## 9. Design System

### 9.1 Design principles

- Clarity before decoration
- Evidence before ornament
- Consistency before novelty
- Hierarchy before density
- White space is functional
- Every visual element must support the message
- Use contrast and emphasis deliberately
- Prefer a small number of well-executed visual patterns

### 9.2 Typography

Use fonts that are legally distributable or reliably available across platforms. Include fallback instructions.

Define:

- Heading font family
- Body font family
- Heading size scale
- Subheading size scale
- Body text size
- Footnote size
- Line spacing
- Paragraph spacing
- Capitalization rules

Suggested hierarchy concept:

- Slide title: largest; communicates conclusion
- Section header: secondary hierarchy
- Chart headline: insight-led
- Body / labels: readable at presentation scale
- Footnote / sources: small but legible

### 9.3 Color system

Build several original themes, for example:

- **Classic executive:** navy, charcoal, white, restrained blue accent
- **Modern strategy:** deep teal, slate, warm neutral, focused accent
- **Monochrome minimal:** black, gray scale, one accent color

Define:

- Background colors
- Primary text
- Secondary text
- Primary accent
- Secondary accent
- Positive / warning / negative semantic colors
- Chart series colors
- Accessible contrast requirements

### 9.4 Layout system

Define:

- Default 16:9 aspect ratio
- Fixed outer margins
- Grid columns
- Baseline spacing tokens
- Minimum gaps between objects
- Alignment rules
- Chart area and title area constraints
- Footer and source placement

### 9.5 Icon system

If including premium icons:

- Verify commercial license terms.
- Verify whether redistribution inside a digital product is permitted.
- Preserve attribution and license files where required.
- Use a single coherent icon family within one deck.
- Avoid arbitrary icons used only as decoration.

### 9.6 Image rules

- Use images only when they add evidence, context, or meaningful emotional signal.
- Avoid generic AI images that do not support the argument.
- Avoid using visual effects that compromise readability.
- Use crops, overlays, and captions consistently.

---

## 10. Anti-AI-Slop System

### 10.1 Definition

“AI slop” in presentation output includes generic, visually noisy, poorly reasoned, or ungrounded content that may appear polished at first glance but fails executive scrutiny.

### 10.2 Content anti-slop rules

- Do not use empty phrases such as “leverage synergies” without precise meaning.
- Do not produce unsupported market facts, revenue figures, customer claims, or quotations.
- Do not write long generic bullet lists when a conclusion and evidence structure is needed.
- Do not repeat the same message across slides.
- Do not imply causality when only correlation or opinion is provided.
- Identify assumptions explicitly.

### 10.3 Visual anti-slop rules

- No irrelevant decorative imagery.
- No mixed illustration styles, mixed icon families, or arbitrary visual effects.
- No excessive gradients, glass effects, 3D objects, or ornamental shapes unless explicitly requested and appropriate.
- No crowded slides that attempt to show every detail.
- No tiny text used to force content into a slide.
- No charts without a clear takeaway title or source note when data is external.
- No infographic elements without an analytical role.

### 10.4 Narrative anti-slop rules

- Each slide must answer a question, support an argument, or enable a decision.
- The order of slides must advance the argument.
- The deck must not start with a generic agenda if an executive answer is needed first.
- Recommendations must connect logically to evidence and constraints.

---

## 11. End-to-End Workflow

### 11.1 Step 0 — Identify operating mode

Determine one of the following:

- **Create:** build a new deck from a brief or data.
- **Convert:** turn a memo, report, PDF, spreadsheet, or other source into a deck.
- **Redesign:** improve an existing `.pptx` deck.
- **Data update:** update an existing deck using refreshed data.

### 11.2 Step 1 — Intake validation

Collect or infer:

- Presentation objective
- Intended audience
- Decision requested
- Business context
- Key facts and available evidence
- Data sources
- Constraints: slide count, deadline, format, brand rules
- Preferred theme
- Existing assets or template

### 11.3 Step 2 — Ask only critical clarifying questions

Ask questions only if the answer materially changes the storyline, recommendation, scope, or visual design.

Priority clarifying questions:

1. What decision should the audience make after this presentation?
2. Who is the audience and what do they already know?
3. What evidence/data is available and what is missing?
4. How many slides or how much time is available?

If information is missing and cannot be obtained, proceed with clearly labeled assumptions.

### 11.4 Step 3 — Build the storyline

1. Define the governing question.
2. Draft the executive answer or provisional recommendation.
3. Select an appropriate narrative architecture: SCQA, Pyramid, issue tree, option comparison, or another pattern.
4. Build a slide-by-slide argument.
5. Verify that each supporting point contributes to the main answer.

### 11.5 Step 4 — Plan the deck

For each slide define:

- Slide number
- Slide purpose
- Action title
- Key evidence
- Slide type/layout
- Visual / chart recommendation
- Source or assumption note
- Speaker note optional

### 11.6 Step 5 — Generate content and visual specifications

- Write concise slide content.
- Turn raw evidence into insights.
- Select chart types based on the analytical question.
- Apply the theme, typography, spacing, and layout rules.
- Use approved icons/assets only.
- Create `.pptx` if the environment permits; otherwise provide a complete deck specification.

### 11.7 Step 6 — Run quality gates

Run four checks:

1. Narrative QA
2. Content/data QA
3. Visual QA
4. Technical file QA

### 11.8 Step 7 — Refine

If any quality gate fails:

- Identify the failure category.
- Revise only the affected content/layout where possible.
- Re-run relevant checks.
- Stop when the deck meets the quality threshold; do not iterate indefinitely without a new insight.

### 11.9 Step 8 — Deliver

Deliver:

- Final PPTX if generated
- Slide-by-slide summary
- Major assumptions
- Sources or source gaps
- Optional note on what requires human validation

---

## 12. Script Specifications

### 12.1 `generate_pptx.py`

**Purpose:** convert a structured deck specification into a `.pptx` file.

**Inputs:**

- Deck JSON/YAML
- Theme configuration
- Layout library
- Source images/icons
- Data tables for charts

**Responsibilities:**

- Create slides from approved layouts.
- Insert titles, body text, charts, diagrams, tables, icons, and images.
- Apply theme tokens.
- Enforce basic spacing and typography rules.
- Export a valid PPTX.

**Potential implementation options:**

- Python: `python-pptx`
- JavaScript: `pptxgenjs`
- Template editing: XML unpack/edit/repack approach

### 12.2 `analyze_pptx.py`

**Purpose:** inspect an uploaded deck before redesign or update.

**Responsibilities:**

- Extract slide text and notes where available.
- Detect slide count and basic structure.
- Identify placeholders.
- Inventory fonts, colors, images, and shapes where feasible.
- Flag obvious inconsistencies.
- Produce a machine-readable analysis report.

### 12.3 `render_slides.py`

**Purpose:** render slides to thumbnails, images, or PDF for visual QA.

**Responsibilities:**

- Create slide overview/contact sheet.
- Allow a model or human reviewer to inspect visual consistency.
- Support before/after comparison in redesign jobs.

### 12.4 `validate_content.py`

**Purpose:** validate logical and textual quality.

**Checks:**

- Missing action titles
- Placeholder text left unresolved
- Duplicate slide titles/messages
- Missing required sections
- Excessively long titles/body text
- Unsupported numerical claims when source data is absent
- Unlabeled assumptions
- Missing source notes where required

### 12.5 `validate_visuals.py`

**Purpose:** validate slide-level visual integrity.

**Checks:**

- Text overflow
- Object overlap
- Elements outside slide boundaries
- Minimum font sizes
- Inconsistent fonts/colors
- Contrast problems
- Unaligned objects
- Excessive object density

### 12.6 `validate_deck.py`

**Purpose:** integrated preflight check.

**Output:**

- Pass/fail status
- Severity-ranked issues
- Slide numbers affected
- Recommended corrections
- Quality score by category

### 12.7 `chart_helpers.py`

**Purpose:** provide consistent chart selection and styling.

**Responsibilities:**

- Recommend chart type based on analytical question.
- Normalize data.
- Create themed charts.
- Apply labeling and source-note rules.
- Avoid misleading axes or chart forms.

---

## 13. Chart Selection Rules

| Business question                             | Preferred visual                                   |
| --------------------------------------------- | -------------------------------------------------- |
| How has a value changed over time?            | Line chart or column chart                         |
| What explains a change from A to B?           | Waterfall / bridge                                 |
| Which segment is largest or highest priority? | Sorted bar chart                                   |
| What is the breakdown of a whole?             | Stacked bar or 100% stacked bar; use pie sparingly |
| Where is the process bottleneck?              | Funnel or process flow                             |
| Which options outperform on two criteria?     | 2x2 only if axes are meaningful                    |
| What are the drivers of an outcome?           | Driver tree / issue tree / decomposition           |
| What happens across stages?                   | Journey / flow / phased process                    |
| What must happen over time?                   | Roadmap                                            |

Chart requirements:

- Title must state the insight, not merely the metric.
- Axis and units must be legible.
- Highlight the relevant series/data point.
- Avoid unnecessary legend complexity.
- Include source or note if data is externally sourced.
- Use a table when exact values matter more than a visual pattern.

---

## 14. Quality Rubric

### 14.1 Narrative quality

- Governing question is explicit or inferable.
- Executive answer is clear.
- Slide order follows a logical argument.
- One main message per slide.
- Action title matches evidence.
- Recommendation follows from diagnosis and analysis.
- Deck contains an actionable conclusion.

### 14.2 Context and factual integrity

- Claims are grounded in supplied sources/data.
- Assumptions are visible.
- No fabricated figures or citations.
- Language fits the audience and industry context.
- Data sources are stated when relevant.

### 14.3 Visual quality

- Design language is consistent.
- Typography hierarchy is clear.
- Layout uses alignment and whitespace.
- Slides are readable at presentation size.
- Charts are decision-oriented.
- Icons and images are purposeful.
- No clipping, overlap, or placeholder remnants.

### 14.4 User-experience quality

- Skill asks only necessary questions.
- First usable draft is produced efficiently.
- User does not need to repeatedly explain consulting standards.
- Output reduces manual cleanup versus generic prompting.

### 14.5 Suggested scoring

Score each category from 1–5:

- Storyline and decision clarity
- Content/data integrity
- Action-title quality
- Visual consistency
- Chart/data communication
- Anti-AI-slop compliance
- Technical PPTX quality

Suggested acceptance criteria for a V1 deck:

- No score below 3.
- Average score at least 4 for user-facing output.
- No critical failure: fabricated data, unreadable slide, broken PPTX, or missing core decision/recommendation.

---

## 15. Testing Strategy

### 15.1 Triggering tests

The skill should trigger for requests such as:

- “Buat deck strategi untuk board meeting.”
- “Turn this business brief into an executive PowerPoint.”
- “Create a consulting-style deck from this report.”
- “Rapikan PPT ini agar lebih profesional dan structured.”
- “Build a presentation for a market-entry decision.”
- “Create an investor update with clear storyline and charts.”

The skill should not trigger for unrelated tasks such as:

- “Tulis email follow-up singkat.”
- “Buat logo untuk coffee shop.”
- “Buat resep makan malam.”
- “Ringkas artikel ini dalam satu paragraf,” unless a deck is explicitly requested.

### 15.2 Functional tests

Test at least these scenarios:

1. Strategy deck from a short brief
2. Board update from KPIs
3. Market-entry deck with partial data
4. Profit-improvement deck
5. Memo/report-to-deck conversion
6. Existing deck redesign
7. Incomplete data with explicit assumptions
8. Different industries: SaaS, retail, healthcare, manufacturing, public sector
9. Brand-theme adaptation
10. Data-heavy deck requiring chart selection

### 15.3 Regression tests

Maintain a set of “golden briefs” with expected structural outcomes.

For each release, assess:

- Did the skill trigger correctly?
- Is the governing question identified?
- Is the executive summary answer-first?
- Are action titles meaningful?
- Are all core sections present when relevant?
- Does the generated deck pass visual QA?

### 15.4 Baseline comparison

Compare three conditions:

1. Generic AI prompt without the skill
2. Core skill only
3. Core skill plus scripts/assets/QA

Measure:

- Number of user follow-up prompts
- Number of clarifying questions
- Time to usable first draft
- Number of manual edits required
- Narrative quality score
- Visual quality score
- Number of technical errors

---

## 16. Platform Strategy

### 16.1 Platform-neutral core

The core intellectual property should be platform-neutral:

- Storytelling methods
- Design system
- Slide taxonomy
- Quality rubric
- Assets
- Structured input/output specification
- Scripts where local/server execution is possible

### 16.2 Claude adapter

- `SKILL.md` and skill folder
- Claude.ai upload workflow where supported
- Claude Code installation workflow
- Code execution for PPTX scripts where available
- Skill-creator for drafting and iterating on the skill

### 16.3 ChatGPT adapter

- Custom GPT or Project instructions
- Uploaded reference files
- Prompt templates
- Structured deck specification output
- Optional external/local generation script workflow

### 16.4 Gemini adapter

- Gem/project instruction layer
- Reference files and examples
- Structured input brief and deck-plan output
- Optional code workflow where supported

### 16.5 Perplexity adapter

- Research-first workflow
- Source collection and citation validation
- Export a structured presentation brief/deck spec to another generation environment
- Avoid presenting unsupported web-research claims as facts without citation

### 16.6 Practical compatibility promise

Do not promise identical functionality everywhere.

Communicate clearly:

- **Core mode:** works as a reasoning and design workflow across many AI platforms.
- **Generation mode:** requires an environment capable of generating/editing presentation files.
- **Connected mode:** requires configured MCP/API integrations and permissions.

---

## 17. MCP Expansion Design

### 17.1 Possible connected sources

- Google Drive
- SharePoint / OneDrive
- Notion
- Google Sheets / Excel
- CRM systems
- BI dashboards
- Internal document repositories
- Figma / design asset storage

### 17.2 Connected workflow example

```text
1. Receive request: “Prepare Q3 board deck.”
2. Pull KPI data from BI or spreadsheet system.
3. Pull approved logo/template from Drive or SharePoint.
4. Generate deck and QA report.
5. Save PPTX to designated folder.
6. Create share link.
7. Notify stakeholders in Slack or email.
```

### 17.3 MCP safeguards

- Verify connector status before workflow.
- Verify permissions, scopes, API keys, and token freshness.
- Verify exact tool names.
- Handle failed API calls with retries/fallbacks where safe.
- If MCP fails, provide a non-MCP fallback request for uploaded files or manually supplied data.
- Never expose credentials in user-facing outputs.

---

## 18. Frontmatter Blueprint

This is a conceptual starting point, not the final `SKILL.md`.

```yaml
***
name: consulting-ppt
description: Create, redesign, or convert business content into consulting-style PowerPoint decks with answer-first storylines, action titles, structured analysis, executive visuals, and quality checks. Use when users ask for strategy decks, board presentations, investor or client decks, business presentations, consulting-style slides, or help improving a .pptx file. Use for creating a new deck from a brief, converting reports or memos into slides, or redesigning existing presentations. Do not use for unrelated writing, simple email tasks, or non-presentation design requests.
license: Proprietary
environment: Use presentation-generation scripts when code execution and required dependencies are available. Otherwise provide a complete structured deck plan and slide content for manual creation.
allowed-tools: "Bash(python:*) Bash(node:*) WebFetch"
metadata:
  author: YOUR_BRAND
  version: 0.1.0
  tags: [presentation, consulting, strategy, powerpoint, executive-communication]
  documentation: https://YOUR-DOMAIN.example/docs
  support: support@YOUR-DOMAIN.example
***
```

Frontmatter rules:

- Name must be kebab-case.
- Name should match the folder name.
- Description must explain what the skill does and when to use it.
- Keep description under 1024 characters.
- Do not use XML angle brackets.
- Do not use `claude` or `anthropic` as a reserved skill-name prefix.
- Update `metadata.version` on each meaningful release.

---

## 19. Legal, Licensing, and Governance

### 19.1 Intellectual-property rules

- Build original PPTX templates and original layout library.
- Use third-party templates only if the license explicitly permits commercial redistribution in your product.
- Do not package McKinsey decks, client decks, confidential consulting materials, logos, or directly copied proprietary layouts.
- Treat examples found online as research references, not resale assets.
- Keep evidence of licenses for icons, fonts, images, UI kits, and templates.

### 19.2 Brand/trademark rules

- Do not use McKinsey branding in the product name or imply affiliation.
- Use descriptive language such as “consulting-style” or “executive strategy deck.”
- Ensure marketing screenshots contain only original assets or properly licensed assets.

### 19.3 Content-integrity rules

- Never invent business facts, research findings, financial metrics, citations, or customer quotes.
- Mark assumptions explicitly.
- Request sources when evidence is necessary for a claim.
- Include a source note pattern for data-driven slides.

### 19.4 Security rules

- Do not include API keys or secrets in templates, scripts, documentation, or demos.
- Review third-party skills and scripts before including them.
- Request least-privilege scopes for MCP connections.
- Avoid storing sensitive client data unnecessarily.

---

## 20. Distribution Package

### 20.1 Customer-facing package

```text
consulting-ppt-product/
├── consulting-ppt-skill.zip
├── README.md
├── START-HERE.pdf
├── installation-guides/
│   ├── claude.md
│   ├── chatgpt.md
│   ├── gemini.md
│   ├── perplexity.md
│   └── local-code-setup.md
├── prompt-examples/
├── input-brief-template.docx
├── example-decks/
├── changelog.md
├── license.md
└── support.md
```

### 20.2 README for humans

The repository-level README should include:

- Product outcome and positioning
- Compatibility matrix
- Installation steps
- Quick-start example
- Screenshots / before-after examples
- Requirements for PPTX generation
- Known limitations
- License and support terms

Do not place `README.md` inside the actual skill folder if following the guide’s packaging convention; keep model-facing documentation in `SKILL.md` and `references/`.

### 20.3 Customer onboarding flow

1. Customer purchases/downloads product.
2. Customer chooses their platform.
3. Customer follows platform-specific installation guide.
4. Customer uses a provided business-brief template.
5. Customer runs the “first deck” tutorial.
6. Customer receives deck output and learns the refinement workflow.
7. Customer uses troubleshooting documentation if tools/scripts fail.

### 20.4 Marketing language

Focus on outcomes, not technical implementation.

Good positioning example:

> Turn a messy business brief into a board-ready consulting-style deck with clear storyline, insight-led action titles, disciplined visuals, and fewer revision cycles.

Avoid leading with:

> A folder containing YAML frontmatter, Markdown instructions, and Python scripts.

---

## 21. Versioning and Operations

### 21.1 Versioning

Use semantic versioning:

- `0.x.x`: early beta
- `1.0.0`: first stable commercial version
- Major version: breaking workflow or compatibility change
- Minor version: new layout family, use case, or capability
- Patch version: bug fix, wording improvement, small QA change

### 21.2 Change log

Each release should record:

- What changed
- Which files changed
- New assets or templates
- Compatibility changes
- Fixed known issues
- Migration steps if users need to replace/update files

### 21.3 Feedback loop

Capture user feedback as structured categories:

- Triggering issue
- Storyline issue
- Content relevance issue
- Visual-quality issue
- PPTX technical issue
- Installation issue
- MCP/connectivity issue
- Licensing/asset question

For each issue:

1. Reproduce it.
2. Classify root cause: instruction, reference, asset, script, integration, or user input.
3. Fix the smallest responsible component.
4. Add a regression test.
5. Update the version/changelog.

---

## 22. Development Roadmap

### Phase 0 — Research and product boundary

- Define product positioning and legal boundary.
- Research consulting communication patterns.
- Create an original visual design system.
- Audit all asset licenses.
- Collect non-proprietary examples as study material only.

### Phase 1 — Golden workflow

Choose one difficult, high-value use case, for example:

> “Create a 12-slide profitability-recovery strategy deck for a board based on a short brief and a small KPI table.”

Iterate manually until the workflow produces a strong outcome. Preserve:

- Initial brief
- Critical clarifying questions
- Storyline logic
- Slide plan
- Design decisions
- QA findings
- Final output criteria

Then distill the winning workflow into references and the future skill.

### Phase 2 — V1 core product

- Create `SKILL.md` draft.
- Create 15–25 original layouts.
- Create 2–3 visual themes.
- Create core references.
- Create anti-AI-slop rubric.
- Create three complete examples.
- Support text/outline output for environments without file generation.

### Phase 3 — Power automation

- Implement PPTX generator.
- Implement template/deck analyzer.
- Implement renderer.
- Implement content and visual validators.
- Add structured chart generation.
- Test editable PPTX output.

### Phase 4 — Evaluation

- Create 10–20 positive trigger tests.
- Create negative trigger tests.
- Create a suite of golden briefs.
- Compare generic prompts versus skill-enabled workflow.
- Track user iterations, quality scores, and technical failures.

### Phase 5 — Beta launch

- Package product.
- Publish installation guide.
- Create demo decks and videos.
- Recruit 10–20 beta users from target personas.
- Capture feedback and revise rapidly.

### Phase 6 — Connected and SaaS expansion

- Add MCP connectors.
- Add company brand-kit support.
- Add storage/delivery automation.
- Explore API and SaaS implementation.

---

## 23. Release Checklist

### Planning

- [ ] 2–3 concrete use cases defined
- [ ] Target platforms and tools defined
- [ ] Built-in vs MCP workflow defined
- [ ] Original assets and license status verified
- [ ] Folder structure planned

### Skill structure

- [ ] Folder uses kebab-case
- [ ] `SKILL.md` exists with exact capitalization
- [ ] YAML frontmatter is valid
- [ ] `name` matches folder name
- [ ] `description` includes what and when
- [ ] No XML tags in frontmatter
- [ ] Version metadata is set
- [ ] Core instructions are actionable
- [ ] Error handling is included
- [ ] Examples are included
- [ ] References are linked clearly

### Output quality

- [ ] Action-title rules enforced
- [ ] Storyline QA included
- [ ] Data integrity policy included
- [ ] Visual QA included
- [ ] Anti-AI-slop rules included
- [ ] Templates are original or redistributable
- [ ] PPTX output has been opened in PowerPoint and/or compatible viewer

### Testing

- [ ] Obvious trigger queries tested
- [ ] Paraphrased trigger queries tested
- [ ] Negative trigger queries tested
- [ ] Core use cases tested
- [ ] Edge cases tested
- [ ] Scripts tested in supported environment
- [ ] Regression suite updated
- [ ] Product ZIP structure verified

### Distribution

- [ ] Human README written outside skill folder
- [ ] Installation guides provided per platform
- [ ] Compatibility limitations explained
- [ ] License and support policy included
- [ ] Changelog updated
- [ ] Demo assets verified for rights/permissions

---

## 24. Definition of Done

The product is conceptually mature when it can consistently:

1. Receive an imperfect business brief or source document.
2. Ask only the most decision-relevant clarifying questions.
3. State assumptions transparently if information is missing.
4. Build a coherent answer-first executive storyline.
5. Convert the storyline into slide-specific action titles, evidence, and layouts.
6. Select visuals that clarify the argument rather than decorate the deck.
7. Produce a professional deck specification in all supported AI environments.
8. Generate an editable, technically sound PPTX where generation capability exists.
9. Detect and correct narrative, content, visual, and technical quality failures.
10. Reduce user iteration compared with a generic one-off prompt.
11. Maintain legal, licensing, and data-integrity standards.

---

## 25. Immediate Next Step

Do not begin by writing a large final `SKILL.md`.

Start with one golden workflow:

> Create a board-ready profitability-recovery strategy deck from a short business brief and KPI data.

For that workflow, create:

1. A sample brief.
2. A list of clarifying questions.
3. A governing question.
4. A slide-by-slide storyline.
5. A deck-quality rubric.
6. One original visual theme.
7. Five to eight original slide layouts.
8. A manual “ideal output” deck.

After that manual golden example is strong, convert the proven workflow into `SKILL.md`, references, assets, and scripts.
