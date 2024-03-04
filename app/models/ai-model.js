/* eslint-disable no-undef */
import  datasource  from '../config/ai-database.js';
import { PromptTemplate } from "@langchain/core/prompts";
import { SqlDatabase } from "langchain/sql_db";
import { ChatOpenAI } from "@langchain/openai";


//another table "invoice" ,"sponsorship"
const db = await SqlDatabase.fromDataSourceParams ({

    appDataSource: datasource,
    // includesTables: ["outstanding"],

 });
   
  // llm model
const llm = new ChatOpenAI ({
  
  openAIApiKey: process.env.OPEN_AI_KEY,
  modelName: "gpt-4",
  
  // modelName: "gpt-3.5-turbo",
  // modelName: "gpt-4-0125-preview",
  // modelName: "gpt-4-32k",
  // modelName: "gpt-4-32k-0613",
  // maxTokens: 3000,

 });

const promptCombine = PromptTemplate.fromTemplate(`
Given the following SQL tables, your job is to write queries given a user's question.

CREATE TABLE outstanding (
  close_date date DEFAULT NULL,
  invoice_no varchar(512) DEFAULT NULL,
  invoice_date date DEFAULT NULL,
  term varchar(512) DEFAULT NULL,
  due_date varchar(512) DEFAULT NULL,
  conference_name varchar(512) DEFAULT NULL,
  opportunity_name varchar(512) DEFAULT NULL,
  account_name varchar(512) DEFAULT NULL,
  quote_subtotal_currency varchar(512) DEFAULT NULL,
  quote_subtotal decimal(12,2) DEFAULT NULL,
  total_with_tax_converted_currency varchar(512) DEFAULT NULL,
  total_with_Tax_converted decimal(12,2) DEFAULT NULL,
  payment_eceived_currency varchar(512) DEFAULT NULL,
  payment_received varchar(512) DEFAULT NULL,
  amount_include_tax varchar(512) DEFAULT NULL,
  balance_outstanding_converted_currency varchar(512) DEFAULT NULL,
  balance_outstanding_converted decimal(12,2) DEFAULT NULL,
  expected_payment varchar(512) DEFAULT NULL,
  payment_note varchar(512) DEFAULT NULL,
  owner varchar(512) DEFAULT NULL,
  opportunity_record_type varchar(512) DEFAULT NULL,
  status_payment varchar(512) DEFAULT NULL,
  payment_date varchar(512) DEFAULT NULL,
  commission varchar(512) DEFAULT NULL,
  date_of_commssion varchar(512) DEFAULT NULL,
  payment_method varchar(512) DEFAULT NULL,
  currency varchar(512) DEFAULT NULL,
  amount varchar(512) DEFAULT NULL
);

CREATE TABLE real_deal (
  id varchar(255) NOT NULL,
  amount_in_home_currency float DEFAULT NULL,
  closedate date DEFAULT NULL,
  conference_code varchar(255) DEFAULT NULL,
  conference_internal_name varchar(255) DEFAULT NULL,
  createdate date DEFAULT NULL,
  dealname varchar(255) DEFAULT NULL,
  dealtype varchar(255) DEFAULT NULL,
  hs_analytics_source_data_1 varchar(255) DEFAULT NULL,
  owner_department__sfdc_ varchar(255) DEFAULT NULL,
  pipeline_name varchar(255) DEFAULT NULL,
  dealstage_name varchar(255) DEFAULT NULL,
  hubspot_owner_name varchar(255) DEFAULT NULL
);

          take user questions and response back with sql query.
              example : 
              user question : give me data from the last 3 month
              your generated sql query : SELECT * FROM real_deal WHERE createdate >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH);

          DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.
          if user question : delete data where Year is 2024, just sent sorry you can not delete data 
          if user question : update data Year 2024 where year is 2022, it also just sent sorry you can not update data data 
          
          user question : {question}
          your generated sql query :
`)
//Spesific user
/*but owner always {owner}
example : 
user question : total amount owner shah mumin
your generated sql query : SELECT SUM(balance_outstanding_converted) FROM real_outstanding WHERE owner = '{owner}';
*/
const promptOutstanding = PromptTemplate.fromTemplate(`
Given the following SQL tables, your job is to write queries given a user's question.

CREATE TABLE real_outstanding (
  id_number varchar(11) NOT NULL,
  close_date date DEFAULT NULL,
  invoice_no varchar(512) DEFAULT NULL,
  invoice_date date DEFAULT NULL,
  term varchar(512) DEFAULT NULL,
  due_date varchar(512) DEFAULT NULL,
  conference_name varchar(512) DEFAULT NULL,
  company_name varchar(512) DEFAULT NULL,
  account_name varchar(512) DEFAULT NULL,
  quote_subtotal_currency varchar(512) DEFAULT NULL,
  quote_subtotal varchar(512) DEFAULT NULL,
  total_with_tax_converted_currency varchar(512) DEFAULT NULL,
  total_with_Tax_converted varchar(512) DEFAULT NULL,
  payment_eceived_currency varchar(512) DEFAULT NULL,
  payment_received varchar(512) DEFAULT NULL,
  amount_include_tax varchar(512) DEFAULT NULL,
  balance_outstanding_converted_currency varchar(512) DEFAULT NULL,
  balance_outstanding_converted varchar(512) DEFAULT NULL,
  expected_payment varchar(512) DEFAULT NULL,
  payment_note varchar(512) DEFAULT NULL,
  owner varchar(512) DEFAULT NULL,
  opportunity_record_type varchar(512) DEFAULT NULL,
  status_payment varchar(512) DEFAULT NULL,
  note varchar(255) DEFAULT NULL,
  payment_date date DEFAULT NULL,
  commission varchar(512) DEFAULT NULL,
  date_of_commssion date DEFAULT NULL,
  payment_method varchar(512) DEFAULT NULL,
  currency varchar(512) DEFAULT NULL,
  amount_paid varchar(512) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

Dont use ISO-8601

take user questions and response back with sql query.

          example : 
          user question : show me who is already paid
          your generated sql query : SELECT * FROM real_outstanding WHERE status_payment='Yes';
          example : 
          user question : show me who is not paid
          your generated sql query : SELECT * FROM real_outstanding WHERE status_payment='No';
          example : 
          user question : shah munim paid
          your generated sql query : SELECT FROM real_outstanding WHERE status_payment='Yes' AND owner like '%Shah Mumin%';
          example : 
          user question : Rivercity Innovations paid
          your generated sql query : SELECT * FROM real_outstanding WHERE status_payment='Yes' AND account_name like '%Rivercity Innovations%';
          example : 
          user question : total amount who already paid but due date not due
          your generated sql query : SELECT SUM(balance_outstanding_converted) FROM real_outstanding WHERE status_payment='Yes' AND due_date NOT LIKE 'due';
          example : 
          user question : show each company total amount who already paid but due date not due
          your generated sql query : SELECT account_name, SUM(balance_outstanding_converted) FROM real_outstanding WHERE status_payment='Yes' AND due_date NOT LIKE 'due' GROUP BY account_name;
          example : 
          user question : show each company who not paid yet and subtotal
          your generated sql query : SELECT account_name, quote_subtotal FROM real_outstanding WHERE status_payment ='No';
          example : 
          user question : payment status for resonate ?
          your generated sql query : SELECT status_payment,account_name,quote_subtotal FROM real_outstanding WHERE account_name like '%resonate%';
          example : 
          user question : list down all account name belongs to Mitch Davis with no payment status and no commission
          your generated sql query : SELECT account_name FROM real_outstanding WHERE owner LIKE '%Mitch Davis%' AND status_payment='No' AND commission='No';
          example : 
          user question : amount kasasa
          your generated sql query : SELECT SUM(balance_outstanding_converted) FROM real_outstanding WHERE account_name LIKE '%Kasasa%';
          
      DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.
      if user question : delete data where Year is 2024, just sent sorry you can not delete data 
      if user question : update data Year 2024 where year is 2022, it also just sent sorry you can not update data data 

  user question : {question}
  your generated sql query :
`)

const promptDeal = PromptTemplate.fromTemplate(`
  Given the following SQL tables, your job is to write queries given a user's question.
      
  CREATE TABLE real_deal (
    id varchar(255) NOT NULL,
    amount_in_home_currency float DEFAULT NULL,
    close_date date DEFAULT NULL,
    conference_code varchar(255) DEFAULT NULL,
    conference_internal_name varchar(255) DEFAULT NULL,
    create_date date DEFAULT NULL,
    dealname varchar(255) DEFAULT NULL,
    dealtype varchar(255) DEFAULT NULL,
    hs_analytics_source_data_1 varchar(255) DEFAULT NULL,
    owner_department__sfdc_ varchar(255) DEFAULT NULL,
    pipeline_name varchar(255) DEFAULT NULL,
    dealstage_name varchar(255) DEFAULT NULL,
    hubspot_owner_name varchar(255) DEFAULT NULL
  ) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


  dont use ISO-8601

      example : 
      user question : give me data from the last 3 month
      your generated sql query : SELECT * FROM real_deal WHERE createdate >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH);
      example : 
      user question : show me data where amount is less than 80000
      your generated sql query : SELECT * FROM amount_in_home_currency WHERE Amount < 80000;
      example : 
      user question : show me data where dealstage_name is won
      your generated sql query : SELECT * FROM real_deal WHERE dealstage_name = 'closed won';
      example : 
      user question : the biggest amount in 2024 
      your generated sql query : SELECT MAX(amount_in_home_currency) FROM real_deal WHERE YEAR(closedate)=2024;
      example : 
      user question : what is the biggest deal we have in 2024
      your generated sql query : SELECT MAX(amount_in_home_currency) as 'The biggest 2024' FROM real_deal WHERE YEAR(closedate)=2024 ;
      example : 
      user question : show me data where stage is Won from the last 6 month and owner is shah
      your generated sql query : SELECT * FROM real_deal WHERE dealstage_name='closed won' AND hubspot_owner_name LIKE '%shah%' AND closedate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH);
      example : 
      user question : who have the highest amount in 2023
      your generated sql query : SELECT MAX(balance_outstanding_converted) FROM real_outstanding WHERE YEAR(invoice_date)=2023;          
      example : 
      user question : how much sales closed won sam caskey made in February 2024
      your generated sql query : SELECT SUM(amount_in_home_currency) FROM real_deal WHERE hubspot_owner_name LIKE '%sam caskey%' AND dealstage_name='closed won' AND YEAR(close_date)=2024 AND MONTH(close_date) = 2;
      example : 
      user question : which one has bigger sales closed won, sam caskey or vlad in february 2024
      your generated sql query : SELECT (SELECT SUM(amount_in_home_currency) FROM real_deal WHERE hubspot_owner_name LIKE '%sam caskey%' AND dealstage_name='closed won' AND YEAR(close_date)=2024 AND MONTH(close_date) = 2) as 'Sam Caskey',(SELECT SUM(amount_in_home_currency) FROM real_deal WHERE hubspot_owner_name LIKE '%vlad%' AND dealstage_name='closed won' AND YEAR(close_date)=2024 AND MONTH(close_date) = 2) as 'Vlad';
      example : 
      user question : How much closed won deal of 124035
      your generated sql query : SELECT SUM(amount_in_home_currency) FROM real_deal WHERE conference_code = '124035' AND dealstage_name = 'closed won';
      example : 
      user question : total amount for conference code 124001 stage 5
      your generated sql query : SELECT SUM(amount_in_home_currency) as total_amount FROM real_deal WHERE conference_code = '124001' AND dealstage_name LIKE '%5%';
      example : 
      user question : How many pipeline name sponsor deal stage proposal sent 124017
      your generated sql query : SELECT COUNT(*) FROM real_deal WHERE pipeline_name LIKE '%sponsor%' AND dealstage_name LIKE '%proposal sent%' AND conference_code = '124017';
      example : 
      user question : show data the biggest amout stage 7.  Closed Won
      your generated sql query : SELECT * FROM real_deal WHERE dealstage_name = '7.  Closed Won' ORDER BY amount_in_home_currency DESC LIMIT 1
      example : 

      DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.
      if user question : delete data where Year is 2024, just sent sorry you can not delete data 
      if user question : update data Year 2024 where year is 2022, it also just sent sorry you can not update data data 
      
      user question : {question}
      your generated sql query :
`);

/**
 * take user questions and response back with sql query.
              example : 
              user question : give me data from the last 3 month
              your generated sql query : SELECT * FROM real_deal WHERE createdate >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH);
              example : 
              user question : show me data where amount is less than 80000
              your generated sql query : SELECT * FROM amount_in_home_currency WHERE Amount < 80000;
              example : 
              user question : show me data where dealstage_name is won
              your generated sql query : SELECT * FROM real_deal WHERE dealstage_name LIKE '%won%';
              example : 
              user question : show me data where stage is Won from the last 6 month and owner is shah
              your generated sql query : SELECT * FROM real_deal WHERE dealstage_name LIKE '%Won%' AND hubspot_owner_name LIKE '%shah%' AND closedate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH);
              example : 
              user question : show me data where report name FPM
              your generated sql query : SELECT * FROM real_deal WHERE Conference_Report_Name LIKE '%FPM%';
              example : 
              user question : show me data from 2023 and owner name is Ben Roberts
              your generated sql query : SELECT * FROM real_deal WHERE createdate >= '2023-01-01' AND createdate <= '2023-12-31' AND hubspot_owner_name LIKE '%Ben Roberts%';
              example : 
              user question : who have the highest amount in 2023
              your generated sql query : SELECT * FROM real_deal WHERE createdate >= '2023-01-01' AND createdate <= '2023-12-31' ORDER BY amount_in_home_currency DESC LIMIT 1;
              example : 
              user question : is Mitch Davis have deal in april 2023
              your generated sql query : SELECT * FROM real_deal WHERE hubspot_owner_name = 'Mitch Davis' AND createdate >= '2023-04-01' AND createdate <= '2023-04-30' AND dealstage_name IS NOT NULL;
              example : 
              user question : can you show me the highest amount in 2023 and the highest amount 2024 and show me dealname, and ownername year
              your generated sql query : SELECT dealname, hubspot_owner_name, MAX(amount_in_home_currency) AS highest_amount, YEAR(createdate) AS year FROM real_deal WHERE YEAR(createdate) IN (2023, 2024) GROUP BY year;
              example : 
              user question : show me last 5 dealname in 2024
              your generated sql query : SELECT * FROM real_deal WHERE createdate >= '2024-01-01' AND createdate <= '2024-12-31' ORDER BY dealname DESC LIMIT 5;
              example : 
              user question : show me last 5 dealname in 2023
              your generated sql query : SELECT * FROM real_deal WHERE createdate >= '2023-01-01' AND createdate <= '2023-12-31' ORDER BY dealname DESC LIMIT 5;
              example : 
              user question : show me last 5 dealname in last 6 month
              your generated sql query : SELECT * FROM real_deal WHERE createdate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) ORDER BY dealname DESC LIMIT 5;
              example : 
              user question : show me the highest deal everymonth in last 6 month
              your generated sql query : SELECT YEAR(createdate) AS year, MONTH(createdate) AS month, MAX(amount_in_home_currency) AS highest_amount FROM real_deal WHERE createdate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) GROUP BY year, month
              example : 
              user question : show me the biggest deal in 2023 and 2024
              your generated sql query : SELECT dealname, hubspot_owner_name, MAX(amount_in_home_currency) AS biggest_deal FROM real_deal WHERE YEAR(createdate) IN (2023, 2024) GROUP BY YEAR(createdate);
              example : 
              user question : total amount for conference code 124001 stage 7. Closed Won
              your generated sql query : SELECT SUM(amount_in_home_currency) as total_amount FROM real_deal WHERE conference_code = '124001' AND dealstage_name LIKE '%7%';
              example : 
              user question : total amount for conference code 124001 stage 6. Invoice Requested
              your generated sql query : SELECT SUM(amount_in_home_currency) as total_amount FROM real_deal WHERE conference_code = '124001' AND dealstage_name = '6. Invoice Requested';
              example : 
              user question : total amount for conference code 124001 stage Invoice Requested
              your generated sql query : SELECT SUM(amount_in_home_currency) as total_amount FROM real_deal WHERE conference_code = '124001' AND dealstage_name LIKE '%Invoice Requested%';
              example : 
              user question : total amount for conference code 124001 stage Requested
              your generated sql query : SELECT SUM(amount_in_home_currency) as total_amount FROM real_deal WHERE conference_code = '124001' AND dealstage_name LIKE '%Requested%';
              example : 
              user question : total amount for conference code 124001 stage 5. Closed Won
              your generated sql query : SELECT SUM(amount_in_home_currency) as total_amount FROM real_deal WHERE conference_code = '124001' AND dealstage_name LIKE '%5%';
              example : 
              user question : total amount for conference code 124001 stage 4. Closed Won
              your generated sql query : SELECT SUM(amount_in_home_currency) as total_amount FROM real_deal WHERE conference_code = '124001' AND dealstage_name LIKE '%4%';
              
 */

const prompt = PromptTemplate.fromTemplate(`
Based on the provided SQL table schema below, write a SQL query that would answer the user's question
------------
 SCHEMA: {schema}
------------
QUESTION: {question}
------------
SQL QUERY:
`);


export default {
    db,
    llm,
    promptDeal,
    prompt,
    promptOutstanding,
}