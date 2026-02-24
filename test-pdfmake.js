import { pdfMake, generatePdfMakeDefinition } from './src/services/pdfMakeDefinition.js';
import resumeData from './src/data/resumeData.json' with { type: 'json' };

async function testPdf() {
    console.log("Starting test...");
    try {
        const docDef = generatePdfMakeDefinition(resumeData);
        console.log("Generated docDef");
        const pdf = pdfMake.createPdf(docDef);
        console.log("Created pdf generator", typeof pdf.getBlob);

        // Try getting the blob
        if (pdf.getBlob.length === 0 || pdf.getBlob().then) {
            console.log("It uses a Promise!");
            const blob = await pdf.getBlob();
            console.log("Blob generated!", blob.size);
        } else {
            console.log("It uses a Callback!");
            pdf.getBlob((blob) => {
                console.log("Blob callback triggered!", blob.size);
            });
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testPdf();
