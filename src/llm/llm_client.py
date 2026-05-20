import requests
import json
from typing import List, Dict, Any, Optional


class LLMClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.siliconflow.cn/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def query_code(self, query: str, context: Optional[List[Dict[str, Any]]] = None) -> str:
        messages = []

        if context:
            context_text = "Here is the relevant code context:\n"
            for item in context:
                context_text += f"\nFile: {item.get('file', 'unknown')}\n"
                context_text += f"Content:\n{item.get('content', '')}\n"
            messages.append({"role": "system", "content": context_text})

        messages.append({"role": "user", "content": query})

        payload = {
            "model": "Qwen/Qwen2.5-7B-Instruct",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2000
        }

        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            result = response.json()
            return result['choices'][0]['message']['content']
        except Exception as e:
            print(f"LLM API Error: {e}")
            return f"Error querying LLM: {str(e)}"
