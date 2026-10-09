import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BootError, BootLoading } from '@/components/BootState';
import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { Section } from '@/components/Section';
import { SizeField } from '@/components/SizeField';
import { SliderField } from '@/components/SliderField';
import { colors, layout, spacing } from '@/constants/theme';
import { CONSTANT_SOURCES } from '@/core/constants';
import type { InfrastructureConstants } from '@/domain/types';
import { confirmDestructive } from '@/services/confirm';
import { useBoot } from '@/store/hydration';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsScreen() {
  const boot = useBoot();
  const constants = useSettingsStore((state) => state.constants);
  const setConstants = useSettingsStore((state) => state.setConstants);
  const resetConstants = useSettingsStore((state) => state.resetConstants);

  if (boot.status === 'loading') {
    return <BootLoading />;
  }
  if (boot.status === 'failed') {
    return (
      <BootError
        onRetry={boot.retry}
        onReset={() =>
          confirmDestructive(
            'Reset saved data',
            'Delete all saved estimates and constants on this device?',
            boot.resetSavedData,
          )
        }
      />
    );
  }

  const patchInfra = (patch: Partial<InfrastructureConstants>) =>
    setConstants({ ...constants, infrastructure: { ...constants.infrastructure, ...patch } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        These editable assumptions drive the implications. Each value notes what it represents.
      </Text>

      <Section title="Throughput" delay={0}>
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

      <Section title="Storage and network" delay={90}>
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
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
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
