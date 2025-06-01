# Iris Dataset Analytics - AI Statistical Analysis Assistant

A comprehensive statistical analysis platform for the famous Iris dataset, powered by an intelligent AI agent that provides expert-level data insights through natural language queries.

## 🌸 Features

### AI Agent Workflow
- **START**: Natural language query processing
- **PLAN**: Intelligent analysis strategy formulation
- **ACTION**: Automated tool execution for statistical analysis
- **OBSERVATION**: Real-time data processing and calculations
- **OUTPUT**: Clear, actionable insights with visual formatting

### Statistical Analysis Tools
- **Feature Statistics**: Mean, median, standard deviation, min/max for all features
- **Species Distribution**: Sample counts and percentages across iris species
- **Comparative Analysis**: Cross-species feature comparisons
- **Dataset Summary**: Comprehensive overview of the entire dataset

### Real-time Data Integration
- Dynamic loading of 150 iris samples from CSV data
- Live data statistics display in header
- Error handling and loading states
- Responsive data visualization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd iris-analyze

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your OpenAI API key to .env.local
```

### Development

```bash
npm run dev
# or
yarn dev
# or  
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📊 Usage Examples

Try these natural language queries with the AI Statistical Analysis Assistant:

- "What are the statistics for sepal length?"
- "Show me the species distribution"
- "Compare petal width across different species"
- "Give me a dataset summary"
- "What is the mean sepal length for each species?"
- "Which feature has the highest variance?"

## 🏗️ Architecture

### AI Agent System (`/api/chat`)
- OpenAI GPT integration with structured JSON responses
- Four specialized statistical analysis tools
- Async tool execution with error handling
- Step-by-step reasoning display

### Frontend Components
- **Sidebar**: Chat interface with agent conversation history
- **Header**: Live data statistics and user authentication
- **Dashboard**: Visual overview of dataset metrics
- **Message**: Rich display of agent responses with step breakdown

### Data Management
- **useIrisData Hook**: Real-time data loading and state management
- **Data Utils**: Statistical calculations using D3.js
- **CSV Integration**: Direct loading from public/data/Iris.csv

## 🛠️ Technology Stack

- **Framework**: Next.js 15.3.3 with App Router
- **AI**: OpenAI GPT with function calling
- **Styling**: Tailwind CSS with custom components
- **Data Processing**: Papa Parse (CSV) + D3.js (statistics)
- **Authentication**: Clerk (optional)
- **TypeScript**: Full type safety throughout

## 📁 Project Structure

```
app/
├── api/chat/           # AI agent API endpoint
├── components/         # React components
├── hooks/             # Custom React hooks
├── utils/             # Data processing utilities
└── globals.css        # Global styles

public/data/           # Iris dataset CSV
```

## 🔧 Configuration

### Environment Variables
```bash
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key (optional)
CLERK_SECRET_KEY=your_clerk_secret (optional)
```

### Statistical Tools Configuration
The system includes four main analysis functions:
- `calculateFeatureStatistics(feature)` - Individual feature analysis
- `getSpeciesDistribution()` - Species breakdown
- `compareFeaturesBySpecies(feature)` - Cross-species comparison  
- `getDatasetSummary()` - Complete dataset overview

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Other Platforms
```bash
npm run build
npm start
```

## 📈 Dataset Information

The Iris dataset contains:
- **150 samples** across 3 species
- **4 features**: Sepal Length, Sepal Width, Petal Length, Petal Width
- **Species**: Iris-setosa, Iris-versicolor, Iris-virginica
- **50 samples per species** for balanced analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original Iris dataset by Ronald Fisher (1936)
- OpenAI for GPT API capabilities
- Next.js team for the excellent framework
- D3.js community for statistical functions
