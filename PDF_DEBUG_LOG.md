# PDF Export Engine — Debug Log & Recovery Guide

# Last Updated: 2026-02-23

# Status: ✅ WORKING (html2pdf.js engine)

## ══════════════════════════════════════════════

## QUICK FIX REFERENCE

## ══════════════════════════════════════════════

### If PDF download stops working, check these in order

1. **Is `.cv-document` in the DOM?**
   - Open browser console → `document.querySelector('.cv-document')`
   - If `null`, ResumeView.jsx is not rendering. Check the component tree.

2. **Is html2pdf imported?**
   - Check `BuilderWorkspace.jsx` line ~5: `import html2pdf from 'html2pdf.js'`
   - If missing: `npm install html2pdf.js`

3. **Is the zoom transform interfering?**
   - The capture code temporarily strips CSS transforms before rendering.
   - If zoom is > 100%, the PDF may capture at the wrong scale.

4. **Is the blob size correct?**
   - Console should show: `[PDF] Blob ready. Size: XXXXXX`
   - Normal size: 500KB–2MB for a 2-page resume
   - If < 10KB: wrong element being captured (check `.cv-document` selector)
   - If 0: html2pdf failed silently

## ══════════════════════════════════════════════

## ARCHITECTURE

## ══════════════════════════════════════════════

### Current Stack (WORKING)

```
BuilderWorkspace.jsx
  └── handleDownloadPDF()
        ├── document.querySelector('.cv-document')  ← live DOM element
        ├── Strip CSS transforms from zoom wrapper
        ├── html2pdf().from(element).outputPdf('blob')
        ├── new Blob([blob], { type: 'application/pdf' })
        └── downloadBlob() → DOM-appended anchor + MouseEvent dispatch
```

### Key Files

- `src/components/BuilderWorkspace.jsx` — PDF export handler (handleDownloadPDF)
- `src/components/ResumeView.jsx` — The `.cv-document` element being captured
- `src/services/pdfMakeDefinition.js` — LEGACY: kept for reference, NOT used for PDF export

## ══════════════════════════════════════════════

## BUG HISTORY & ROOT CAUSES

## ══════════════════════════════════════════════

### Bug #1: pdfMake crashes on empty bullets

- **Symptom:** App crashes when downloading PDF with empty bullet points
- **Cause:** `ul: ['']` is invalid in pdfMake
- **Fix:** Filter: `(job.achievements || []).filter(a => stripHtml(a).trim().length > 0)`
- **Status:** Fixed in pdfMakeDefinition.js (but file is now legacy)

### Bug #2: pdfMake deadlocks in Vite

- **Symptom:** "Rendering..." spinner never stops. No errors in console.
- **Cause:** `pdfMake.createPdf()` internal renderer deadlocks in Vite ESM environment
- **Evidence:** Even `pdfMake.createPdf({content:'test'}).download()` hangs forever
- **Tested ALL of these — ALL deadlock:**
  - `import * as pdfMake` (static) → deadlock
  - `import pdfMake from` (default) → deadlock  
  - `await import('pdfmake/build/pdfmake')` (dynamic) → deadlock
  - `.getBlob()` callback → never fires
  - `.getBase64()` callback → never fires
  - `.download()` → never completes
- **Resolution:** Abandoned pdfMake entirely. Switched to html2pdf.js.

### Bug #3: html2pdf produces wrong file format

- **Symptom:** Downloaded file can't be opened as PDF
- **Cause:** `.save()` method doesn't always produce correct MIME type
- **Fix:** Use `.outputPdf('blob')` then wrap in `new Blob([blob], {type: 'application/pdf'})`

### Bug #4: html2pdf captures empty/tiny PDF (3.5KB)

- **Symptom:** PDF downloads but is blank/empty
- **Cause #1:** DOM clone loses all CSS styles
- **Cause #2:** Wrong element targeted (wrapper instead of `.cv-document`)
- **Fix:** Capture `.cv-document` directly from live DOM, don't clone

### Bug #5: PDF visual quality issues (overlapping, bad page breaks)

- **Symptom:** Section headers overlap with content below, pages split mid-text
- **Cause:** CSS transforms from zoom feature interfere with html2canvas
- **Fix:** Temporarily strip `transform` style before capture, restore after
- **Page breaks:** Set `pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }`
- **ResumeView.jsx** already has `pageBreakInside: 'avoid'` on sections

## ══════════════════════════════════════════════

## CRITICAL: DO NOT DO THESE

## ══════════════════════════════════════════════

❌ Do NOT use pdfMake in this Vite project — it WILL deadlock
❌ Do NOT clone DOM nodes for capture — they lose CSS
❌ Do NOT use `cvRef.current` for capture — it points to the outer wrapper, not the resume
❌ Do NOT use html2pdf's `.save()` method — use `.outputPdf('blob')` instead
❌ Do NOT capture while zoom is applied — strip transforms first
❌ Do NOT use `link.click()` for blob downloads — use `MouseEvent` dispatch
❌ Do NOT revoke blob URLs quickly (≤200ms) — use 10+ seconds delay
❌ Do NOT dispatch click on anchors NOT in the DOM — Chrome ignores `download` attr

### Bug #6: Chrome downloads with UUID filename (not .pdf)

- **Symptom:** Files download as `854664e9-e980-4338-...` instead of `Name_CV.pdf`
- **Cause #1:** `link.click()` — Chrome sometimes ignores `download` attribute
- **Cause #2:** `URL.revokeObjectURL` called after only 200ms — too fast
- **Cause #3:** Anchor NOT appended to `document.body` — Chrome navigates to blob URL
- **Fix:** Append anchor to DOM + use `MouseEvent` dispatch + 10-second revoke delay

## ══════════════════════════════════════════════

## WORKING CODE SNAPSHOT (handleDownloadPDF)

## ══════════════════════════════════════════════

```javascript
// ═══ BULLETPROOF DOWNLOAD ═══
const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);  // MUST be in DOM for Chrome
    a.dispatchEvent(new MouseEvent('click', {
        bubbles: true, cancelable: true, view: window
    }));
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 10000);
};

const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setShowDropdown(false);
    setDownloadSuccess(false);

    try {
        const filename = getSafeFilename('pdf');
        const cvElement = document.querySelector('.cv-document');
        if (!cvElement) throw new Error("Resume document not found in DOM");

        const zoomWrapper = cvElement.closest('[style*="transform"]');
        let savedTransform = '';
        if (zoomWrapper) {
            savedTransform = zoomWrapper.style.transform;
            zoomWrapper.style.transform = 'none';
        }

        await new Promise(resolve => setTimeout(resolve, 200));

        const pdfBlob = await html2pdf()
            .set({
                margin:      [5, 0, 5, 0],
                filename:    filename,
                image:       { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak:   { mode: ['avoid-all', 'css', 'legacy'] }
            })
            .from(cvElement)
            .outputPdf('blob');

        if (zoomWrapper && savedTransform) {
            zoomWrapper.style.transform = savedTransform;
        }

        const finalBlob = new Blob([pdfBlob], { type: 'application/pdf' });
        downloadBlob(finalBlob, filename);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
        console.error("[PDF] FATAL ERROR:", error);
        alert("PDF generation failed: " + error.message);
    } finally {
        setTimeout(() => setIsDownloading(false), 1500);
    }
};
```

## ══════════════════════════════════════════════

## DEPENDENCIES

## ══════════════════════════════════════════════

```json
{
    "html2pdf.js": "^0.10.1"
}
```

Install: `npm install html2pdf.js`

## ══════════════════════════════════════════════

## FUTURE IMPROVEMENT: Selectable Text PDFs

## ══════════════════════════════════════════════

html2pdf.js renders as images (canvas-based), so text is NOT selectable.
To get selectable text PDFs:

- Option A: Use a server-side renderer (Puppeteer/Playwright headless Chrome)
- Option B: Switch bundler from Vite to Webpack (where pdfMake works)
- Option C: Use react-pdf/renderer (@react-pdf/renderer) which generates vector PDFs
