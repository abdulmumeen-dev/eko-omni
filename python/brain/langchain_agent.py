# python/brain/langchain_agent.py
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from langchain.tools import tool
import os

class PythonAgent:
    def __init__(self, memory=None):
        self.memory = memory
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.tools = self.create_tools()
        self.agent = None
        
    def create_tools(self):
        @tool
        def analyze_data(query: str) -> str:
            """Analyze data using Python (Pandas/NumPy)"""
            return f"Data analysis result for: {query}"
            
        @tool
        def run_ml_model(input_data: str) -> str:
            """Run a machine learning model"""
            return f"ML model result for: {input_data}"
            
        @tool
        def research_topic(topic: str) -> str:
            """Research a topic using LangChain"""
            return f"Research results for: {topic}"
            
        return [analyze_data, run_ml_model, research_topic]
    
    def run(self, prompt):
        if not self.agent:
            # Create agent on first run
            return f"[LangChain Agent] Processing: {prompt}"
        return f"Agent result for: {prompt}"

if __name__ == "__main__":
    agent = PythonAgent()
    print(agent.run("Analyze market trends"))
