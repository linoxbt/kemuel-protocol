# Kemuel Protocol — Frontend Build Prompt

Paste this directly into Claude Code, Lovable, or v0 in place of the build spec's generic
"Phase 4 — Frontend" prompt. It implements the same three routes the spec requires
(`/`, `/collateral`, `/revenue`) inside a specific visual system — codename **The Sealed
Archive** — instead of a default component-library look.

Design reference lineage: the bracket-notation, high-contrast, editorial confidence of
serotoninn.com, reinterpreted through Kemuel Protocol's own subject matter — an oracle
that reads evidence and produces *signed, bracketed judgments* (`[assetId, value,
confidenceBps]`). The bracket motif isn't decorative here; it's literally how an
attestation payload is shaped. Lean on that honestly instead of copying streetwear
e-commerce styling wholesale.

---

## 0. Design tokens — implement these exactly as Tailwind theme extensions

```js
// tailwind.config.ts — theme.extend
colors: {
  ink:        '#16120D', // ground — near-black, warm umber undertone, never pure #000
  paper:      '#F4EEDF', // primary text / reversed ground — warm parchment, never pure #FFF
  line:       '#4B4130', // hairlines, dividers, disabled states
  seal:       '#BE6A2A', // THE accent — one color, spent deliberately. "wax seal" bronze
  'seal-bright': '#E39A4C', // hover/active state of seal only
  safe:       '#6E8F5C', // semantic — healthy LTV / settled / confirmed
  warn:       '#D9B23C', // semantic — margin call / underwriting pending
  critical:   '#B24B3C', // semantic — liquidated / defaulted / rejected
},
fontFamily: {
  display: ['Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', 'Georgia', 'serif'],
  body:    ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
  mono:    ['ui-monospace', 'SF Mono', 'Cascadia Code', 'Roboto Mono', 'Menlo', 'Consolas', 'monospace'],
}
```

**Rule: `seal` is spent in exactly one place per screen at a time** — the single most
important number, action, or live signal. Never use it for decoration, never use it twice
in the same viewport doing two different jobs. `safe` / `warn` / `critical` are a separate
semantic system for loan/bond health — they are not the brand accent and must never be
substituted for `seal`.

Dark ground only. `ink` is the app's permanent background — this is a deliberate, single-world
"archive/vault" aesthetic (like a sealed dossier), not a light/dark togglable theme. Do not
add a light mode.

## 1. Typography rules

- `font-display` (serif) is reserved for section theses and numerals — the handful of
  sentences on each page doing the actual persuading ("Truth, signed." / "LTV 62%"). Set
  with `text-wrap: balance`, generous line-height (1.05–1.15 at display sizes).
- `font-body` (system sans) carries every paragraph of explanatory copy. Cap measure at
  ~65ch. Never use it for numbers that need to align in a column.
- `font-mono` is the protocol's own voice: nav labels, buttons, status pills, event-feed
  rows, bracket notation, addresses, tx hashes, basis points. Set with uppercase +
  `letter-spacing: 0.04em` for labels under 14px. Use `font-variant-numeric: tabular-nums`
  anywhere digits stack (LTV %, USDT amounts, timestamps).

## 2. The bracket component language

This is the site's signature device — implement it as reusable primitives, not one-off
markup:

- **Buttons / CTAs** render as `[ LABEL ]` — literal bracket characters in `font-mono`,
  brackets in `text-line` at rest, both brackets and label shift to `text-seal` on
  hover/focus, no background fill, no border-radius. Example: `[ LAUNCH APP ]`,
  `[ SIMULATE ATTESTATION ]`, `[ CONNECT WALLET ]`.
- **Nav / section labels** use the same device with a leading index, because the three
  primitives genuinely are an ordered sequence (registry → two consumers): `[ 01 ·
  ATTESTATION ENGINE ]`, `[ 02 · COLLATERAL VAULT ]`, `[ 03 · REVENUE BOND VAULT ]`. Do not
  invent numbering elsewhere it doesn't correspond to a real sequence.
- **Status pills** (loan/bond state) are bracketed mono tags with a semantic dot, not a
  filled badge: `[ ● HEALTHY ]` in `safe`, `[ ● MARGIN CALL ]` in `warn`, `[ ● LIQUIDATED ]`
  in `critical`.
- **Event feed rows** read like a manifest line, monospace, tabular: `[ TX ] 0x4f2a…9c11 ·
  LoanOpened · 2m ago  ↗` — the whole row links to `https://scan.botchain.ai/tx/<hash>`,
  arrow glyph shifts to `seal` on hover.
- **The logo lockup**: `[ KEMUEL ]` set in `font-mono`, brackets in `line`, wordmark in
  `paper`, with `PROTOCOL` beneath at 11px, `letter-spacing: 0.2em`, `text-line`. Use the
  Bracket mark (see brand assets) as the standalone icon/favicon — it's the same visual
  idea as a real SVG symbol instead of literal text, for places text doesn't fit.

## 3. Motion — purposeful, not decorative

- **Attestation land**: when a new attestation posts on-chain, the affected card does a
  single 180ms scale (0.98 → 1.02 → 1.0) with a `seal`-colored ring that flashes and fades
  — reads as a stamp pressing down, not a generic pulse. Fires once, never loops.
  Never overlap it with the LTV bar transition — sequence them.
- **LTV bar**: width transitions over 400ms ease-out when a new attestation changes it.
  Color crossfades between `safe`/`warn`/`critical` — never snaps. If the stamp-flash
  above is also firing on the same card, sequence it first and start the bar transition
  once the stamp settles (~180ms later) — don't run both at once.
- **Event feed**: new rows slide in from the top over 200ms, existing rows shift down —
  standard list-insert, nothing fancier.
- **Step indicator** on both "Simulate" buttons (see §5) advances left-to-right with no
  easing on the connecting line, only the active step's label gets a subtle opacity pulse
  (not a spinner) — feels procedural, like a form being stamped through stages.
- Respect `prefers-reduced-motion`: disable all of the above, keep instant state changes.

## 4. Pages

### `/` — Landing

- Masthead: `[ KEMUEL ]` lockup left, `[ CONNECT WALLET ]` right, both in a slim
  `ink`-on-`ink` bar with a 1px `line` bottom border — no shadow, no blur.
- Hero: one `font-display` thesis line at very large scale (clamp(2.5rem, 7vw, 5.5rem)),
  something in the register of **"One registry. Two consumers. No human in the loop."**
  Sub-line in `font-body`, one sentence, states what Kemuel actually is (continuous-truth
  oracle for real-world assets). `[ LAUNCH APP ]` CTA below, scrolls to §2.
- Three sections, one per primitive, using the `[ 01 · … ]` / `[ 02 · … ]` / `[ 03 · … ]`
  label device from §2. Each section: label, one-sentence explanation, and a small live
  or static specimen — e.g. §1 (Attestation Engine) shows a miniature attestation payload
  rendered as real bracket notation: `[ assetId, confidenceBps: 8600, dataHash ]` in
  `font-mono`; §2 (Collateral Vault) shows a static example LTV bar; §3 (Revenue Bond
  Vault) shows a static example repayment line. These are *specimens*, not screenshots —
  keep them schematic.
- Footer: repo link, `scan.botchain.ai`, chain badge (`[ BOT CHAIN · 677 ]`).

### `/collateral`

- List of the connected wallet's open loans as cards, each with: assetId (truncated,
  mono), principal (tabular-nums), the bracketed status pill (§2), and a full-width LTV
  bar — track in `line`, fill in `safe`/`warn`/`critical` depending on current LTV vs.
  `liquidationThresholdBps`, with the numeric % right-aligned in `font-mono` tabular-nums.
- `[ SIMULATE NEW ATTESTATION ]` button — posts to the agent's `/attest/physical`
  endpoint with a bundled demo image. On click, replace the button with the step
  indicator from §5 in place (don't open a modal).
- Live event feed below the loan list (`LoanOpened` / `MarginCall` / `Liquidated`, read
  via `viem`'s `watchContractEvent`), rendered per the manifest-row spec in §2.
- Empty state (no loans yet): a single centered line, `font-display`, small — "No
  attested collateral yet." plus the simulate button — never a generic empty-box
  illustration.

### `/revenue`

- `[ CONNECT STRIPE — TEST MODE ]` form: single input for the Stripe test secret key,
  with a permanent, non-dismissable inline label in `warn` reading `TEST MODE ONLY — no
  real charges` directly under the field, not a tooltip.
- Once connected: underwriting result card — `period_revenue_usd`, `risk_score`,
  `recommended_revenue_share_bps`, `confidence` — each as a labeled tabular-nums stat,
  laid out in a single row on desktop / stacked on mobile. Confidence below
  `MIN_CONFIDENCE` (70%) renders in `critical` with a one-line explanation of why
  underwriting was declined, if that happens — never a silent failure state.
- `[ SIMULATE REVENUE PERIOD ]` button — same step-indicator pattern as `/collateral`.
- Live event feed (`BondIssued` / `RevenueSettled`), same manifest-row spec.

### Shared shell

- Network guard: if the connected wallet isn't on chain 677, replace the whole page body
  (not a toast) with a single centered `[ SWITCH TO BOT CHAIN ]` action and one sentence
  explaining why — this blocks accidental interaction with the wrong chain, don't let it
  be dismissable.
- Every on-chain reference (address, tx, contract) is a real link out to
  `https://scan.botchain.ai/...` — never inert text.

## 5. The step indicator (shared component)

Both "Simulate" buttons must expand into this inline on click — four stages, left to
right, connected by a `line`-colored rule that fills with `seal` as each stage completes:

`CALLING AI` → `SIGNING` → `SUBMITTING ON-CHAIN` → `CONFIRMED`

Active stage label pulses opacity (see §3), completed stages turn `seal`, failed stage (if
any) turns `critical` and the row grows a one-line reason underneath instead of just
dying silently. Total flow should resolve in well under 30 seconds against testnet — build
timeouts and failure states for the AI call, the signing step, and the on-chain confirm
independently; don't collapse them into one generic "loading" state.

## 6. Tech constraints (unchanged from the base spec — do not deviate)

- Next.js 14, App Router, TypeScript, Tailwind (tokens above), wagmi + viem + RainbowKit.
- Configure the BOT Chain custom chain: `id: 677`, RPC from `BOT_CHAIN_RPC_URL` env var.
- Import contract addresses from `/contracts/deployments/<network>.json` — never hardcode.
- All live data (loans, bonds, event feeds) comes from real contract reads/`watchContractEvent`
  calls — no mocked UI state once wagmi hooks are wired.

## 7. Accessibility & responsiveness

- Every bracket button/pill is a real interactive element (`<button>`/`<a>`), not a
  styled `<div>` — brackets must not remove semantics.
- Visible focus ring in `seal` at 2px offset on every interactive element (`ink` ground
  makes default browser focus rings invisible — do not skip this).
- LTV bars and status pills carry the semantic color *and* the text label — never color
  alone (colorblind-safe by construction, not an afterthought).
- Mobile: masthead collapses to `[ ☰ ]` + wallet button only; three-primitive sections and
  loan/bond cards stack full-width; event feed rows wrap to two lines (hash+status /
  time+link) rather than truncating the link away.

## Definition of done

A cold visitor can land on `/`, understand the three-primitive architecture in under 15
seconds from the hero + section labels alone, connect a wallet, land on `/collateral` or
`/revenue`, run a full simulate flow watching the four-stage step indicator resolve, and
see the resulting event land in the live feed with a working link to the explorer — all
without the bracket/mono/serif system ever reading as a copy-pasted component library.
