# Iris Dataset AI Assistant

An AI-powered web application for analyzing the famous Iris dataset using natural language queries. Built with Next.js, OpenAI GPT-4o-mini, and TypeScript.

## Features

- 🤖 **AI-Powered Analysis**: Ask questions in natural language about the Iris dataset
- 📊 **Statistical Tools**: Mean, median, standard deviation, correlation, and more
- 🔍 **Data Manipulation**: Filter, sort, group, and explore the dataset
- 💬 **Chat Interface**: Interactive conversation with step-by-step reasoning
- 🧠 **Transparent AI**: See the AI's planning, actions, and observations

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure OpenAI API Key

Create or update `.env.local` with your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the Application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Example Queries

Try asking these questions:

- "What are the basic statistics for sepal length?"
- "Compare the mean petal width across different species"
- "What is the correlation between sepal length and petal length?"
- "Show me the distribution of species in the dataset"
- "Filter the data to show only setosa species with sepal length > 5"
- "What are the unique values in the Species column?"

## Available Analysis Tools

### Statistical Analysis
- Calculate mean, median, standard deviation, variance
- Find min, max, percentiles
- Correlation analysis between features
- Comprehensive descriptive statistics

### Data Manipulation
- Filter data by species or measurement ranges
- Sort data by any column
- Group data by categorical values
- Select specific columns
- Get dataset information

### Analysis Tools
- Cross-tabulation between variables
- Frequency tables
- Compare groups across different measurements

## How It Works

The AI assistant follows a structured reasoning process:

1. **START**: Receives your question
2. **PLAN**: Determines which tools to use
3. **ACTION**: Executes the appropriate analysis functions
4. **OBSERVATION**: Reviews the results
5. **OUTPUT**: Provides a clear, informative answer

## Dataset Information

The Iris dataset contains 150 samples with the following features:
- **SepalLengthCm**: Sepal length in centimeters
- **SepalWidthCm**: Sepal width in centimeters
- **PetalLengthCm**: Petal length in centimeters
- **PetalWidthCm**: Petal width in centimeters
- **Species**: Iris species (setosa, versicolor, virginica)

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini
- **Data Processing**: D3-array, PapaParse
- **Authentication**: Clerk (configured but not required for basic usage)

## Deployment

The application is ready for deployment on Netlify, Vercel, or any platform that supports Next.js.

Make sure to set the `OPENAI_API_KEY` environment variable in your deployment platform.
