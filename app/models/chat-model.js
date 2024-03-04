import {
    ChatPromptTemplate,
    MessagesPlaceholder,
  } from "@langchain/core/prompts";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { AIMessage } from "@langchain/core/messages";
import { HumanMessage } from "@langchain/core/messages";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";


const tools = [
    new TavilySearchResults({
      apikey: process.env.TAVILY_API_KEY,
      maxResults: 1,
    }),
  ];
  
  const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPEN_AI_KEY,
    modelName: "gpt-3.5-turbo-1106",
    temperature: 0,
  });
  
  
const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a helpful assistant. You may not need to use tools for every query - the user may just want to chat!",
    ],
    new MessagesPlaceholder("messages"),
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  

const agent = await createOpenAIToolsAgent({
  llm: chat,
  tools,
  prompt,
});
  
const agentExecutor = new AgentExecutor({ agent, tools });


// Adapted from https://smith.langchain.com/hub/hwchase17/openai-tools-agent
const prompt2 = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a helpful assistant. You may not need to use tools for every query - the user may just want to chat!",
    ],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);
  
  const agent2 = await createOpenAIToolsAgent({
    llm: chat,
    tools,
    prompt: prompt2,
  });
  
  const agentExecutor2 = new AgentExecutor({ agent: agent2, tools });


const demoEphemeralChatMessageHistory = new ChatMessageHistory();

const conversationalAgentExecutor = new RunnableWithMessageHistory({
  runnable: agentExecutor2,
  getMessageHistory: (_sessionId) => demoEphemeralChatMessageHistory,
  inputMessagesKey: "input",
  outputMessagesKey: "output",
  historyMessagesKey: "chat_history",
});

export default { agentExecutor,conversationalAgentExecutor };