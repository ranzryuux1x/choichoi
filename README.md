# AI Code Sandbox

Fitur:
- Editor HTML, CSS, JavaScript
- Live preview
- AI generate/modify code
- Netlify Functions sebagai proxy API
- API key tidak ditaruh di frontend

## Deploy ke Netlify

1. Upload folder ini ke GitHub.
2. Import repository tersebut ke Netlify.
3. Set Environment Variable:
   - `OPENAI_API_KEY` = API key kamu
4. Deploy.
5. Buka website dan gunakan prompt AI.

Jangan pernah menaruh OPENAI_API_KEY langsung di `script.js` atau HTML.
