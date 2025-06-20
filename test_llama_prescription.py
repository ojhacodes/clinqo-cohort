#!/usr/bin/env python3
"""
Test script for Llama Prescription System using OpenRouter API
"""

import sys
import os
import json

# Add the ai-engine/nlp path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai-engine/nlp'))

from llama_prescription_generator import LlamaPrescriptionAI

def test_llama_prescription():
    """Test the Llama prescription system using OpenRouter API"""
    
    # Use the working API key that was just tested with curl
    api_key = "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"
    
    print("🧪 Testing Llama Prescription System via OpenRouter...")
    print(f"🔑 Using API key: {api_key[:10]}...")
    
    # Initialize the AI system
    ai = LlamaPrescriptionAI(api_key)
    
    # Test cases
    test_cases = [
        "I have a severe headache and fever, feeling very tired and dizzy",
        "I'm experiencing chest pain and shortness of breath",
        "I have a persistent cough and sore throat",
        "I feel nauseous and have stomach pain"
    ]
    
    for i, transcript in enumerate(test_cases, 1):
        print(f"\n📋 Test Case {i}: {transcript}")
        print("-" * 50)
        
        try:
            result = ai.generate_prescription(transcript)
            
            if result.get("status") == "success":
                print("✅ Success!")
                prescription = result.get("prescription", {})
                
                print(f"📊 Symptoms detected: {len(prescription.get('symptoms', []))}")
                print(f"💊 Medications recommended: {len(prescription.get('medications', []))}")
                
                # Show first symptom and medication
                if prescription.get('symptoms'):
                    symptom = prescription['symptoms'][0]
                    print(f"🔍 Sample symptom: {symptom.get('name')} ({symptom.get('severity')})")
                
                if prescription.get('medications'):
                    med = prescription['medications'][0]
                    print(f"💊 Sample medication: {med.get('name')} - {med.get('dosage')}")
                
            else:
                print(f"❌ Failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
    
    print("\n🎉 Test completed!")

if __name__ == "__main__":
    test_llama_prescription() 