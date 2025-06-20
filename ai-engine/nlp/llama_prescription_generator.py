import requests
import json
import re
from typing import Dict, List, Optional
from datetime import datetime

class LlamaPrescriptionAI:
    """Clinqo-AI prescription system using OpenRouter API with Llama model"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "meta-llama/llama-3.1-8b-instruct:free"  # Correct OpenRouter model name
    
    def extract_symptoms_from_transcript(self, transcript: str) -> List[str]:
        """Extract symptoms from transcript using keyword matching"""
        transcript_lower = transcript.lower()
        
        symptom_keywords = {
            'headache': ['headache', 'head pain', 'migraine', 'head ache'],
            'fever': ['fever', 'temperature', 'hot', 'chills'],
            'cough': ['cough', 'coughing', 'chest', 'respiratory'],
            'fatigue': ['fatigue', 'tired', 'exhausted', 'weakness'],
            'nausea': ['nausea', 'sick', 'vomiting', 'upset stomach'],
            'pain': ['pain', 'ache', 'sore', 'hurt'],
            'dizziness': ['dizzy', 'dizziness', 'lightheaded'],
            'shortness_of_breath': ['shortness of breath', 'difficulty breathing', 'breathless'],
            'sore_throat': ['sore throat', 'throat pain', 'swallowing'],
            'runny_nose': ['runny nose', 'congestion', 'stuffy nose'],
            'rash': ['rash', 'itchy', 'skin irritation'],
            'muscle_pain': ['muscle pain', 'body ache', 'joint pain']
        }
        
        found_symptoms = []
        for symptom_type, keywords in symptom_keywords.items():
            for keyword in keywords:
                if keyword in transcript_lower:
                    found_symptoms.append(symptom_type.replace('_', ' ').title())
                    break
        
        # If no specific symptoms found, return general discomfort
        if not found_symptoms:
            found_symptoms = ['General Discomfort']
        
        return found_symptoms
    
    def build_prescription_prompt(self, transcript: str, symptoms: List[str]) -> str:
        """Create a comprehensive prompt for prescription generation"""
        
        prompt = f"""
You are Clinqo-AI, a medical AI assistant with extensive experience in medical diagnosis and prescription. Analyze the following patient transcript and generate a comprehensive medical prescription.

PATIENT TRANSCRIPT:
"{transcript}"

DETECTED SYMPTOMS:
{', '.join(symptoms)}

Generate a detailed medical prescription in the following JSON format:

{{
  "symptoms": [
    {{
      "id": "symptom_id",
      "name": "Symptom Name",
      "severity": "mild|moderate|severe",
      "description": "Detailed description of the symptom"
    }}
  ],
  "medications": [
    {{
      "id": "medication_id",
      "name": "Brand Name",
      "genericName": "Generic Name",
      "dosage": "Specific dosage (e.g., 500mg)",
      "frequency": "How often to take (e.g., Every 4-6 hours)",
      "duration": "How long to take (e.g., 3-5 days)",
      "sideEffects": ["Side effect 1", "Side effect 2"],
      "warnings": ["Warning 1", "Warning 2"],
      "category": "Medication category (e.g., Pain Reliever)",
      "prescription": false
    }}
  ],
  "recommendations": [
    "Get adequate rest and sleep",
    "Stay hydrated with plenty of fluids",
    "Monitor symptoms closely",
    "Avoid strenuous activities",
    "Maintain a healthy diet"
  ],
  "followUp": "Follow-up instructions based on severity",
  "emergencySigns": [
    "Severe chest pain or difficulty breathing",
    "High fever (above 103°F/39.4°C)",
    "Severe headache with confusion",
    "Unusual bleeding or bruising",
    "Signs of allergic reaction"
  ]
}}

IMPORTANT GUIDELINES:
1. Use realistic but safe over-the-counter medications when possible
2. Set prescription: false for OTC medications, true only for prescription drugs
3. Provide specific dosages and frequencies
4. Include relevant side effects and warnings
5. Base severity on symptom description
6. Ensure all medications are age-appropriate
7. Return ONLY valid JSON - no additional text
8. Use common, well-known medications
9. Include comprehensive safety information

Return the JSON response only.
"""
        return prompt
    
    def generate_prescription(self, transcript: str) -> Dict:
        """Generate comprehensive prescription from transcript"""
        
        # Debug: Log what we're sending to OpenRouter
        print(f"🤖 Llama AI sending to OpenRouter: '{transcript}'")
        print(f"📏 Llama AI transcript length: {len(transcript)}")
        
        # Extract symptoms from transcript
        symptoms = self.extract_symptoms_from_transcript(transcript)
        
        # Build the prompt
        prompt = self.build_prescription_prompt(transcript, symptoms)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "Medical AI Simulation"
        }
        
        data = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are Clinqo-AI, a medical AI assistant. Provide accurate, safe, and comprehensive medical prescriptions in JSON format. Always prioritize patient safety and include appropriate warnings and disclaimers."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3,
            "max_tokens": 1500,
            "stream": False
        }
        
        try:
            print(f"🤖 Sending request to OpenRouter API...")
            print(f"📡 Using model: {self.model}")
            
            response = requests.post(self.api_url, headers=headers, json=data, timeout=30)
            
            print(f"📊 Response status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"❌ Error response: {response.text}")
                return self._create_fallback_prescription(transcript, symptoms)
            
            response_json = response.json()
            
            if 'choices' not in response_json or len(response_json['choices']) == 0:
                return self._create_fallback_prescription(transcript, symptoms)
            
            content = response_json['choices'][0]['message']['content']
            print(f"🔍 Raw AI response: {content}")
            
            # Extract JSON from response
            parsed_json = self._extract_json_from_response(content)
            
            if parsed_json:
                return {
                    "status": "success",
                    "prescription": parsed_json,
                    "timestamp": datetime.now().isoformat(),
                    "model_used": self.model
                }
            else:
                return self._create_fallback_prescription(transcript, symptoms)
                
        except requests.exceptions.Timeout:
            print("⏰ Request timed out")
            return self._create_fallback_prescription(transcript, symptoms)
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {str(e)}")
            return self._create_fallback_prescription(transcript, symptoms)
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
            return self._create_fallback_prescription(transcript, symptoms)
    
    def _extract_json_from_response(self, content: str) -> Optional[Dict]:
        """Extract JSON from AI response"""
        try:
            # Method 1: Look for JSON code blocks
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                json_content = content[json_start:json_end].strip()
                return json.loads(json_content)
            
            # Method 2: Look for curly braces
            if "{" in content and "}" in content:
                json_start = content.find("{")
                json_end = content.rfind("}") + 1
                json_content = content[json_start:json_end]
                return json.loads(json_content)
            
            # Method 3: Try to parse the entire content
            return json.loads(content.strip())
            
        except json.JSONDecodeError as e:
            print(f"⚠️  JSON parsing failed: {e}")
            return None
    
    def _create_fallback_prescription(self, transcript: str, symptoms: List[str]) -> Dict:
        """Create fallback prescription when AI fails"""
        
        # Create basic symptom structure
        symptom_objects = []
        for i, symptom in enumerate(symptoms):
            symptom_objects.append({
                "id": f"symptom_{i}",
                "name": symptom,
                "severity": "mild",
                "description": f"Patient reported {symptom.lower()}"
            })
        
        # Create basic medication
        medications = [{
            "id": "multivitamin",
            "name": "Daily Multivitamin",
            "genericName": "Multivitamin",
            "dosage": "1 tablet",
            "frequency": "Once daily",
            "duration": "Ongoing",
            "sideEffects": ["Mild stomach upset"],
            "warnings": ["Take with food"],
            "category": "Supplement",
            "prescription": False
        }]
        
        return {
            "status": "fallback",
            "prescription": {
                "symptoms": symptom_objects,
                "medications": medications,
                "recommendations": [
                    "Get adequate rest and sleep",
                    "Stay hydrated with plenty of fluids",
                    "Monitor your symptoms closely",
                    "Avoid strenuous activities",
                    "Maintain a healthy diet"
                ],
                "followUp": "Monitor symptoms and contact healthcare provider if they persist beyond 7 days.",
                "emergencySigns": [
                    "Severe chest pain or difficulty breathing",
                    "High fever (above 103°F/39.4°C)",
                    "Severe headache with confusion",
                    "Unusual bleeding or bruising",
                    "Signs of allergic reaction (rash, swelling, difficulty breathing)"
                ]
            },
            "timestamp": datetime.now().isoformat(),
            "model_used": "fallback"
        }

def test_llama_prescription():
    """Test the Llama prescription system"""
    # You'll need to set your OpenRouter API key here
    api_key = "YOUR_OPENROUTER_API_KEY"  # Replace with your actual key
    
    ai = LlamaPrescriptionAI(api_key)
    
    test_transcript = "I have a severe headache and fever, feeling very tired and dizzy"
    
    print("🧪 Testing Llama Prescription System...")
    result = ai.generate_prescription(test_transcript)
    
    print("📋 Result:")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_llama_prescription() 