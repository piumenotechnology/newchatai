import aiModel from '../models/ai-model.js';
import pool from '../config/database.js'
import datasource from '../config/ai-database.js';
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage } from "@langchain/core/messages";

//use prompt only to get query and run query manualy
const answerOutstanding = async (req, res) => {
  const userQuestion = req.body.userQuestion;
  console.log(userQuestion);

  try {
    if (userQuestion.includes("find")) {
      const cek = await aiModel.llm.invoke([new HumanMessage(userQuestion)]);
      res.json({
        message: "Find the answers on the internet",
        question: userQuestion,
        answer: cek.content,
      });
    } else {
      const sqlPromptDeal = RunnableSequence.from([
        {
          schema: async () => aiModel.db.getTableInfo(),
          question: () => userQuestion,
          // owner: () => 'Mitch Davis',
        },
        aiModel.promptOutstanding,
        aiModel.llm,
        new StringOutputParser(),
      ]);

      const _promt = await sqlPromptDeal.invoke({ question: userQuestion });
      // const manager = datasource.manager;
      // var [data] = await manager.query(_promt)

      if(!_promt.includes("SELECT")){
        res.json({
          query: _promt,
          message: "Can't Make query",
        })
        
      }
      
      var [data] = await pool.execute(_promt)

      if (data.length < 1) {
        res.json({
          query: _promt,
          message: "No data can be found in the table",
          // data: [],
        });
      } else {
        res.json({
          query: _promt,
          count_data: data.length,
          message: "Find the answers",
          // cek : data[1],
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
  answerOutstanding
}


  //normal prompt 
  // const sqlPrompt = RunnableSequence.from ([
  //   {
  //     schema: async () => aiModel.db.getTableInfo(),
  //     question: (userQuestion) => req.body.userQuestion,
  //   },
  //   aiModel.prompt,
  //   aiModel.llm,
  //   new StringOutputParser(),
  // ]);