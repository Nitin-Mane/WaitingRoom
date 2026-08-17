# API, Data Schema & Storage Specification

## 1. Data Schema Definitions

### `WaitingItem`
```typescript
interface WaitingItem {
  id: string;                         // Unique UUID
  title: string;                      // Concise summary of dependency
  category: ItemCategory;             // RECRUITER | ACADEMIC | APPROVAL | etc.
  status: WaitingStatus;              // DRAFT | WAITING | SNOOZED | ESCALATED | RESPONDED | RESOLVED | CANCELLED
  counterpartyId: string;             // Reference to Counterparty ID
  counterpartyName: string;           // Direct display name
  counterpartyOrg?: string;           // Organization
  consequenceLevel: 1 | 2 | 3 | 4 | 5; // Severity of inaction
  blockingScore: number;              // 0-100 normalized score
  scoreDetails: ScoreBreakdown;       // Explainable factor metrics
  recommendation: Recommendation;     // Policy recommendation and tone
  expectedResponseAt?: string;        // ISO 8601 Timestamp
  hardDeadlineAt?: string;            // ISO 8601 Timestamp
  followUpCount: number;              // Total follow-up communications sent
  tags: string[];                     // User custom label tags
  notes?: string;                     // Context & tracking notes
  createdAt: string;                  // ISO Timestamp
  updatedAt: string;                  // ISO Timestamp
  resolvedAt?: string;                // ISO Timestamp
  resolutionSummary?: string;         // Summary of outcome
}
```

### `Counterparty`
```typescript
interface Counterparty {
  id: string;
  name: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
  channelPreference?: string;
  averageResponseDays: number;
  totalInteractions: number;
  notes?: string;
}
```

---

## 2. Backup & Export Bundle JSON Schema

```json
{
  "version": "1.0.0",
  "exportedAt": "2026-08-17T12:00:00.000Z",
  "app": "WaitingRoom",
  "checksum": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "data": {
    "items": [...],
    "counterparties": [...],
    "dependencies": [...],
    "timelineEvents": [...],
    "settings": {...}
  }
}
```
