import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as fs from "fs";

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = "wallet_data.txt";

export type ChatResponse = {
  content: string;
  type: "tools" | "user";
};

// List of autonomous actions the agent can perform
const AUTONOMOUS_ACTIONS = [
  "Check my wallet balance and details",
  "Request test tokens from the faucet if needed",
  "Send token to specified address",
  "Mint an NFT Collections with generated art",
  "Check the status of previous transactions",
  "Monitor gas prices and network status"
];

/**
 * Initialize the agent with CDP Agentkit
 */
export async function initializeAgent() {
  try {
    // Initialize LLM
    const llm = new ChatOpenAI({
      model: "gpt-4",
    });

    let walletDataStr: string | null = null;

    // Read existing wallet data if available
    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
      } catch (error) {
        console.error("Error reading wallet data:", error);
      }
    }

    // Configure CDP AgentKit
    const config = {
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    // Initialize CDP AgentKit
    const agentkit = await CdpAgentkit.configureWithWallet(config);

    // Initialize CDP AgentKit Toolkit and get tools
    const cdpToolkit = new CdpToolkit(agentkit);
    const tools = cdpToolkit.getTools();

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = { configurable: { thread_id: "CDP AgentKit Chatbot Example!" } };

    // Create React Agent using the LLM and CDP AgentKit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
        faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
        funds from the user. Before executing your first action, get the wallet details to see what network 
        you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
        asks you to do something you can't do with your currently available tools, you must say so, and 
        encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
        docs.cdp.coinbase.com for more information. Be concise and helpful with your responses.
        `,
    });

    // Save wallet data
    const exportedWallet = await agentkit.exportWallet();
    fs.writeFileSync(WALLET_DATA_FILE, exportedWallet);

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

/**
 * Check if the message should trigger autonomous mode
 */
function isAutonomousMode(message: string): boolean {
  const autoTriggers = ['auto', 'autonomous', 'automatic', 'self-running'];
  return autoTriggers.some(trigger => message.toLowerCase().includes(trigger));
}

/**
 * Run the agent in autonomous mode
 */
async function runAutonomousMode(agent: any, config: any): Promise<ChatResponse[]> {
  const responses: ChatResponse[] = [];
  
  try {
    // First, check wallet and network status
    const initCheck = "First, please check my wallet details and network status to ensure we're on base-sepolia.";
    const initStream = await agent.stream({ messages: [new HumanMessage(initCheck)] }, config);
    let lastToolResponse = '';
    
    for await (const chunk of initStream) {
      if ("tools" in chunk) {
        lastToolResponse = chunk.tools.messages[0].content;
      }
    }
    
    if (lastToolResponse) {
      responses.push({
        content: lastToolResponse,
        type: "tools"
      });
    }

    // Choose a random action from the list
    const randomAction = AUTONOMOUS_ACTIONS[Math.floor(Math.random() * AUTONOMOUS_ACTIONS.length)];
    const thought = `Let's perform this action: ${randomAction}. Please execute this task creatively and explain what you're doing.`;
    
    const actionStream = await agent.stream({ messages: [new HumanMessage(thought)] }, config);
    lastToolResponse = '';
    
    for await (const chunk of actionStream) {
      if ("tools" in chunk) {
        lastToolResponse = chunk.tools.messages[0].content;
      }
    }

    if (lastToolResponse) {
      responses.push({
        content: lastToolResponse,
        type: "tools"
      });
    }

    // Add a summary of what was done
    responses.push({
      content: `Completed autonomous action: ${randomAction}. Next action in 30 seconds...`,
      type: "tools"
    });
    
  } catch (error: any) {
    responses.push({
      content: `Error in autonomous mode: ${error?.message || 'Unknown error'}. Will try again in 30 seconds...`,
      type: "tools"
    });
  }
  
  return responses;
}

// Add this new function to handle continuous autonomous execution
export async function runContinuousAutonomous(agent: any, config: any): Promise<ChatResponse[]> {
  try {
    return await runAutonomousMode(agent, config);
  } catch (error: any) {
    return [{
      content: `Error in autonomous mode: ${error?.message || 'Unknown error'}. Will try again in 30 seconds...`,
      type: "tools"
    }];
  }
}

/**
 * Run the agent in chat mode
 */
async function runChatMode(agent: any, config: any, message: string): Promise<ChatResponse[]> {
  const responses: ChatResponse[] = [];
  let enhancedMessage = message;

  // Enhance common commands with more context
  if (message.includes('wallet') || message.includes('address')) {
    enhancedMessage = "Please show me my wallet address and details from the CDP wallet.";
  } else if (message.includes('faucet')) {
    enhancedMessage = "Please request test tokens from the faucet for my wallet on the base-sepolia network.";
  } else if (message.includes('send token')) {
    enhancedMessage = "Please help me send tokens to the specified address using CDP tools.";
  } else if (message.includes('nft')) {
    enhancedMessage = "Please create a new NFT using CDP tools and mint it to my wallet.";
  }

  const stream = await agent.stream({ messages: [new HumanMessage(enhancedMessage)] }, config);
  let lastToolResponse = '';
  
  for await (const chunk of stream) {
    if ("tools" in chunk) {
      lastToolResponse = chunk.tools.messages[0].content;
    }
  }
  
  if (lastToolResponse) {
    responses.push({
      content: lastToolResponse,
      type: "tools"
    });
  }
  
  return responses;
}

/**
 * Process a chat message and return the response stream
 */
export async function processChatMessage(message: string) {
  const { agent, config } = await initializeAgent();
  
  // Check if we should run in autonomous mode
  if (isAutonomousMode(message)) {
    return await runContinuousAutonomous(agent, config);
  }
  
  // Run in chat mode with enhanced message handling
  return await runChatMode(agent, config, message);
} 