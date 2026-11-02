import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDashboardMetrics, getContentAttribution } from './analytics';
import { generateSeedLeads } from '../data/seedLeads';

test('calculateDashboardMetrics computes non-empty metrics from seed leads', () => {
  const seeds = generateSeedLeads();
  const metrics = calculateDashboardMetrics(seeds);

  assert.ok(metrics.newLeadsCount > 0);
  assert.ok(metrics.followUpsDueCount >= 0);
  assert.ok(metrics.conversionRatePct >= 0);
  assert.ok(metrics.wonCount > 0);
  assert.ok(metrics.totalPipelineValue > 0);
});

test('getContentAttribution groups leads by content title', () => {
  const seeds = generateSeedLeads();
  const attribution = getContentAttribution(seeds);

  assert.ok(attribution.length > 0);
  assert.ok(attribution[0].leadCount >= 1);
  assert.ok(attribution[0].title.length > 0);
});
