import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { ChoiceChips } from '@/components/ChoiceChips';
import { ImplicationList } from '@/components/ImplicationList';
import { MetricGrid } from '@/components/MetricGrid';
import { NumberField } from '@/components/NumberField';
import { Section } from '@/components/Section';
import { SizeField } from '@/components/SizeField';
import { SliderField } from '@/components/SliderField';
import { SystemScene } from '@/components/scene/SystemScene';
import { colors, spacing } from '@/constants/theme';
import { evaluate } from '@/core/evaluate';
import { toMarkdown } from '@/core/export';
import { describeMetrics } from '@/core/metrics';
import { buildScene } from '@/core/scene';
import { cloneInputs } from '@/core/scenarios';
import type { Constants, Inputs, Scenario } from '@/domain/types';
import { copyMarkdown, shareMarkdown, slugifyFileBase } from '@/services/shareScenario';
import { useScenarioHydrated, useSettingsHydrated } from '@/store/hydration';
import { useScenarioStore } from '@/store/scenarioStore';
import { useSettingsStore } from '@/store/settingsStore';

const AVAILABILITY = [
  { label: '99%', value: 0.99 },
  { label: '99.9%', value: 0.999 },
  { label: '99.99%', value: 0.9999 },
  { label: '99.999%', value: 0.99999 },
];

interface Draft {
  name: string;
  inputs: Inputs;
}

export default function ScenarioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hydrated = useScenarioHydrated();
  const settingsHydrated = useSettingsHydrated();
  const scenario = useScenarioStore((state) => state.scenarios.find((item) => item.id === id));
  const constants = useSettingsStore((state) => state.constants);

  if (!hydrated || !settingsHydrated) {
    return <Centered text="Loading…" />;
  }
  if (!scenario) {
    return <Centered text="This estimate no longer exists." />;
  }
  return <ScenarioEditor key={scenario.id} scenario={scenario} constants={constants} />;
}

function ScenarioEditor({ scenario, constants }: { scenario: Scenario; constants: Constants }) {
  const updateScenario = useScenarioStore((state) => state.updateScenario);
  const [draft, setDraft] = useState<Draft>(() => ({
    name: scenario.name,
    inputs: cloneInputs(scenario.inputs),
  }));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateScenario(scenario.id, { name: draft.name, inputs: draft.inputs });
    }, 400);
    return () => clearTimeout(timer);
  }, [draft, scenario.id, updateScenario]);

  const evaluation = useMemo(() => evaluate(draft.inputs, constants), [draft.inputs, constants]);
  const scene = useMemo(
    () => buildScene(draft.inputs, evaluation.derived, evaluation.implications, constants),
    [draft.inputs, evaluation, constants],
  );

  const patchTraffic = (patch: Partial<Inputs['traffic']>) =>
    setDraft((current) => ({
      ...current,
      inputs: { ...current.inputs, traffic: { ...current.inputs.traffic, ...patch } },
    }));

  const patchData = (patch: Partial<Inputs['dataShape']>) =>
    setDraft((current) => ({
      ...current,
      inputs: { ...current.inputs, dataShape: { ...current.inputs.dataShape, ...patch } },
    }));

  const patchNonFunctional = (patch: Partial<Inputs['nonFunctional']>) =>
    setDraft((current) => ({
      ...current,
      inputs: {
        ...current.inputs,
        nonFunctional: { ...current.inputs.nonFunctional, ...patch },
      },
    }));

  const buildMarkdown = () =>
    toMarkdown({ ...scenario, name: draft.name, inputs: draft.inputs }, evaluation);

  const handleCopy = async () => {
    await copyMarkdown(buildMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    const markdown = buildMarkdown();
    const shared = await shareMarkdown(markdown, `${slugifyFileBase(draft.name)}.md`);
    if (!shared) {
      await copyMarkdown(markdown);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Section title="Scenario">
        <TextInput
          style={styles.nameInput}
          value={draft.name}
          onChangeText={(name) => setDraft((current) => ({ ...current, name }))}
          placeholder="Estimate name"
          placeholderTextColor={colors.textMuted}
        />
      </Section>

      <Section title="Traffic">
        <NumberField
          label="Daily active users"
          value={draft.inputs.traffic.dailyActiveUsers}
          onChange={(value) => patchTraffic({ dailyActiveUsers: value })}
        />
        <NumberField
          label="Actions per user / day"
          value={draft.inputs.traffic.actionsPerUserPerDay}
          onChange={(value) => patchTraffic({ actionsPerUserPerDay: value })}
        />
        <NumberField
          label="Read:write ratio"
          hint="reads per write"
          suffix=":1"
          value={draft.inputs.traffic.readWriteRatio}
          onChange={(value) => patchTraffic({ readWriteRatio: value })}
        />
        <SliderField
          label="Peak multiplier"
          value={draft.inputs.traffic.peakMultiplier}
          min={1}
          max={10}
          step={0.5}
          format={(value) => `${value}x`}
          onChange={(value) => patchTraffic({ peakMultiplier: value })}
        />
      </Section>

      <Section title="Data shape">
        <SizeField
          label="Average object size"
          value={draft.inputs.dataShape.objectSizeBytes}
          onChange={(value) => patchData({ objectSizeBytes: value })}
        />
        <NumberField
          label="Objects written / action"
          value={draft.inputs.dataShape.objectsWrittenPerAction}
          onChange={(value) => patchData({ objectsWrittenPerAction: value })}
        />
        <NumberField
          label="Objects read / action"
          value={draft.inputs.dataShape.objectsReadPerAction}
          onChange={(value) => patchData({ objectsReadPerAction: value })}
        />
        <NumberField
          label="Retention"
          suffix="days"
          value={draft.inputs.dataShape.retentionDays}
          onChange={(value) => patchData({ retentionDays: value })}
        />
        <SliderField
          label="Replication factor"
          value={draft.inputs.dataShape.replicationFactor}
          min={1}
          max={5}
          step={1}
          format={(value) => `${value}x`}
          onChange={(value) => patchData({ replicationFactor: value })}
        />
      </Section>

      <Section title="Non-functional">
        <Text style={styles.fieldLabel}>Availability target</Text>
        <ChoiceChips
          options={AVAILABILITY}
          value={draft.inputs.nonFunctional.availabilityTarget}
          onChange={(value) => patchNonFunctional({ availabilityTarget: value })}
        />
        <SliderField
          label="Monthly growth"
          value={draft.inputs.nonFunctional.monthlyGrowthRate}
          min={0}
          max={0.2}
          step={0.005}
          format={(value) => `${(value * 100).toFixed(1)}%`}
          onChange={(value) => patchNonFunctional({ monthlyGrowthRate: value })}
        />
      </Section>

      <Section title="System">
        <SystemScene model={scene} implications={evaluation.implications} />
      </Section>

      <Section title="Derived estimates">
        <MetricGrid metrics={describeMetrics(evaluation.derived)} />
      </Section>

      <Section title="Implications">
        <ImplicationList implications={evaluation.implications} />
      </Section>

      <Section title="Export">
        <View style={styles.exportRow}>
          <View style={styles.exportItem}>
            <Button
              label={copied ? 'Copied' : 'Copy Markdown'}
              variant="secondary"
              onPress={handleCopy}
            />
          </View>
          <View style={styles.exportItem}>
            <Button label="Share" onPress={handleShare} />
          </View>
        </View>
      </Section>
    </ScrollView>
  );
}

function Centered({ text }: { text: string }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.centeredText}>{text}</Text>
    </View>
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
  nameInput: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.xs,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 14,
  },
  exportRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  exportItem: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  centeredText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
});
