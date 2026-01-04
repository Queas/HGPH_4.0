# Database Schema Relationships - Visual Guide

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     TKDL-PH DATABASE STRUCTURE                      │
└─────────────────────────────────────────────────────────────────────┘

                           ┌──────────────┐
                           │     USER     │
                           │──────────────│
                           │ • Admin      │
                           │ • Researcher │
                           │ • Reviewer   │
                           │ • Editor     │
                           │ • Indigenous │
                           │   Rep        │
                           └──────┬───────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
    ┌───────────────────┐  ┌──────────────┐  ┌──────────────────┐
    │ MEDICINAL PLANT   │  │   CLINICAL   │  │    RESEARCH      │
    │                   │  │    STUDY     │  │  CONTRIBUTION    │
    │ • Scientific name │  │              │  │                  │
    │ • Common names    │◄─┤ • Plants[]   │  │ • Submitted by   │
    │ • Traditional use │  │ • Conditions │  │ • Reviewed by    │
    │ • Phytochemicals  ├─►│ • Results    │  │ • Status         │
    │ • Clinical        │  │ • Evidence   │  │ • Quality score  │
    │   evidence[]      │  │   level      │  │                  │
    │ • Safety          │  │              │  └──────────────────┘
    │ • Distribution    │  └──────────────┘
    │ • Version history │
    └─────────┬─────────┘
              │
              ▼
    ┌─────────────────────────┐
    │  INDIGENOUS KNOWLEDGE   │
    │                         │
    │ • Community             │
    │ • Traditional knowledge │
    │ • Prior Informed        │
    │   Consent (PIC)         │
    │ • IPR Status            │
    │ • Benefit Sharing       │
    │ • Access Control        │
    │ • Consent validity      │
    └─────────────────────────┘
```

---

## Data Flow: From Submission to Publication

```
┌────────────────────────────────────────────────────────────────────┐
│                    CONTRIBUTION WORKFLOW                            │
└────────────────────────────────────────────────────────────────────┘

1. SUBMISSION
   ┌─────────────────┐
   │   Researcher    │ ─── Creates ──► ResearchContribution
   └─────────────────┘                (status: draft)
                                             │
                                             ▼
2. REVIEW ASSIGNMENT                  (status: submitted)
   ┌─────────────────┐                      │
   │   Editor/Admin  │ ─── Assigns ─────────┤
   └─────────────────┘                      │
                                             ▼
3. PEER REVIEW                        Reviewer(s) assigned
   ┌─────────────────┐                      │
   │    Reviewers    │ ◄─────────────────────┤
   └─────────────────┘                      │
            │                                │
            ├── Rating (1-5)                 │
            ├── Comments                     │
            └── Decision ──────────────────► │
                                             ▼
4. DECISION                     ┌────────────┴────────────┐
   ┌─────────────────┐         │                          │
   │   Editor        │         ▼                          ▼
   └─────────────────┘    APPROVED                REVISION REQUESTED
            │              (status: approved)      (status: revision_requested)
            │                   │                          │
            ▼                   │                          │
5. INTEGRATION                  │         Researcher revises
   Data merged into        MedicinalPlant │              │
   appropriate model      or ClinicalStudy │              │
   (status: integrated)        │           └──────┬───────┘
                               ▼                  │
6. PUBLICATION          Validation status: ───────┘
   ┌─────────────────┐  'published'
   │ PUBLIC DATABASE │  Access level: 'public'
   └─────────────────┘
```

---

## Indigenous Knowledge: Consent Flow

```
┌────────────────────────────────────────────────────────────────────┐
│               IPRA & NAGOYA PROTOCOL COMPLIANCE FLOW               │
└────────────────────────────────────────────────────────────────────┘

STEP 1: COMMUNITY ENGAGEMENT
┌─────────────────────────────────────────┐
│  Indigenous Community                   │
│  • Traditional knowledge holder         │
│  • Community elders                     │
│  • Tribal council                       │
└──────────────┬──────────────────────────┘
               │
               ▼
        Initial discussion
        • Purpose explained
        • Scope of use
        • Benefits shared
               │
               ▼
STEP 2: PRIOR INFORMED CONSENT (PIC)
┌─────────────────────────────────────────┐
│  Consent Process                        │
│  ✓ Information disclosure               │
│  ✓ Community consultation               │
│  ✓ Written consent obtained             │
│  ✓ Witnesses present                    │
│  ✓ NCIP involvement                     │
└──────────────┬──────────────────────────┘
               │
               ▼
        Consent ID generated
        (e.g., PIC-TBOLI-2024-001)
               │
               ▼
STEP 3: DOCUMENTATION & REGISTRATION
┌─────────────────────────────────────────┐
│  IndigenousKnowledge Record             │
│  • consent.obtained = true              │
│  • consent.consentId = "PIC-..."        │
│  • consent.expiryDate = Date            │
│  • consent.scopeOfUse = [...]           │
│  • ipr.status = "protected"             │
└──────────────┬──────────────────────────┘
               │
               ▼
        Register with NCIP
        (ipr.registrationNumber)
               │
               ▼
STEP 4: BENEFIT SHARING AGREEMENT
┌─────────────────────────────────────────┐
│  Benefit Sharing Terms                  │
│  • Monetary benefits (if commercial)    │
│  • Non-monetary benefits                │
│    - Capacity building                  │
│    - Technology transfer                │
│    - Joint research                     │
└──────────────┬──────────────────────────┘
               │
               ▼
STEP 5: ACCESS CONTROL & MONITORING
┌─────────────────────────────────────────┐
│  Access Management                      │
│  • accessLevel = "researchers_only"     │
│  • All access logged (accessLog[])      │
│  • Consent validity checked             │
│  • Annual review (compliance.next...)   │
└──────────────┬──────────────────────────┘
               │
               ▼
        ┌──────┴───────┐
        │              │
        ▼              ▼
  REVOCABLE      RENEWABLE
  (community     (before expiry)
   decision)
```

---

## Medicinal Plant: Version Control

```
┌────────────────────────────────────────────────────────────────────┐
│                    VERSION CONTROL SYSTEM                          │
└────────────────────────────────────────────────────────────────────┘

Initial Creation (v1.0)
┌─────────────────────────────────┐
│  MedicinalPlant                 │
│  version: 1                     │
│  names: {...}                   │
│  traditionalUses: [...]         │
│  previousVersions: []           │
└─────────────┬───────────────────┘
              │
              │ Editor makes changes
              │ plant.createVersion(userId, "Added new study")
              ▼
Version 2.0
┌─────────────────────────────────┐
│  MedicinalPlant                 │
│  version: 2                     │
│  names: {...}                   │
│  traditionalUses: [..., NEW]    │◄─── Updated content
│  previousVersions: [            │
│    {                            │
│      versionNumber: 1,          │
│      data: {original plant},    │◄─── Snapshot of v1
│      updatedBy: userId,         │
│      changeLog: "Added study"   │
│    }                            │
│  ]                              │
└─────────────┬───────────────────┘
              │
              │ Another update
              ▼
Version 3.0
┌─────────────────────────────────┐
│  MedicinalPlant                 │
│  version: 3                     │
│  names: {...}                   │
│  traditionalUses: [..., UPDATED]│
│  previousVersions: [            │
│    { v1 snapshot },             │
│    { v2 snapshot }              │◄─── Full history maintained
│  ]                              │
└─────────────────────────────────┘

BENEFITS:
✓ Complete audit trail
✓ Can rollback to any version
✓ Track who made what changes
✓ Change log for each update
✓ Compliance with TKDL standards
```

---

## Access Control Matrix

```
┌────────────────────────────────────────────────────────────────────┐
│                      ROLE-BASED PERMISSIONS                        │
└────────────────────────────────────────────────────────────────────┘

Role                │ View  │ Create │ Edit  │ Review │ Approve │ IPR
────────────────────┼───────┼────────┼───────┼────────┼─────────┼─────
Public User         │  ✓*   │   ✗    │   ✗   │   ✗    │    ✗    │  ✗
Registered User     │  ✓    │   ✗    │   ✗   │   ✗    │    ✗    │  ✗
Professional        │  ✓    │   ✗    │   ✗   │   ✗    │    ✗    │  ✗
Researcher          │  ✓+   │   ✓    │   ✗   │   ✗    │    ✗    │  ✗
Reviewer            │  ✓+   │   ✓    │   ✓   │   ✓    │    ✗    │  ✗
Editor              │  ✓+   │   ✓    │   ✓   │   ✓    │    ✓    │  ✗
Indigenous Rep      │  ✓+   │   ✓§   │   ✗   │   ✗    │    ✗    │  ✓
Admin               │  ✓+   │   ✓    │   ✓   │   ✓    │    ✓    │  ✓

* = Only 'public' access level content
+ = Can access 'registered', 'researcher', 'restricted' based on settings
§ = Only for their own community's knowledge

ACCESS LEVELS (MedicinalPlant & IndigenousKnowledge):
┌──────────────────┬──────────────────────────────────────────┐
│ Access Level     │ Who Can Access                           │
├──────────────────┼──────────────────────────────────────────┤
│ public           │ Everyone (including anonymous)           │
│ registered       │ Logged-in users                          │
│ researcher       │ Researchers, reviewers, editors, admins  │
│ restricted       │ Specific permission required             │
│ private          │ Admin only (or owner community)          │
└──────────────────┴──────────────────────────────────────────┘
```

---

## Search & Filter Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                    SEARCH CAPABILITIES                             │
└────────────────────────────────────────────────────────────────────┘

1. TEXT SEARCH (MongoDB Full-Text)
   ┌────────────────────────────────────┐
   │ User enters: "cough asthma fever"  │
   └────────────┬───────────────────────┘
                │
                ▼
   Search in indexed fields:
   • names.scientific
   • names.commonNames.name
   • description.botanical
   • traditionalUses.condition
   • tags
                │
                ▼
   Scored results (relevance)

2. STRUCTURED FILTERS
   ┌──────────────────────────────────────┐
   │ • Condition: "Diabetes"              │
   │ • Region: "Region XII"               │
   │ • DOH Approved: Yes                  │
   │ • Safety Level: "Low toxicity"       │
   │ • Has Clinical Evidence: Level I-II  │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   Combined MongoDB query:
   {
     'traditionalUses.condition': /diabetes/i,
     'distribution.regions': 'Region XII',
     'regulatoryStatus.dohApproved': true,
     'safety.toxicity.level': 'Low',
     'clinicalEvidence.evidenceLevel': { $in: ['Level I', 'Level II'] }
   }

3. MULTILINGUAL SEARCH
   User searches: "Lagundi" OR "Gapasgapas" OR "Dangla"
                  │
                  ▼
   Search across all language variants:
   names.commonNames: [
     { language: 'Tagalog', name: 'Lagundi' },
     { language: 'Cebuano', name: 'Gapasgapas' },
     { language: 'Ilocano', name: 'Dangla' }
   ]
                  │
                  ▼
   Returns same plant (Vitex negundo)

4. ADVANCED: By Phytochemical
   User: "Plants containing Flavonoids for inflammation"
                  │
                  ▼
   Query:
   {
     'phytochemicals.class': 'Flavonoid',
     'phytochemicals.bioactivity': 'Anti-inflammatory'
   }
```

---

## Data Validation Pipeline

```
┌────────────────────────────────────────────────────────────────────┐
│                   VALIDATION WORKFLOW                              │
└────────────────────────────────────────────────────────────────────┘

NEW ENTRY
    │
    ▼
┌─────────────────────────┐
│ Schema Validation       │ ◄─── Mongoose schema rules
│ • Required fields       │      • names.scientific required
│ • Data types            │      • Safety data structure
│ • Enum values           │      • Date formats
└──────────┬──────────────┘
           │ PASS
           ▼
┌─────────────────────────┐
│ Completeness Check      │
│ completenessCheck: {    │
│   hasScientificName: ✓  │
│   hasTraditionalUse: ✓  │
│   hasSources: ✓         │
│   hasSafetyInfo: ✓      │
│   hasImages: ?          │
│ }                       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ IPR Compliance Check    │
│ IF traditionalUse &&    │
│    iprStatus='protected'│
│ THEN consent required   │
└──────────┬──────────────┘
           │ PASS
           ▼
┌─────────────────────────┐
│ Quality Scoring         │
│ Based on:               │
│ • Source quality        │
│ • Citation format       │
│ • Data completeness     │
│ • Clinical evidence     │
│ Score: 0-100            │
└──────────┬──────────────┘
           │
           ▼
    STATUS: ready_for_review
           │
           ▼
┌─────────────────────────┐
│ Peer Review Process     │
│ • 2+ reviewers          │
│ • Rating 1-5            │
│ • Comments              │
└──────────┬──────────────┘
           │ APPROVED
           ▼
┌─────────────────────────┐
│ Editor Final Check      │
│ • Format consistency    │
│ • Image licensing       │
│ • Legal compliance      │
└──────────┬──────────────┘
           │ APPROVE
           ▼
    STATUS: published
    accessLevel: public
```

---

## Integration with External Systems

```
┌────────────────────────────────────────────────────────────────────┐
│              EXTERNAL SYSTEM INTEGRATIONS (Future)                 │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   HGPH Database     │
└──────────┬──────────┘
           │
           ├──────────────────────┐
           │                      │
           ▼                      ▼
┌────────────────────┐  ┌───────────────────┐
│  IHM Database      │  │ ASEAN TKDL        │
│  (DOST)            │  │                   │
│  • Sync clinical   │  │ • Share validated │
│    studies         │  │   traditional     │
│  • Research data   │  │   knowledge       │
└────────────────────┘  └───────────────────┘
           │                      │
           │                      │
           ▼                      ▼
┌────────────────────┐  ┌───────────────────┐
│  PubMed/DOI        │  │ WIPO TKDL         │
│                    │  │                   │
│  • Auto-fetch      │  │ • IPR registration│
│    citations       │  │ • Protection      │
│  • Update studies  │  │   tracking        │
└────────────────────┘  └───────────────────┘
           │
           ▼
┌────────────────────┐
│  NCIP Database     │
│                    │
│  • Consent tracking│
│  • Community data  │
│  • Compliance      │
└────────────────────┘

API Endpoints (future):
• GET /api/external/ihm/studies
• POST /api/external/asean/submit
• GET /api/external/pubmed/doi/:doi
• POST /api/external/ncip/consent
```

---

## Performance Optimization Strategy

```
┌────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE CONSIDERATIONS                      │
└────────────────────────────────────────────────────────────────────┘

1. INDEXES (Already Implemented)
   ┌──────────────────────────────────────┐
   │ MedicinalPlant Indexes:              │
   │ • names.scientific                   │
   │ • names.commonNames.name             │
   │ • tags                               │
   │ • validationStatus                   │
   │ • distribution.regions               │
   │ • Full-text index on multiple fields │
   └──────────────────────────────────────┘
   
   Query time: <50ms for indexed searches

2. PAGINATION (Must Implement)
   Limit results per page: 20-50 items
   Don't load entire collections

3. SELECTIVE POPULATION
   Only populate needed references:
   .populate('contributors.user', 'firstName lastName')
   NOT: .populate('contributors.user') // loads everything

4. CACHING STRATEGY (Future)
   ┌─────────────┐
   │   Redis     │ ◄── Cache frequently accessed
   └─────────────┘     • Published plants list
                       • DOH-approved plants
                       • Search results (5 min TTL)

5. AGGREGATION PIPELINES
   For complex queries, use MongoDB aggregation:
   db.medicinal_plants.aggregate([
     { $match: { ... } },
     { $lookup: { ... } },
     { $group: { ... } },
     { $sort: { ... } }
   ])
```

---

This visual guide complements the technical documentation in DATABASE_SCHEMA.md and TKDL_QUICK_START.md
