# Secret Decoder Application

This is a secure web application that requires a 6-digit passcode to reveal hidden content including a background image, text message, and audio file.

## Security Features

- Passcode is stored as SHA-256 hash only
- Assets (image, audio, text) are base64 encoded
- Assets are only decoded and displayed when correct passcode is entered

## Encoding Assets Script

To generate secure hashes and encoded assets for your application, use the provided Node.js script:

### Prerequisites
- Node.js installed on your system

### Usage

1. **Prepare your assets:**
   - A 6-digit passcode (e.g., 123456)
   - An image file (JPEG, PNG, etc.)
   - An audio file (MP3, WAV, etc.) 
   - Text content you want to reveal

2. **Run the encoding script:**
   ```bash
   node scripts/encode-assets.js <passcode> <image-path> <audio-path> <text-content>
   ```

   **Example:**
   ```bash
   node scripts/encode-assets.js 123456 ./secret-image.jpg ./secret-audio.mp3 "THE ANCIENT WISDOM HAS BEEN UNLOCKED"
   ```

3. **Update your application:**
   - Copy the generated `PASSCODE_HASH` to replace the value in `src/pages/Index.tsx`
   - Copy the `ENCODED_IMAGE` to replace the value in `src/pages/Index.tsx`
   - Copy the `ENCODED_AUDIO` to replace the value in `src/pages/Index.tsx` 
   - Copy the `ENCODED_TEXT` to replace the value in `src/pages/Index.tsx`

4. **Example output:**
   ```
   ✅ Results:
   Passcode Hash: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
   Encoded Image (first 100 chars): /9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYW...
   Encoded Audio (first 100 chars): UklGRiQEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAEAAD//f//...
   Encoded Text: VEhFIEFOQ0lFTlQgV0lTRE9NIEhBUyBCRUVOIFVOTE9DS0VE
   ```

The script will also generate an `encoded-assets.json` file with all the encoded data for backup purposes.

## Project info

**URL**: https://lovable.dev/projects/da823739-ea12-480c-9238-779c00d2326a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/da823739-ea12-480c-9238-779c00d2326a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/da823739-ea12-480c-9238-779c00d2326a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
