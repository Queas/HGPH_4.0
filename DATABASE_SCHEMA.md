# Database Schema Documentation
## Philippine Herbal Medicine Platform - TKDL Database Structure

### Overview
This document outlines the comprehensive database schema designed for the Philippine Traditional Knowledge Digital Library (TKDL-PH), compliant with IPRA, Nagoya Protocol, and international standards for traditional knowledge preservation.

---

## Core Models

### 1. MedicinalPlant
**Purpose**: Central repository for scientifically validated medicinal plant information

**Key Features**:
- ✅ Multilingual naming (Scientific + 9 Philippine languages)
- ✅ Traditional uses with IPR tracking
- ✅ Phytochemical composition database
- ✅ Clinical evidence integration
- ✅ Safety and contraindication data
- ✅ Regional distribution mapping
- ✅ Version control for all changes
- ✅ Multi-stage validation workflow
- ✅ DOH/FDA approval tracking

**Access Levels**: `public`, `registered`, `researcher`, `restricted`

**Validation Statuses**: `draft` → `pending_review` → `under_review` → `approved` → `published`

**Search Capabilities**:
- By scientific/common name (all languages)
- By condition/symptom
- By region/province
- By phytochemical compound
- By clinical evidence level
- Full-text search

**Example Use Cases**:
```javascript
// Search by condition
MedicinalPlant.searchByCondition('diabetes');

// Search by region
MedicinalPlant.searchByRegion('Region XII');

// Find by common name in Cebuano
MedicinalPlant.getByCommonName('lagundi', 'Cebuano');

// Add traditional use with IPR tracking
plant.addTraditionalUse({
  condition: 'Fever',
  preparation: 'Decoction',
  sources: [{
    community: 'T\'boli Community',
    region: 'Region XII',
    consent: { obtained: true, consentId: 'PIC-2025-001' }
  }],
  iprStatus: 'protected'
});
```

---

### 2. ClinicalStudy
**Purpose**: Research publications and clinical trial data repository

**Key Features**:
- ✅ Multiple study types (in vitro → Phase IV trials)
- ✅ Evidence-based medicine classification
- ✅ Quality assessment & bias risk tracking
- ✅ Citation management (DOI, PMID)
- ✅ Full-text and PDF linking
- ✅ Ethics approval tracking
- ✅ Funding transparency

**Study Types Supported**:
- In vitro / In vivo (Animal)
- Phase I-IV Clinical Trials
- Case Studies
- Systematic Reviews & Meta-analyses
- Ethnobotanical Surveys

**Evidence Levels**: Level I (highest) → Level V (lowest)

**Example Use Cases**:
```javascript
// Find all clinical trials for a plant
ClinicalStudy.findByPlant(plantId);

// Find studies for specific condition
ClinicalStudy.findByCondition('hypertension');

// Add citation tracking
study.addCitation(citingStudyId);

// Verify study
study.verify(reviewerId);
```

---

### 3. IndigenousKnowledge
**Purpose**: IPRA and Nagoya Protocol-compliant traditional knowledge management

**Critical Compliance Features**:
- ✅ **Prior Informed Consent (PIC)** tracking with unique IDs
- ✅ **Benefit Sharing Agreements** documentation
- ✅ **IPR status management** (public_domain, protected, proprietary, restricted)
- ✅ **NCIP approval** tracking
- ✅ **Access control** with audit trails
- ✅ **Consent revocation** mechanism
- ✅ **Cultural sensitivity** classification

**Knowledge Types**:
- Medicinal Use
- Preparation Method
- Cultural Practice
- Spiritual Use
- Conservation Method

**IPR Statuses**: `public_domain`, `protected`, `proprietary`, `restricted`, `pending_assessment`

**Access Levels**: `public`, `registered_users`, `researchers_only`, `community_only`, `restricted`, `private`

**Sensitivity Levels**: `Low`, `Medium`, `High`, `Sacred`

**Example Use Cases**:
```javascript
// Check consent validity
knowledge.checkConsentValidity(); // Returns true/false

// Revoke consent
knowledge.revokeConsent('Community decision');

// Grant access to researcher
knowledge.grantAccess(researcherId, 'PhD research on antimicrobial properties');

// Find public knowledge only
IndigenousKnowledge.findPublicKnowledge();

// Find knowledge requiring IPR review
IndigenousKnowledge.requiresIPRReview();
```

**Nagoya Protocol Compliance**:
- Auto-generated Consent IDs: `PIC-{timestamp}-{random}`
- Benefit sharing tracking (Monetary/Non-monetary)
- Expiry date monitoring
- Revocable consent support
- Community approval workflow

---

### 4. ResearchContribution
**Purpose**: Peer review workflow and community contribution management

**Key Features**:
- ✅ **Submission workflow**: draft → submitted → review → approval → integration
- ✅ **Multi-reviewer system** with rating metrics
- ✅ **Version control** for revisions
- ✅ **Quality scoring** (0-100)
- ✅ **Flag system** for issues
- ✅ **Internal/public comments**
- ✅ **Attribution & acknowledgment**

**Contribution Types**:
- New Plant Entry
- Traditional Use Addition
- Clinical Study Addition
- Phytochemical Data
- Safety Information
- Image Upload
- Correction
- Translation
- Indigenous Knowledge
- Review

**Workflow Statuses**: `draft`, `submitted`, `under_review`, `revision_requested`, `revised`, `approved`, `rejected`, `integrated`, `withdrawn`

**Review Rating Metrics**:
- Accuracy (1-5)
- Completeness (1-5)
- Relevance (1-5)
- Source Quality (1-5)

**Example Use Cases**:
```javascript
// Submit contribution
contribution.submit();

// Assign reviewer
contribution.assignReviewer(reviewerId);

// Add review with ratings
contribution.addReview(reviewerId, {
  decision: 'approve',
  rating: {
    accuracy: 5,
    completeness: 4,
    relevance: 5,
    sourceQuality: 5
  },
  comments: 'Excellent contribution with peer-reviewed sources'
});

// Request revision
contribution.requestRevision('Please add more clinical evidence');

// Approve and integrate
contribution.approve(editorId);
contribution.integrate(editorId);
```

---

### 5. User (Enhanced)
**Purpose**: Extended user management with role-based access control

**New Roles**:
- `user` - General public
- `professional` - Healthcare practitioners
- `researcher` - Academic researchers
- `reviewer` - Peer reviewers
- `editor` - Content editors
- `admin` - System administrators
- `indigenous_representative` - IP community representatives

**Enhanced Features**:
- ✅ Academic profiles (ORCID, affiliation, credentials)
- ✅ Granular permissions (review, edit, approve, IPR management)
- ✅ Indigenous representative verification with NCIP
- ✅ Contribution tracking
- ✅ Expertise area tagging
- ✅ Notification preferences

**Permission Flags**:
- `canReview` - Can peer review contributions
- `canEdit` - Can edit plant entries
- `canApprove` - Can approve for publication
- `canAccessRestrictedKnowledge` - Access to sensitive indigenous knowledge
- `canManageIPR` - Manage intellectual property rights

---

## Database Indexes

### Performance Optimization
All models include strategic indexes for common query patterns:

**MedicinalPlant**:
- Scientific name
- Common names (all languages)
- Tags
- Validation status
- Regions
- Full-text search (names, description, uses)

**ClinicalStudy**:
- Title, abstract, keywords (text search)
- Plants reference
- Study type
- Publication date (descending)
- DOI
- Conditions

**IndigenousKnowledge**:
- Community name
- Indigenous group
- Plants reference
- IPR status
- Access level
- Consent obtained

**ResearchContribution**:
- Contributor user
- Status
- Related plant
- Submission date (descending)
- Priority

---

## Relationships

```
User
 ├─ creates → ResearchContribution
 ├─ reviews → ResearchContribution
 ├─ verifies → IndigenousKnowledge
 └─ updates → MedicinalPlant

MedicinalPlant
 ├─ references → ClinicalStudy (via phytochemicals.references)
 ├─ links to → IndigenousKnowledge (via plants field)
 └─ validated by → User (reviewHistory)

ClinicalStudy
 ├─ studies → MedicinalPlant (many-to-many)
 └─ authored by → Researchers (embedded)

IndigenousKnowledge
 ├─ relates to → MedicinalPlant
 ├─ documented by → User/Researcher
 └─ accessed by → User (with audit trail)

ResearchContribution
 ├─ submitted by → User
 ├─ reviewed by → User (multiple reviewers)
 ├─ relates to → MedicinalPlant | ClinicalStudy | IndigenousKnowledge
 └─ decided by → User (editor)
```

---

## Data Validation Rules

### MedicinalPlant
- ✅ Must have scientific name
- ✅ At least one common name required
- ✅ Safety information required before publishing
- ✅ At least one source/reference required
- ✅ Images must have proper licensing

### ClinicalStudy
- ✅ DOI or valid publication reference required
- ✅ Must be linked to at least one plant
- ✅ Ethics approval required for clinical trials
- ✅ Methodology description required

### IndigenousKnowledge
- ✅ **CRITICAL**: Consent must be obtained before any use
- ✅ Consent ID auto-generated when obtained=true
- ✅ Community and indigenous group required
- ✅ Knowledge holder information required
- ✅ Access level defaults to 'restricted'
- ✅ Expiry date monitoring

### ResearchContribution
- ✅ Must have at least 2 reviewers for approval
- ✅ Quality score calculated from reviewer ratings
- ✅ Sources required for all factual claims
- ✅ Completeness check before approval

---

## Migration Path

To migrate existing LibraryItem data to new MedicinalPlant schema:

```javascript
// Migration script outline
const migrateLibraryItems = async () => {
  const items = await LibraryItem.find({ category: 'plants' });
  
  for (const item of items) {
    const plant = new MedicinalPlant({
      names: {
        scientific: item.scientific || 'Unknown',
        commonNames: [{
          language: 'Filipino',
          name: item.title
        }],
        family: 'To be determined'
      },
      description: {
        botanical: item.fullDescription || item.description
      },
      traditionalUses: item.uses?.map(use => ({
        condition: use,
        preparation: 'Traditional method',
        iprStatus: 'pending'
      })) || [],
      distribution: {
        regions: [item.region || 'Nationwide']
      },
      tags: item.tags || [],
      validationStatus: 'draft',
      accessLevel: 'public',
      isActive: item.isActive
    });
    
    await plant.save();
  }
};
```

---

## Best Practices

### 1. **Always Check Consent Before Accessing Indigenous Knowledge**
```javascript
const knowledge = await IndigenousKnowledge.findById(id);
if (!knowledge.checkConsentValidity()) {
  throw new Error('Consent not valid or expired');
}
```

### 2. **Use Version Control for Major Changes**
```javascript
await plant.createVersion(userId, 'Updated phytochemical data from 2025 study');
```

### 3. **Log All Access to Restricted Knowledge**
```javascript
await knowledge.grantAccess(userId, 'Research on antimicrobial properties');
```

### 4. **Implement Soft Deletes**
```javascript
// Don't delete, deactivate
plant.isActive = false;
await plant.save();
```

### 5. **Validate Data Quality**
```javascript
const completeness = {
  hasScientificName: !!plant.names.scientific,
  hasTraditionalUse: plant.traditionalUses.length > 0,
  hasSources: plant.sources.length > 0,
  hasSafetyInfo: !!plant.safety,
  hasImages: plant.images.length > 0
};
```

---

## Security Considerations

### 1. **Indigenous Knowledge Protection**
- Default to most restrictive access level
- Require authentication for all non-public knowledge
- Log all access attempts
- Implement rate limiting on sensitive data
- Watermark images of sacred plants

### 2. **Data Integrity**
- All changes tracked in version history
- Multi-stage approval for public-facing content
- Automated backup before major updates
- Audit trail for all IPR changes

### 3. **Privacy**
- Knowledge holder names can be anonymized
- Community representatives must be NCIP-verified
- Personal information encrypted at rest
- GDPR-compliant data deletion

---

## Future Enhancements

### Phase 2
- [ ] Geospatial database (PostGIS) for distribution mapping
- [ ] Full-text search with Elasticsearch
- [ ] Image recognition for plant identification
- [ ] Blockchain for IPR immutability
- [ ] Multi-tenant for regional databases

### Phase 3
- [ ] GraphQL API for complex queries
- [ ] Real-time collaboration (Socket.io)
- [ ] AI-powered content suggestions
- [ ] Integration with global TKDL networks
- [ ] Mobile-first offline synchronization

---

## Contact & Support

For database schema questions or modifications:
- Technical Lead: [To be assigned]
- Database Administrator: [To be assigned]
- NCIP Liaison: [To be assigned]

**Last Updated**: January 4, 2026
**Version**: 1.0
**Status**: Initial Implementation
