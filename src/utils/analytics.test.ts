import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDashboardMetrics,
  getContentAttribution,
  getWeeklyChartData,
  getFollowUpDiscipline,
  getTopAcquisitionChannel,
  DayActivityData,
} from './analytics';
import { Lead } from '../types';

const sampleLeads: Lead[] = [
  {
    id: 'test-1',
    fullName: 'Jane Doe',
    whatsappNumber: '+15551234567',
    source: 'TikTok',
    sourceDetail: 'TikTok: React architecture',
    stage: 'Won',
    temperature: 'Hot',
    estimatedValue: 4000,
    wonValue: 4000,
    currency: 'USD',
    purpose: 'Software project',
    summary: 'Looking for a full stack web app',
    followUpChannel: 'WhatsApp',
    lastContactedAt: new Date().toISOString(),
    followUpCount: 2,
    archived: false,
    firstContactAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interactions: [],
    tags: ['Tech'],
    avatarColor: 'mint',
  },
  {
    id: 'test-2',
    fullName: 'John Smith',
    whatsappNumber: '+15559876543',
    source: 'WhatsApp',
    sourceDetail: 'WhatsApp referral',
    stage: 'Negotiation',
    temperature: 'Warm',
    estimatedValue: 2500,
    currency: 'USD',
    purpose: 'Consultation or mentoring',
    summary: 'Wants weekly coaching',
    followUpChannel: 'WhatsApp',
    lastContactedAt: new Date().toISOString(),
    followUpCount: 1,
    archived: false,
    firstContactAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interactions: [],
    tags: ['Consulting'],
    avatarColor: 'sky',
  },
];

test('calculateDashboardMetrics computes metrics gracefully for empty leads array', () => {
  const metrics = calculateDashboardMetrics([]);
  assert.equal(metrics.newLeadsCount, 0);
  assert.equal(metrics.followUpsDueCount, 0);
  assert.equal(metrics.wonCount, 0);
  assert.equal(metrics.totalPipelineValue, 0);
  assert.equal(metrics.conversionRatePct, 0);
});

test('calculateDashboardMetrics computes metrics from sample leads', () => {
  const metrics = calculateDashboardMetrics(sampleLeads);
  assert.ok(metrics.newLeadsCount > 0);
  assert.equal(metrics.wonCount, 1);
  assert.equal(metrics.wonTotalValue, 4000);
  assert.equal(metrics.totalPipelineValue, 2500);
});

test('getContentAttribution groups leads by content title', () => {
  const attribution = getContentAttribution(sampleLeads);
  assert.ok(attribution.length > 0);
  assert.equal(attribution[0].leadCount, 1);
});

test('getWeeklyChartData returns real zeroes for empty leads', () => {
  const chartData = getWeeklyChartData([], 7);
  assert.equal(chartData.length, 7);
  chartData.forEach((day: DayActivityData) => {
    assert.equal(day.newLeads, 0);
    assert.equal(day.followUpsDone, 0);
  });
});

test('getFollowUpDiscipline and getTopAcquisitionChannel return dynamic values', () => {
  const emptyDiscipline = getFollowUpDiscipline([]);
  assert.equal(emptyDiscipline.percentage, 100);

  const topChannel = getTopAcquisitionChannel(sampleLeads);
  assert.ok(topChannel.channel.includes('TikTok') || topChannel.channel.includes('WhatsApp'));
});
