# Email Sending Backend

## Features
- 2 APIs:
  - `POST /api/email/normal`
  - `POST /api/email/freelancing`
- Uses 2 different Gmail accounts (App Passwords)
- Logs each email in MongoDB collection `emaillogs` with `toEmail` + `type`
- Prevents sending again if the same `to_email` + `type` already exists in DB

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. Install deps:
   - `npm install`
3. Run:
   - Dev: `npm run dev`
   - Prod: `npm start`

## Request Body
```json
{
  "to": "someone@example.com",
  "subject": "Hello",
  "textTemplate": "Hi",
  "htmlTemplate": "<b>Hi</b>",
  "attachments": [
    {
      "filename": "test.txt",
      "contentType": "text/plain",
      "contentBase64": "SGVsbG8="
    }
  ]
}
```

- You can send `subject` or `heading`.
- Provide at least one of `text/textTemplate` or `html/htmlTemplate`.
- Attachments are optional and use base64.

## Curl testing

### Normal email
```bash
curl -X POST http://localhost:3000/api/email/normal \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"someone@example.com\",\"subject\":\"Normal Test\",\"textTemplate\":\"Hello from normal\"}"
```

### Freelancing email
```bash
curl -X POST http://localhost:3000/api/email/freelancing \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"someone@example.com\",\"heading\":\"Freelance Test\",\"htmlTemplate\":\"<b>Hello from freelancing</b>\"}"
```

### Multiple attachments (example)
```bash
curl -X POST http://localhost:3000/api/email/normal \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"someone@example.com\",\"subject\":\"5 Attachments Test\",\"text\":\"See attachments\",\"attachments\":[{\"filename\":\"a.txt\",\"contentType\":\"text/plain\",\"contentBase64\":\"QQ==\"},{\"filename\":\"b.txt\",\"contentType\":\"text/plain\",\"contentBase64\":\"Qg==\"},{\"filename\":\"c.txt\",\"contentType\":\"text/plain\",\"contentBase64\":\"Qw==\"},{\"filename\":\"d.txt\",\"contentType\":\"text/plain\",\"contentBase64\":\"RA==\"},{\"filename\":\"e.txt\",\"contentType\":\"text/plain\",\"contentBase64\":\"RQ==\"}]}"
```

### Attachment via Google Drive/public URL
The API can download a file from `attachmentUrl`, attach it to the email, and delete the temp file after sending.

```bash
curl -X POST http://localhost:3000/api/email/normal \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"someone@example.com\",\"subject\":\"Drive Link Attachment\",\"text\":\"Please see attached file\",\"attachmentUrl\":\"https://drive.google.com/file/d/FILE_ID/view?usp=sharing\",\"attachmentFilename\":\"resume.pdf\"}"
```

### Resume PDF from public folder
If you send `"resume": true`, the API will attach `public/resume.pdf`.

```bash
curl -X POST http://localhost:3000/api/email/normal \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"someone@example.com\",\"subject\":\"Application\",\"text\":\"Hi, please find my resume attached\",\"resume\":true}"
```

## Responses
- `200`: sent successfully
- `409`: already sent before for that `to` + `type`
- `400`: invalid body
