import type { ClubType } from '../types';

export const CLUB_TYPE_BADGE_STYLES: Record<
  ClubType,
  { bg: string; text: string; border: string }
> = {
  Coding: { bg: '#fbf2f3', text: '#991b1b', border: '#991b1b' },
  Cultural: { bg: '#f3f0ff', text: '#7678ed', border: '#7678ed' },
  Sports: { bg: '#f0fdf4', text: '#15803d', border: '#15803d' },
  Literary: { bg: '#fff7ed', text: '#f18701', border: '#f18701' },
  Robotics: { bg: '#f0f9ff', text: '#0369a1', border: '#0369a1' },
  Social: { bg: '#fef9c3', text: '#a16207', border: '#a16207' },
  Music: { bg: '#fdf4ff', text: '#9333ea', border: '#9333ea' },
  Dance: { bg: '#fff1f2', text: '#e11d48', border: '#e11d48' },
  'NIAT Circle': { bg: '#fbf2f3', text: '#991b1b', border: '#991b1b' },
};

export const CLUB_TYPE_FILTER_OPTIONS: ClubType[] = [
  'Coding',
  'Cultural',
  'Sports',
  'Literary',
  'Robotics',
  'Social',
];
