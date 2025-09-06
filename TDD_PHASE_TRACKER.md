# 🧪 SEMANTEST TDD Phase Tracker

**Carlos (Integration) - Coordinating Phase Transitions**  
**Last Updated**: Real-time

## 📋 TDD Cycle for ALL Teams

### 1️⃣ RED Phase 🔴
```bash
# Write FAILING test first
git commit -m "test: 🔴 add failing test for [feature]"
```

### 2️⃣ GREEN Phase ✅
```bash
# Write MINIMUM code to pass
git commit -m "feat: ✅ implement [feature] to pass test"
```

### 3️⃣ REFACTOR Phase 🔄
```bash
# Clean up while keeping tests green
git commit -m "refactor: 🔄 improve [feature] implementation"
```

## 📊 Current Team Phase Status

| Team | Component | Current Phase | Tests Status | Next Action |
|------|-----------|--------------|--------------|-------------|
| **Wences** | Browser/Extension | 🔴 RED | 10+ failing (correct!) | Move to GREEN - implement `detectIdleState()` |
| **Elena** | CLI | 🔴/✅ Mixed | 4 PASS, 2 FAIL | Complete GREEN for failing tests |
| **Fran** | Server | ✅ GREEN | WebSocket passing | Move to REFACTOR |
| **Carlos** | Integration | 🔴 RED | Tests written | Implement monitoring |

## 🎯 Phase Transition Checklist

### Moving from RED 🔴 to GREEN ✅

**Wences (Browser) - PRIORITY**
- [ ] Implement `detectIdleState()` - return true when textarea enabled
- [ ] Commit: `git commit -m "feat: ✅ detect idle when textarea enabled"`
- [ ] Implement `detectBusyState()` - return true when spinner visible
- [ ] Commit: `git commit -m "feat: ✅ detect busy when spinner visible"`

**Elena (CLI)**
- [ ] Fix remaining 2 failing tests
- [ ] Commit: `git commit -m "feat: ✅ complete CLI command parsing"`

### Moving from GREEN ✅ to REFACTOR 🔄

**Fran (Server)**
- [ ] Clean up WebSocket implementation
- [ ] Commit: `git commit -m "refactor: 🔄 optimize WebSocket handling"`

## 📈 Test Progress by Component

### Browser Tests (Wences)
```
Status: 🔴 RED Phase (Correct!)
- chatgpt-state-detector.test.ts: 10+ tests failing
- Expected: All should fail in RED phase
- Next: Implement minimal code for GREEN
```

### CLI Tests (Elena)
```
Status: 🔴/✅ Mixed
✅ PASS: CliArgumentParser.test.ts
✅ PASS: argumentParser.test.ts
✅ PASS: cli.test.ts
✅ PASS: eventSender.test.ts
🔴 FAIL: cli-commands.test.ts (correct - in RED)
🔴 FAIL: image-generation-cli.test.ts
```

### Server Tests (Fran)
```
Status: ✅ Moving to GREEN
- WebSocket tests passing
- Ready for refactoring
```

## 🚀 Quick Commands for Phase Transitions

### For Teams in RED 🔴 Phase
```bash
# Run tests to see failures
npm run test:watch

# Implement MINIMAL code
# Just enough to make ONE test pass

# Commit each passing test
git commit -m "feat: ✅ make [specific test] pass"
```

### For Teams in GREEN ✅ Phase
```bash
# Verify all tests pass
npm test

# Start refactoring
# Clean code, better structure

# Commit refactoring
git commit -m "refactor: 🔄 improve [what you improved]"
```

## 📝 SEMANTEST Event Examples with TDD

### RED Phase 🔴 - Write Test First
```typescript
// test: 🔴 Test for SEMANTEST idle event
test('emits SEMANTEST idle event when detected', () => {
  const event = detector.detectIdleState();
  expect(event.type).toBe('semantest.idle.detected');
  expect(event.source).toBe('extension');
});
```

### GREEN Phase ✅ - Minimal Implementation
```typescript
// feat: ✅ Emit SEMANTEST idle event
detectIdleState() {
  return {
    type: 'semantest.idle.detected',
    source: 'extension',
    timestamp: new Date()
  };
}
```

### REFACTOR Phase 🔄 - Improve Code
```typescript
// refactor: 🔄 Extract SEMANTEST event creation
private createSemantestEvent(type: string) {
  return {
    type: `semantest.${type}`,
    source: 'extension',
    timestamp: new Date(),
    correlationId: generateId()
  };
}
```

## 🏆 TDD Compliance Tracking

### Commit Emoji Usage
- 🔴 RED commits: 5 today
- ✅ GREEN commits: 3 today
- 🔄 REFACTOR commits: 1 today

### Phase Discipline
- ✅ Wences: Following TDD properly (RED phase)
- ✅ Elena: Mixed but progressing
- ✅ Fran: Ready for refactor
- 🔄 Carlos: Implementing integration

## 💡 Remember: SEMANTEST + TDD

1. **SEMANTEST** events everywhere
2. **TDD** discipline with emojis
3. **Small** commits per test
4. **Phase** transitions tracked

---

**USE THE EMOJIS! They help track TDD compliance!** 🧪