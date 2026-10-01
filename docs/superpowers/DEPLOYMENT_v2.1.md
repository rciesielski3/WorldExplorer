# WorldExplorer v2.1 — Deployment Guide

**Version:** 2.1.0 (versionCode 154)
**Release Date:** October 2026
**Platform:** Android (Google Play Store)

## Phase 1: QA Testing (Internal Testing Track)

### Pre-Deployment Checklist
- [ ] All 631+ tests passing locally
- [ ] No TypeScript errors
- [ ] Country Details screen loads enriched data
- [ ] Explore Screen filters work correctly (region, population, dev level)
- [ ] Sorting options work (alphabetical, size, GDP)
- [ ] UI renders correctly in dark mode
- [ ] UI renders correctly in light mode
- [ ] Touch targets are 48dp+ (accessibility)
- [ ] Semantic labels present (accessibility)
- [ ] Daily Challenge still works (v2.0.7 feature)
- [ ] Quiz functionality intact (core feature)
- [ ] All existing features work with new features

### Build & Internal Testing
1. Download AAB from GitHub Actions
2. Upload to Google Play Console → Testing → Internal testing
3. Release notes: Describe v2.1 design features
4. Share tester link with QA team
5. Test all features per checklist above
6. Monitor Crashlytics for 24-48 hours
   - Expected: 0 new crashes
   - Baseline: Same as v2.0.9

### Monitoring Checklist
- [ ] 0 new crashes after 24 hours
- [ ] No permission denials
- [ ] No ANR (Application Not Responding)
- [ ] User feedback positive (if reviews posted)

## Phase 2: Production Rollout

### Prerequisites
- ✅ Internal testing approved (0 critical issues)
- ✅ Crashlytics monitoring clean
- ✅ Release notes ready

### Rollout Strategy
1. Go to Production track
2. Click Create new release
3. Upload same AAB from internal testing
4. Add Release Notes (same as internal testing)
5. Set Rollout percentage: 25% (staged rollout)

### Monitoring (25% Rollout)
1. Monitor Crashlytics for crash rate
2. Expected: Same or better than v2.0.9
3. Monitor user reviews
4. Expected: Stable or positive feedback

### Rollout Increase to 100%
After 24-48 hours at 25% with no critical issues:
1. Manage rollout
2. Increase to 100%
3. Full rollout begins

### Post-Deployment Monitoring
- Crash rate (should be ≤ baseline)
- Session duration (may increase)
- User ratings (should maintain or improve)
- Feature engagement (new features should be used)

## Rollback Procedures

**If critical issues during 25% rollout:**
1. Pause rollout (stay at 25%)
2. Document issue in GitHub Issues
3. Create hotfix branch from v2.1 commit
4. Fix issue and rebuild
5. Test in internal testing
6. Re-promote to production

**If critical issues at 100% rollout:**
1. Reduce rollout to 0% (pauses for all users)
2. Document issue
3. Create v2.1.1 hotfix
4. Rebuild and test
5. Re-deploy

## Success Metrics
- ✅ 0 critical crashes during internal testing
- ✅ 0 new crashes on production (24-48h)
- ✅ User ratings stable or improved
- ✅ No permission-related errors
- ✅ Features functional and engaging
- ✅ Session duration stable or increased

## Timeline
| Phase | Duration | Target Date |
|-------|----------|-------------|
| QA Testing | 2-3 days | Oct 3-5 |
| Production 25% | 1-2 days | Oct 5-6 |
| Production 100% | 1-2 days | Oct 6-7 |
| **Live on Play Store** | — | **Oct 7** |
