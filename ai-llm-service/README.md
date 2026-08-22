# AI/LLM Service — SmartWaste AI

> ⚠️ **This service is reserved for AI/ML implementation by a separate team member.**
> Do NOT modify the existing stub code. Only add your AI/LLM implementation inside the marked sections.

## Service Responsibility

This service handles all AI and machine-learning functionality:

- **Waste Classification** — Identify waste type from image/camera input
- **Recycling Recommendations** — Suggest recycling/upcycling options for a material
- **Fill-Level Prediction** — Predict when a bin will overflow (time-series ML)
- **Waste Scanning** — Process camera frames for real-time waste detection

## Integration Points

The AI service is called by the SmartWaste brain service (Next.js API routes) at:

| Endpoint | Method | Description |
|---|---|---|
| `/api/waste/scan` | POST | Scan and classify waste item |
| `/api/recycling/:material` | GET | Get recycling suggestions for a material |

These endpoints are already stubbed in `src/app/api/waste/` and `src/app/api/recycling/`.

## How to Implement

1. Edit `services/waste.service.js` — add your LLM/vision API calls here
2. Edit `controllers/waste.controller.js` — update response format if needed
3. Add any new environment variables to `.env.local.example`
4. Install your AI dependencies: e.g., `npm install @google/generative-ai openai`

## Environment Variables Needed

Add these to `.env.local`:

```env
# AI/LLM Service (implemented by AI team)
GEMINI_API_KEY=your_key_here
# OR
OPENAI_API_KEY=your_key_here
```

## Expected Response Shape

```json
{
  "material": "aluminium",
  "category": "recyclable",
  "confidence": 0.96,
  "recommendations": [
    "Place in the blue recycling bin",
    "Rinse before disposing",
    "Can be made into new cans in 60 days"
  ],
  "nearestSuitableBinCategory": "recyclable"
}
```
