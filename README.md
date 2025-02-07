AgentStatuette 🤖

AgentStatuette is an AI-powered web application that makes your onchain life easier with AgentKit. It provides a user-friendly interface for managing your blockchain wallet and performing various token operations.

The idea is from CryptoStatuette who is everywhere (Twitter, Telegram, Discord, Farcaster, etc.) in the Base community and sometimes has to perform repetitive manual tasks, such as sending faucet to global builders.
Features

    🏦 Wallet Management: Check your wallet address and details
    💧 Faucet Access: Request test tokens for your wallet
    💰 Balance Checking: View your current token balance
    💸 Token Transfer: Send tokens to other addresses
    🤖 Autonomous Mode: Let the agent perform actions automatically

Getting Started
Prerequisites

    Node.js (v18 or higher)
    pnpm (v8 or higher)

Installation

    Clone the repository:

git clone https://github.com/cryptobeijing/agentstatuette.git
cd agentstatuette

    Install dependencies:

pnpm install

    Create a .env.local file based on .env.example and fill in your configuration.

    Start the development server:

pnpm dev

    Open http://localhost:3000 in your browser.

Environment Variables

Create a .env.local file in the root directory with the following variables:

# OPENAI
OPENAI_API_KEY=your_openai_api_key_here

# CDP
CDP_API_KEY_NAME=your_cdp_api_key_name_here
CDP_API_KEY_PRIVATE_KEY=your_cdp_private_key_here

# Network (Optional)
NETWORK_ID=base-sepolia  # Defaults to base-sepolia if not set

Technology Stack

    Next.js 14
    TypeScript
    Tailwind CSS
    AgentKit Integration

License

This project is licensed under the MIT License - see the LICENSE file for details.
Contact
For any questions or feedback, please reach out to us through GitHub issues.