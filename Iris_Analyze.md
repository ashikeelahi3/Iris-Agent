## ✅ Project Goals

* Build a **Next.js web interface** where users ask questions about the Iris dataset.
* The system replies with step-by-step AI reasoning using START → PLAN → ACTION → OBSERVATION → OUTPUT.
* Iris dataset is analyzed using statistical tools (just like your Node.js app).
* Uses **OpenAI GPT-4o or GPT-4o-mini** via API.
* Shows interaction history in a chat interface.

---

## 🧠 Project Structure (High-Level Plan)

```
/iris-agent-nextjs
│
├── /app              → Next.js App Route (API + UI)
│   ├── /api
│   │   └── /analyze  → OpenAI + tool integration
│   └── /chat         → Frontend chat interface (React + Tailwind)
│
├── /lib              → Core logic: data loader, tools, OpenAI wrapper
│   ├── tools.js
│   ├── executor.js
│   └── iris.js
│
├── /public
│   └── Iris.csv
│
├── .env.local        → Your OpenAI key
├── next.config.js
└── package.json
```

---

## 🧩 Step-by-Step Plan

### 1. **Set Up Next.js with Tailwind**

```bash
npx create-next-app@latest iris-agent-nextjs
cd iris-agent-nextjs
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then configure `tailwind.config.js` and CSS as needed (let me know if you want the setup files).

---

### 2. **Move Your Tools to `/lib` Folder**

Break your logic into modules:

* `lib/iris.js`: Load and parse the CSV file
* `lib/tools.js`: All the `StatisticalTools`, `DataTools`, `AnalysisTools` classes
* `lib/executor.js`: `FunctionExecutor` class
* `lib/systemPrompt.js`: Your system prompt text

---

### 3. **Iris Dataset Handling**

Move the Iris CSV to `public/Iris.csv`, and use `fs` to read it:

```js
// lib/iris.js
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export function loadIrisData() {
  const file = fs.readFileSync(path.join(process.cwd(), 'public', 'Iris.csv'), 'utf8');
  const parsed = Papa.parse(file, { header: true });
  return parsed.data;
}
```

Install parser:

```bash
npm install papaparse
```

---

### 4. **Create API Route: `app/api/analyze/route.js`**

This endpoint:

* Accepts a prompt
* Loads data
* Calls OpenAI with your prompt and system prompt
* Executes tools
* Returns the AI’s reply

Use `OpenAI` SDK like you already do.

Example:

```js
// app/api/analyze/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { loadIrisData } from '@/lib/iris';
import { tools } from '@/lib/tools';
import { FunctionExecutor } from '@/lib/executor';
import { SYSTEM_PROMPT } from '@/lib/systemPrompt';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { query, messages: previousMessages } = await req.json();
  const dataContext = { iris: loadIrisData(), lastResult: null };

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...previousMessages,
    { role: 'user', content: JSON.stringify({ type: 'user', user: query }) }
  ];

  while (true) {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(chat.choices[0].message.content);
    messages.push({ role: 'assistant', content: JSON.stringify(result) });

    if (result.type === 'output') {
      return NextResponse.json({ messages, reply: result.output });
    }

    if (result.type === 'action') {
      const observation = await FunctionExecutor.executeFunction(result.function, result.input, dataContext);
      const obs = { type: 'observation', observation };
      messages.push({ role: 'assistant', content: JSON.stringify(obs) });
    }
  }
}
```

---

### 5. **Build the Chat UI – `app/chat/page.tsx`**

You’ll use:

* Input box
* Message history view
* `fetch('/api/analyze')` to send the query and receive a response

This part uses basic React hooks (`useState`, `useEffect`) to manage the conversation state.

Let me know if you want a sample UI starter file here.

---

### 6. **Environment Setup**

In `.env.local`:

```
OPENAI_API_KEY=your_key_here
```

---

## ✅ Optional Additions

* Add streaming responses using `OpenAI.stream()` + SSE.
* Add visualizations (e.g., boxplot for SepalLengthCm) using chart libraries.
* Add authentication if you want to restrict usage.
* Add logging (store queries and results in a database for audit).

---

## 📚 Summary

| Component         | Role                                               |
| ----------------- | -------------------------------------------------- |
| `lib/iris.js`     | Loads and parses Iris dataset                      |
| `lib/tools.js`    | Exposes all analysis tools                         |
| `lib/executor.js` | Resolves and runs the AI-chosen function           |
| `/api/analyze`    | Backend for AI interaction                         |
| `/chat`           | User interface where queries are typed and replied |
| `.env.local`      | Stores OpenAI API key                              |

---


### Sample code.


index.js
```
import OpenAI from "openai"
import readLineSync from 'readline-sync'
import dotenv from 'dotenv'
import { importData, filterIrisData } from "./related_functions/import_dataset.js"
import * as ss from 'simple-statistics'

dotenv.config()
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const client = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// Initialize data
const filePath = './data/Iris.csv';
const iris = await importData(filePath);

const dataContext = {
    "iris": iris,
    "lastResult": null
};

// Statistical Analysis Tools
class StatisticalTools {
  static calculateMean(data, column) {
    if (!Array.isArray(data) || data.length === 0 || !column) return NaN;
    const values = data.map(item => parseFloat(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return NaN;
    return ss.mean(values);
  }

  static calculateMedian(data, column) {
    if (!Array.isArray(data) || data.length === 0 || !column) return NaN;
    const values = data.map(item => parseFloat(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return NaN;
    return ss.median(values);
  }

  static calculateStandardDeviation(data, column) {
    if (!Array.isArray(data) || data.length === 0 || !column) return NaN;
    const values = data.map(item => parseFloat(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return NaN;
    return ss.standardDeviation(values);
  }

  static calculateVariance(data, column) {
    if (!Array.isArray(data) || data.length === 0 || !column) return NaN;
    const values = data.map(item => parseFloat(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return NaN;
    return ss.variance(values);
  }

  static calculateCount(data, column, value) {
    if (!Array.isArray(data) || !column) return 0;
    return data.filter(item => String(item[column]) === String(value)).length;
  }

  static calculateCorrelation(data, column1, column2) {
    if (!Array.isArray(data) || data.length === 0 || !column1 || !column2) return NaN;
    const values1 = data.map(item => parseFloat(item[column1])).filter(val => !isNaN(val));
    const values2 = data.map(item => parseFloat(item[column2])).filter(val => !isNaN(val));
    if (values1.length === 0 || values1.length !== values2.length) return NaN;
    return ss.sampleCorrelation(values1, values2);
  }

  static calculateMin(data, column) {
    if (!Array.isArray(data) || data.length === 0 || !column) return NaN;
    const values = data.map(item => parseFloat(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return NaN;
    return Math.min(...values);
  }

  static calculateMax(data, column) {
    if (!Array.isArray(data) || data.length === 0 || !column) return NaN;
    const values = data.map(item => parseFloat(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return NaN;
    return Math.max(...values);
  }

  static calculatePercentile(data, column, percentile) {
    if (!Array.isArray(data) || data.length === 0 || !column || percentile < 0 || percentile > 100) return NaN;
    const values = data.map(item => parseFloat(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return NaN;
    return ss.quantile(values, percentile / 100);
  }

  static getDescriptiveStats(data, column) {
    if (!Array.isArray(data) || data.length === 0 || !column) return null;
    const values = data.map(item => parseFloat(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return null;
    
    return {
      count: values.length,
      mean: ss.mean(values),
      median: ss.median(values),
      standardDeviation: ss.standardDeviation(values),
      variance: ss.variance(values),
      min: Math.min(...values),
      max: Math.max(...values),
      q25: ss.quantile(values, 0.25),
      q75: ss.quantile(values, 0.75)
    };
  }
}

// Data Manipulation Tools
class DataTools {
  static filterData(data, filterFn) {
    return data.filter(filterFn);
  }

  static sortData(data, column, order = 'asc') {
    if (!Array.isArray(data) || !column) return data;
    
    return [...data].sort((a, b) => {
      const aVal = parseFloat(a[column]) || a[column];
      const bVal = parseFloat(b[column]) || b[column];
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });
  }

  static groupBy(data, column) {
    if (!Array.isArray(data) || !column) return {};
    
    return data.reduce((groups, item) => {
      const key = item[column];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  }

  static getUniqueValues(data, column) {
    if (!Array.isArray(data) || !column) return [];
    return [...new Set(data.map(item => item[column]))];
  }

  static selectColumns(data, columns) {
    if (!Array.isArray(data) || !Array.isArray(columns)) return data;
    
    return data.map(item => {
      const newItem = {};
      columns.forEach(col => {
        if (item.hasOwnProperty(col)) {
          newItem[col] = item[col];
        }
      });
      return newItem;
    });
  }

  static getDataInfo(data) {
    if (!Array.isArray(data) || data.length === 0) return null;
    
    const sample = data[0];
    const columns = Object.keys(sample);
    
    return {
      totalRows: data.length,
      totalColumns: columns.length,
      columns: columns,
      sampleData: data.slice(0, 5)
    };
  }
}

// Analysis Tools
class AnalysisTools {
  static createCrossTabulation(data, column1, column2) {
    if (!Array.isArray(data) || !column1 || !column2) return {};
    
    const crosstab = {};
    
    data.forEach(item => {
      const val1 = item[column1];
      const val2 = item[column2];
      
      if (!crosstab[val1]) {
        crosstab[val1] = {};
      }
      if (!crosstab[val1][val2]) {
        crosstab[val1][val2] = 0;
      }
      crosstab[val1][val2]++;
    });
    
    return crosstab;
  }

  static createFrequencyTable(data, column) {
    if (!Array.isArray(data) || !column) return {};
    
    const freq = {};
    data.forEach(item => {
      const val = item[column];
      freq[val] = (freq[val] || 0) + 1;
    });
    
    return freq;
  }

  static compareGroups(data, groupColumn, measureColumn) {
    if (!Array.isArray(data) || !groupColumn || !measureColumn) return {};
    
    const groups = DataTools.groupBy(data, groupColumn);
    const comparison = {};
    
    Object.keys(groups).forEach(group => {
      comparison[group] = StatisticalTools.getDescriptiveStats(groups[group], measureColumn);
    });
    
    return comparison;
  }
}

// Define available tools
const tools = {
  // Data manipulation
  "filterIrisData": filterIrisData,
  "sortData": DataTools.sortData,
  "groupBy": DataTools.groupBy,
  "getUniqueValues": DataTools.getUniqueValues,
  "selectColumns": DataTools.selectColumns,
  "getDataInfo": DataTools.getDataInfo,
  
  // Statistical analysis
  "calculateMean": StatisticalTools.calculateMean,
  "calculateMedian": StatisticalTools.calculateMedian,
  "calculateStandardDeviation": StatisticalTools.calculateStandardDeviation,
  "calculateVariance": StatisticalTools.calculateVariance,
  "calculateCount": StatisticalTools.calculateCount,
  "calculateCorrelation": StatisticalTools.calculateCorrelation,
  "calculateMin": StatisticalTools.calculateMin,
  "calculateMax": StatisticalTools.calculateMax,
  "calculatePercentile": StatisticalTools.calculatePercentile,
  "getDescriptiveStats": StatisticalTools.getDescriptiveStats,
  
  // Analysis tools
  "createCrossTabulation": AnalysisTools.createCrossTabulation,
  "createFrequencyTable": AnalysisTools.createFrequencyTable,
  "compareGroups": AnalysisTools.compareGroups
};

const SYSTEM_PROMPT = `
You are an AI Assistant with START, PLAN, ACTION, Observation and Output State.
Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.
Once you get the observation, Return the AI response based on START prompt and observations

Strictly follow the JSON output format as in example

Available Tools:
DATA MANIPULATION:
- filterIrisData(data, filterFn): Filters dataset based on a function
- sortData(data, column, order): Sorts data by column ('asc' or 'desc')
- groupBy(data, column): Groups data by column values
- getUniqueValues(data, column): Gets unique values in a column
- selectColumns(data, columns): Selects specific columns from data
- getDataInfo(data): Gets basic information about the dataset

STATISTICAL ANALYSIS:
- calculateMean(data, column): Calculates mean of a column
- calculateMedian(data, column): Calculates median of a column
- calculateStandardDeviation(data, column): Calculates standard deviation
- calculateVariance(data, column): Calculates variance
- calculateCount(data, column, value): Counts occurrences of a value
- calculateCorrelation(data, column1, column2): Calculates correlation between columns
- calculateMin(data, column): Finds minimum value
- calculateMax(data, column): Finds maximum value
- calculatePercentile(data, column, percentile): Calculates percentile (0-100)
- getDescriptiveStats(data, column): Gets comprehensive statistics for a column

ANALYSIS TOOLS:
- createCrossTabulation(data, column1, column2): Creates cross-tabulation table
- createFrequencyTable(data, column): Creates frequency table for a column
- compareGroups(data, groupColumn, measureColumn): Compares statistics across groups

Example:
START
{ "type": "user", "user": "What is the mean SepalLengthCm for each species?" }
{ "type": "plan", "plan": "I will use compareGroups to get statistics for SepalLengthCm grouped by Species." }
{ "type": "action", "function": "compareGroups", "input": { "data": "iris", "groupColumn": "Species", "measureColumn": "SepalLengthCm" } }
{ "type": "observation", "observation": "..." }
{ "type": "output", "output": "The mean SepalLengthCm for each species is: ..." }
`;

// Function execution handler
class FunctionExecutor {
  static resolveDataset(dataReference) {
    if (typeof dataReference === 'string') {
      if (dataContext.hasOwnProperty(dataReference)) {
        return dataContext[dataReference];
      } else if (dataReference === "result from filterIrisData" || dataReference === "lastResult") {
        return dataContext.lastResult;
      } else {
        throw new Error(`Dataset reference '${dataReference}' not found in dataContext.`);
      }
    } else if (Array.isArray(dataReference)) {
      return dataReference;
    } else {
      throw new Error("Invalid 'data' field: must be a string reference or an array.");
    }
  }

  static async executeFunction(functionName, input) {
    const fn = tools[functionName];
    if (!fn) {
      throw new Error(`Function '${functionName}' is not available.`);
    }

    // Handle functions that need data resolution
    if (input.data) {
      const dataset = this.resolveDataset(input.data);
      if (!Array.isArray(dataset)) {
        throw new Error(`Resolved dataset is not a valid array.`);
      }

      // Execute based on function signature
      if (functionName === "filterIrisData") {
        if (typeof input.filterFn !== 'string') {
          throw new Error("filterFn must be a string representation of a function.");
        }
        const filterFunction = eval(input.filterFn);
        const result = fn(dataset, filterFunction);
        dataContext.lastResult = result;
        return result;
      } else if (functionName === "sortData") {
        return fn(dataset, input.column, input.order);
      } else if (functionName === "groupBy") {
        return fn(dataset, input.column);
      } else if (functionName === "getUniqueValues") {
        return fn(dataset, input.column);
      } else if (functionName === "selectColumns") {
        return fn(dataset, input.columns);
      } else if (functionName === "getDataInfo") {
        return fn(dataset);
      } else if (functionName === "createCrossTabulation") {
        return fn(dataset, input.column1, input.column2);
      } else if (functionName === "createFrequencyTable") {
        return fn(dataset, input.column);
      } else if (functionName === "compareGroups") {
        return fn(dataset, input.groupColumn, input.measureColumn);
      } else if (functionName === "calculatePercentile") {
        return fn(dataset, input.column, input.percentile);
      } else if (functionName === "calculateCorrelation") {
        return fn(dataset, input.column1, input.column2);
      } else {
        // Single column functions
        return fn(dataset, input.column, input.value);
      }
    } else {
      // Functions that don't need dataset resolution
      return fn(...Object.values(input));
    }
  }
}

// Test the new tools
console.log("Simple-statistics test:", ss.mean([1, 2, 3, 4, 5]));
console.log("Data loaded:", iris.length, "rows");

// Main conversation loop
const messages = [{role: 'system', content: SYSTEM_PROMPT}]

while (true) {
  const query = readLineSync.question('>> ')
  const q = {
    type: 'user',
    user: query
  }
  messages.push({role: 'user', content: JSON.stringify(q)})

  while (true) {
    try {
      const chat = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        response_format: {type: 'json_object'}
      })

      const result = chat.choices[0].message.content
      console.log(result)
      messages.push({ role: 'assistant', content: result })

      const call = JSON.parse(result)

      if (call.type === "output") {
        console.log(`🤖: ${call.output}`)
        break
      } else if (call.type === "action") {
        try {
          const observation = await FunctionExecutor.executeFunction(call.function, call.input)
          const obs = {"type": "observation", "observation": observation}
          messages.push({ role: "user", content: JSON.stringify(obs)})
        } catch (error) {
          console.error(`Error executing function ${call.function}: ${error.message}`)
          const obs = {"type": "observation", "observation": `Error: ${error.message}`}
          messages.push({ role: "user", content: JSON.stringify(obs)})
        }
      }
    } catch (error) {
      if (error.status === 429) {
        console.log("Rate limit exceeded. Please wait before making more requests.")
        break
      } else {
        console.error("API Error:", error.message)
        break
      }
    }
  }
}
```

./related_functions/import_dataset.js
```
import fs from 'fs';
import csv from 'csv-parser';

export const importData = async (filePath) => {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log('CSV file successfully processed');
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}


export const filterIrisData = (data, filterFn) => {
  return data.filter(filterFn);
}
```
