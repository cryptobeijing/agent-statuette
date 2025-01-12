# AgentStatuette

This Project uses AgentKit – CDP's best-in-class toolkit for building AI Agents.

AgentStatuette want to make people's life easier with AI Agents.

The idea is from CryptoStatuette, Base Global Community Builder #001, who is very active on Twitter, Farcaster, Telegram, Discord, etc. and has a lot of Onchain activities.

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

## Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd agent-statuette
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your configuration values.

## Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/` - Application source code
- `public/` - Static assets
- `src/app/` - Next.js 13+ App Router pages and components

## Environment Variables

The project requires several environment variables to be set up before it can run. Follow these steps:

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and set the following required variables:

### OpenAI Configuration
- `OPENAI_API_KEY`: Your OpenAI API key for AI functionality
  - Get it from: https://platform.openai.com/api-keys

### CDP (Coinbase Developer Platform) Configuration
- `CDP_API_KEY_NAME`: Your CDP API key name
- `CDP_API_KEY_PRIVATE_KEY`: Your CDP private key
  - Get these from: https://docs.base.org/tools/agentkit

### Optional Configuration
- `NETWORK_ID`: The network to connect to (defaults to base-sepolia if not set)

Make sure to keep your `.env.local` file secure and never commit it to the repository.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Your chosen license]
