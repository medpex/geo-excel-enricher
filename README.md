
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/368997ea-4193-48c8-b033-bd2fe1616e62

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/368997ea-4193-48c8-b033-bd2fe1616e62) and start prompting.

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

## Docker Deployment 🐳

### Quick Start with Docker

```bash
# Pull and run the latest image
docker run -p 3000:80 ghcr.io/yourusername/yourrepo:latest
```

### Using Docker Compose

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Start with Docker Compose
docker-compose up -d

# Access the app at http://localhost:3000
```

### Building Locally

```bash
# Build the image
docker build -t geocoding-app .

# Run the container
docker run -p 3000:80 geocoding-app
```

For detailed Docker deployment instructions, see [DOCKER.md](./DOCKER.md).

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

**Lovable Hosting (Easiest)**

Simply open [Lovable](https://lovable.dev/projects/368997ea-4193-48c8-b033-bd2fe1616e62) and click on Share -> Publish.

**Docker Deployment (Recommended for Production)**

This project includes complete Docker support for easy deployment:

- **GitHub Container Registry**: Automatic builds on push
- **Docker Compose**: One-command local deployment
- **Production Ready**: Nginx, health checks, security headers
- **Scalable**: Ready for load balancing and orchestration

See [DOCKER.md](./DOCKER.md) for complete deployment guide.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
