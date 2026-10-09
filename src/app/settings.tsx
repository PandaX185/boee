import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { Section } from '@/components/Section';
import { SizeField } from '@/components/SizeField';
import { SliderField } from '@/components/SliderField';
import { colors, spacing } from '@/constants/theme';
import { CONSTANT_SOURCES } from '@/core/constants';
import type { InfrastructureConstants } from '@/domain/types';
import { useSettingsHydrated } from '@/store/hydration';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsScreen() {
  const hydrated = useSettingsHydrated();
  const constants = useSettingsStore((state) => state.constants);
  const setConstants = useSettingsStore((state) => state.setConstants);
  const resetConstants = useSettingsStore((state) => state.resetConstants);

  if (!hydrated) {
    return <Text style={styles.message}>Loading…</Text>;
  }

  const patchInfra = (patch: Partial<InfrastructureConstants>) =>
    setConstants({ ...constants, infrastructure: { ...constants.infrastructure, ...patch } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        These editable assumptions drive the implications. Each value notes what it represents.
      </Text>

      <Section title="Throughput">
        <NumberField
          label="Server QPS capacity"
          value={constants.infrastructure.serverQpsCapacity}
          hint={CONSTANT_SOURCES.serverQpsCapacity}
          onChange={(value) => patchInfra({ serverQpsCapacity: value })}
        />
        <NumberField
          label="Single-node read QPS"
          value={constants.infrastructure.singleNodeReadQps}
          hint={CONSTANT_SOURCES.singleNodeReadQps}
          onChange={(value) => patchInfra({ singleNodeReadQps: value })}
        />
        <NumberField
          label="Single-node write QPS"
          value={constants.infrastructure.singleNodeWriteQps}
          hint={CONSTANT_SOURCES.singleNodeWriteQps}
          onChange={(value) => patchInfra({ singleNodeWriteQps: value })}
        />
      </Section>

      <Section title="Storage and network">
        <SizeField
          label="Cache RAM budget"
          value={constants.infrastructure.cacheRamBytes}
          hint={CONSTANT_SOURCES.cacheRamBytes}
          onChange={(value) => patchInfra({ cacheRamBytes: value })}
        />
        <SizeField
          label="NIC bandwidth"
          value={constants.infrastructure.nicBytesPerSecond}
          hint={CONSTANT_SOURCES.nicBytesPerSecond}
          onChange={(value) => patchInfra({ nicBytesPerSecond: value })}
        />
        <SliderField
          label="Hot working set fraction"
          value={constants.hotWorkingSetFraction}
          min={0}
          max={0.5}
          step={0.05}
          format={(value) => `${(value * 100).toFixed(0)}%`}
          onChange={(value) => setConstants({ ...constants, hotWorkingSetFraction: value })}
        />
      </Section>

      <View style={styles.reset}>
        <Button label="Reset to defaults" variant="secondary" onPress={resetConstants} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  lead: {
    color: colors.textMuted,
    fontSize: 14,
  },
  reset: {
    marginTop: spacing.sm,
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
  },
});
