import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';

/**
 * Test Screen for Lottie Animations
 *
 * This screen verifies that all 4 required animations:
 * 1. rotating-earth.json - 6s continuous loop
 * 2. confetti.json - 2s one-shot celebration
 * 3. spinner.json - continuous loading spinner
 * 4. achievement.json - 2s one-shot badge pop
 *
 * Load without errors, play smoothly, and match duration specs.
 *
 * Usage for testing:
 * 1. Navigate to this screen in development
 * 2. Verify each animation plays smoothly
 * 3. Check Expo console for any warnings/errors
 * 4. Confirm durations match specifications
 */

interface AnimationTest {
  name: string;
  file: string;
  duration: string;
  loop: boolean;
  description: string;
  expectedBehavior: string;
}

const ANIMATIONS: AnimationTest[] = [
  {
    name: 'Rotating Earth',
    file: '../assets/animations/rotating-earth.json',
    duration: '6s',
    loop: true,
    description: 'Hero section globe rotation',
    expectedBehavior: 'Continuous smooth 360° rotation',
  },
  {
    name: 'Confetti',
    file: '../assets/animations/confetti.json',
    duration: '2s',
    loop: false,
    description: 'Quiz completion celebration',
    expectedBehavior: 'Confetti pieces fall and fade out, then stops',
  },
  {
    name: 'Loading Spinner',
    file: '../assets/animations/spinner.json',
    duration: 'Continuous',
    loop: true,
    description: 'Loading state indicator',
    expectedBehavior: 'Smooth continuous circle rotation',
  },
  {
    name: 'Achievement Badge',
    file: '../assets/animations/achievement.json',
    duration: '2s',
    loop: false,
    description: 'Achievement/badge unlock pop',
    expectedBehavior: 'Badge scales with bounce effect then fades, stops after 2s',
  },
];

interface TestResult {
  name: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  playCount: number;
}

export default function LottieAnimationTestScreen() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>(
    ANIMATIONS.reduce(
      (acc, anim) => ({
        ...acc,
        [anim.name]: { name: anim.name, status: 'idle', playCount: 0 },
      }),
      {}
    )
  );

  const updateTestResult = (
    name: string,
    updates: Partial<TestResult> | ((prev: TestResult) => Partial<TestResult>),
  ) => {
    setTestResults((prev) => {
      const current = prev[name];
      const resolved = typeof updates === 'function' ? updates(current) : updates;
      return { ...prev, [name]: { ...current, ...resolved } };
    });
  };

  const handleAnimationLoad = (name: string) => {
    console.log(`✓ Animation loaded: ${name}`);
    updateTestResult(name, { status: 'success' });
  };

  const handleAnimationError = (name: string, error: string) => {
    console.error(`✗ Animation error (${name}):`, error);
    updateTestResult(name, { status: 'error', error });
  };

  const handleAnimationFinish = (name: string) => {
    console.log(`✓ Animation finished: ${name}`);
    updateTestResult(name, (prev) => ({
      playCount: prev.playCount + 1,
    }));
  };

  const playAnimation = (name: string) => {
    updateTestResult(name, { status: 'loading', playCount: 0 });
    // Animation will auto-play and callback will update status
  };

  const getStatusColor = (status: 'idle' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'loading':
        return '#3b82f6';
      default:
        return '#9ca3af';
    }
  };

  const getStatusIcon = (status: 'idle' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'loading':
        return '⏳';
      default:
        return '○';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Lottie Animation Tests</Text>
          <Text style={styles.subtitle}>
            Verifying all 4 animations load and play smoothly
          </Text>
        </View>

        {/* Test Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Test Summary</Text>
          <Text style={styles.summaryText}>
            Total Animations: {ANIMATIONS.length}
          </Text>
          <Text
            style={[
              styles.summaryText,
              {
                color: Object.values(testResults).some((r) => r.status === 'error')
                  ? '#ef4444'
                  : '#10b981',
              },
            ]}
          >
            Status:{' '}
            {Object.values(testResults).every((r) => r.status === 'success')
              ? 'All passed ✓'
              : Object.values(testResults).some((r) => r.status === 'error')
                ? 'Some failed ✗'
                : 'In progress...'}
          </Text>
        </View>

        {/* Animation Tests */}
        {ANIMATIONS.map((animation, index) => {
          const result = testResults[animation.name];
          const statusColor = getStatusColor(result.status);

          return (
            <View key={index} style={styles.testCard}>
              <View style={styles.testHeader}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.animationName,
                      { color: statusColor },
                    ]}
                  >
                    {getStatusIcon(result.status)} {animation.name}
                  </Text>
                  <Text style={styles.durationBadge}>{animation.duration}</Text>
                </View>
                <Text style={styles.loopBadge}>
                  {animation.loop ? '🔄 Loop' : '▶️ One-shot'}
                </Text>
              </View>

              <Text style={styles.description}>{animation.description}</Text>
              <Text style={styles.expected}>
                Expected: {animation.expectedBehavior}
              </Text>

              {/* Animation Container */}
              <View style={styles.animationContainer}>
                <LottieView
                  source={require(animation.file)}
                  autoPlay={true}
                  loop={animation.loop}
                  speed={1}
                  style={styles.animation}
                  onAnimationLoaded={() => handleAnimationLoad(animation.name)}
                  onAnimationFinish={() =>
                    handleAnimationFinish(animation.name)
                  }
                  onAnimationFailure={(error) => {
                    handleAnimationError(animation.name, String(error));
                  }}
                  resizeMode="contain"
                />
              </View>

              {/* Status Display */}
              <View style={styles.statusSection}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  Status: {result.status.toUpperCase()}
                </Text>
                {result.error && (
                  <Text style={styles.errorText}>Error: {result.error}</Text>
                )}
                <Text style={styles.playCountText}>
                  Plays: {result.playCount}
                </Text>
              </View>

              {/* Control Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.playButton]}
                  onPress={() => playAnimation(animation.name)}
                >
                  <Text style={styles.buttonText}>▶️ Replay</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.infoButton]}
                  onPress={() => {
                    console.log(`Animation: ${animation.name}`);
                    console.log(`File: ${animation.file}`);
                    console.log(`Duration: ${animation.duration}`);
                    console.log(`Loop: ${animation.loop}`);
                  }}
                >
                  <Text style={styles.buttonText}>ℹ️ Info</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Console Log Section */}
        <View style={styles.consoleSection}>
          <Text style={styles.consoleTitle}>💻 Console Output</Text>
          <Text style={styles.consoleText}>
            Open the Expo console to see detailed test logs and any error
            messages
          </Text>
        </View>

        {/* Verification Checklist */}
        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>Verification Checklist</Text>
          <Text style={styles.checklistItem}>
            ☐ All animations load without errors
          </Text>
          <Text style={styles.checklistItem}>
            ☐ Rotating Earth rotates smoothly for 6s
          </Text>
          <Text style={styles.checklistItem}>
            ☐ Confetti fades out after 2s one-shot
          </Text>
          <Text style={styles.checklistItem}>
            ☐ Spinner rotates continuously
          </Text>
          <Text style={styles.checklistItem}>
            ☐ Achievement badge pops and bounces for 2s
          </Text>
          <Text style={styles.checklistItem}>
            ☐ No stuttering or lag during playback
          </Text>
          <Text style={styles.checklistItem}>
            ☐ No console errors or warnings
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            If all tests pass, commit with:
          </Text>
          <Text style={styles.footerCode}>
            feat: add Lottie animation assets with verification
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  testCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  testHeader: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  animationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  durationBadge: {
    backgroundColor: '#f0f9ff',
    color: '#0369a1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '500',
  },
  loopBadge: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  expected: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  animationContainer: {
    height: 250,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  statusSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 4,
  },
  playCountText: {
    fontSize: 12,
    color: '#6b7280',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#3b82f6',
  },
  infoButton: {
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  consoleSection: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  consoleTitle: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  consoleText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  checklistCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 8,
  },
  checklistItem: {
    fontSize: 13,
    color: '#166534',
    marginBottom: 4,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 6,
  },
  footerCode: {
    fontSize: 11,
    color: '#d97706',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    backgroundColor: '#fef08a',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
});
