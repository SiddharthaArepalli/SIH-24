const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// POST route for PII detection and PDF redaction
app.post('/detect-pii', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  console.log('Received file:', filePath);

  try {
    // Mocked text extraction from file
    const originalText = 'Your Aadhaar number is 1234 5678 9012';
    console.log('Original text extracted:', originalText);
    let redactedText = originalText;

    // Example redaction logic
    const aadhaarPattern = /\d{4}\s\d{4}\s\d{4}/;
    if (aadhaarPattern.test(originalText)) {
      redactedText = redactedText.replace(aadhaarPattern, 'XXXX XXXX XXXX'); // Mask Aadhaar
    }

    console.log('Redacted text:', redactedText);

    // Load and redact the PDF
    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    firstPage.drawText(redactedText, { x: 50, y: 750, size: 12 });

    // Save the redacted PDF
    const pdfBytes = await pdfDoc.save();

    // Return both the redacted PDF and the text
    res.json({
      originalText: originalText || 'No original text found.',
      redactedText: redactedText || 'No redacted text found.',
      pdf: pdfBytes.toString('base64') // Convert PDF to base64 for easier handling
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Error processing the PDF' });
  } finally {
    // Clean up the uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
