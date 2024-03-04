import aiModel from '../models/ai-model.js';
import pool from '../config/database.js'
import datasource from '../config/ai-database.js';
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage } from "@langchain/core/messages";
import agent from '../models/chat-model.js';

//use prompt only to get query and run query manualy
const answerDeal = async (req, res) => {
  const userQuestion = req.body.userQuestion;
  console.log(userQuestion);

  try {
    if (userQuestion.includes("find")) {
      // const cek = await aiModel.llm.invoke([new HumanMessage(userQuestion)]);
      // const chat_global = await agentExecutor.invoke({
      //   messages: [
      //     new HumanMessage(userQuestion),
      //   ],
      // })

      const chat_global = await agent.conversationalAgentExecutor.invoke(
        { input: userQuestion },
        { configurable: { sessionId: "unused" } }
      );

      res.json({
        message: "Find the answers on the internet",
        question: userQuestion,
        answer: chat_global.output,
      });
      
    } else {
      const sqlPromptDeal = RunnableSequence.from([
        {
          schema: async () => aiModel.db.getTableInfo(),
          question: () => userQuestion,
        },
        aiModel.promptDeal,
        aiModel.llm,
        new StringOutputParser(),
      ]);
      // const manager = datasource.manager;

      
      const _promt = await sqlPromptDeal.invoke({ question: userQuestion });
      if(!_promt.includes("SELECT")){
        res.json({
          query: _promt,
          message: "Can't Make query",
        })
      }
      
      const [data] = await pool.execute(_promt)
      // const [data] = await manager.query(_promt)

      if (data.length < 1) {
        res.json({
          query: _promt,
          message: "No data can be found in the table",
        });
      } else {
        res.json({
          query: _promt,
          count_data: data.length,
          message: "Find the answers",
          data,
        });
      }
    }
  } catch (error) {
    res.status(403).json([{ error: "An error occurred" }]);
  }
};

const getAnswer = () => {
  
}

export default {
  answerDeal
}
