# FPL Assistant - Technical Specification

## 1. Project Overview

**Project Name:** FPL Assistant  
**Type:** Web Application (Full-stack)  
**Core Functionality:** A comprehensive Fantasy Premier League optimization tool that helps users optimize their team, propose transfers, predict points, and compare players using existing MCP servers and the official FPL API.  
**Target Users:** Fantasy Premier League managers who want data-driven decisions to improve their rankings

---

## 2. Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand (lightweight, TypeScript-friendly)
- **Data Fetching:** TanStack Query (React Query)
- **Charts:** Recharts (for visualizations)
- **UI Components:** Radix UI (accessible, customizable)

### Backend
- **Runtime:** Node.js (via Next.js API Routes)
- **Optimization Engine:** Linear programming solver (javascript-lp-solver)
- **Caching:** Redis (via Upstash) or in-memory cache

### External Integrations
- **FPL API:** Official Fantasy Premier League API (https://fantasy.premierleague.com/api/)
- **MCP Servers:** Model Context Protocol servers for specialized computations
  - Fetch MCP (for HTTP requests)
  - Additional MCP servers as needed

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FPL Assistant                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Frontend   │◄──►│  API Layer   │◄──►│   Services   │      │
│  │   (Next.js)  │    │ (API Routes) │    │   (Core)     │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │              │
│         ▼                   ▼                   ▼              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Data Layer                           │   │
│  ├──────────────┬──────────────┬──────────────┬───────────┤   │
│  │  FPL API     │  MCP Servers │  Cache       │  Local    │   │
│  │  (Official)  │  (External)  │  (Redis)     │  Storage  │   │
│  └──────────────┴──────────────┴──────────────┴───────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Feature Specifications

### 4.1 Team Optimizer
**Description:** Find the optimal team within budget constraints using linear programming

**Inputs:**
- Total budget (default: £100.0m)
- Required formation (e.g., 4-4-2, 3-4-3)
- Player selection (include/exclude players)
- Team constraints (max 3 players from same real team)

**Algorithm:**
```
Variables: x_i (binary - include player i in starting XI)
Constraints:
  - Σ(cost_i * x_i) ≤ budget
  - Σ(x_i for position GK) = 1
  - Σ(x_i for position DEF) = 4 (or formation-based)
  - Σ(x_i for position MID) = 4 (or formation-based)
  - Σ(x_i for position FWD) = 2 (or formation-based)
  - Σ(x_i for same team) ≤ 3
Objective: Maximize Σ(expected_points_i * x_i)
```

**Output:**
- Optimal starting XI with captain/vice-captain
- Value analysis (cost per point)
- Projected points for the gameweek

### 4.2 Transfer Suggestions
**Description:** Propose the best transfers based on current team and upcoming fixtures

**Inputs:**
- Current team squad
- Transfer budget (wildcard, free hit, etc.)
- Number of free transfers available
- Current chip status

**Algorithm:**
1. Identify underperforming players in current squad
2. Calculate expected points differential for potential transfers
3. Consider fixture difficulty (upcoming 3-5 gameweeks)
4. Factor in team value and overall team strength

**Output:**
- Recommended transfers (in/out pairs)
- Point gain projection
- Risk assessment

### 4.3 Points Predictor
**Description:** Predict player points for upcoming fixtures using historical data

**Inputs:**
- Player ID or list of players
- Number of upcoming fixtures to predict
- Factors to consider (home/away, opponent strength, form)

**Algorithm:**
1. Fetch player's historical points data
2. Analyze fixture difficulty ratings
3. Consider player's form (last 5 games)
4. Factor in availability (injury/suspension status)
5. Use weighted average: 40% form + 30% fixture difficulty + 30% historical

**Output:**
- Predicted points per player per fixture
- Confidence interval
- Recommendation (buy/hold/sell)

### 4.4 Player Comparison
**Description:** Compare players across multiple metrics

**Metrics:**
- Total points
- Points per million (value)
- Form (last 5 gameweeks)
- Goal involvement (goals + assists)
- Minutes played
- Clean sheet potential (for defenders/goalkeepers)
- Chance of playing (availability)

**Output:**
- Side-by-side comparison table
- Radar chart visualization
- Recommendation based on budget

### 4.5 Dashboard
**Description:** Overview of user's FPL team with insights

**Components:**
- Current team overview
- Next gameweek predictions
- Transfer recommendations summary
- Captaincy suggestions
- Player value trends
- Overall rank and progress

---

## 5. API Endpoints

### FPL Data
- `GET /api/fpl/bootstrap-static` - Get all player data
- `GET /api/fpl/entry/{entryId}` - Get user's team
- `GET /api/fpl/entry/{entryId}/history` - Get user's history

### Optimizer
- `POST /api/optimizer/team` - Optimize starting XI
- `POST /api/optimizer/transfers` - Get transfer suggestions

### Predictions
- `GET /api/predictions/player/{playerId}` - Predict player points
- `GET /api/predictions/gameweek/{gw}` - Predict all players for GW

### Players
- `GET /api/players` - List all players with filters
- `GET /api/players/{playerId}` - Get player details
- `GET /api/players/compare` - Compare multiple players

---

## 6. Data Models

### Player
```typescript
interface Player {
  id: number;
  firstName: string;
  secondName: string;
  webName: string;
  team: number;
  teamName: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  price: number;
  form: number;
  totalPoints: number;
  minutesPlayed: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  bonusPoints: number;
  expectedGoals: number;
  expectedAssists: number;
  news: string;
  status: 'available' | 'doubtful' | 'unavailable';
}
```

### OptimizedTeam
```typescript
interface OptimizedTeam {
  players: Player[];
  captain: Player;
  viceCaptain: Player;
  totalCost: number;
  projectedPoints: number;
  formation: string;
}
```

### TransferSuggestion
```typescript
interface TransferSuggestion {
  in: Player;
  out: Player;
  pointsGain: number;
  cost: number;
  risk: 'low' | 'medium' | 'high';
  reason: string;
}
```

---

## 7. MCP Server Integration

### Primary Integration: Official FPL API
- **Endpoint:** https://fantasy.premierleague.com/api/
- **Data:** Player stats, fixtures, teams, gameweeks
- **Rate Limiting:** Cache responses (5-15 min TTL)

### MCP Servers to Use
1. **Fetch MCP** - For making HTTP requests to FPL API
2. **Optional: Filesystem MCP** - For caching data locally
3. **Optional: Calculator MCP** - For complex calculations

---

## 8. Project Structure

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

## 9. Development Phases

### Phase 1: Foundation (Week 1)
- Set up Next.js project with TypeScript
- Configure Tailwind CSS and UI components
- Implement FPL API client
- Create data models and types

### Phase 2: Core Features (Week 2)
- Build player listing and search
- Implement player detail pages
- Create player comparison tool

### Phase 3: Optimization Engine (Week 3)
- Implement linear programming solver
- Build team optimizer
- Create transfer suggestion algorithm

### Phase 4: Predictions (Week 4)
- Build points prediction model
- Implement fixture difficulty calculator
- Create captaincy recommendations

### Phase 5: Dashboard & Polish (Week 5)
- Create main dashboard
- Add visualizations and charts
- Responsive design and mobile optimization
- Performance tuning

---

## 10. Success Metrics

- Team optimizer produces valid teams within budget 100% of the time
- Transfer suggestions improve user's projected points by minimum 5 points/week
- Prediction accuracy within 10% of actual points
- Page load time under 2 seconds
- Mobile-responsive on all devices

---

## 11. Future Enhancements

- Machine learning-based predictions
- Integration with FPL Scout/Expert leagues
- Historical performance analysis
- Price change predictions
- Automated team management (Auto-picker)
- Multi-team management
- Social features (share teams, compare with friends)
