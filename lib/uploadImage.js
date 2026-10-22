// COOLGUY-MD.V10 - Updated by davidmurungi114 - 2026
const fetch = require('node-fetch');
const FormData = require('form-data');
const FileType = require('file-type');
const fs = require('fs');
const path = require('path');

async function uploadImage(buffer) {
    try {
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const fileType = await FileType.fromBuffer(buffer);
        const { ext, mime } = fileType || { ext: 'png', mime: 'image/png' };
        const tempFile = path.join(tmpDir, `temp_${Date.now()}.${ext}`);

        fs.writeFileSync(tempFile, buffer);

        const form = new FormData();
        form.append('files[]', fs.createReadStream(tempFile));

        const response = await fetch('https://qu.ax/upload.php', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        fs.unlinkSync(tempFile);

        const result = await response.json();
        if (result && result.success) {
            return result.files[0].url;
        } else {
            const telegraphForm = new FormData();
            telegraphForm.append('file', buffer, {
                filename: `upload.${ext}`,
                contentType: mime
            });

            const telegraphResponse = await fetch('https://telegra.ph/upload', {
                method: 'POST',
                body: telegraphForm
            });

            const img = await telegraphResponse.json();
            if (img[0]?.src) {
                return 'https://telegra.ph' + img[0].src;
            }
            
            throw new Error('Failed to upload image to both services');
        }
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

module.exports = { uploadImage };
