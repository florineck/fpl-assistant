# FPL Assistant - Implementation Plan

## Overview
This plan outlines the implementation of the FPL Assistant based on the technical specification in `SPEC.md`.

---

## Phase 1: Foundation (Week 1)

### 1.1 Project Setup
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up project structure per SPEC.md
- [ ] Install dependencies:
  - zustand (state management)
  - @tanstack/react-query (data fetching)
  - recharts (charts)
  - @radix-ui/react-* (UI components)
  - javascript-lp-solver (optimization)

### 1.2 FPL API Client
- [ ] Create `src/lib/fpl-api.ts`
- [ ] Implement Bootstrap Static endpoint
- [ ] Implement Entry/Team endpoint
- [ ] Add caching layer (in-memory or Redis)
- [ ] Handle rate limiting

### 1.3 Data Models & Types
- [ ] Create `src/types/index.ts`
- [ ] Define Player interface
- [ ] Define OptimizedTeam interface
- [ ] Define TransferSuggestion interface
- [ ] Add API response types

### 1.4 Base Components
- [ ] Create layout with navigation
- [ ] Set up global styles
- [ ] Create common UI components (Button, Card, Input)

---

## Phase 2: Core Features (Week 2)

### 2.1 Player Listing
- [ ] Create `/players` page
- [ ] Implement player grid/list view
- [ ] Add filtering (by position, team, price range)
- [ ] Add sorting (by points, form, price)
- [ ] Implement search functionality

### 2.2 Player Details
- [ ] Create `/players/[id]` page
- [ ] Display player stats and info
- [ ] Show recent performance
- [ ] Display fixture history

### 2.3 Player Comparison
- [ ] Create `/players/compare` page
- [ ] Implement side-by-side comparison (up to 5 players)
- [ ] Add radar chart visualization
- [ ] Calculate value metrics

---

## Phase 3: Optimization Engine (Week 3)

### 3.1 Linear Programming Solver
- [ ] Integrate javascript-lp-solver
- [ ] Implement team optimization algorithm
- [ ] Add formation constraints
- [ ] Add team limit constraints (max 3 per team)

### 3.2 Team Optimizer UI
- [ ] Create `/optimizer` page
- [ ] Add budget input
- [ ] Add formation selector
- [ ] Add player include/exclude controls
- [ ] Display optimized XI with captain selection

### 3.3 Transfer Suggestions
- [ ] Implement transfer algorithm
- [ ] Create `/transfers` page
- [ ] Add transfer budget options
- [ ] Display point gain projections
- [ ] Add risk assessment

---

## Phase 4: Predictions (Week 4)

### 4.1 Points Prediction Model
- [ ] Implement prediction algorithm:
  - 40% form + 30% fixture difficulty + 30% historical
- [ ] Create fixture difficulty calculator
- [ ] Add injury/suspension consideration

### 4.2 Prediction UI
- [ ] Create `/predictions` page
- [ ] Display predicted points per player
- [ ] Show confidence intervals
- [ ] Add buy/hold/sell recommendations

### 4.3 Captaincy Suggestions
- [ ] Implement captain recommendation algorithm
- [ ] Show differential options
- [ ] Display form trends

---

## Phase 5: Dashboard & Polish (Week 5)

### 5.1 Main Dashboard
- [ ] Create `/dashboard` page
- [ ] Display current team overview
- [ ] Show next gameweek predictions
- [ ] Add transfer recommendations summary
- [ ] Display player value trends

### 5.2 Visualizations
- [ ] Add charts using Recharts
- [ ] Create player form graphs
- [ ] Add team value trend chart
- [ ] Implement fixture difficulty visualization

### 5.3 Polish
- [ ] Responsive design for mobile
- [ ] Loading states and error handling
- [ ] Performance optimization
- [ ] Add loading skeletons

---

## API Endpoints to Implement

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fpl/bootstrap-static` | GET | Get all player data |
| `/api/fpl/entry/[entryId]` | GET | Get user's team |
| `/api/fpl/entry/[entryId]/history` | GET | Get user's history |
| `/api/optimizer/team` | POST | Optimize starting XI |
| `/api/optimizer/transfers` | POST | Get transfer suggestions |
| `/api/predictions/player/[playerId]` | GET | Predict player points |
| `/api/predictions/gameweek/[gw]` | GET | Predict all players for GW |
| `/api/players` | GET | List all players with filters |
| `/api/players/[playerId]` | GET | Get player details |
| `/api/players/compare` | GET | Compare multiple players |

---

## File Structure

```
fpl-assistant/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── dashboard/
│   │   ├── optimizer/
│   │   ├── transfers/
│   │   ├── predictions/
│   │   ├── players/
│   │   │   ├── page.tsx
│   │   │   ├── compare/
│   │   │   └── [id]/
│   │   └── api/
│   │       ├── fpl/
│   │       ├── optimizer/
│   │       ├── predictions/
│   │       └── players/
│   ├── components/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── optimizer/
│   │   ├── players/
│   │   └── charts/
│   ├── lib/
│   │   ├── fpl-api.ts
│   │   ├── optimizer.ts
│   │   ├── predictions.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useFplData.ts
│   │   └── useOptimizer.ts
│   ├── store/
│   │   └── index.ts
│   └── types/
│       └── index.ts
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## Dependencies

### Required Packages
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "zustand": "4.x",
    "@tanstack/react-query": "5.x",
    "recharts": "2.x",
    "@radix-ui/react-*": "latest",
    "javascript-lp-solver": "latest"
  }
}
```

---

## Success Criteria

- Team optimizer produces valid teams within budget 100% of the time
- Transfer suggestions improve projected points by minimum 5 points/week
- Prediction accuracy within 10% of actual points
- Page load time under 2 seconds
- Mobile-responsive on all devices
